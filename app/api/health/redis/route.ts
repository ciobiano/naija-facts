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
			return NextResponse.json({
				status: "error",
				message: "Redis environment variables not configured",
				details: {
					hasUrl: !!redisUrl,
					hasToken: !!redisToken,
				}
			}, { status: 500 });
		}

		// Test Redis health check
		const isHealthy = await culturalCache.healthCheck();
		
		if (isHealthy) {
			console.log("✅ Redis connection successful");
			return NextResponse.json({
				status: "healthy",
				message: "Redis connection is working",
				timestamp: Date.now()
			});
		} else {
			console.error("❌ Redis health check failed");
			return NextResponse.json({
				status: "unhealthy",
				message: "Redis health check failed"
			}, { status: 500 });
		}
	} catch (error) {
		console.error("❌ Redis connection error:", error);
		return NextResponse.json({
			status: "error",
			message: "Redis connection failed",
			error: error instanceof Error ? error.message : "Unknown error"
		}, { status: 500 });
	}
} 