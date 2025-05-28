import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

const registerSchema = z
	.object({
		email: z.string().email("Invalid email address").toLowerCase().trim(),
		password: z
			.string()
			.min(8, "Password must be at least 8 characters")
			.regex(
				/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
				"Password must contain at least one uppercase letter, one lowercase letter, and one number"
			),
		fullName: z
			.string()
			.min(2, "Full name must be at least 2 characters")
			.max(100, "Full name must be less than 100 characters")
			.trim(),
		confirmPassword: z.string(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords don't match",
		path: ["confirmPassword"],
	});

export async function POST(request: NextRequest) {
	try {
		// Parse and validate request body
		const body = await request.json();
		const validatedData = registerSchema.parse(body);

		// Additional security: Check for suspicious patterns
		const suspiciousPatterns = [
			/script/i,
			/javascript/i,
			/vbscript/i,
			/onload/i,
			/onerror/i,
		];

		const isSuspicious = suspiciousPatterns.some(
			(pattern) =>
				pattern.test(validatedData.fullName) ||
				pattern.test(validatedData.email)
		);

		if (isSuspicious) {
			return NextResponse.json(
				{ error: "Invalid input detected" },
				{ status: 400 }
			);
		}

		// Check if user already exists
		const existingUser = await prisma.profile.findUnique({
			where: { email: validatedData.email },
		});

		if (existingUser) {
			return NextResponse.json(
				{ error: "User with this email already exists" },
				{ status: 400 }
			);
		}

		// Hash password with higher salt rounds for better security
		const saltRounds = 12;
		const hashedPassword = await bcrypt.hash(
			validatedData.password,
			saltRounds
		);

		// Generate verification token
		const verificationToken = crypto.randomBytes(32).toString("hex");
		const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

		// Create user and verification token in a transaction
		const result = await prisma.$transaction(async (tx) => {
			// Create user
			const user = await tx.profile.create({
				data: {
					email: validatedData.email,
					full_name: validatedData.fullName,
					password_hash: hashedPassword,
					is_active: true,
					created_at: new Date(),
					updated_at: new Date(),
				},
				select: {
					id: true,
					email: true,
					full_name: true,
					created_at: true,
				},
			});

			// Create verification token
			await tx.verificationToken.create({
				data: {
					identifier: validatedData.email,
					token: verificationToken,
					expires: expires,
				},
			});

			// Initialize user progress for all active categories
			const categories = await tx.category.findMany({
				where: { is_active: true },
			});

			// Create user progress entries for each category
			const progressPromises = categories.map((category) =>
				tx.userProgress.create({
					data: {
						user_id: user.id,
						category_id: category.id,
						total_questions_attempted: 0,
						correct_answers: 0,
						completion_percentage: 0,
						last_activity: new Date(),
					},
				})
			);

			await Promise.all(progressPromises);

			return { user, verificationToken };
		});

		// TODO: Send verification email
		// const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify-email?token=${verificationToken}`;
		// await sendVerificationEmail(validatedData.email, verificationUrl);

		// Log for development (remove in production)
		if (process.env.NODE_ENV === "development") {
			console.log(
				`Verification email should be sent to ${validatedData.email}. Token: ${result.verificationToken}`
			);
		}

		return NextResponse.json(
			{
				message:
					"Account created successfully! Please check your email to verify your account.",
				user: {
					id: result.user.id,
					email: result.user.email,
					fullName: result.user.full_name,
				},
				requiresVerification: true,
			},
			{ status: 201 }
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

		// Log error for debugging (be careful not to log sensitive data)
		console.error("Registration error:", {
			message: error instanceof Error ? error.message : "Unknown error",
			timestamp: new Date().toISOString(),
		});

		// Generic error response to avoid information leakage
		return NextResponse.json(
			{ error: "Registration failed. Please try again later." },
			{ status: 500 }
		);
	}
}
