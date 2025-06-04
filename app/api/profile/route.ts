import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authOptions } from "../auth/[...nextauth]/route";

const updateProfileSchema = z.object({
	id: z.string().optional(),
	fullName: z
		.string()
		.min(2, "Full name must be at least 2 characters")
		.optional(),
	preferredLanguage: z.string().optional(),
	timezone: z.string().optional(),
	dateOfBirth: z.string().optional(),
	location: z.string().optional(),
	avatarUrl: z.string().url().optional().or(z.literal("")),
	learningPreferences: z.record(z.any()).optional(),
});

export async function GET(request: NextRequest) {
	try {
		const session = await getServerSession(authOptions);

		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const profile = await prisma.profile.findUnique({
			where: { id: session.user.id },
			select: {
				id: true,
				email: true,
				full_name: true,
				avatar_url: true,
				preferred_language: true,
				timezone: true,
				date_of_birth: true,
				location: true,
				learning_preferences: true,
				created_at: true,
				updated_at: true,
				last_login: true,
				is_active: true,
			},
		});

		if (!profile) {
			return NextResponse.json({ error: "Profile not found" }, { status: 404 });
		}

		return NextResponse.json({ profile });
	} catch (error) {
		console.error("Get profile error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

export async function PUT(request: NextRequest) {
	try {
		const session = await getServerSession(authOptions);

		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const body = await request.json();
		const validatedData = updateProfileSchema.parse(body);

		// Prepare update data
		const updateData: any = {
			updated_at: new Date(),
		};

		if (validatedData.fullName !== undefined) {
			updateData.full_name = validatedData.fullName;
		}
		if (validatedData.preferredLanguage !== undefined) {
			updateData.preferred_language = validatedData.preferredLanguage;
		}
		if (validatedData.timezone !== undefined) {
			updateData.timezone = validatedData.timezone;
		}
		if (validatedData.dateOfBirth !== undefined) {
			updateData.date_of_birth = validatedData.dateOfBirth
				? new Date(validatedData.dateOfBirth)
				: null;
		}
		if (validatedData.location !== undefined) {
			updateData.location = validatedData.location;
		}
		if (validatedData.avatarUrl !== undefined) {
			updateData.avatar_url = validatedData.avatarUrl || null;
		}
		if (validatedData.learningPreferences !== undefined) {
			updateData.learning_preferences = validatedData.learningPreferences;
		}

		const updatedProfile = await prisma.profile.update({
			where: { id: session.user.id },
			data: updateData,
			select: {
				id: true,
				email: true,
				full_name: true,
				avatar_url: true,
				preferred_language: true,
				timezone: true,
				date_of_birth: true,
				location: true,
				learning_preferences: true,
				updated_at: true,
			},
		});

		return NextResponse.json({
			message: "Profile updated successfully",
			profile: updatedProfile,
		});
	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: "Validation failed", details: error.errors },
				{ status: 400 }
			);
		}

		console.error("Update profile error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
