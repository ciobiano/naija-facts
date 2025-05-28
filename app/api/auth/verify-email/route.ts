import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

const verifyEmailSchema = z.object({
	token: z.string().min(1, "Verification token is required"),
});

const resendVerificationSchema = z.object({
	email: z.string().email("Invalid email address").toLowerCase().trim(),
});

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { token } = verifyEmailSchema.parse(body);

		// Validate token format (should be 64 character hex string)
		if (!/^[a-f0-9]{64}$/i.test(token)) {
			return NextResponse.json(
				{ error: "Invalid token format" },
				{ status: 400 }
			);
		}

		// Find verification token in the VerificationToken table
		const verificationToken = await prisma.verificationToken.findFirst({
			where: {
				token: token,
				expires: {
					gt: new Date(), // Token must not be expired
				},
			},
		});

		if (!verificationToken) {
			return NextResponse.json(
				{
					error: "Invalid or expired verification token",
					code: "TOKEN_INVALID_OR_EXPIRED",
				},
				{ status: 400 }
			);
		}

		// Find user by email (identifier)
		const user = await prisma.profile.findUnique({
			where: { email: verificationToken.identifier },
		});

		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 400 });
		}

		// Check if email is already verified
		if (user.email_verified) {
			return NextResponse.json(
				{
					message: "Email is already verified",
					code: "ALREADY_VERIFIED",
				},
				{ status: 200 }
			);
		}

		// Mark email as verified and delete the verification token
		await prisma.$transaction([
			prisma.profile.update({
				where: { id: user.id },
				data: {
					email_verified: new Date(),
					updated_at: new Date(),
				},
			}),
			prisma.verificationToken.delete({
				where: {
					identifier_token: {
						identifier: verificationToken.identifier,
						token: verificationToken.token,
					},
				},
			}),
		]);

		return NextResponse.json(
			{
				message:
					"Email verified successfully! You can now sign in to your account.",
				code: "VERIFICATION_SUCCESS",
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

		console.error("Email verification error:", {
			message: error instanceof Error ? error.message : "Unknown error",
			timestamp: new Date().toISOString(),
		});

		return NextResponse.json(
			{ error: "Verification failed. Please try again." },
			{ status: 500 }
		);
	}
}

// Resend verification email
export async function PUT(request: NextRequest) {
	try {
		const body = await request.json();
		const { email } = resendVerificationSchema.parse(body);

		const user = await prisma.profile.findUnique({
			where: { email },
		});

		if (!user) {
			// Don't reveal if user exists for security
			return NextResponse.json(
				{
					message:
						"If an account with that email exists, we've sent a verification link.",
					code: "RESEND_REQUESTED",
				},
				{ status: 200 }
			);
		}

		if (user.email_verified) {
			return NextResponse.json(
				{
					error: "Email is already verified",
					code: "ALREADY_VERIFIED",
				},
				{ status: 400 }
			);
		}

		// Check for rate limiting - prevent spam
		const recentTokens = await prisma.verificationToken.findMany({
			where: {
				identifier: email,
				expires: {
					gt: new Date(Date.now() - 5 * 60 * 1000), // Last 5 minutes
				},
			},
		});

		if (recentTokens.length >= 3) {
			return NextResponse.json(
				{
					error:
						"Too many verification requests. Please wait before requesting another.",
					code: "RATE_LIMITED",
				},
				{ status: 429 }
			);
		}

		// Generate new verification token
		const verificationToken = crypto.randomBytes(32).toString("hex");
		const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

		// Delete any existing verification tokens for this email and create new one
		await prisma.$transaction([
			prisma.verificationToken.deleteMany({
				where: { identifier: email },
			}),
			prisma.verificationToken.create({
				data: {
					identifier: email,
					token: verificationToken,
					expires: expires,
				},
			}),
		]);

		// TODO: Send verification email
		// const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify-email?token=${verificationToken}`;
		// await sendVerificationEmail(email, verificationUrl);

		// Log for development (remove in production)
		if (process.env.NODE_ENV === "development") {
			console.log(
				`Verification email requested for ${email}. Token: ${verificationToken}`
			);
		}

		return NextResponse.json(
			{
				message:
					"Verification email sent! Please check your inbox and spam folder.",
				code: "RESEND_SUCCESS",
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

		console.error("Resend verification error:", {
			message: error instanceof Error ? error.message : "Unknown error",
			timestamp: new Date().toISOString(),
		});

		return NextResponse.json(
			{ error: "Failed to send verification email. Please try again." },
			{ status: 500 }
		);
	}
}
