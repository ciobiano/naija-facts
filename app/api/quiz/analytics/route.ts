import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);
		const categoryId = searchParams.get("categoryId");

		if (!categoryId) {
			return NextResponse.json(
				{ error: "Category ID is required" },
				{ status: 400 }
			);
		}

		// Get category information
		const category = await prisma.category.findUnique({
			where: {
				slug: categoryId,
				is_active: true,
			},
			select: {
				id: true,
				name: true,
				slug: true,
				quiz_questions: {
					where: { is_active: true },
					select: { id: true },
				},
			},
		});

		if (!category) {
			return NextResponse.json(
				{ error: "Category not found" },
				{ status: 404 }
			);
		}

		// Get user progress for this category
		const userProgress = await prisma.userProgress.findUnique({
			where: {
				user_id_category_id: {
					user_id: session.user.id,
					category_id: category.id,
				},
			},
		});

		// Get quiz attempts for analytics
		const quizAttempts = await prisma.quizAttempt.findMany({
			where: {
				user_id: session.user.id,
				question: {
					category_id: category.id,
					is_active: true,
				},
			},
			include: {
				question: {
					select: {
						difficulty_level: true,
						points: true,
					},
				},
			},
			orderBy: {
				created_at: "desc",
			},
			take: 100, // Last 100 attempts for analysis
		});

		// Calculate user statistics
		const totalAttempts = quizAttempts.length;
		const correctAnswers = quizAttempts.filter(
			(attempt) => attempt.is_correct
		).length;
		const accuracy =
			totalAttempts > 0
				? Math.round((correctAnswers / totalAttempts) * 100)
				: 0;

		const totalPoints = quizAttempts
			.filter((attempt) => attempt.is_correct)
			.reduce((sum, attempt) => sum + attempt.points_earned, 0);

		const averageScore = accuracy;

		// Calculate time statistics
		const times = quizAttempts
			.map((attempt) => attempt.time_taken_seconds)
			.filter((time) => time > 0);
		const averageTime =
			times.length > 0
				? Math.round(times.reduce((a, b) => a + b, 0) / times.length)
				: 0;
		const bestTime = times.length > 0 ? Math.min(...times) : 0;

		// Performance by difficulty
		const performanceByDifficulty = {
			beginner: { correct: 0, total: 0 },
			intermediate: { correct: 0, total: 0 },
			advanced: { correct: 0, total: 0 },
		};

		quizAttempts.forEach((attempt) => {
			const difficulty = attempt.question.difficulty_level;
			if (performanceByDifficulty[difficulty]) {
				performanceByDifficulty[difficulty].total++;
				if (attempt.is_correct) {
					performanceByDifficulty[difficulty].correct++;
				}
			}
		});

		// Progress over time (last 30 days)
		const thirtyDaysAgo = new Date();
		thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

		const recentAttempts = quizAttempts.filter(
			(attempt) => new Date(attempt.created_at) >= thirtyDaysAgo
		);

		// Group by date for progress tracking
		const progressByDate = new Map();
		recentAttempts.forEach((attempt) => {
			const date = attempt.created_at.toISOString().split("T")[0];
			if (!progressByDate.has(date)) {
				progressByDate.set(date, {
					correct: 0,
					total: 0,
					points: 0,
				});
			}
			const dayData = progressByDate.get(date);
			dayData.total++;
			if (attempt.is_correct) {
				dayData.correct++;
				dayData.points += attempt.points_earned;
			}
		});

		const progressOverTime = Array.from(progressByDate.entries())
			.map(([date, data]) => ({
				date,
				accuracy:
					data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
				points: data.points,
				questionsAnswered: data.total,
			}))
			.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
			.slice(-14); // Last 14 days

		// Recent activity (last 7 sessions)
		const sessionGroups = new Map();
		recentAttempts.slice(0, 35).forEach((attempt) => {
			// Take more attempts to get distinct sessions
			const sessionDate = attempt.created_at.toISOString().split("T")[0];
			if (!sessionGroups.has(sessionDate)) {
				sessionGroups.set(sessionDate, {
					date: sessionDate,
					attempts: [],
				});
			}
			sessionGroups.get(sessionDate).attempts.push(attempt);
		});

		const recentActivity = Array.from(sessionGroups.values())
			.slice(0, 7) // Last 7 sessions
			.map((session) => {
				const correct = session.attempts.filter(
					(a: (typeof quizAttempts)[0]) => a.is_correct
				).length;
				const total = session.attempts.length;
				const totalTime = session.attempts.reduce(
					(sum: number, a: (typeof quizAttempts)[0]) =>
						sum + (a.time_taken_seconds || 0),
					0
				);

				return {
					date: session.date,
					score: total > 0 ? Math.round((correct / total) * 100) : 0,
					questionsAnswered: total,
					timeSpent: totalTime,
				};
			})
			.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

		const analyticsData = {
			category: {
				id: category.id,
				name: category.name,
				slug: category.slug,
				totalQuestions: category.quiz_questions.length,
			},
			userStats: {
				totalAttempts,
				correctAnswers,
				accuracy,
				averageScore,
				totalPoints,
				currentStreak: userProgress?.current_streak || 0,
				longestStreak: userProgress?.longest_streak || 0,
				bestTime,
				averageTime,
				recentActivity,
			},
			performanceByDifficulty,
			progressOverTime,
		};

		return NextResponse.json(analyticsData);
	} catch (error) {
		console.error("Error fetching quiz analytics:", error);
		return NextResponse.json(
			{ error: "Failed to fetch quiz analytics" },
			{ status: 500 }
		);
	}
}
