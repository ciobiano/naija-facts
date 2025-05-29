import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function DELETE(request: NextRequest) {
	try {
		const session = await getServerSession(authOptions);

		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Perform account deletion in a transaction to ensure data consistency
		await prisma.$transaction(async (tx) => {
			// Delete related records first (foreign key dependencies)

			// Delete user progress
			await tx.userProgress.deleteMany({
				where: { user_id: session.user!.id },
			});

			// Delete user achievements
			await tx.userAchievement.deleteMany({
				where: { user_id: session.user!.id },
			});

			// Delete quiz attempts (if any)
			await tx.quizAttempt.deleteMany({
				where: { user_id: session.user!.id },
			});

			// Delete verification tokens
			await tx.verificationToken.deleteMany({
				where: {
					identifier: session.user!.email!,
				},
			});

			// Finally, delete the user profile
			await tx.profile.delete({
				where: { id: session.user!.id },
			});
		});

		// Log account deletion for audit purposes
		console.log(
			`Account deleted for user: ${
				session.user.email
			} at ${new Date().toISOString()}`
		);

		return NextResponse.json({
			message: "Account deleted successfully",
		});
	} catch (error) {
		console.error("Account deletion error:", error);
		return NextResponse.json(
			{ error: "Failed to delete account. Please try again later." },
			{ status: 500 }
		);
	}
}
