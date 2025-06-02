"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import useSWR from "swr";

import { calculateQuizStats, fetcher } from "@/lib/quiz";
import { DifficultyLevel, QuizCategoriesResponse } from "@/types";
import { ChapterCard } from "@/components/ui/sections/quiz/chapter-card";
import { HelpSection } from "@/components/ui/sections/quiz/help-section";
import { StatsOverview } from "@/components/ui/sections/quiz/stats-overview";
import {
	LoadingState,
	ErrorState,
	UnauthorizedState,
} from "@/components/ui/states";

export default function QuizPage() {
	const { data: session } = useSession();
	const [selectedDifficulty, setSelectedDifficulty] =
		useState<DifficultyLevel>("all");

	const { data, error, isLoading, mutate } = useSWR<QuizCategoriesResponse>(
		session ? "/api/quiz/categories?includeStats=true" : null,
		fetcher,
		{
			revalidateOnFocus: false,
			dedupingInterval: 30000, // Cache for 30 seconds
			onError: (err) => console.error("Quiz categories error:", err),
		}
	);

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
				<h1 className="text-3xl font-bold mb-2">
					Nigerian Constitutional Quizzes
				</h1>
				<p className="text-lg text-muted-foreground">
					Master the Nigerian Constitution chapter by chapter with adaptive
					quizzes
				</p>
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
