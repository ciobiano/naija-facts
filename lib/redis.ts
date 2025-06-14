import { Redis } from "@upstash/redis";

// Initialize Redis client
const redis = new Redis({
	url: process.env.UPSTASH_REDIS_REST_URL!,
	token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Type definitions for better TypeScript support
interface ImageMetadata {
	id: string;
	file_path: string;
	file_size: number;
	mime_type: string;
	title: string;
	description?: string;
	category_id?: string;
	view_count?: number;
	download_count?: number;
	cached_at: number;
}

interface SearchFilters {
	category?: string;
	tags?: string[];
	dateRange?: {
		start: Date;
		end: Date;
	};
}

interface UserActivity {
	last_login: number;
	quiz_progress: Record<string, number>;
	achievements: string[];
	preferences: Record<string, unknown>;
}

/**
 * Cultural Content Cache Manager
 *
 * Handles caching for Nigerian cultural content platform
 * Optimized for image metadata, search results, and analytics
 */
export class CulturalCache {
	private static instance: CulturalCache;
	private redis: Redis;

	// Private constructor prevents direct instantiation (Singleton pattern)
	private constructor() {
		this.redis = redis;
	}

	// Public static method - the only way to get an instance
	public static getInstance(): CulturalCache {
		if (!CulturalCache.instance) {
			CulturalCache.instance = new CulturalCache();
		}
		return CulturalCache.instance;
	}

	/**
	 * 🖼️ IMAGE METADATA CACHING
	 *
	 * Cache image metadata for lightning-fast retrieval
	 * TTL: 1 hour (3600s) - image metadata rarely changes
	 */
	public async cacheImageMetadata(
		imageId: string,
		metadata: ImageMetadata,
		ttlSeconds: number = 3600
	): Promise<void> {
		const key = `image:metadata:${imageId}`;
		await this.redis.setex(
			key,
			ttlSeconds,
			JSON.stringify({
				...metadata,
				cached_at: Date.now(),
			})
		);
	}

	public async getImageMetadata(
		imageId: string
	): Promise<ImageMetadata | null> {
		const key = `image:metadata:${imageId}`;
		const cached = await this.redis.get(key);
		return cached ? JSON.parse(cached as string) : null;
	}

	/**
	 * 📊 VIEW/DOWNLOAD TRACKING
	 *
	 * Fast Redis counters for real-time analytics
	 * Background job syncs to database periodically
	 */
	public async incrementViewCount(imageId: string): Promise<number> {
		const key = `views:${imageId}`;
		return await this.redis.incr(key);
	}

	public async incrementDownloadCount(imageId: string): Promise<number> {
		const key = `downloads:${imageId}`;
		return await this.redis.incr(key);
	}

	public async getViewCount(imageId: string): Promise<number> {
		const key = `views:${imageId}`;
		const count = await this.redis.get(key);
		return count ? parseInt(count as string) : 0;
	}

	/**
	 * 🔍 SEARCH RESULTS CACHING
	 *
	 * Cache search results for common queries
	 * TTL: 30 minutes (1800s) - search results can be cached longer
	 */
	public async cacheSearchResults(
		query: string,
		filters: SearchFilters,
		results: ImageMetadata[],
		ttlSeconds: number = 1800
	): Promise<void> {
		const cacheKey = this.generateSearchKey(query, filters);
		await this.redis.setex(
			cacheKey,
			ttlSeconds,
			JSON.stringify({
				query,
				filters,
				results,
				cached_at: Date.now(),
				total_results: results.length,
			})
		);
	}

	public async getCachedSearchResults(
		query: string,
		filters: SearchFilters
	): Promise<ImageMetadata[] | null> {
		const cacheKey = this.generateSearchKey(query, filters);
		const cached = await this.redis.get(cacheKey);

		if (cached) {
			const parsed = JSON.parse(cached as string);
			return parsed.results;
		}

		return null;
	}

	private generateSearchKey(query: string, filters: SearchFilters): string {
		const filterString = JSON.stringify(filters || {});
		const combined = `${query}:${filterString}`;
		const encoded = Buffer.from(combined).toString("base64");
		return `search:${encoded}`;
	}

	/**
	 * 📈 ANALYTICS & BATCH PROCESSING
	 *
	 * Get batched data for background processing
	 */
	public async getBatchedViewCounts(): Promise<Record<string, number>> {
		const pattern = "views:*";
		const keys = await this.redis.keys(pattern);
		const counts: Record<string, number> = {};

		for (const key of keys) {
			const count = await this.redis.get(key);
			if (count && parseInt(count as string) > 0) {
				const imageId = key.replace("views:", "");
				counts[imageId] = parseInt(count as string);
			}
		}

		return counts;
	}

	public async getBatchedDownloadCounts(): Promise<Record<string, number>> {
		const pattern = "downloads:*";
		const keys = await this.redis.keys(pattern);
		const counts: Record<string, number> = {};

		for (const key of keys) {
			const count = await this.redis.get(key);
			if (count && parseInt(count as string) > 0) {
				const imageId = key.replace("downloads:", "");
				counts[imageId] = parseInt(count as string);
			}
		}

		return counts;
	}

	public async clearBatchedCounts(
		imageIds: string[],
		type: "views" | "downloads"
	): Promise<void> {
		if (imageIds.length === 0) return;

		const keys = imageIds.map((id) => `${type}:${id}`);
		await this.redis.del(...keys);
	}

	/**
	 * 🏷️ CATEGORY & TAG CACHING
	 *
	 * Cache category and tag data for faster filtering
	 */
	public async cacheCategories(
		categories: Array<Record<string, unknown>>,
		ttlSeconds: number = 7200
	): Promise<void> {
		const key = "cultural:categories";
		await this.redis.setex(key, ttlSeconds, JSON.stringify(categories));
	}

	public async getCachedCategories(): Promise<Array<
		Record<string, unknown>
	> | null> {
		const key = "cultural:categories";
		const cached = await this.redis.get(key);
		return cached ? JSON.parse(cached as string) : null;
	}

	/**
	 * 👤 USER SESSION CACHING
	 *
	 * Cache user preferences and recent activity
	 */
	public async cacheUserActivity(
		userId: string,
		activity: UserActivity,
		ttlSeconds: number = 3600
	): Promise<void> {
		const key = `user:activity:${userId}`;
		await this.redis.setex(key, ttlSeconds, JSON.stringify(activity));
	}

	public async getUserActivity(userId: string): Promise<UserActivity | null> {
		const key = `user:activity:${userId}`;
		const cached = await this.redis.get(key);
		return cached ? JSON.parse(cached as string) : null;
	}

	/**
	 * 🔧 UTILITY METHODS
	 */
	public async clearCache(pattern: string): Promise<void> {
		const keys = await this.redis.keys(pattern);
		if (keys.length > 0) {
			await this.redis.del(...keys);
		}
	}

	public async getCacheStats(): Promise<Record<string, unknown>> {
		// Note: Redis client might not have 'info' method, using ping instead
		try {
			await this.redis.ping();
			return {
				status: "connected",
				timestamp: Date.now(),
			};
		} catch (error) {
			return {
				status: "error",
				error: error instanceof Error ? error.message : "Unknown error",
				timestamp: Date.now(),
			};
		}
	}

	/**
	 * 🚨 HEALTH CHECK
	 */
	public async healthCheck(): Promise<boolean> {
		try {
			await this.redis.ping();
			return true;
		} catch (error) {
			console.error("Redis health check failed:", error);
			return false;
		}
	}
}

// Export singleton instance
export const culturalCache = CulturalCache.getInstance();

// Export for direct Redis access if needed
export { redis };

// Export types for use in other files
export type { ImageMetadata, SearchFilters, UserActivity };

/**
 * 🎯 USAGE EXAMPLES:
 *
 * // Cache image metadata
 * await culturalCache.cacheImageMetadata('img123', imageData);
 *
 * // Get cached metadata
 * const metadata = await culturalCache.getImageMetadata('img123');
 *
 * // Track views (fast)
 * await culturalCache.incrementViewCount('img123');
 *
 * // Cache search results
 * await culturalCache.cacheSearchResults('Nigerian dance', {}, results);
 *
 * // Background batch processing
 * const batchedViews = await culturalCache.getBatchedViewCounts();
 */
