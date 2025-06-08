"use client";

import { useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import useSWR from "swr";

import { calculateQuizStats, fetcher } from "@/lib/quiz";
import { QuizCategoriesResponse } from "@/types";
import { ChapterCard } from "@/components/ui/sections/quiz/chapter-card";
import { HelpSection } from "@/components/ui/sections/quiz/help-section";
import { StatsOverview } from "@/components/ui/sections/quiz/stats-overview";
import { PerformanceIndicator } from "@/components/ui/sections/quiz/performance-indicator";
import {
	LoadingState,
	ErrorState,
	UnauthorizedState,
} from "@/components/ui/states";

export default function QuizPage() {
	const { data: session } = useSession();
	const router = useRouter();

	const { data, error, isLoading, mutate } = useSWR<QuizCategoriesResponse>(
		session ? "/api/quiz/categories?includeStats=true" : null,
		fetcher,
		{
			revalidateOnFocus: false,
			dedupingInterval: 30000, // Cache for 30 seconds
			onError: (err) => console.error("Quiz categories error:", err),
		}
	);

	// Handle corrupted session detection
	const { status } = useSession();
	useEffect(() => {
		// Case 1: Session exists but user.id is missing (corrupted token)
		if (session && !session.user?.id) {
			console.log(
				"Detected session without user ID, signing out and redirecting..."
			);
			signOut({ redirect: false }).then(() => {
				router.push("/auth/signin?callbackUrl=" + encodeURIComponent("/quiz"));
			});
			return;
		}

		// Case 2: Get 401 but have a session (API rejecting corrupted session)
		if (session && error && error.message?.includes("401")) {
			console.log(
				"Detected corrupted session via API error, signing out and redirecting..."
			);
			signOut({ redirect: false }).then(() => {
				router.push("/auth/signin?callbackUrl=" + encodeURIComponent("/quiz"));
			});
			return;
		}

		// Case 3: Session completely invalidated
		if (status === "unauthenticated" && window.location.pathname === "/quiz") {
			console.log("Session invalidated, redirecting to sign in...");
			router.push("/auth/signin?callbackUrl=" + encodeURIComponent("/quiz"));
		}
	}, [session, error, status, router]);

	const categories = data?.categories || [];
	const stats = calculateQuizStats(categories);

	// Loading state
	if (isLoading) {
		return (
			<LoadingState
				title="Loading Quiz Categories"
				description="Preparing your personalized quiz experience..."
				variant="cards"
			/>
		);
	}

	// Unauthenticated state
	if (!session) {
		return (
			<UnauthorizedState
				title="Ready to Test Your Knowledge?"
				description="Sign in to access Nigerian Constitutional quizzes and track your progress."
			/>
		);
	}

	// Error state
	if (error) {
		return (
			<ErrorState
				title="Unable to Load Quiz Categories"
				description="We couldn't fetch the quiz categories. Please try again."
				error={error.message}
				onRetry={() => mutate()}
			/>
		);
	}

	return (
		<div className="container mx-auto py-6 px-4 max-w-6xl">
			{/* Header */}
			<div className="mb-8">
				<div className="flex items-center justify-between mb-2">
					<h1 className="text-3xl font-bold">
						Nigerian Constitutional Quizzes
					</h1>
					<PerformanceIndicator
						showDetailedMetrics={true}
						className="hidden md:flex"
					/>
				</div>
				<p className="text-lg text-muted-foreground">
					Master the Nigerian Constitution chapter by chapter with adaptive
					quizzes
				</p>

				{/* Mobile Performance Indicator */}
				<div className="mt-4 md:hidden">
					<PerformanceIndicator showDetailedMetrics={false} />
				</div>
			</div>

			{/* Stats Overview */}
			<StatsOverview stats={stats} />

			{/* Chapter Grid */}
			<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
				{categories.map((category, index) => (
					<ChapterCard
						key={category.id}
						category={category}
						index={index}
						categories={categories}
					/>
				))}
			</div>

			{/* Help Section */}
			<HelpSection />
		</div>
	);
}
