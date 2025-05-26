import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

const forgotPasswordSchema = z.object({
	email: z.string().email("Invalid email address"),
});

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { email } = forgotPasswordSchema.parse(body);

		// Check if user exists
		const user = await prisma.profile.findUnique({
			where: { email },
		});

		if (!user) {
			// Don't reveal if user exists or not for security
			return NextResponse.json(
				{
					message:
						"If an account with that email exists, we've sent a password reset link.",
				},
				{ status: 200 }
			);
		}

		// Generate reset token
		const resetToken = crypto.randomBytes(32).toString("hex");
		const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

		// Store reset token in database (you might want to create a separate table for this)
		await prisma.profile.update({
			where: { id: user.id },
			data: {
				// Note: You'll need to add these fields to your schema
				reset_token: resetToken,
				reset_token_expiry: resetTokenExpiry,
			},
		});

		// TODO: Send email with reset link
		// const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`;
		// await sendPasswordResetEmail(email, resetUrl);

		console.log(`Password reset requested for ${email}. Token: ${resetToken}`);

		return NextResponse.json(
			{
				message:
					"If an account with that email exists, we've sent a password reset link.",
			},
			{ status: 200 }
		);
	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: "Invalid email address" },
				{ status: 400 }
			);
		}

		console.error("Forgot password error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
