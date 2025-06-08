import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { DifficultyLevel } from "@prisma/client";
import {
	quizPerformanceOptimizer,
	QuizQuestionWithAnswers,
	LoadingStrategy,
	NetworkOptimization,
} from "@/lib/quiz/performance-optimizer";

export interface QuizPerformanceState {
	isLoading: boolean;
	isOffline: boolean;
	networkInfo: NetworkOptimization;
	loadingStrategy: LoadingStrategy;
	cacheHitRate: number;
	offlineCategories: string[];
}

export interface UseQuizPerformanceOptions {
	enablePrefetch?: boolean;
	enableOffline?: boolean;
	enablePerformanceMetrics?: boolean;
	maxRetries?: number;
}

export function useQuizPerformance(options: UseQuizPerformanceOptions = {}) {
	const {
		enablePrefetch = true,
		enableOffline = true,
		enablePerformanceMetrics = true,
		maxRetries = 3,
	} = options;

	const { data: session } = useSession();
	const [performanceState, setPerformanceState] =
		useState<QuizPerformanceState>({
			isLoading: false,
			isOffline: false,
			networkInfo: {
				connectionType: "4g",
				effectiveType: "4g",
				downlink: 10,
				rtt: 100,
			},
			loadingStrategy: {
				type: "eager",
				batchSize: 10,
				maxConcurrent: 3,
			},
			cacheHitRate: 0,
			offlineCategories: [],
		});

	// Performance metrics tracking
	const metricsRef = useRef({
		cacheHits: 0,
		cacheMisses: 0,
		loadTimes: [] as number[],
		errorCount: 0,
	});

	// Update network and offline status
	const updateNetworkStatus = useCallback(() => {
		const isOffline = quizPerformanceOptimizer.isOffline();
		const loadingStrategy = quizPerformanceOptimizer.getLoadingStrategy();
		const offlineCategories = quizPerformanceOptimizer.getOfflineCategories();

		setPerformanceState((prev) => ({
			...prev,
			isOffline,
			loadingStrategy,
			offlineCategories,
		}));
	}, []);

	// Load optimized questions
	const loadQuestionsOptimized = useCallback(
		async (
			categoryId: string,
			count: number = 10,
			difficulty?: DifficultyLevel
		): Promise<QuizQuestionWithAnswers[]> => {
			if (!session?.user?.id) {
				throw new Error("User session required");
			}

			const startTime = Date.now();
			setPerformanceState((prev) => ({ ...prev, isLoading: true }));

			let retryCount = 0;
			let lastError: Error | null = null;

			while (retryCount < maxRetries) {
				try {
					const questions =
						await quizPerformanceOptimizer.loadQuestionsOptimized(
							categoryId,
							session.user.id,
							count,
							difficulty
						);

					// Track performance metrics
					if (enablePerformanceMetrics) {
						const loadTime = Date.now() - startTime;
						metricsRef.current.loadTimes.push(loadTime);

						// Keep only last 10 load times for average calculation
						if (metricsRef.current.loadTimes.length > 10) {
							metricsRef.current.loadTimes.shift();
						}

						// Update cache hit rate
						const totalRequests =
							metricsRef.current.cacheHits + metricsRef.current.cacheMisses;
						const cacheHitRate =
							totalRequests > 0
								? metricsRef.current.cacheHits / totalRequests
								: 0;

						setPerformanceState((prev) => ({
							...prev,
							isLoading: false,
							cacheHitRate: Math.round(cacheHitRate * 100) / 100,
						}));
					} else {
						setPerformanceState((prev) => ({ ...prev, isLoading: false }));
					}

					return questions;
				} catch (error) {
					lastError = error as Error;
					retryCount++;
					metricsRef.current.errorCount++;

					// Exponential backoff for retries
					if (retryCount < maxRetries) {
						const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);
						await new Promise((resolve) => setTimeout(resolve, delay));
					}
				}
			}

			setPerformanceState((prev) => ({ ...prev, isLoading: false }));
			throw lastError || new Error("Failed to load questions after retries");
		},
		[session?.user?.id, maxRetries, enablePerformanceMetrics]
	);

	// Get optimized image URL
	const getOptimizedImageUrl = useCallback((originalUrl: string): string => {
		return quizPerformanceOptimizer.getOptimizedImageUrl(originalUrl);
	}, []);

	// Clear cache
	const clearCache = useCallback(() => {
		quizPerformanceOptimizer.clearAllCache();
		metricsRef.current = {
			cacheHits: 0,
			cacheMisses: 0,
			loadTimes: [],
			errorCount: 0,
		};
		setPerformanceState((prev) => ({
			...prev,
			cacheHitRate: 0,
			offlineCategories: [],
		}));
	}, []);

	// Get performance metrics
	const getPerformanceMetrics = useCallback(() => {
		const { loadTimes, errorCount } = metricsRef.current;
		const averageLoadTime =
			loadTimes.length > 0
				? loadTimes.reduce((a, b) => a + b, 0) / loadTimes.length
				: 0;

		return {
			averageLoadTime: Math.round(averageLoadTime),
			errorCount,
			cacheHitRate: performanceState.cacheHitRate,
			networkType: performanceState.networkInfo.connectionType,
			isOffline: performanceState.isOffline,
			offlineCategoriesCount: performanceState.offlineCategories.length,
		};
	}, [performanceState]);

	// Initialize and monitor network changes
	useEffect(() => {
		updateNetworkStatus();

		// Listen for online/offline events
		const handleOnline = () => updateNetworkStatus();
		const handleOffline = () => updateNetworkStatus();

		window.addEventListener("online", handleOnline);
		window.addEventListener("offline", handleOffline);

		return () => {
			window.removeEventListener("online", handleOnline);
			window.removeEventListener("offline", handleOffline);
		};
	}, [updateNetworkStatus]);

	// Periodic performance monitoring
	useEffect(() => {
		if (!enablePerformanceMetrics) return;

		const interval = setInterval(() => {
			updateNetworkStatus();
		}, 30000); // Update every 30 seconds

		return () => clearInterval(interval);
	}, [enablePerformanceMetrics, updateNetworkStatus]);

	return {
		// State
		...performanceState,

		// Actions
		loadQuestionsOptimized,
		getOptimizedImageUrl,
		clearCache,
		getPerformanceMetrics,

		// Utilities
		isSlowConnection:
			performanceState.networkInfo.connectionType === "slow-2g" ||
			performanceState.networkInfo.connectionType === "2g",
		isFastConnection: performanceState.networkInfo.connectionType === "4g",
		canPreload:
			enablePrefetch &&
			performanceState.networkInfo.connectionType !== "slow-2g" &&
			performanceState.networkInfo.connectionType !== "2g",
	};
}
