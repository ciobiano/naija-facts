import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth/auth-options";
import { emailChangeSchema } from "@/lib/auth/validation";
import crypto from "crypto";

export async function POST(request: NextRequest) {
	try {
		const session = await getServerSession(authOptions);

		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const body = await request.json();

		// Validate the request data
		const validation = emailChangeSchema.safeParse(body);
		if (!validation.success) {
			const errors: Record<string, string> = {};
			validation.error.errors.forEach((err) => {
				if (err.path.length > 0) {
					errors[err.path[0] as string] = err.message;
				}
			});
			return NextResponse.json(
				{ error: "Validation failed", details: errors },
				{ status: 400 }
			);
		}

		const { newEmail, password } = validation.data;

		// Get user from database
		const user = await prisma.profile.findUnique({
			where: { id: session.user.id },
			select: { id: true, email: true, password_hash: true },
		});

		if (!user || !user.password_hash) {
			return NextResponse.json(
				{ error: "User not found or no password set" },
				{ status: 404 }
			);
		}

		// Check if new email is the same as current
		if (user.email === newEmail) {
			return NextResponse.json(
				{ error: "New email must be different from current email" },
				{ status: 400 }
			);
		}

		// Verify password
		const isPasswordValid = await bcrypt.compare(password, user.password_hash);
		if (!isPasswordValid) {
			return NextResponse.json(
				{ error: "Incorrect password" },
				{ status: 400 }
			);
		}

		// Check if new email is already in use
		const existingUser = await prisma.profile.findUnique({
			where: { email: newEmail },
		});

		if (existingUser) {
			return NextResponse.json(
				{ error: "This email address is already in use" },
				{ status: 400 }
			);
		}

		// Generate verification token
		const verificationToken = crypto.randomBytes(32).toString("hex");
		const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

		// Store pending email change in verification tokens table
		await prisma.verificationToken.create({
			data: {
				identifier: `email-change:${session.user.id}:${newEmail}`,
				token: verificationToken,
				expires: tokenExpiry,
			},
		});

		// TODO: Send verification email to new email address
		// This would integrate with your email service (SendGrid, AWS SES, etc.)
		console.log(
			`Email verification token generated for ${newEmail}: ${verificationToken}`
		);

		// Log email change attempt for security audit
		console.log(
			`Email change requested by user: ${
				user.email
			} to ${newEmail} at ${new Date().toISOString()}`
		);

		return NextResponse.json({
			message:
				"Verification email sent to your new email address. Please check your inbox and click the verification link to complete the email change.",
			pendingEmail: newEmail,
		});
	} catch (error) {
		console.error("Email change error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

// Handle email verification
export async function PUT(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const token = searchParams.get("token");

		if (!token) {
			return NextResponse.json(
				{ error: "Verification token is required" },
				{ status: 400 }
			);
		}

		// Find the verification token
		const verificationRecord = await prisma.verificationToken.findUnique({
			where: { token },
		});

		if (!verificationRecord) {
			return NextResponse.json(
				{ error: "Invalid or expired verification token" },
				{ status: 400 }
			);
		}

		// Check if token is expired
		if (verificationRecord.expires < new Date()) {
			// Clean up expired token
			await prisma.verificationToken.delete({
				where: { token },
			});
			return NextResponse.json(
				{ error: "Verification token has expired" },
				{ status: 400 }
			);
		}

		// Parse the identifier to get user ID and new email
		const identifierParts = verificationRecord.identifier.split(":");
		if (identifierParts.length !== 3 || identifierParts[0] !== "email-change") {
			return NextResponse.json(
				{ error: "Invalid verification token format" },
				{ status: 400 }
			);
		}

		const userId = identifierParts[1];
		const newEmail = identifierParts[2];

		// Update user email
		await prisma.profile.update({
			where: { id: userId },
			data: {
				email: newEmail,
				updated_at: new Date(),
			},
		});

		// Clean up verification token
		await prisma.verificationToken.delete({
			where: { token },
		});

		// Log successful email change
		console.log(
			`Email successfully changed for user: ${userId} to ${newEmail} at ${new Date().toISOString()}`
		);

		return NextResponse.json({
			message: "Email address updated successfully",
			newEmail,
		});
	} catch (error) {
		console.error("Email verification error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
