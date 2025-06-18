import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth/auth-options";
import { passwordChangeSchema } from "@/lib/auth/validation";
import {
	rateLimitByUser,
	createRateLimitResponse,
} from "@/lib/auth/rate-limit";

export async function POST(request: NextRequest) {
	try {
		const session = await getServerSession(authOptions);

		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Apply rate limiting per user
		const rateLimitResult = rateLimitByUser(session.user.id, "passwordChange");
		if (!rateLimitResult.allowed) {
			return createRateLimitResponse(
				rateLimitResult.resetTime!,
				rateLimitResult.remainingRequests || 0
			);
		}

		const body = await request.json();
		// Removed sensitive data logging for security

		// Validate the request data
		const validation = passwordChangeSchema.safeParse(body);
		if (!validation.success) {
			console.log("Validation errors:", validation.error.errors);
			const errors: Record<string, string> = {};
			validation.error.errors.forEach((err) => {
				if (err.path.length > 0) {
					errors[err.path[0] as string] = err.message;
				}
			});
			console.log("Formatted errors:", errors);
			return NextResponse.json(
				{ error: "Validation failed", details: errors },
				{ status: 400 }
			);
		}

		const { currentPassword, newPassword } = validation.data;

		// Get user from database
		const user = await prisma.profile.findUnique({
			where: { id: session.user.id },
			select: { id: true, password_hash: true, email: true },
		});

		if (!user || !user.password_hash) {
			return NextResponse.json(
				{ error: "User not found or no password set" },
				{ status: 404 }
			);
		}

		// Verify current password
		const isCurrentPasswordValid = await bcrypt.compare(
			currentPassword,
			user.password_hash
		);

		if (!isCurrentPasswordValid) {
			return NextResponse.json(
				{ error: "Current password is incorrect" },
				{ status: 400 }
			);
		}

		// Hash new password
		const saltRounds = 12;
		const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

		// Update password in database
		await prisma.profile.update({
			where: { id: session.user.id },
			data: {
				password_hash: hashedNewPassword,
				updated_at: new Date(),
			},
		});

		// Log password change for security audit
		console.log(
			`Password changed for user: ${user.email} at ${new Date().toISOString()}`
		);

		return NextResponse.json({
			message: "Password updated successfully",
		});
	} catch (error) {
		console.error("Password change error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
