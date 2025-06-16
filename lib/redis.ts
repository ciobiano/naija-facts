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
 * Helper function to safely parse Redis data
 * Upstash Redis automatically deserializes JSON, so we need to handle both cases
 */
function safeParseRedisData<T>(data: unknown): T | null {
	if (!data) return null;

	// If it's already an object (Upstash auto-deserialization), return it
	if (typeof data === "object") {
		return data as T;
	}

	// If it's a string, try to parse it
	if (typeof data === "string") {
		try {
			return JSON.parse(data) as T;
		} catch (error) {
			console.error("Failed to parse Redis data:", error);
			return null;
		}
	}

	return null;
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
		return safeParseRedisData<ImageMetadata>(cached);
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

		const parsed = safeParseRedisData<{
			query: string;
			filters: SearchFilters;
			results: ImageMetadata[];
			cached_at: number;
			total_results: number;
		}>(cached);

		return parsed?.results || null;
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
		return safeParseRedisData<Array<Record<string, unknown>>>(cached);
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
		return safeParseRedisData<UserActivity>(cached);
	}

	/**
	 * 🧹 CACHE MANAGEMENT
	 */
	public async clearCache(pattern: string): Promise<void> {
		const keys = await this.redis.keys(pattern);
		if (keys.length > 0) {
			await this.redis.del(...keys);
		}
	}

	public async getCacheStats(): Promise<Record<string, unknown>> {
		try {
			// Basic stats without using Redis INFO (which might not be available on Upstash)
			const patterns = [
				"image:metadata:*",
				"views:*",
				"downloads:*",
				"search:*",
				"cultural:categories",
				"jwt:session:*",
				"user:profile:*",
			];

			const stats: Record<string, number> = {};

			for (const pattern of patterns) {
				const keys = await this.redis.keys(pattern);
				const category = pattern.replace(":*", "").replace(":", "_");
				stats[`${category}_count`] = keys.length;
			}

			return {
				...stats,
				timestamp: Date.now(),
			};
		} catch (error) {
			console.error("Failed to get cache stats:", error);
			return { error: "Failed to retrieve cache statistics" };
		}
	}

	public async healthCheck(): Promise<boolean> {
		try {
			await this.redis.ping();
			return true;
		} catch (error) {
			console.error("Redis health check failed:", error);
			return false;
		}
	}

	// Helper function to sanitize JWT token data for safe storage
	private sanitizeTokenData(
		tokenData: Record<string, unknown>
	): Record<string, unknown> {
		const sanitized: Record<string, unknown> = {};
		const allowedFields = [
			"sub",
			"email",
			"name",
			"picture",
			"sessionId",
			"sessionStart",
			"preferredLanguage",
			"timezone",
			"isActive",
			"emailVerified",
			"iat",
			"exp",
			"jti",
		];

		for (const [key, value] of Object.entries(tokenData)) {
			if (allowedFields.includes(key)) {
				// Ensure dates are converted to timestamps
				if (value instanceof Date) {
					sanitized[key] = value.getTime();
				} else if (
					typeof value === "string" ||
					typeof value === "number" ||
					typeof value === "boolean" ||
					value === null
				) {
					sanitized[key] = value;
				}
			}
		}

		return sanitized;
	}

	// Helper function to deserialize JWT token data
	private deserializeTokenData(
		tokenData: Record<string, unknown>
	): Record<string, unknown> {
		const deserialized = { ...tokenData };

		// Convert timestamp fields back if needed
		if (
			deserialized.sessionStart &&
			typeof deserialized.sessionStart === "number"
		) {
			// Keep as number for easier comparison
		}

		return deserialized;
	}

	/**
	 * 🔐 SIMPLIFIED JWT SESSION CACHING
	 *
	 * Simplified JWT caching - only use when absolutely necessary
	 * NextAuth handles most session management already
	 */
	public async cacheJWTSession(
		tokenId: string,
		tokenData: Record<string, unknown>,
		ttlSeconds: number = 1800
	): Promise<void> {
		const key = `jwt:session:${tokenId}`;
		const sanitizedData = this.sanitizeTokenData(tokenData);

		try {
			await this.redis.setex(
				key,
				ttlSeconds,
				JSON.stringify({
					...sanitizedData,
					cached_at: Date.now(),
				})
			);
		} catch (error) {
			console.error(`Failed to cache JWT session ${tokenId}:`, error);
			throw error;
		}
	}

	public async getJWTSession(
		tokenId: string
	): Promise<Record<string, unknown> | null> {
		const key = `jwt:session:${tokenId}`;

		try {
			const cached = await this.redis.get(key);
			const parsed = safeParseRedisData<Record<string, unknown>>(cached);
			return parsed ? this.deserializeTokenData(parsed) : null;
		} catch (error) {
			console.error(`Failed to get JWT session ${tokenId}:`, error);
			return null;
		}
	}

	public async invalidateJWTSession(tokenId: string): Promise<void> {
		const key = `jwt:session:${tokenId}`;
		await this.redis.del(key);
	}

	/**
	 * 👤 SIMPLIFIED USER PROFILE CACHING
	 *
	 * Cache user profile data - simplified approach
	 */
	public async cacheUserProfile(
		userId: string,
		userData: Record<string, unknown>,
		ttlSeconds: number = 900
	): Promise<void> {
		const key = `user:profile:${userId}`;
		await this.redis.setex(
			key,
			ttlSeconds,
			JSON.stringify({
				...userData,
				cached_at: Date.now(),
			})
		);
	}

	public async getUserProfile(
		userId: string
	): Promise<Record<string, unknown> | null> {
		const key = `user:profile:${userId}`;
		const cached = await this.redis.get(key);
		return safeParseRedisData<Record<string, unknown>>(cached);
	}

	public async invalidateUserProfile(userId: string): Promise<void> {
		const key = `user:profile:${userId}`;
		await this.redis.del(key);
	}

	/**
	 * 🔄 BASIC SESSION RECOVERY HELPERS
	 *
	 * Simplified session recovery - use sparingly
	 */
	public async cacheEmailToUserId(
		email: string,
		userId: string,
		ttlSeconds: number = 3600
	): Promise<void> {
		const key = `email:userid:${Buffer.from(email).toString("base64")}`;
		await this.redis.setex(key, ttlSeconds, userId);
	}

	public async getUserIdByEmail(email: string): Promise<string | null> {
		const key = `email:userid:${Buffer.from(email).toString("base64")}`;
		const result = await this.redis.get(key);
		return result as string | null;
	}

	/**
	 * 🚨 BASIC SESSION BLACKLIST
	 *
	 * Simple session blacklisting - use only when necessary
	 */
	public async blacklistSession(
		sessionId: string,
		ttlSeconds: number = 86400 // 24 hours
	): Promise<void> {
		const key = `blacklist:session:${sessionId}`;
		await this.redis.setex(key, ttlSeconds, "blacklisted");
	}

	public async isSessionBlacklisted(sessionId: string): Promise<boolean> {
		const key = `blacklist:session:${sessionId}`;
		const result = await this.redis.get(key);
		return result === "blacklisted";
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
