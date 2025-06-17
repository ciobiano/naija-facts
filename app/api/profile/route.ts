import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/prisma";

export async function GET() {
	try {
		const session = await getServerSession(authOptions);

		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const user = await prisma.profile.findUnique({
			where: {
				id: session.user.id,
			},
			select: {
				id: true,
				email: true,
				full_name: true,
				created_at: true,
				updated_at: true,
				email_verified: true,
			},
		});

		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		return NextResponse.json({
			user,
		});
	} catch (error) {
		console.error("Error fetching profile:", error);
		return NextResponse.json(
			{ error: "Failed to fetch profile" },
			{ status: 500 }
		);
	}
}

export async function PUT(request: Request) {
	try {
		const session = await getServerSession(authOptions);

		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const body = await request.json();
		const { full_name } = body;

		if (!full_name || typeof full_name !== "string") {
			return NextResponse.json(
				{ error: "Full name is required" },
				{ status: 400 }
			);
		}

		const updatedUser = await prisma.profile.update({
			where: {
				id: session.user.id,
			},
			data: {
				full_name,
				updated_at: new Date(),
			},
			select: {
				id: true,
				email: true,
				full_name: true,
				created_at: true,
				updated_at: true,
				email_verified: true,
			},
		});

		return NextResponse.json({
			success: true,
			user: updatedUser,
		});
	} catch (error: unknown) {
		console.error("Error updating profile:", error);
		return NextResponse.json(
			{ error: "Failed to update profile" },
			{ status: 500 }
		);
	}
}
