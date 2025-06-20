"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RotateCcw, Share2, Download } from "lucide-react";
import { fetcher } from "@/lib/quiz";
import {
	LoadingState,
	ErrorState,
	UnauthorizedState,
} from "@/components/ui/states";
import { QuizResultsHeader } from "@/components/ui/sections/quiz/results/quiz-results-header";
import { QuizAnalytics } from "@/components/ui/sections/quiz/results/quiz-analytics";
import { QuizSummaryCard } from "@/components/ui/sections/quiz/results/quiz-summary-card";
import { QuizInsights } from "@/components/ui/sections/quiz/results/quiz-insights";
import { MilestoneCelebration } from "@/components/ui/primitives/milestone-celebration";

interface QuizResultsData {
	category: {
		id: string;
		name: string;
		slug: string;
		totalQuestions: number;
	};
	userStats: {
		totalAttempts: number;
		correctAnswers: number;
		accuracy: number;
		averageScore: number;
		totalPoints: number;
		currentStreak: number;
		longestStreak: number;
		bestTime: number;
		averageTime: number;
		recentActivity: Array<{
			date: string;
			score: number;
			questionsAnswered: number;
			timeSpent: number;
		}>;
	};
	performanceByDifficulty: {
		beginner: { correct: number; total: number };
		intermediate: { correct: number; total: number };
		advanced: { correct: number; total: number };
	};
	progressOverTime: Array<{
		date: string;
		accuracy: number;
		points: number;
		questionsAnswered: number;
	}>;
}

export default function QuizResultsPage() {
	const { data: session } = useSession();
	const params = useParams();
	const router = useRouter();
	const categorySlug = params.categorySlug as string;
	const [showCelebration, setShowCelebration] = useState(false);

	// Fetch quiz results data
	const { data, error, isLoading } = useSWR<QuizResultsData>(
		session && categorySlug
			? `/api/quiz/analytics?categoryId=${categorySlug}`
			: null,
		fetcher
	);

	// Check for category completion milestone
	useEffect(() => {
		if (data && session) {
			// Calculate unique questions answered (to check completion)
			const totalQuestions = data.category.totalQuestions;
			const userAttempts = data.userStats.totalAttempts;
			const accuracy = data.userStats.accuracy;

			// Check if user has answered all questions with 75%+ accuracy
			// Note: This assumes totalAttempts represents unique questions answered
			// You might need to adjust this logic based on your actual data structure
			const isCompleted = userAttempts >= totalQuestions && accuracy >= 75;

			// Only show celebration once per session (you could also use localStorage for persistence)
			const celebrationKey = `celebration-${categorySlug}-${data.userStats.totalAttempts}`;
			const hasSeenCelebration = sessionStorage.getItem(celebrationKey);

			if (isCompleted && !hasSeenCelebration) {
				setShowCelebration(true);
				sessionStorage.setItem(celebrationKey, "true");
			}
		}
	}, [data, session, categorySlug]);

	const handleRetakeQuiz = () => {
		router.push(`/quiz/${categorySlug}`);
	};

	const handleShareResults = () => {
		// Implement share functionality
		if (navigator.share && data) {
			navigator.share({
				title: `${data.category.name} Quiz Results`,
				text: `I scored ${data.userStats.accuracy}% accuracy on the ${data.category.name} quiz!`,
				url: window.location.href,
			});
		}
	};

	const handleShareCompletion = () => {
		if (data && navigator.share) {
			navigator.share({
				title: "Category Completed! 🎉",
				text: `Just completed ${data.category.name} with ${data.userStats.accuracy}% accuracy on Naija Facts!`,
				url: window.location.href,
			});
		}
	};

	const handleDownloadReport = () => {
		// Implement download functionality
		console.log("Download report");
	};

	if (!session) {
		return (
			<UnauthorizedState
				title="Access Restricted"
				description="You need to be signed in to view your quiz results."
			/>
		);
	}

	if (isLoading) {
		return (
			<LoadingState
				title="Loading Results"
				description="Analyzing your quiz performance..."
				variant="full"
				size="lg"
			/>
		);
	}

	if (error || !data) {
		return (
			<ErrorState
				title="Results Not Available"
				description="Unable to load your quiz results for this category."
				error={error?.message}
				onRetry={() => window.location.reload()}
				showHomeButton={false}
				showRetryButton={true}
			/>
		);
	}

	return (
		<div className="container mx-auto py-6 px-4 max-w-6xl">
			{/* Header */}
			<div className="mb-6">
				<div className="flex items-center justify-between mb-4">
					<Button
						variant="outline"
						onClick={() => router.push("/quiz")}
						className="flex items-center"
					>
						<ArrowLeft className="h-4 w-4 mr-2" />
						Back to Quiz Categories
					</Button>

					<div className="flex items-center space-x-2">
						<Button
							variant="outline"
							size="sm"
							onClick={handleShareResults}
							className="flex items-center"
						>
							<Share2 className="h-4 w-4 mr-1" />
							Share
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={handleDownloadReport}
							className="flex items-center"
						>
							<Download className="h-4 w-4 mr-1" />
							Download Report
						</Button>
						<Button onClick={handleRetakeQuiz} className="flex items-center">
							<RotateCcw className="h-4 w-4 mr-2" />
							Retake Quiz
						</Button>
					</div>
				</div>

				<QuizResultsHeader
					categoryName={data.category.name}
					userStats={data.userStats}
				/>
			</div>

			{/* Results Content */}
			<div className="grid gap-6 lg:grid-cols-3">
				{/* Main Results Column */}
				<div className="lg:col-span-2 space-y-6">
					<QuizSummaryCard userStats={data.userStats} />
					<QuizAnalytics
						performanceByDifficulty={data.performanceByDifficulty}
						progressOverTime={data.progressOverTime}
						recentActivity={data.userStats.recentActivity}
					/>
				</div>

				{/* Insights Sidebar */}
				<div className="space-y-6">
					<QuizInsights
						userStats={data.userStats}
						categoryData={data.category}
					/>
				</div>
			</div>

			{/* Category Completion Celebration */}
			{showCelebration && data && (
				<MilestoneCelebration
					completion={{
						categoryName: data.category.name,
						accuracy: Math.round(data.userStats.accuracy),
						totalQuestions: data.category.totalQuestions,
						completedQuestions: data.userStats.totalAttempts,
						totalPoints: data.userStats.totalPoints,
					}}
					show={showCelebration}
					onClose={() => setShowCelebration(false)}
					onShare={handleShareCompletion}
				/>
			)}
		</div>
	);
}
