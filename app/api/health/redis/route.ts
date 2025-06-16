import { NextResponse } from "next/server";
import { culturalCache } from "@/lib/redis";

export async function GET() {
	try {
		console.log("🔍 Testing Redis connection...");

		// Check environment variables
		const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
		const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

		if (!redisUrl || !redisToken) {
			console.error("❌ Redis environment variables not set");
			return NextResponse.json(
				{
					status: "error",
					message: "Redis environment variables not configured",
					details: {
						hasUrl: !!redisUrl,
						hasToken: !!redisToken,
					},
				},
				{ status: 500 }
			);
		}

		// Test basic Redis health check
		const isHealthy = await culturalCache.healthCheck();

		if (!isHealthy) {
			console.error("❌ Redis health check failed");
			return NextResponse.json(
				{
					status: "unhealthy",
					message: "Redis health check failed",
				},
				{ status: 500 }
			);
		}

		// Test basic cache functionality with simple data
		const testKey = `health-test-${Date.now()}`;
		const testData = {
			message: "health check",
			timestamp: Date.now(),
			simple: true,
		};

		// Test basic caching (this uses the fixed safeParseRedisData function)
		await culturalCache.cacheImageMetadata(
			testKey,
			{
				id: testKey,
				file_path: "/test/path",
				file_size: 1024,
				mime_type: "image/test",
				title: "Health Check Test",
				cached_at: Date.now(),
			},
			60
		);

		// Test retrieving cached data
		const retrieved = await culturalCache.getImageMetadata(testKey);

		// Clean up test data
		await culturalCache.clearCache(`image:metadata:${testKey}`);

		const basicTestPassed =
			retrieved && retrieved.title === "Health Check Test";

		console.log("✅ Redis health check successful");
		return NextResponse.json({
			status: "healthy",
			message: "Redis connection is working properly",
			timestamp: Date.now(),
			tests: {
				basicHealth: isHealthy,
				cacheReadWrite: basicTestPassed,
			},
		});
	} catch (error) {
		console.error("❌ Redis health check error:", error);
		return NextResponse.json(
			{
				status: "error",
				message: "Redis health check failed",
				error: error instanceof Error ? error.message : "Unknown error",
				timestamp: Date.now(),
			},
			{ status: 500 }
		);
	}
}
