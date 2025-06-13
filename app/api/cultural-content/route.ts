import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { Prisma } from "@prisma/client";

// Query parameters schema
const querySchema = z.object({
	page: z.string().optional().default("1"),
	limit: z.string().optional().default("20"),
	sortBy: z
		.enum(["date_uploaded", "title", "region"])
		.optional()
		.default("date_uploaded"),
	sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
	region: z.string().optional(),
	search: z.string().optional(),
});

export async function GET(request: NextRequest) {
	try {
		console.log("Cultural content API called");

		const { searchParams } = new URL(request.url);
		const queryParams = Object.fromEntries(searchParams.entries());
		console.log("Query params:", queryParams);

		const { page, limit, sortBy, sortOrder, region, search } =
			querySchema.parse(queryParams);

		const pageNum = parseInt(page);
		const limitNum = parseInt(limit);
		const skip = (pageNum - 1) * limitNum;

		// Build where clause
		const where: Prisma.CulturalImageWhereInput = {};

		if (region) {
			where.region = region;
		}

		if (search) {
			where.OR = [
				{ title: { contains: search, mode: "insensitive" } },
				{ description: { contains: search, mode: "insensitive" } },
				{ photographer: { contains: search, mode: "insensitive" } },
			];
		}

		console.log("Where clause:", JSON.stringify(where, null, 2));

		// Build order by clause
		const orderBy: Prisma.CulturalImageOrderByWithRelationInput = {};
		if (sortBy === "date_uploaded") {
			orderBy.date_uploaded = sortOrder === "asc" ? "asc" : "desc";
		} else {
			orderBy[sortBy] = sortOrder;
		}

		console.log("Order by clause:", JSON.stringify(orderBy, null, 2));

		// Test database connection
		console.log("Testing database connection...");
		await prisma.$connect();
		console.log("Database connected successfully");

		// Get total count for pagination
		console.log("Getting total count...");
		const total = await prisma.culturalImage.count({ where });
		console.log("Total images found:", total);

		// Get paginated results
		console.log("Fetching images...");
		const images = await prisma.culturalImage.findMany({
			where,
			orderBy,
			skip,
			take: limitNum,
			include: {
				uploader: {
					select: {
						id: true,
						full_name: true,
					},
				},
			},
		});

		console.log("Images fetched:", images.length);

		// Calculate pagination metadata
		const totalPages = Math.ceil(total / limitNum);
		const hasNextPage = pageNum < totalPages;
		const hasPrevPage = pageNum > 1;

		const response = {
			success: true,
			data: {
				images,
				pagination: {
					page: pageNum,
					limit: limitNum,
					total,
					totalPages,
					hasNextPage,
					hasPrevPage,
				},
			},
		};

		console.log("Returning response with", images.length, "images");
		return NextResponse.json(response);
	} catch (error) {
		console.error("Error fetching cultural content:");
		console.error("Error type:", typeof error);
		console.error(
			"Error name:",
			error instanceof Error ? error.name : "Unknown"
		);
		console.error(
			"Error message:",
			error instanceof Error ? error.message : String(error)
		);
		console.error(
			"Error stack:",
			error instanceof Error ? error.stack : "No stack"
		);

		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{
					error: "Invalid query parameters",
					details: error.errors,
				},
				{ status: 400 }
			);
		}

		const errorMessage =
			error instanceof Error ? error.message : "Unknown error";

		return NextResponse.json(
			{
				error: "Failed to fetch cultural content",
				details: errorMessage,
			},
			{ status: 500 }
		);
	} finally {
		// Always disconnect
		try {
			await prisma.$disconnect();
		} catch (disconnectError) {
			console.error("Error disconnecting from database:", disconnectError);
		}
	}
}
