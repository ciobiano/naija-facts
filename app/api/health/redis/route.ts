import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";

export async function GET() {
	try {
		// Test Redis connection
		const ping = await redis.ping();

		if (ping !== "PONG") {
			throw new Error("Redis ping failed");
		}

		// Test basic operations
		const testKey = "health-check";
		const testValue = JSON.stringify({
			timestamp: Date.now(),
			test: true,
		});

		// Set a value
		await redis.set(testKey, testValue, { ex: 60 }); // Expire in 60 seconds

		// Get the value back
		const retrieved = await redis.get(testKey);

		if (!retrieved) {
			throw new Error("Failed to retrieve test data from Redis");
		}

		// Parse and verify
		const parsedData = JSON.parse(retrieved as string);

		if (!parsedData.test) {
			throw new Error("Retrieved data doesn't match expected format");
		}

		// Clean up
		await redis.del(testKey);

		return NextResponse.json({
			status: "healthy",
			message: "Redis is working correctly",
			timestamp: new Date().toISOString(),
			operations: {
				ping: "✓",
				set: "✓",
				get: "✓",
				delete: "✓",
			},
		});
	} catch (error) {
		console.error("Redis health check failed:", error);

		return NextResponse.json(
			{
				status: "unhealthy",
				message: "Redis connection failed",
				error: error instanceof Error ? error.message : "Unknown error",
				timestamp: new Date().toISOString(),
			},
			{ status: 500 }
		);
	}
}
