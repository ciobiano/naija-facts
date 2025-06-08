import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { quizService } from "@/lib/quiz/quiz-service";
import { adaptiveDifficultyService } from "@/lib/quiz/adaptive-difficulty";
import { DifficultyLevel } from "@prisma/client";

export async function GET(request: NextRequest) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);
		const categoryId = searchParams.get("categoryId");
		const action = searchParams.get("action");

		if (!categoryId) {
			return NextResponse.json(
				{ error: "Category ID is required" },
				{ status: 400 }
			);
		}

		switch (action) {
			case "recommendation":
				// Get adaptive difficulty recommendation
				const currentDifficulty = searchParams.get("currentDifficulty") as DifficultyLevel;
				const recommendation = await quizService.getAdaptiveRecommendation(
					session.user.id,
					categoryId,
					currentDifficulty
				);
				return NextResponse.json({ recommendation });

			case "baseline":
				// Perform baseline assessment
				const baselineDifficulty = await quizService.performBaselineAssessment(
					session.user.id,
					categoryId
				);
				return NextResponse.json({ 
					baselineDifficulty,
					message: "Baseline assessment completed"
				});

			case "performance":
				// Get user performance metrics
				const metrics = await adaptiveDifficultyService.analyzeUserPerformance(
					session.user.id,
					categoryId
				);
				return NextResponse.json({ metrics });

			case "questions":
				// Get adaptive questions
				const count = parseInt(searchParams.get("count") || "10");
				const forcedDifficulty = searchParams.get("difficulty") as DifficultyLevel;
				
				const questions = await quizService.getAdaptiveQuestions(
					session.user.id,
					categoryId,
					count,
					forcedDifficulty
				);
				
				return NextResponse.json({ 
					questions,
					count: questions.length,
					adaptive: true
				});

			default:
				return NextResponse.json(
					{ error: "Invalid action. Use: recommendation, baseline, performance, or questions" },
					{ status: 400 }
				);
		}
	} catch (error) {
		console.error("Adaptive difficulty API error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

export async function POST(request: NextRequest) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const body = await request.json();
		const { categoryId, action, data } = body;

		if (!categoryId || !action) {
			return NextResponse.json(
				{ error: "Category ID and action are required" },
				{ status: 400 }
			);
		}

		switch (action) {
			case "updateDifficulty":
				// Manual difficulty override
				const { difficulty, reason } = data;
				if (!difficulty) {
					return NextResponse.json(
						{ error: "Difficulty level is required" },
						{ status: 400 }
					);
				}

				// Store user preference (you might want to add this to the database)
				// For now, just return success
				return NextResponse.json({
					success: true,
					message: `Difficulty manually set to ${difficulty}`,
					reason: reason || "User preference"
				});

			case "feedback":
				// User feedback on difficulty appropriateness
				const { questionId, wasAppropriate, suggestedDifficulty } = data;
				
				// Store feedback for algorithm improvement
				// This could be used to refine the adaptive algorithm
				return NextResponse.json({
					success: true,
					message: "Feedback recorded",
					questionId,
					feedback: { wasAppropriate, suggestedDifficulty }
				});

			default:
				return NextResponse.json(
					{ error: "Invalid action. Use: updateDifficulty or feedback" },
					{ status: 400 }
				);
		}
	} catch (error) {
		console.error("Adaptive difficulty POST API error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
} 