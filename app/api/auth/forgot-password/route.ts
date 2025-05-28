import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

const forgotPasswordSchema = z.object({
	email: z.string().email("Invalid email address").toLowerCase().trim(),
});

// Rate limiting map (in production, use Redis or similar)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { email } = forgotPasswordSchema.parse(body);

		// Rate limiting: max 3 requests per 15 minutes per email
		const now = Date.now();
		const rateLimitKey = `forgot-password:${email}`;
		const rateLimit = rateLimitMap.get(rateLimitKey);

		if (rateLimit) {
			if (now < rateLimit.resetTime) {
				if (rateLimit.count >= 3) {
					return NextResponse.json(
						{
							error:
								"Too many password reset requests. Please wait before trying again.",
							code: "RATE_LIMITED",
						},
						{ status: 429 }
					);
				}
				rateLimit.count++;
			} else {
				// Reset the rate limit
				rateLimitMap.set(rateLimitKey, {
					count: 1,
					resetTime: now + 15 * 60 * 1000,
				});
			}
		} else {
			rateLimitMap.set(rateLimitKey, {
				count: 1,
				resetTime: now + 15 * 60 * 1000,
			});
		}

		// Check if user exists
		const user = await prisma.profile.findUnique({
			where: { email },
			select: { id: true, email: true, full_name: true, is_active: true },
		});

		// Always return success message for security (don't reveal if user exists)
		const successMessage =
			"If an account with that email exists, we've sent a password reset link.";

		if (!user || !user.is_active) {
			return NextResponse.json({ message: successMessage }, { status: 200 });
		}

		// Generate cryptographically secure reset token
		const resetToken = crypto.randomBytes(32).toString("hex");
		const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

		// Clear any existing reset tokens and set new one
		await prisma.profile.update({
			where: { id: user.id },
			data: {
				reset_token: resetToken,
				reset_token_expiry: resetTokenExpiry,
				updated_at: new Date(),
			},
		});

		// TODO: Send email with reset link
		const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`;
		// await sendPasswordResetEmail(email, resetUrl, user.full_name);

		// Log for development (remove in production)
		if (process.env.NODE_ENV === "development") {
			console.log(`Password reset requested for ${email}`);
			console.log(`Reset URL: ${resetUrl}`);
		}

		return NextResponse.json({ message: successMessage }, { status: 200 });
	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{
					error: "Invalid email address",
					details: error.errors.map((err) => ({
						field: err.path.join("."),
						message: err.message,
					})),
				},
				{ status: 400 }
			);
		}

		console.error("Forgot password error:", {
			message: error instanceof Error ? error.message : "Unknown error",
			timestamp: new Date().toISOString(),
		});

		return NextResponse.json(
			{ error: "Internal server error. Please try again later." },
			{ status: 500 }
		);
	}
}
