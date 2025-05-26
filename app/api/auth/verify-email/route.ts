import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

const verifyEmailSchema = z.object({
	token: z.string().min(1, "Verification token is required"),
});

const resendVerificationSchema = z.object({
	email: z.string().email("Invalid email address"),
});

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { token } = verifyEmailSchema.parse(body);

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
				{ error: "Invalid or expired verification token" },
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
			{ message: "Email verified successfully" },
			{ status: 200 }
		);
	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: "Validation failed", details: error.errors },
				{ status: 400 }
			);
		}

		console.error("Email verification error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
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
				},
				{ status: 200 }
			);
		}

		if (user.email_verified) {
			return NextResponse.json(
				{ error: "Email is already verified" },
				{ status: 400 }
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

		console.log(
			`Verification email requested for ${email}. Token: ${verificationToken}`
		);

		return NextResponse.json(
			{
				message:
					"If an account with that email exists, we've sent a verification link.",
			},
			{ status: 200 }
		);
	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: "Validation failed", details: error.errors },
				{ status: 400 }
			);
		}

		console.error("Resend verification error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
