/* eslint-disable @typescript-eslint/no-unused-vars */
import { prisma } from "@/lib/prisma";
import { DifficultyLevel } from "@prisma/client";

export interface UserPerformanceMetrics {
	accuracy: number;
	averageTime: number;
	currentStreak: number;
	recentPerformance: number[];
	difficultyDistribution: {
		beginner: { correct: number; total: number };
		intermediate: { correct: number; total: number };
		advanced: { correct: number; total: number };
	};
}

export interface AdaptiveRecommendation {
	recommendedDifficulty: DifficultyLevel;
	confidenceScore: number;
	reasoning: string;
	shouldAdjust: boolean;
}

export class AdaptiveDifficultyService {
	private readonly BASELINE_QUESTIONS = 5;
	private readonly ADJUSTMENT_THRESHOLD = 3;
	private readonly CONFIDENCE_THRESHOLD = 0.7;

	/**
	 * Analyze user performance to determine appropriate difficulty level
	 */
	async analyzeUserPerformance(
		userId: string,
		categoryId?: string
	): Promise<UserPerformanceMetrics> {
		const whereClause = {
			user_id: userId,
			question: {
				...(categoryId && { category_id: categoryId }),
				is_active: true,
			},
		};

		// Get recent attempts (last 20 for analysis)
		const recentAttempts = await prisma.quizAttempt.findMany({
			where: whereClause,
			include: {
				question: {
					select: {
						difficulty_level: true,
						points: true,
					},
				},
			},
			orderBy: { created_at: "desc" },
			take: 20,
		});

		if (recentAttempts.length === 0) {
			return this.getDefaultMetrics();
		}

		// Calculate overall accuracy
		const correctAnswers = recentAttempts.filter((a) => a.is_correct).length;
		const accuracy = (correctAnswers / recentAttempts.length) * 100;

		// Calculate average time
		const validTimes = recentAttempts
			.map((a) => a.time_taken_seconds)
			.filter((t) => t > 0);
		const averageTime =
			validTimes.length > 0
				? validTimes.reduce((a, b) => a + b, 0) / validTimes.length
				: 30;

		// Get current streak from user progress
		const userProgress = await prisma.userProgress.findFirst({
			where: {
				user_id: userId,
				...(categoryId && { category_id: categoryId }),
			},
		});
		const currentStreak = userProgress?.current_streak || 0;

		// Calculate recent performance trend (last 10 attempts)
		const recentPerformance = recentAttempts
			.slice(0, 10)
			.map((attempt) => (attempt.is_correct ? 1 : 0));

		// Distribution by difficulty
		const difficultyDistribution = {
			beginner: { correct: 0, total: 0 },
			intermediate: { correct: 0, total: 0 },
			advanced: { correct: 0, total: 0 },
		};

		recentAttempts.forEach((attempt) => {
			const difficulty = attempt.question.difficulty_level;
			if (difficultyDistribution[difficulty]) {
				difficultyDistribution[difficulty].total++;
				if (attempt.is_correct) {
					difficultyDistribution[difficulty].correct++;
				}
			}
		});

		return {
			accuracy,
			averageTime,
			currentStreak,
			recentPerformance,
			difficultyDistribution,
		};
	}

	/**
	 * Generate adaptive difficulty recommendation based on performance
	 */
	async getAdaptiveRecommendation(
		userId: string,
		categoryId?: string,
		currentDifficulty?: DifficultyLevel
	): Promise<AdaptiveRecommendation> {
		const metrics = await this.analyzeUserPerformance(userId, categoryId);

		// Calculate recommendation based on multiple factors
		const difficultyScore = this.calculateDifficultyScore(metrics);
		const recommendedDifficulty = this.mapScoreToDifficulty(difficultyScore);
		const confidenceScore = this.calculateConfidence(metrics);
		const shouldAdjust = this.shouldAdjustDifficulty(
			metrics,
			currentDifficulty,
			recommendedDifficulty
		);

		const reasoning = this.generateReasoning(
			metrics,
			difficultyScore,
			recommendedDifficulty
		);

		return {
			recommendedDifficulty,
			confidenceScore,
			reasoning,
			shouldAdjust,
		};
	}

	/**
	 * Get intelligently selected questions based on adaptive difficulty
	 */
	async getAdaptiveQuestions(
		userId: string,
		categoryId: string,
		count: number = 10,
		forcedDifficulty?: DifficultyLevel
	) {
		let targetDifficulty = forcedDifficulty;

		if (!targetDifficulty) {
			const recommendation = await this.getAdaptiveRecommendation(
				userId,
				categoryId
			);
			targetDifficulty = recommendation.recommendedDifficulty;
		}

		// Get questions with adaptive difficulty
		const questions = await prisma.quizQuestion.findMany({
			where: {
				category_id: categoryId,
				difficulty_level: targetDifficulty,
				is_active: true,
			},
			include: {
				quiz_answers: {
					select: {
						id: true,
						answer_text: true,
						sort_order: true,
						// Don't include is_correct for security
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
			take: count * 2, // Get more to allow for filtering
		});

		// Filter out recently attempted questions
		const recentQuestionIds = await this.getRecentQuestionIds(
			userId,
			categoryId
		);
		const filteredQuestions = questions.filter(
			(q) => !recentQuestionIds.includes(q.id)
		);

		// Return requested count, fallback to all available if needed
		return filteredQuestions.slice(0, count).length >= count
			? filteredQuestions.slice(0, count)
			: questions.slice(0, count);
	}

	/**
	 * Perform baseline assessment for new users
	 */
	async performBaselineAssessment(
		userId: string,
		categoryId: string
	): Promise<DifficultyLevel> {
		// Check if user has enough attempts for baseline
		const attemptCount = await prisma.quizAttempt.count({
			where: {
				user_id: userId,
				question: {
					category_id: categoryId,
					is_active: true,
				},
			},
		});

		if (attemptCount >= this.BASELINE_QUESTIONS) {
			const recommendation = await this.getAdaptiveRecommendation(
				userId,
				categoryId
			);
			return recommendation.recommendedDifficulty;
		}

		// Start with beginner for new users
		return "beginner";
	}

	/**
	 * Calculate difficulty score based on user metrics
	 */
	private calculateDifficultyScore(metrics: UserPerformanceMetrics): number {
		let score = 0;

		// Accuracy weight (40%)
		score += (metrics.accuracy / 100) * 0.4;

		// Streak weight (20%)
		const streakScore = Math.min(metrics.currentStreak / 10, 1);
		score += streakScore * 0.2;

		// Recent performance trend weight (25%)
		const recentScore =
			metrics.recentPerformance.length > 0
				? metrics.recentPerformance.reduce((a, b) => a + b, 0) /
				  metrics.recentPerformance.length
				: 0.5;
		score += recentScore * 0.25;

		// Time performance weight (15%)
		const timeScore = Math.max(0, Math.min(1, (60 - metrics.averageTime) / 60));
		score += timeScore * 0.15;

		return Math.max(0, Math.min(1, score));
	}

	/**
	 * Map difficulty score to actual difficulty level
	 */
	private mapScoreToDifficulty(score: number): DifficultyLevel {
		if (score >= 0.8) return "advanced";
		if (score >= 0.6) return "intermediate";
		return "beginner";
	}

	/**
	 * Calculate confidence in the recommendation
	 */
	private calculateConfidence(metrics: UserPerformanceMetrics): number {
		const sampleSize = metrics.recentPerformance.length;
		const baseSizeScore = Math.min(sampleSize / 10, 1);

		// Calculate consistency (lower variance = higher confidence)
		const variance = this.calculateVariance(metrics.recentPerformance);
		const consistencyScore = Math.max(0, 1 - variance);

		return (baseSizeScore + consistencyScore) / 2;
	}

	/**
	 * Determine if difficulty should be adjusted
	 */
	private shouldAdjustDifficulty(
		metrics: UserPerformanceMetrics,
		current?: DifficultyLevel,
		recommended?: DifficultyLevel
	): boolean {
		if (!current || !recommended) return true;
		if (current === recommended) return false;

		// Only adjust if we have enough data and clear trend
		return (
			metrics.recentPerformance.length >= this.ADJUSTMENT_THRESHOLD &&
			this.calculateConfidence(metrics) >= this.CONFIDENCE_THRESHOLD
		);
	}

	/**
	 * Generate human-readable reasoning for the recommendation
	 */
	private generateReasoning(
		metrics: UserPerformanceMetrics,
				score: number,
				difficulty: DifficultyLevel
	): string {
		const reasons: string[] = [];

		if (metrics.accuracy >= 85) {
			reasons.push("High accuracy indicates strong understanding");
		} else if (metrics.accuracy <= 60) {
			reasons.push("Lower accuracy suggests need for easier questions");
		}

		if (metrics.currentStreak >= 5) {
			reasons.push("Good streak shows consistent performance");
		}

		const recentTrend =
			metrics.recentPerformance.length > 0
				? metrics.recentPerformance.reduce((a, b) => a + b, 0) /
				  metrics.recentPerformance.length
				: 0;

		if (recentTrend > 0.8) {
			reasons.push("Recent performance is strong");
		} else if (recentTrend < 0.5) {
			reasons.push("Recent struggles suggest easier questions");
		}

		return reasons.length > 0
			? reasons.join(", ")
			: "Based on overall performance analysis";
	}

	/**
	 * Get recently attempted question IDs to avoid repetition
	 */
	private async getRecentQuestionIds(
		userId: string,
		categoryId: string
	): Promise<string[]> {
		const recentAttempts = await prisma.quizAttempt.findMany({
			where: {
				user_id: userId,
				question: {
					category_id: categoryId,
					is_active: true,
				},
			},
			select: { question_id: true },
			orderBy: { created_at: "desc" },
			take: 20, // Last 20 questions
		});

		return recentAttempts.map((attempt) => attempt.question_id);
	}

	/**
	 * Calculate variance for consistency measurement
	 */
	private calculateVariance(numbers: number[]): number {
		if (numbers.length === 0) return 0;

		const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
		const squaredDiffs = numbers.map((x) => Math.pow(x - mean, 2));
		return squaredDiffs.reduce((a, b) => a + b, 0) / numbers.length;
	}

	/**
	 * Default metrics for new users
	 */
	private getDefaultMetrics(): UserPerformanceMetrics {
		return {
			accuracy: 50,
			averageTime: 30,
			currentStreak: 0,
			recentPerformance: [],
			difficultyDistribution: {
				beginner: { correct: 0, total: 0 },
				intermediate: { correct: 0, total: 0 },
				advanced: { correct: 0, total: 0 },
			},
		};
	}
}

// Export singleton instance
export const adaptiveDifficultyService = new AdaptiveDifficultyService();
