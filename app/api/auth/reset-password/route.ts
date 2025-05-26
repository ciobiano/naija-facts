import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const resetPasswordSchema = z
	.object({
		token: z.string().min(1, "Reset token is required"),
		password: z.string().min(8, "Password must be at least 8 characters"),
		confirmPassword: z.string(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords don't match",
		path: ["confirmPassword"],
	});

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { token, password } = resetPasswordSchema.parse(body);

		// Find user with valid reset token
		const user = await prisma.profile.findFirst({
			where: {
				reset_token: token,
				reset_token_expiry: {
					gt: new Date(), // Token must not be expired
				},
			},
		});

		if (!user) {
			return NextResponse.json(
				{ error: "Invalid or expired reset token" },
				{ status: 400 }
			);
		}

		// Hash new password
		const saltRounds = 12;
		const hashedPassword = await bcrypt.hash(password, saltRounds);

		// Update user password and clear reset token
		await prisma.profile.update({
			where: { id: user.id },
			data: {
				password_hash: hashedPassword,
				reset_token: null,
				reset_token_expiry: null,
				updated_at: new Date(),
			},
		});

		return NextResponse.json(
			{ message: "Password reset successfully" },
			{ status: 200 }
		);
	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: "Validation failed", details: error.errors },
				{ status: 400 }
			);
		}

		console.error("Reset password error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
