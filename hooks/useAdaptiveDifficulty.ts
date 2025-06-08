import { useState, useEffect, useCallback } from "react";
import { DifficultyLevel } from "@prisma/client";

export interface AdaptiveRecommendation {
	recommendedDifficulty: DifficultyLevel;
	confidenceScore: number;
	reasoning: string;
	shouldAdjust: boolean;
}

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

interface UseAdaptiveDifficultyOptions {
	categoryId: string;
	autoFetch?: boolean;
	onRecommendationChange?: (recommendation: AdaptiveRecommendation) => void;
}

export function useAdaptiveDifficulty({
	categoryId,
	autoFetch = true,
	onRecommendationChange,
}: UseAdaptiveDifficultyOptions) {
	const [recommendation, setRecommendation] =
		useState<AdaptiveRecommendation | null>(null);
	const [metrics, setMetrics] = useState<UserPerformanceMetrics | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Fetch adaptive difficulty recommendation
	const fetchRecommendation = useCallback(
		async (currentDifficulty?: DifficultyLevel) => {
			if (!categoryId) return;

			setLoading(true);
			setError(null);

			try {
				const params = new URLSearchParams({
					categoryId,
					action: "recommendation",
				});

				if (currentDifficulty) {
					params.append("currentDifficulty", currentDifficulty);
				}

				const response = await fetch(`/api/quiz/adaptive?${params}`);

				if (!response.ok) {
					throw new Error("Failed to fetch recommendation");
				}

				const data = await response.json();
				setRecommendation(data.recommendation);

				if (onRecommendationChange) {
					onRecommendationChange(data.recommendation);
				}
			} catch (err) {
				setError(err instanceof Error ? err.message : "Unknown error");
			} finally {
				setLoading(false);
			}
		},
		[categoryId, onRecommendationChange]
	);

	// Fetch user performance metrics
	const fetchMetrics = useCallback(async () => {
		if (!categoryId) return;

		setLoading(true);
		setError(null);

		try {
			const params = new URLSearchParams({
				categoryId,
				action: "performance",
			});

			const response = await fetch(`/api/quiz/adaptive?${params}`);

			if (!response.ok) {
				throw new Error("Failed to fetch metrics");
			}

			const data = await response.json();
			setMetrics(data.metrics);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Unknown error");
		} finally {
			setLoading(false);
		}
	}, [categoryId]);

	// Get adaptive questions
	const getAdaptiveQuestions = useCallback(
		async (count: number = 10, forcedDifficulty?: DifficultyLevel) => {
			if (!categoryId) return null;

			setLoading(true);
			setError(null);

			try {
				const params = new URLSearchParams({
					categoryId,
					action: "questions",
					count: count.toString(),
				});

				if (forcedDifficulty) {
					params.append("difficulty", forcedDifficulty);
				}

				const response = await fetch(`/api/quiz/adaptive?${params}`);

				if (!response.ok) {
					throw new Error("Failed to fetch adaptive questions");
				}

				const data = await response.json();
				return data.questions;
			} catch (err) {
				setError(err instanceof Error ? err.message : "Unknown error");
				return null;
			} finally {
				setLoading(false);
			}
		},
		[categoryId]
	);

	// Perform baseline assessment
	const performBaseline = useCallback(async () => {
		if (!categoryId) return null;

		setLoading(true);
		setError(null);

		try {
			const params = new URLSearchParams({
				categoryId,
				action: "baseline",
			});

			const response = await fetch(`/api/quiz/adaptive?${params}`);

			if (!response.ok) {
				throw new Error("Failed to perform baseline assessment");
			}

			const data = await response.json();
			return data.baselineDifficulty;
		} catch (err) {
			setError(err instanceof Error ? err.message : "Unknown error");
			return null;
		} finally {
			setLoading(false);
		}
	}, [categoryId]);

	// Manual difficulty override
	const overrideDifficulty = useCallback(
		async (difficulty: DifficultyLevel, reason?: string) => {
			if (!categoryId) return false;

			setLoading(true);
			setError(null);

			try {
				const response = await fetch("/api/quiz/adaptive", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						categoryId,
						action: "updateDifficulty",
						data: { difficulty, reason },
					}),
				});

				if (!response.ok) {
					throw new Error("Failed to override difficulty");
				}

				const data = await response.json();

				// Refresh recommendation after override
				await fetchRecommendation(difficulty);

				return data.success;
			} catch (err) {
				setError(err instanceof Error ? err.message : "Unknown error");
				return false;
			} finally {
				setLoading(false);
			}
		},
		[categoryId, fetchRecommendation]
	);

	// Submit feedback on difficulty appropriateness
	const submitFeedback = useCallback(
		async (
			questionId: string,
			wasAppropriate: boolean,
			suggestedDifficulty?: DifficultyLevel
		) => {
			if (!categoryId) return false;

			try {
				const response = await fetch("/api/quiz/adaptive", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						categoryId,
						action: "feedback",
						data: { questionId, wasAppropriate, suggestedDifficulty },
					}),
				});

				if (!response.ok) {
					throw new Error("Failed to submit feedback");
				}

				const data = await response.json();
				return data.success;
			} catch (err) {
				setError(err instanceof Error ? err.message : "Unknown error");
				return false;
			}
		},
		[categoryId]
	);

	// Auto-fetch recommendation on mount
	useEffect(() => {
		if (autoFetch && categoryId) {
			fetchRecommendation();
		}
	}, [autoFetch, categoryId, fetchRecommendation]);

	return {
		// State
		recommendation,
		metrics,
		loading,
		error,

		// Actions
		fetchRecommendation,
		fetchMetrics,
		getAdaptiveQuestions,
		performBaseline,
		overrideDifficulty,
		submitFeedback,

		// Utility
		refresh: () => {
			fetchRecommendation();
			fetchMetrics();
		},
	};
}
