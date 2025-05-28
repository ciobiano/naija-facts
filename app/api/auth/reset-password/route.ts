import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const resetPasswordSchema = z
	.object({
		token: z
			.string()
			.min(1, "Reset token is required")
			.regex(/^[a-f0-9]{64}$/i, "Invalid token format"),
		password: z
			.string()
			.min(8, "Password must be at least 8 characters")
			.regex(
				/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
				"Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
			),
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

		// Additional security: Check for suspicious patterns in password
		const suspiciousPatterns = [
			/script/i,
			/javascript/i,
			/vbscript/i,
			/onload/i,
			/onerror/i,
		];

		const isSuspicious = suspiciousPatterns.some((pattern) =>
			pattern.test(password)
		);

		if (isSuspicious) {
			return NextResponse.json(
				{ error: "Invalid password format detected" },
				{ status: 400 }
			);
		}

		// Find user with valid reset token
		const user = await prisma.profile.findFirst({
			where: {
				reset_token: token,
				reset_token_expiry: {
					gt: new Date(), // Token must not be expired
				},
				is_active: true, // User must be active
			},
			select: {
				id: true,
				email: true,
				password_hash: true,
				reset_token: true,
				reset_token_expiry: true,
			},
		});

		if (!user) {
			return NextResponse.json(
				{
					error: "Invalid or expired reset token",
					code: "TOKEN_INVALID_OR_EXPIRED",
				},
				{ status: 400 }
			);
		}

		// Check if new password is different from current password
		if (user.password_hash) {
			const isSamePassword = await bcrypt.compare(password, user.password_hash);
			if (isSamePassword) {
				return NextResponse.json(
					{
						error: "New password must be different from your current password",
						code: "SAME_PASSWORD",
					},
					{ status: 400 }
				);
			}
		}

		// Hash new password with high salt rounds
		const saltRounds = 12;
		const hashedPassword = await bcrypt.hash(password, saltRounds);

		// Update user password and clear reset token in a transaction
		await prisma.$transaction([
			prisma.profile.update({
				where: { id: user.id },
				data: {
					password_hash: hashedPassword,
					reset_token: null,
					reset_token_expiry: null,
					updated_at: new Date(),
				},
			}),
			// Log the password reset for security audit
			// You might want to create a separate audit log table
		]);

		// Log for security audit (in production, use proper audit logging)
		console.log(
			`Password reset completed for user ${
				user.email
			} at ${new Date().toISOString()}`
		);

		return NextResponse.json(
			{
				message:
					"Password reset successfully. You can now sign in with your new password.",
				code: "RESET_SUCCESS",
			},
			{ status: 200 }
		);
	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{
					error: "Validation failed",
					details: error.errors.map((err) => ({
						field: err.path.join("."),
						message: err.message,
					})),
				},
				{ status: 400 }
			);
		}

		console.error("Reset password error:", {
			message: error instanceof Error ? error.message : "Unknown error",
			timestamp: new Date().toISOString(),
		});

		return NextResponse.json(
			{ error: "Internal server error. Please try again later." },
			{ status: 500 }
		);
	}
}
