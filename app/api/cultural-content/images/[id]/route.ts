import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

interface RouteContext {
	params: Promise<{
		id: string;
	}>;
}

// Schema for updating metadata
const updateMetadataSchema = z.object({
	title: z.string().min(1, "Title is required").optional(),
	description: z.string().optional(),
	region: z.string().optional(),
	photographer: z.string().optional(),
	alt_text: z.string().optional(),
});

// GET individual image with view tracking
export async function GET(request: NextRequest, { params }: RouteContext) {
	try {
		const { id: imageId } = await params;

		if (!imageId) {
			return NextResponse.json(
				{ error: "Image ID is required" },
				{ status: 400 }
			);
		}

		// Fetch image details
		const image = await prisma.culturalImage.findUnique({
			where: { id: imageId },
			include: {
				uploader: {
					select: {
						id: true,
						full_name: true,
					},
				},
			},
		});

		if (!image) {
			return NextResponse.json({ error: "Image not found" }, { status: 404 });
		}

		// Increment view count
		await prisma.culturalImage.update({
			where: { id: imageId },
			data: {
				view_count: {
					increment: 1,
				},
			},
		});

		return NextResponse.json({ image });
	} catch (error) {
		console.error("Error fetching image:", error);
		return NextResponse.json(
			{ error: "Failed to fetch image" },
			{ status: 500 }
		);
	}
}

// PUT to update image metadata
export async function PUT(request: NextRequest, { params }: RouteContext) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { id: imageId } = await params;
		const body = await request.json();
		const { title, description, region, photographer } = body;

		// Check if user owns the image
		const existingImage = await prisma.culturalImage.findUnique({
			where: { id: imageId },
			select: { uploaded_by: true },
		});

		if (!existingImage) {
			return NextResponse.json({ error: "Image not found" }, { status: 404 });
		}

		if (existingImage.uploaded_by !== session.user.id) {
			return NextResponse.json({ error: "Permission denied" }, { status: 403 });
		}

		// Update image
		const updatedImage = await prisma.culturalImage.update({
			where: { id: imageId },
			data: {
				title,
				description,
				region,
				photographer,
				updated_at: new Date(),
			},
		});

		return NextResponse.json({
			success: true,
			image: updatedImage,
		});
	} catch (error) {
		console.error("Error updating image:", error);
		return NextResponse.json(
			{ error: "Failed to update image" },
			{ status: 500 }
		);
	}
}

// DELETE image (only by owner)
export async function DELETE(request: NextRequest, { params }: RouteContext) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { id: imageId } = await params;

		// Check if user owns the image
		const existingImage = await prisma.culturalImage.findUnique({
			where: { id: imageId },
			select: { uploaded_by: true, file_path: true },
		});

		if (!existingImage) {
			return NextResponse.json({ error: "Image not found" }, { status: 404 });
		}

		if (existingImage.uploaded_by !== session.user.id) {
			return NextResponse.json({ error: "Permission denied" }, { status: 403 });
		}

		// Delete from database (UploadThing files are automatically cleaned up)
		await prisma.culturalImage.delete({
			where: { id: imageId },
		});

		return NextResponse.json({
			success: true,
			message: "Image deleted successfully",
		});
	} catch (error) {
		console.error("Error deleting image:", error);
		return NextResponse.json(
			{ error: "Failed to delete image" },
			{ status: 500 }
		);
	}
}

export async function PATCH(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		// Check authentication
		const session = await getServerSession(authOptions);
		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { id } = await params;
		const body = await request.json();
		const validatedData = updateMetadataSchema.parse(body);

		// Update the cultural image
		const updatedImage = await prisma.culturalImage.update({
			where: { id },
			data: validatedData,
			include: {
				uploader: {
					select: {
						id: true,
						full_name: true,
					},
				},
			},
		});

		return NextResponse.json({
			success: true,
			data: updatedImage,
			message: "Metadata updated successfully",
		});
	} catch (error) {
		console.error("Error updating cultural image metadata:", error);

		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{
					error: "Validation error",
					details: error.errors,
				},
				{ status: 400 }
			);
		}

		return NextResponse.json(
			{ error: "Failed to update metadata" },
			{ status: 500 }
		);
	}
}
