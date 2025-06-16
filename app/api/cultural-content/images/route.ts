import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { Prisma } from "@prisma/client";

// Query schema for filtering and pagination
const querySchema = z.object({
	page: z.string().optional().default("1"),
	limit: z.string().optional().default("20"),
	region: z.string().optional(),
	search: z.string().optional(),
	sortBy: z
		.enum(["date_uploaded", "title", "view_count", "download_count"])
		.optional()
		.default("date_uploaded"),
	sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const query = querySchema.parse({
			page: searchParams.get("page") || "1",
			limit: searchParams.get("limit") || "20",
			region: searchParams.get("region") || undefined,
			search: searchParams.get("search") || undefined,
			sortBy: searchParams.get("sortBy") || "date_uploaded",
			sortOrder: searchParams.get("sortOrder") || "desc",
		});

		const page = parseInt(query.page);
		const limit = Math.min(parseInt(query.limit), 50); // Max 50 items per page
		const skip = (page - 1) * limit;

		// Build where clause
		const where: Prisma.CulturalImageWhereInput = {};

		if (query.region) {
			where.region = {
				contains: query.region,
				mode: "insensitive",
			};
		}

		if (query.search) {
			where.OR = [
				{
					title: {
						contains: query.search,
						mode: "insensitive",
					},
				},
				{
					description: {
						contains: query.search,
						mode: "insensitive",
					},
				},
				
			];
		}

		// Fetch images with pagination
		const [images, totalCount] = await Promise.all([
			prisma.culturalImage.findMany({
				where,
				skip,
				take: limit,
				orderBy: {
					[query.sortBy]: query.sortOrder,
				},
				select: {
					id: true,
					title: true,
					description: true,
					region: true,
					photographer: true,
					file_path: true,
					file_size: true,
					mime_type: true,
					width: true,
					height: true,
					date_taken: true,
					date_uploaded: true,
					view_count: true,
					download_count: true,
					uploader: {
						select: {
							id: true,
							full_name: true,
						},
					},
				},
			}),
			prisma.culturalImage.count({ where }),
		]);

		const totalPages = Math.ceil(totalCount / limit);

		return NextResponse.json({
			images,
			pagination: {
				page,
				limit,
				totalCount,
				totalPages,
				hasNextPage: page < totalPages,
				hasPrevPage: page > 1,
			},
		});
	} catch (error) {
		console.error("Error fetching cultural images:", error);
		return NextResponse.json(
			{ error: "Failed to fetch images" },
			{ status: 500 }
		);
	}
}

// Validation schema for cultural image creation - CLEAN
const createCulturalImageSchema = z.object({
	title: z.string().min(1, "Title is required"),
	description: z.string().optional(),
	region: z.string().optional(),
	photographer: z.string().optional(),

	// File data from UploadThing
	file_path: z.string().url("Valid file URL is required"),
	file_size: z.number().positive("File size must be positive"),
	mime_type: z.string().min(1, "MIME type is required"),
	file_key: z.string().min(1, "File key is required"),
	original_name: z.string().min(1, "Original filename is required"),

	// Auto-extracted metadata (sent from client)
	width: z.number().optional(),
	height: z.number().optional(),
});

// Note: Metadata extraction is now handled client-side for better UX

export async function POST(request: NextRequest) {
	try {
		// Check authentication
		const session = await getServerSession(authOptions);
		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Parse and validate request body
		const body = await request.json();
		const validatedData = createCulturalImageSchema.parse(body);

		// Create cultural image record
		const createData: Prisma.CulturalImageCreateInput = {
			title: validatedData.title,
			description: validatedData.description,
			region: validatedData.region,
			photographer: validatedData.photographer,
			uploader: {
				connect: { id: session.user.id },
			},
			file_path: validatedData.file_path,
			file_size: validatedData.file_size,
			mime_type: validatedData.mime_type,
			...(validatedData.width && { width: validatedData.width }),
			...(validatedData.height && { height: validatedData.height }),
		};

		const culturalImage = await prisma.culturalImage.create({
			data: createData,
			include: {
				uploader: {
					select: {
						id: true,
						full_name: true,
					},
				},
			},
		});

		console.log("Cultural image saved successfully:", culturalImage.id);

		return NextResponse.json(
			{
				success: true,
				data: culturalImage,
				message: "Cultural image saved successfully",
			},
			{ status: 201 }
		);
	} catch (error) {
		console.error("Error saving cultural image:", error);

		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{
					error: "Validation error",
					details: error.errors,
				},
				{ status: 400 }
			);
		}

		// Prisma errors
		if (error && typeof error === "object" && "code" in error) {
			console.error("Prisma error code:", (error as { code: string }).code);
			if ("meta" in error) {
				console.error("Prisma error meta:", (error as { meta: unknown }).meta);
			}
		}

		const errorMessage =
			error instanceof Error ? error.message : "Unknown error";

		return NextResponse.json(
			{
				error: "Failed to save cultural image",
				details: errorMessage,
			},
			{ status: 500 }
		);
	}
}
