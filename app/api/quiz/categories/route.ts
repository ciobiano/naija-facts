import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { quizService } from "@/lib/database/quiz-service";

// GET /api/quiz/categories - Get all quiz categories
export async function GET(request: Request) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);
		const includeStats = searchParams.get("includeStats") === "true";
		const page = parseInt(searchParams.get("page") || "1");
		const pageSize = parseInt(searchParams.get("pageSize") || "25");

		// Use the clean quiz service
		const result = await quizService.getCategories(
			includeStats ? session.user.id : undefined,
			{ page, pageSize }
		);

		return NextResponse.json(result);
	} catch (error) {
		console.error("Error fetching quiz categories:", error);
		return NextResponse.json(
			{ error: "Failed to fetch quiz categories" },
			{ status: 500 }
		);
	}
}
