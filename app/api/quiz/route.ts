import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { quizService } from "@/lib/quiz/quiz-service";
import { DifficultyLevel } from "@prisma/client";

// GET /api/quiz - Get quiz questions based on category and difficulty
export async function GET(request: Request) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);
		const categoryId = searchParams.get("categoryId");
		const difficulty = searchParams.get("difficulty") as DifficultyLevel | null;
		const limit = parseInt(searchParams.get("limit") || "10");
		const page = Math.ceil(
			(parseInt(searchParams.get("offset") || "0") + 1) / limit
		);

		if (!categoryId) {
			return NextResponse.json(
				{ error: "Category ID is required" },
				{ status: 400 }
			);
		}

		// Verify category exists and is active
		const category = await quizService.getCategory(categoryId);
		if (!category) {
			return NextResponse.json(
				{ error: "Category not found or inactive" },
				{ status: 404 }
			);
		}

		// Get questions using the service (excludes correct answers for security)
		const questions = await quizService.getQuestions(
			{
				categoryId,
				difficulty: difficulty || undefined,
				isActive: true,
			},
			{ page, pageSize: limit },
			true // Exclude correct answers for security
		);

		return NextResponse.json({ questions });
	} catch (error) {
		console.error("Error fetching quiz questions:", error);
		return NextResponse.json(
			{ error: "Failed to fetch quiz questions" },
			{ status: 500 }
		);
	}
}

// POST /api/quiz - Submit a quiz answer
export async function POST(request: Request) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const body = await request.json();
		const { questionId, answerId, answerText, timeTaken = 0 } = body;

		if (!questionId) {
			return NextResponse.json(
				{ error: "Question ID is required" },
				{ status: 400 }
			);
		}

		// Use the service to handle the quiz attempt
		const result = await quizService.submitQuizAttempt(
			session.user.id,
			questionId,
			answerId,
			answerText,
			timeTaken
		);

		return NextResponse.json({
			success: true,
			...result,
		});
	} catch (error) {
		console.error("Error submitting quiz answer:", error);

		if (error instanceof Error && error.message === "Question not found") {
			return NextResponse.json(
				{ error: "Question not found" },
				{ status: 404 }
			);
		}

		return NextResponse.json(
			{ error: "Failed to submit quiz answer" },
			{ status: 500 }
		);
	}
}
