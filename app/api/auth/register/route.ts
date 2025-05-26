import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

const registerSchema = z
	.object({
		email: z.string().email("Invalid email address"),
		password: z.string().min(8, "Password must be at least 8 characters"),
		fullName: z.string().min(2, "Full name must be at least 2 characters"),
		confirmPassword: z.string(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords don't match",
		path: ["confirmPassword"],
	});

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const validatedData = registerSchema.parse(body);

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

		// Hash password
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

			for (const category of categories) {
				await tx.userProgress.create({
					data: {
						user_id: user.id,
						category_id: category.id,
					},
				});
			}

			return user;
		});

		// TODO: Send verification email
		// const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify-email?token=${verificationToken}`;
		// await sendVerificationEmail(validatedData.email, verificationUrl);

		console.log(
			`Verification email should be sent to ${validatedData.email}. Token: ${verificationToken}`
		);

		return NextResponse.json(
			{
				message:
					"User created successfully. Please check your email to verify your account.",
				user: {
					id: result.id,
					email: result.email,
					fullName: result.full_name,
				},
			},
			{ status: 201 }
		);
	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: "Validation failed", details: error.errors },
				{ status: 400 }
			);
		}

		console.error("Registration error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
