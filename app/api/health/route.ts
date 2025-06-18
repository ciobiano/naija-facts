import { NextResponse } from "next/server";

export async function GET() {
	try {
		// Basic health check without external dependencies
		const health = {
			status: "healthy",
			timestamp: new Date().toISOString(),
			uptime: process.uptime(),
			environment: process.env.NODE_ENV || "unknown",
			memory: process.memoryUsage(),
			version: process.version,
		};

		return NextResponse.json(health, { status: 200 });
	} catch (error) {
		console.error("Health check error:", error);
		return NextResponse.json(
			{
				status: "unhealthy",
				timestamp: new Date().toISOString(),
				error: error instanceof Error ? error.message : "Health check failed",
			},
			{ status: 503 }
		);
	}
}
