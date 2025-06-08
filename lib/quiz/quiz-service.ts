import { prisma } from "@/lib/prisma";
import { DifficultyLevel, QuestionType } from "@prisma/client";
import {
	adaptiveDifficultyService,
	AdaptiveRecommendation,
} from "./adaptive-difficulty";
import {
	quizPerformanceOptimizer,
	QuizQuestionWithAnswers,
} from "./performance-optimizer";

// Type definitions for quiz operations
export interface QuizQuestionFilter {
	categoryId?: string;
	difficulty?: DifficultyLevel;
	questionType?: QuestionType;
	isActive?: boolean;
}

export interface PaginationOptions {
	page?: number;
	pageSize?: number;
}

export interface QuizStats {
	totalQuestions: number;
	totalAttempted: number;
	correctAnswers: number;
	averageScore: number;
	currentStreak: number;
	longestStreak: number;
	totalPoints: number;
	lastActivity: Date | null;
}

export class QuizService {
	// Get categories with optional user progress stats
	async getCategories(userId?: string, pagination?: PaginationOptions) {
		const { page = 1, pageSize = 25 } = pagination || {};
		const skip = (page - 1) * pageSize;

		const [categories, totalCount] = await Promise.all([
			prisma.category.findMany({
				where: { is_active: true },
				include: {
					quiz_questions: {
						where: { is_active: true },
						select: { id: true },
					},
					...(userId && {
						user_progress: {
							where: { user_id: userId },
							select: {
								completion_percentage: true,
								total_points_earned: true,
								current_streak: true,
								total_questions_attempted: true,
								correct_answers: true,
								average_score: true,
								last_activity: true,
							},
						},
					}),
				},
				orderBy: { sort_order: "asc" },
				skip,
				take: pageSize,
			}),
			prisma.category.count({
				where: { is_active: true },
			}),
		]);

		return {
			categories: categories.map((category) => ({
				id: category.id,
				name: category.name,
				description: category.description,
				slug: category.slug,
				icon: category.icon,
				color: category.color,
				sort_order: category.sort_order,
				totalQuestions: category.quiz_questions.length,
				progress: category.user_progress?.[0] || null,
			})),
			meta: {
				pagination: {
					page,
					pageSize,
					total: totalCount,
					totalPages: Math.ceil(totalCount / pageSize),
				},
			},
		};
	}

	// Get category by slug or ID
	async getCategory(identifier: string) {
		return prisma.category.findFirst({
			where: {
				OR: [{ id: identifier }, { slug: identifier }],
				is_active: true,
			},
			include: {
				quiz_questions: {
					where: { is_active: true },
					select: { id: true, difficulty_level: true },
				},
			},
		});
	}

	// Get quiz questions with filtering and pagination
	async getQuestions(
		filter: QuizQuestionFilter,
		pagination?: PaginationOptions,
		excludeAnswers: boolean = false
	) {
		const { page = 1, pageSize = 10 } = pagination || {};
		const skip = (page - 1) * pageSize;

		const questions = await prisma.quizQuestion.findMany({
			where: {
				...(filter.categoryId && { category_id: filter.categoryId }),
				...(filter.difficulty && { difficulty_level: filter.difficulty }),
				...(filter.questionType && { question_type: filter.questionType }),
				is_active: filter.isActive !== false,
			},
			include: {
				quiz_answers: {
					select: {
						id: true,
						answer_text: true,
						sort_order: true,
						...(excludeAnswers ? {} : { is_correct: true, explanation: true }),
					},
					orderBy: { sort_order: "asc" },
				},
				category: {
					select: {
						id: true,
						name: true,
						slug: true,
					},
				},
			},
			orderBy: { created_at: "desc" },
			skip,
			take: pageSize,
		});

		return questions;
	}

	// Get adaptive questions for quiz sessions based on user performance
	async getAdaptiveQuestions(
		userId: string,
		categoryId: string,
		count: number = 10,
		forcedDifficulty?: DifficultyLevel
	) {
		// Use adaptive difficulty service for intelligent question selection
		return adaptiveDifficultyService.getAdaptiveQuestions(
			userId,
			categoryId,
			count,
			forcedDifficulty
		);
	}

	// Get optimized questions with performance caching and offline support
	async getOptimizedQuestions(
		userId: string,
		categoryId: string,
		count: number = 10,
		difficulty?: DifficultyLevel
	): Promise<QuizQuestionWithAnswers[]> {
		// Use performance optimizer for enhanced loading, caching, and offline support
		return quizPerformanceOptimizer.loadQuestionsOptimized(
			categoryId,
			userId,
			count,
			difficulty
		);
	}

	// Get random questions for quiz sessions (fallback method)
	async getRandomQuestions(
		categoryId: string,
		count: number = 10,
		difficulty?: DifficultyLevel
	) {
		// Get total count first
		const totalCount = await prisma.quizQuestion.count({
			where: {
				category_id: categoryId,
				is_active: true,
				...(difficulty && { difficulty_level: difficulty }),
			},
		});

		if (totalCount === 0) return [];

		// For now, just return questions without random skip
		// TODO: Implement proper random selection using SQL ORDER BY RANDOM()
		return this.getQuestions(
			{
				categoryId,
				difficulty,
				isActive: true,
			},
			{ page: 1, pageSize: count },
			true // Exclude correct answers for security
		);
	}

	// Get adaptive difficulty recommendation for a user
	async getAdaptiveRecommendation(
		userId: string,
		categoryId?: string,
		currentDifficulty?: DifficultyLevel
	): Promise<AdaptiveRecommendation> {
		return adaptiveDifficultyService.getAdaptiveRecommendation(
			userId,
			categoryId,
			currentDifficulty
		);
	}

	// Perform baseline assessment for new users
	async performBaselineAssessment(
		userId: string,
		categoryId: string
	): Promise<DifficultyLevel> {
		return adaptiveDifficultyService.performBaselineAssessment(
			userId,
			categoryId
		);
	}

	// Submit quiz attempt and update progress
	async submitQuizAttempt(
		userId: string,
		questionId: string,
		answerId?: string,
		answerText?: string,
		timeTaken: number = 0
	) {
		// Get question with answers
		const question = await prisma.quizQuestion.findUnique({
			where: { id: questionId },
			include: {
				quiz_answers: true,
				category: true,
			},
		});

		if (!question) {
			throw new Error("Question not found");
		}

		// Determine if answer is correct
		let isCorrect = false;

		if (
			(question.question_type === "multiple_choice" ||
				question.question_type === "true_false") &&
			answerId
		) {
			const correctAnswer = question.quiz_answers.find((a) => a.is_correct);
			isCorrect = correctAnswer?.id === answerId;
		} else if (question.question_type === "fill_blank" && answerText) {
			// For fill-in-the-blank questions, check answer text
			const correctAnswers = question.quiz_answers
				.filter((a) => a.is_correct)
				.map((a) => a.answer_text.toLowerCase().trim());

			const userAnswerLower = answerText.toLowerCase().trim();
			isCorrect = correctAnswers.some(
				(correctAnswer) =>
					correctAnswer === userAnswerLower ||
					correctAnswer.includes(userAnswerLower) ||
					userAnswerLower.includes(correctAnswer)
			);
		}

		// Calculate points
		const basePoints = question.points;
		const timeBonus = Math.max(0, Math.floor((60 - timeTaken) / 10)) * 2;
		const pointsEarned = isCorrect ? basePoints + timeBonus : 0;

		// Create attempt record
		const attempt = await prisma.quizAttempt.create({
			data: {
				user_id: userId,
				question_id: questionId,
				selected_answer_id: answerId,
				user_answer_text: answerText,
				is_correct: isCorrect,
				points_earned: pointsEarned,
				time_taken_seconds: timeTaken,
			},
		});

		// Update user progress
		await this.updateUserProgress(
			userId,
			question.category_id,
			isCorrect,
			pointsEarned
		);

		return {
			attempt,
			isCorrect,
			pointsEarned,
			explanation: question.explanation,
		};
	}

	// Update user progress after quiz attempt
	private async updateUserProgress(
		userId: string,
		categoryId: string,
		isCorrect: boolean,
		pointsEarned: number
	) {
		const currentProgress = await prisma.userProgress.findUnique({
			where: {
				user_id_category_id: {
					user_id: userId,
					category_id: categoryId,
				},
			},
		});

		const newTotalAttempted =
			(currentProgress?.total_questions_attempted || 0) + 1;
		const newCorrectAnswers =
			(currentProgress?.correct_answers || 0) + (isCorrect ? 1 : 0);
		const newTotalPoints =
			(currentProgress?.total_points_earned || 0) + pointsEarned;
		const newAverageScore = (newCorrectAnswers / newTotalAttempted) * 100;
		const newCurrentStreak = isCorrect
			? (currentProgress?.current_streak || 0) + 1
			: 0;
		const newLongestStreak = Math.max(
			newCurrentStreak,
			currentProgress?.longest_streak || 0
		);

		return prisma.userProgress.upsert({
			where: {
				user_id_category_id: {
					user_id: userId,
					category_id: categoryId,
				},
			},
			update: {
				total_questions_attempted: newTotalAttempted,
				correct_answers: newCorrectAnswers,
				total_points_earned: newTotalPoints,
				current_streak: newCurrentStreak,
				longest_streak: newLongestStreak,
				last_activity: new Date(),
				average_score: newAverageScore,
			},
			create: {
				user_id: userId,
				category_id: categoryId,
				total_questions_attempted: 1,
				correct_answers: isCorrect ? 1 : 0,
				total_points_earned: pointsEarned,
				current_streak: isCorrect ? 1 : 0,
				longest_streak: isCorrect ? 1 : 0,
				completion_percentage: 0,
				average_score: isCorrect ? 100 : 0,
			},
		});
	}

	// Get user quiz statistics
	async getUserStats(userId: string, categoryId?: string): Promise<QuizStats> {
		const where = {
			user_id: userId,
			...(categoryId && { category_id: categoryId }),
		};

		const [progressData, totalQuestions] = await Promise.all([
			prisma.userProgress.findMany({
				where,
			}),
			categoryId
				? prisma.quizQuestion.count({
						where: { category_id: categoryId, is_active: true },
				  })
				: prisma.quizQuestion.count({ where: { is_active: true } }),
		]);

		const totals = progressData.reduce(
			(acc, progress) => ({
				totalAttempted: acc.totalAttempted + progress.total_questions_attempted,
				correctAnswers: acc.correctAnswers + progress.correct_answers,
				totalPoints: acc.totalPoints + progress.total_points_earned,
				currentStreak: Math.max(acc.currentStreak, progress.current_streak),
				longestStreak: Math.max(acc.longestStreak, progress.longest_streak),
				lastActivity:
					!acc.lastActivity ||
					(progress.last_activity && progress.last_activity > acc.lastActivity)
						? progress.last_activity
						: acc.lastActivity,
			}),
			{
				totalAttempted: 0,
				correctAnswers: 0,
				totalPoints: 0,
				currentStreak: 0,
				longestStreak: 0,
				lastActivity: null as Date | null,
			}
		);

		return {
			totalQuestions,
			...totals,
			averageScore:
				totals.totalAttempted > 0
					? (totals.correctAnswers / totals.totalAttempted) * 100
					: 0,
		};
	}
}

// Export singleton instance
export const quizService = new QuizService();
