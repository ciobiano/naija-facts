import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/prisma";

export async function DELETE() {
	try {
		const session = await getServerSession(authOptions);

		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Delete user account and all related data
		// This will cascade delete related records due to foreign key constraints
		await prisma.user.delete({
			where: {
				id: session.user.id,
			},
		});

		return NextResponse.json({
			success: true,
			message: "Account deleted successfully",
		});
	} catch (error) {
		console.error("Error deleting account:", error);
		return NextResponse.json(
			{ error: "Failed to delete account" },
			{ status: 500 }
		);
	}
}
