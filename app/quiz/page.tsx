"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
	BookOpen,
	Clock,
	Trophy,
	Users,
	CheckCircle,
	Lock,
	Play,
	Star,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import useSWR from "swr";

interface QuizCategory {
	id: string;
	name: string;
	description: string;
	slug: string;
	icon?: string;
	color?: string;
	sort_order: number;
	totalQuestions: number;
	progress: {
		completion_percentage: number;
		total_points_earned: number;
		current_streak: number;
		total_questions_attempted: number;
		correct_answers: number;
		average_score: number;
		last_activity: string | null;
	} | null;
}

interface QuizCategoriesResponse {
	categories: QuizCategory[];
	meta: {
		pagination: {
			page: number;
			pageSize: number;
			total: number;
			totalPages: number;
		};
	};
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function QuizPage() {
	const { data: session } = useSession();
	const [selectedDifficulty, setSelectedDifficulty] = useState<
		"all" | "easy" | "medium" | "hard"
	>("all");
	const { data, error, isLoading, mutate } = useSWR(
		session ? "/api/quiz/categories?includeStats=true" : null,
		fetcher,
		{
			revalidateOnFocus: false,
			dedupingInterval: 30000, // Cache for 30 seconds
			onError: (err) => console.error("Quiz categories error:", err),
		}
	);

	const categories = data?.categories || [];

	const getEstimatedTime = (totalQuestions: number) => {
		// Estimate 1.5 minutes per question
		const minutes = Math.ceil(totalQuestions * 1.5);
		if (minutes < 60) return `${minutes}m`;
		const hours = Math.floor(minutes / 60);
		const remainingMinutes = minutes % 60;
		return `${hours}h ${remainingMinutes}m`;
	};

	const getDifficultyColor = (progress: QuizCategory["progress"]) => {
		if (!progress) return "bg-gray-100";
		const score = progress.average_score;
		if (score >= 80) return "bg-green-100 text-green-800";
		if (score >= 60) return "bg-yellow-100 text-yellow-800";
		return "bg-red-100 text-red-800";
	};

	const isChapterUnlocked = (
		categoryIndex: number,
		progress: QuizCategory["progress"]
	) => {
		// First chapter is always unlocked
		if (categoryIndex === 0) return true;

		// For other chapters, check if previous chapter has some progress
		const previousCategory = categories[categoryIndex - 1];
		return (
			previousCategory?.progress &&
			previousCategory.progress.total_questions_attempted > 0
		);
	};

	if (isLoading) {
		return (
			<div className="container mx-auto py-6 px-4 max-w-6xl">
				<div className="animate-pulse">
					<div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
					<div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
					<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
						{[...Array(6)].map((_, i) => (
							<div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
						))}
					</div>
				</div>
			</div>
		);
	}

	if (!session) {
		return (
			<div className="container mx-auto py-12 px-4 max-w-4xl text-center">
				<h1 className="text-3xl font-bold mb-4">
					Nigerian Constitutional Quizzes
				</h1>
				<p className="text-lg text-muted-foreground mb-8">
					Test your knowledge of Nigerian constitutional law and history
				</p>
				<Button asChild size="lg">
					<Link href="/auth/signin">Sign In to Start Quizzes</Link>
				</Button>
			</div>
		);
	}

	if (error) {
		return (
			<div className="container mx-auto py-12 px-4 max-w-4xl text-center">
				<h1 className="text-2xl font-bold text-red-600 mb-4">
					Error Loading Quizzes
				</h1>
				<p className="text-muted-foreground">{error.message}</p>
				<Button onClick={() => mutate()} className="mt-4">
					Try Again
				</Button>
			</div>
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
			<div className="grid md:grid-cols-4 gap-4 mb-8">
				<Card>
					<CardContent className="p-4">
						<div className="flex items-center space-x-2">
							<BookOpen className="h-5 w-5 text-blue-500" />
							<div>
								<p className="text-sm font-medium">Total Chapters</p>
								<p className="text-2xl font-bold">{categories.length}</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4">
						<div className="flex items-center space-x-2">
							<Trophy className="h-5 w-5 text-yellow-500" />
							<div>
								<p className="text-sm font-medium">Total Points</p>
								<p className="text-2xl font-bold">
									{categories.reduce(
										(sum, cat) =>
											sum + (cat.progress?.total_points_earned || 0),
										0
									)}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4">
						<div className="flex items-center space-x-2">
							<CheckCircle className="h-5 w-5 text-green-500" />
							<div>
								<p className="text-sm font-medium">Completed</p>
								<p className="text-2xl font-bold">
									{
										categories.filter(
											(cat) =>
												cat.progress && cat.progress.completion_percentage >= 80
										).length
									}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4">
						<div className="flex items-center space-x-2">
							<Star className="h-5 w-5 text-purple-500" />
							<div>
								<p className="text-sm font-medium">Best Streak</p>
								<p className="text-2xl font-bold">
									{Math.max(
										...categories.map(
											(cat) => cat.progress?.current_streak || 0
										)
									)}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Chapter Grid */}
			<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
				{categories.map((category, index) => {
					const isUnlocked = isChapterUnlocked(index, category.progress);
					const progress = category.progress;
					const completionPercentage = progress?.completion_percentage || 0;
					const isCompleted = completionPercentage >= 80;

					return (
						<Card
							key={category.id}
							className={cn(
								"relative transition-all duration-200 hover:shadow-lg",
								!isUnlocked && "opacity-60",
								isCompleted && "ring-2 ring-green-500/20"
							)}
						>
							<CardHeader className="pb-3">
								<div className="flex items-start justify-between">
									<div className="flex items-center space-x-3">
										<div
											className={cn(
												"w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg",
												category.color || "bg-blue-500"
											)}
										>
											{index + 1}
										</div>
										<div>
											<CardTitle className="text-lg">{category.name}</CardTitle>
											<div className="flex items-center space-x-2 text-sm text-muted-foreground">
												<Clock className="h-4 w-4" />
												<span>{getEstimatedTime(category.totalQuestions)}</span>
												<span>•</span>
												<span>{category.totalQuestions} questions</span>
											</div>
										</div>
									</div>

									<div className="flex flex-col items-end space-y-1">
										{!isUnlocked && <Lock className="h-5 w-5 text-gray-400" />}
										{isCompleted && (
											<CheckCircle className="h-5 w-5 text-green-500" />
										)}
										{progress && progress.average_score > 0 && (
											<Badge
												variant="secondary"
												className={getDifficultyColor(progress)}
											>
												{Math.round(progress.average_score)}%
											</Badge>
										)}
									</div>
								</div>
							</CardHeader>

							<CardContent>
								<CardDescription className="mb-4 line-clamp-2">
									{category.description}
								</CardDescription>

								{/* Progress Bar */}
								<div className="mb-4">
									<div className="flex justify-between text-sm mb-1">
										<span>Progress</span>
										<span>{Math.round(completionPercentage)}%</span>
									</div>
									<Progress value={completionPercentage} className="h-2" />
								</div>

								{/* Stats */}
								{progress && (
									<div className="grid grid-cols-2 gap-4 text-sm mb-4">
										<div>
											<p className="font-medium">Questions Attempted</p>
											<p className="text-muted-foreground">
												{progress.total_questions_attempted}
											</p>
										</div>
										<div>
											<p className="font-medium">Correct Answers</p>
											<p className="text-muted-foreground">
												{progress.correct_answers}
											</p>
										</div>
									</div>
								)}

								{/* Action Buttons */}
								<div className="flex gap-2">
									{isUnlocked ? (
										<>
											<Button asChild className="flex-1">
												<Link href={`/quiz/${category.slug}`}>
													<Play className="h-4 w-4 mr-2" />
													{progress && progress.total_questions_attempted > 0
														? "Continue"
														: "Start Quiz"}
												</Link>
											</Button>
											{progress && progress.total_questions_attempted > 0 && (
												<Button variant="outline" asChild>
													<Link href={`/quiz/${category.slug}/results`}>
														View Results
													</Link>
												</Button>
											)}
										</>
									) : (
										<Button disabled className="flex-1">
											<Lock className="h-4 w-4 mr-2" />
											Locked
										</Button>
									)}
								</div>

								{/* Unlock Requirement */}
								{!isUnlocked && index > 0 && (
									<p className="text-xs text-muted-foreground mt-2">
										Complete {categories[index - 1]?.name} to unlock
									</p>
								)}
							</CardContent>
						</Card>
					);
				})}
			</div>

			{/* Help Section */}
			<Card className="mt-8">
				<CardHeader>
					<CardTitle>How It Works</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid md:grid-cols-3 gap-6 text-sm">
						<div className="flex items-start space-x-3">
							<div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
								1
							</div>
							<div>
								<h4 className="font-medium mb-1">Start with Chapter I</h4>
								<p className="text-muted-foreground">
									Begin your constitutional journey with the foundational
									chapter
								</p>
							</div>
						</div>
						<div className="flex items-start space-x-3">
							<div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold">
								2
							</div>
							<div>
								<h4 className="font-medium mb-1">Progress Sequentially</h4>
								<p className="text-muted-foreground">
									Each chapter unlocks after you attempt questions in the
									previous one
								</p>
							</div>
						</div>
						<div className="flex items-start space-x-3">
							<div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold">
								3
							</div>
							<div>
								<h4 className="font-medium mb-1">Track Your Mastery</h4>
								<p className="text-muted-foreground">
									Monitor your progress and improve your scores over time
								</p>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
