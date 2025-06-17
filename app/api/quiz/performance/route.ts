import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { quizService } from "@/lib/quiz/quiz-service";
import { DifficultyLevel } from "@prisma/client";

export async function GET(request: NextRequest) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);
		const categoryId = searchParams.get("categoryId");
		const difficulty = searchParams.get("difficulty") as DifficultyLevel | null;
		const count = parseInt(searchParams.get("count") || "10");
		const useOptimized = searchParams.get("optimized") === "true";

		if (!categoryId) {
			return NextResponse.json(
				{ error: "Category ID is required" },
				{ status: 400 }
			);
		}

		// Validate count parameter
		if (count < 1 || count > 50) {
			return NextResponse.json(
				{ error: "Count must be between 1 and 50" },
				{ status: 400 }
			);
		}

		let questions;

		if (useOptimized) {
			// Use performance-optimized loading with caching
			questions = await quizService.getOptimizedQuestions(
				session.user.id,
				categoryId,
				count,
				difficulty || undefined
			);
		} else {
			// Fallback to adaptive questions
			questions = await quizService.getAdaptiveQuestions(
				session.user.id,
				categoryId,
				count,
				difficulty || undefined
			);
		}

		// Get network connection info from headers (if available)
		const saveData = request.headers.get("save-data") === "on";
		const connectionType = request.headers.get("connection-type") || "unknown";

		// Create response data
		const responseData = {
			questions,
			metadata: {
				count: questions.length,
				categoryId,
				difficulty: difficulty || "mixed",
				optimized: useOptimized,
				serverTime: new Date().toISOString(),
				connectionType,
				saveData,
			},
		};

		const response = NextResponse.json(responseData);

		// Set performance-optimized cache headers
		response.headers.set(
			"Cache-Control",
			"public, max-age=300, stale-while-revalidate=600"
		);
		response.headers.set("Vary", "Accept-Encoding, Save-Data, Connection-Type");

		// Enable compression for better performance
		if (request.headers.get("accept-encoding")?.includes("gzip")) {
			response.headers.set("Content-Encoding", "gzip");
		}

		// Set ETag for efficient caching
		const etag = `"${categoryId}-${difficulty || "mixed"}-${count}-${
			questions.length
		}"`;
		response.headers.set("ETag", etag);

		// Check if client has cached version
		const ifNoneMatch = request.headers.get("if-none-match");
		if (ifNoneMatch === etag) {
			return new NextResponse(null, { status: 304 });
		}

		// Add performance hints for preloading
		response.headers.set("Link", `</api/quiz/categories>; rel=prefetch`);

		return response;
	} catch (error) {
		console.error("Performance API error:", error);

		// Return graceful error response
		return NextResponse.json(
			{
				error: "Failed to load questions",
				message: error instanceof Error ? error.message : "Unknown error",
				fallback: true,
			},
			{
				status: 500,
				headers: {
					"Cache-Control": "no-cache, no-store, must-revalidate",
				},
			}
		);
	}
}

// Handle prefetch requests
export async function HEAD(request: NextRequest) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.id) {
			return new NextResponse(null, { status: 401 });
		}

		const { searchParams } = new URL(request.url);
		const categoryId = searchParams.get("categoryId");

		if (!categoryId) {
			return new NextResponse(null, { status: 400 });
		}

		// Verify category exists
		const category = await quizService.getCategory(categoryId);
		if (!category) {
			return new NextResponse(null, { status: 404 });
		}

		const response = new NextResponse(null, { status: 200 });

		// Set cache headers for preflight
		response.headers.set("Cache-Control", "public, max-age=300");
		response.headers.set("Access-Control-Allow-Origin", "*");
		response.headers.set("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");

		return response;
	} catch (error) {
		console.error("Performance preflight error:", error);
		return new NextResponse(null, { status: 500 });
	}
}
