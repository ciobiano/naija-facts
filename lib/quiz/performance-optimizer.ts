import { QuizQuestion, QuizAnswer } from "@prisma/client";
import { DifficultyLevel } from "@prisma/client";

// Define the type locally since it may not be exported from @/types
export type QuizQuestionWithAnswers = QuizQuestion & {
	quiz_answers: QuizAnswer[];
	category?: { name: string };
};

// Types for performance optimization
export interface CacheConfig {
	questionCacheTTL: number; // Time to live for question cache
	categoryCacheTTL: number; // Time to live for category cache
	maxCacheSize: number; // Maximum cache entries
	prefetchCount: number; // Number of questions to prefetch
}

export interface OfflineQuizData {
	categoryId: string;
	categoryName: string;
	questions: QuizQuestionWithAnswers[];
	difficulty: DifficultyLevel;
	cachedAt: number;
	expiresAt: number;
}

export interface LoadingStrategy {
	type: "progressive" | "eager" | "lazy";
	batchSize: number;
	maxConcurrent: number;
}

export interface NetworkOptimization {
	connectionType: "slow-2g" | "2g" | "3g" | "4g" | "offline";
	effectiveType: string;
	downlink: number;
	rtt: number;
}

export class QuizPerformanceOptimizer {
	private questionCache = new Map<string, QuizQuestionWithAnswers[]>();
	private categoryCache = new Map<string, unknown>();
	private prefetchQueue = new Set<string>();
	private loadingPromises = new Map<
		string,
		Promise<QuizQuestionWithAnswers[]>
	>();

	private readonly config: CacheConfig = {
		questionCacheTTL: 15 * 60 * 1000, // 15 minutes
		categoryCacheTTL: 30 * 60 * 1000, // 30 minutes
		maxCacheSize: 50,
		prefetchCount: 5,
	};

	private readonly OFFLINE_STORAGE_KEY = "naija-facts-offline-quiz";
	private readonly CACHE_METADATA_KEY = "naija-facts-cache-metadata";

	constructor() {
		if (typeof window !== "undefined") {
			this.initializePerformanceMonitoring();
			this.cleanupExpiredCache();
		}
	}

	/**
	 * Get optimized question loading strategy based on network conditions
	 */
	getLoadingStrategy(): LoadingStrategy {
		const networkInfo = this.getNetworkInfo();

		switch (networkInfo.connectionType) {
			case "slow-2g":
			case "2g":
				return {
					type: "progressive",
					batchSize: 2,
					maxConcurrent: 1,
				};
			case "3g":
				return {
					type: "progressive",
					batchSize: 5,
					maxConcurrent: 2,
				};
			case "4g":
			default:
				return {
					type: "eager",
					batchSize: 10,
					maxConcurrent: 3,
				};
		}
	}

	/**
	 * Load questions with performance optimization
	 */
	async loadQuestionsOptimized(
		categoryId: string,
		userId: string,
		count: number = 10,
		difficulty?: DifficultyLevel
	): Promise<QuizQuestionWithAnswers[]> {
		const cacheKey = this.getCacheKey(categoryId, difficulty, count);

		// Check memory cache first
		const cached = this.getFromCache(cacheKey);
		if (cached) {
			this.prefetchNext(categoryId, difficulty, count);
			return cached;
		}

		// Check if request is already in progress
		if (this.loadingPromises.has(cacheKey)) {
			return this.loadingPromises.get(cacheKey)!;
		}

		// Check offline storage
		const offlineData = await this.getOfflineQuestions(categoryId, difficulty);
		if (offlineData) {
			this.setCache(cacheKey, offlineData, this.config.questionCacheTTL);
			return offlineData.slice(0, count);
		}

		// Load from network with optimization
		const loadingPromise = this.loadFromNetwork(
			categoryId,
			userId,
			count,
			difficulty
		);

		this.loadingPromises.set(cacheKey, loadingPromise);

		try {
			const questions = await loadingPromise;
			this.setCache(cacheKey, questions, this.config.questionCacheTTL);
			await this.saveOfflineQuestions(categoryId, questions, difficulty);
			this.prefetchNext(categoryId, difficulty, count);
			return questions;
		} finally {
			this.loadingPromises.delete(cacheKey);
		}
	}

	/**
	 * Load questions from network with progressive enhancement
	 */
	private async loadFromNetwork(
		categoryId: string,
		userId: string,
		count: number,
		difficulty?: DifficultyLevel
	): Promise<QuizQuestionWithAnswers[]> {
		const networkInfo = this.getNetworkInfo();

		// Use adaptive questions for better performance and relevance
		const useAdaptive = networkInfo.connectionType !== "slow-2g";

		const endpoint = useAdaptive
			? `/api/quiz/adaptive?categoryId=${categoryId}&action=questions&count=${count}${
					difficulty ? `&difficulty=${difficulty}` : ""
			  }`
			: `/api/quiz?categoryId=${categoryId}&limit=${count}${
					difficulty ? `&difficulty=${difficulty}` : ""
			  }`;

		const controller = new AbortController();
		const timeoutId = setTimeout(
			() => controller.abort(),
			this.getTimeoutForNetwork(networkInfo)
		);

		try {
			const response = await fetch(endpoint, {
				signal: controller.signal,
				headers: {
					"Cache-Control": "max-age=300", // 5 minutes browser cache
				},
			});

			if (!response.ok) {
				throw new Error(`HTTP ${response.status}: ${response.statusText}`);
			}

			const data = await response.json();
			return useAdaptive ? data.questions : data.questions;
		} finally {
			clearTimeout(timeoutId);
		}
	}

	/**
	 * Prefetch next batch of questions in background
	 */
	private async prefetchNext(
		categoryId: string,
		difficulty?: DifficultyLevel,
		currentCount: number = 10
	): Promise<void> {
		const prefetchKey = `${categoryId}-${difficulty || "mixed"}-prefetch`;

		if (this.prefetchQueue.has(prefetchKey)) return;

		this.prefetchQueue.add(prefetchKey);

		try {
			// Only prefetch on good connections
			const networkInfo = this.getNetworkInfo();
			if (
				networkInfo.connectionType === "slow-2g" ||
				networkInfo.connectionType === "2g"
			) {
				return;
			}

			// Prefetch next batch
			const prefetchCount = Math.min(this.config.prefetchCount, currentCount);
			await this.loadFromNetwork(categoryId, "", prefetchCount, difficulty);
		} catch (error) {
			console.warn("Prefetch failed:", error);
		} finally {
			this.prefetchQueue.delete(prefetchKey);
		}
	}

	/**
	 * Save questions for offline use
	 */
	private async saveOfflineQuestions(
		categoryId: string,
		questions: QuizQuestionWithAnswers[],
		difficulty?: DifficultyLevel
	): Promise<void> {
		if (typeof window === "undefined") return;

		try {
			const offlineData: OfflineQuizData = {
				categoryId,
				categoryName: questions[0]?.category?.name || categoryId,
				questions,
				difficulty: difficulty || "beginner",
				cachedAt: Date.now(),
				expiresAt: Date.now() + this.config.questionCacheTTL,
			};

			const existingData = this.getOfflineStorage();
			const updatedData = {
				...existingData,
				[this.getOfflineKey(categoryId, difficulty)]: offlineData,
			};

			// Limit offline storage size
			const entries = Object.entries(updatedData);
			if (entries.length > this.config.maxCacheSize) {
				// Remove oldest entries
				entries.sort(([, a], [, b]) => a.cachedAt - b.cachedAt);
				const toKeep = entries.slice(-this.config.maxCacheSize);
				Object.keys(updatedData).forEach((key) => {
					if (!toKeep.find(([k]) => k === key)) {
						delete updatedData[key];
					}
				});
			}

			localStorage.setItem(
				this.OFFLINE_STORAGE_KEY,
				JSON.stringify(updatedData)
			);
		} catch (error) {
			console.warn("Failed to save offline questions:", error);
		}
	}

	/**
	 * Get questions from offline storage
	 */
	private async getOfflineQuestions(
		categoryId: string,
		difficulty?: DifficultyLevel
	): Promise<QuizQuestionWithAnswers[] | null> {
		if (typeof window === "undefined") return null;

		try {
			const offlineData = this.getOfflineStorage();
			const key = this.getOfflineKey(categoryId, difficulty);
			const data = offlineData[key];

			if (!data || Date.now() > data.expiresAt) {
				return null;
			}

			return data.questions;
		} catch (error) {
			console.warn("Failed to get offline questions:", error);
			return null;
		}
	}

	/**
	 * Preload critical resources for quiz session
	 */
	async preloadCriticalResources(categoryIds: string[]): Promise<void> {
		const strategy = this.getLoadingStrategy();

		if (strategy.type === "progressive" && categoryIds.length > 1) {
			// Only preload first category on slow connections
			categoryIds = categoryIds.slice(0, 1);
		}

		const preloadPromises = categoryIds.map(async (categoryId) => {
			try {
				// Preload a small set of questions
				await this.loadFromNetwork(categoryId, "", 3, undefined);
			} catch (error) {
				console.warn(`Failed to preload category ${categoryId}:`, error);
			}
		});

		await Promise.allSettled(preloadPromises);
	}

	/**
	 * Optimize images and media for current network
	 */
	getOptimizedImageUrl(originalUrl: string): string {
		const networkInfo = this.getNetworkInfo();

		// Return optimized image URLs based on network speed
		switch (networkInfo.connectionType) {
			case "slow-2g":
			case "2g":
				return originalUrl.replace(/\.(jpg|jpeg|png)$/i, "_low.$1");
			case "3g":
				return originalUrl.replace(/\.(jpg|jpeg|png)$/i, "_medium.$1");
			default:
				return originalUrl;
		}
	}

	/**
	 * Clean up expired cache entries
	 */
	private cleanupExpiredCache(): void {
		if (typeof window === "undefined") return;

		// Memory cache cleanup
		const now = Date.now();
		const metadata = this.getCacheMetadata();

		for (const [key, expiry] of Object.entries(metadata)) {
			if (now > expiry) {
				this.questionCache.delete(key);
				this.categoryCache.delete(key);
				delete metadata[key];
			}
		}

		this.saveCacheMetadata(metadata);

		// Offline storage cleanup
		try {
			const offlineData = this.getOfflineStorage();
			const validData: Record<string, OfflineQuizData> = {};

			for (const [key, data] of Object.entries(offlineData)) {
				if (now < data.expiresAt) {
					validData[key] = data;
				}
			}

			localStorage.setItem(this.OFFLINE_STORAGE_KEY, JSON.stringify(validData));
		} catch (error) {
			console.warn("Failed to cleanup offline storage:", error);
		}
	}

	/**
	 * Initialize performance monitoring
	 */
	private initializePerformanceMonitoring(): void {
		if (typeof document === "undefined") return;

		// Monitor page visibility changes
		document.addEventListener("visibilitychange", () => {
			if (document.visibilityState === "visible") {
				this.cleanupExpiredCache();
			}
		});

		// Periodic cleanup
		setInterval(() => {
			this.cleanupExpiredCache();
		}, 5 * 60 * 1000); // Every 5 minutes
	}

	/**
	 * Get network information for optimization decisions
	 */
	private getNetworkInfo(): NetworkOptimization {
		if (typeof window === "undefined") {
			return {
				connectionType: "4g",
				effectiveType: "4g",
				downlink: 10,
				rtt: 100,
			};
		}

		const connection =
			(navigator as { connection?: unknown }).connection ||
			(navigator as { mozConnection?: unknown }).mozConnection ||
			(navigator as { webkitConnection?: unknown }).webkitConnection;

		if (!connection) {
			return {
				connectionType: "4g",
				effectiveType: "4g",
				downlink: 10,
				rtt: 100,
			};
		}

		const conn = connection as {
			effectiveType?: string;
			downlink?: number;
			rtt?: number;
		};

		return {
			connectionType:
				(conn.effectiveType as NetworkOptimization["connectionType"]) || "4g",
			effectiveType: conn.effectiveType || "4g",
			downlink: conn.downlink || 10,
			rtt: conn.rtt || 100,
		};
	}

	/**
	 * Get timeout duration based on network conditions
	 */
	private getTimeoutForNetwork(networkInfo: NetworkOptimization): number {
		switch (networkInfo.connectionType) {
			case "slow-2g":
				return 30000; // 30 seconds
			case "2g":
				return 20000; // 20 seconds
			case "3g":
				return 15000; // 15 seconds
			default:
				return 10000; // 10 seconds
		}
	}

	// Cache helper methods
	private getCacheKey(
		categoryId: string,
		difficulty?: DifficultyLevel,
		count?: number
	): string {
		return `${categoryId}-${difficulty || "mixed"}-${count || 10}`;
	}

	private getOfflineKey(
		categoryId: string,
		difficulty?: DifficultyLevel
	): string {
		return `${categoryId}-${difficulty || "mixed"}`;
	}

	private getFromCache(key: string): QuizQuestionWithAnswers[] | null {
		return this.questionCache.get(key) || null;
	}

	private setCache(
		key: string,
		data: QuizQuestionWithAnswers[],
		ttl: number
	): void {
		this.questionCache.set(key, data);

		const metadata = this.getCacheMetadata();
		metadata[key] = Date.now() + ttl;
		this.saveCacheMetadata(metadata);
	}

	private getCacheMetadata(): Record<string, number> {
		if (typeof window === "undefined") return {};

		try {
			const stored = localStorage.getItem(this.CACHE_METADATA_KEY);
			return stored ? JSON.parse(stored) : {};
		} catch {
			return {};
		}
	}

	private saveCacheMetadata(metadata: Record<string, number>): void {
		if (typeof window === "undefined") return;

		try {
			localStorage.setItem(this.CACHE_METADATA_KEY, JSON.stringify(metadata));
		} catch (error) {
			console.warn("Failed to save cache metadata:", error);
		}
	}

	private getOfflineStorage(): Record<string, OfflineQuizData> {
		if (typeof window === "undefined") return {};

		try {
			const stored = localStorage.getItem(this.OFFLINE_STORAGE_KEY);
			return stored ? JSON.parse(stored) : {};
		} catch {
			return {};
		}
	}

	/**
	 * Check if device is in offline mode
	 */
	isOffline(): boolean {
		if (typeof navigator === "undefined") return false;
		return !navigator.onLine;
	}

	/**
	 * Get offline quiz categories
	 */
	getOfflineCategories(): string[] {
		const offlineData = this.getOfflineStorage();
		return Object.values(offlineData).map((data) => data.categoryId);
	}

	/**
	 * Clear all cache and offline data
	 */
	clearAllCache(): void {
		this.questionCache.clear();
		this.categoryCache.clear();
		this.prefetchQueue.clear();

		if (typeof window !== "undefined") {
			try {
				localStorage.removeItem(this.OFFLINE_STORAGE_KEY);
				localStorage.removeItem(this.CACHE_METADATA_KEY);
			} catch (error) {
				console.warn("Failed to clear storage:", error);
			}
		}
	}
}

// Export singleton instance
export const quizPerformanceOptimizer = new QuizPerformanceOptimizer();
