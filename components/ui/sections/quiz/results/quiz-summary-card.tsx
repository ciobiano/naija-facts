"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
	Target,
	Clock,
	TrendingUp,
	Zap,
	CheckCircle,
	XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface QuizSummaryCardProps {
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
	};
}

export function QuizSummaryCard({ userStats }: QuizSummaryCardProps) {
	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, "0")}`;
	};

	const getScoreColor = (score: number) => {
		if (score >= 90) return "text-green-600";
		if (score >= 80) return "text-blue-600";
		if (score >= 70) return "text-yellow-600";
		return "text-red-600";
	};

	const summaryItems = [
		{
			icon: Target,
			label: "Accuracy Rate",
			value: `${userStats.accuracy}%`,
			progress: userStats.accuracy,
			color: "text-primary",
			bgColor: "bg-primary/10",
		},
		{
			icon: CheckCircle,
			label: "Questions Correct",
			value: `${userStats.correctAnswers}/${userStats.totalAttempts}`,
			progress: (userStats.correctAnswers / userStats.totalAttempts) * 100,
			color: "text-green-600",
			bgColor: "bg-green-100",
		},
		{
			icon: Clock,
			label: "Average Time",
			value: formatTime(userStats.averageTime),
			progress: Math.max(
				0,
				Math.min(100, ((120 - userStats.averageTime) / 120) * 100)
			),
			color: "text-blue-600",
			bgColor: "bg-blue-100",
		},
		{
			icon: Zap,
			label: "Current Streak",
			value: `${userStats.currentStreak} days`,
			progress: Math.min(100, (userStats.currentStreak / 30) * 100),
			color: "text-purple-600",
			bgColor: "bg-purple-100",
		},
	];

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5, delay: 0.1 }}
		>
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center space-x-2">
						<TrendingUp className="h-5 w-5 text-primary" />
						<span>Performance Summary</span>
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-6">
					{/* Summary Grid */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{summaryItems.map((item, index) => {
							const IconComponent = item.icon;
							return (
								<motion.div
									key={item.label}
									initial={{ opacity: 0, x: -20 }}
									animate={{ opacity: 1, x: 0 }}
									transition={{ duration: 0.4, delay: 0.1 + index * 0.1 }}
									className="p-4 rounded-lg border bg-card"
								>
									<div className="flex items-center justify-between mb-2">
										<div className="flex items-center space-x-2">
											<div className={cn("p-2 rounded-full", item.bgColor)}>
												<IconComponent className={cn("h-4 w-4", item.color)} />
											</div>
											<span className="text-sm font-medium text-muted-foreground">
												{item.label}
											</span>
										</div>
										<span className={cn("text-lg font-bold", item.color)}>
											{item.value}
										</span>
									</div>
									<Progress value={item.progress} className="h-2" />
								</motion.div>
							);
						})}
					</div>

					{/* Additional Stats */}
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
						<div className="text-center">
							<div className="text-2xl font-bold text-primary">
								{userStats.totalPoints}
							</div>
							<div className="text-xs text-muted-foreground">Total Points</div>
						</div>
						<div className="text-center">
							<div
								className={cn(
									"text-2xl font-bold",
									getScoreColor(userStats.averageScore)
								)}
							>
								{userStats.averageScore}%
							</div>
							<div className="text-xs text-muted-foreground">Average Score</div>
						</div>
						<div className="text-center">
							<div className="text-2xl font-bold text-green-600">
								{userStats.longestStreak}
							</div>
							<div className="text-xs text-muted-foreground">Best Streak</div>
						</div>
						<div className="text-center">
							<div className="text-2xl font-bold text-blue-600">
								{formatTime(userStats.bestTime)}
							</div>
							<div className="text-xs text-muted-foreground">Best Time</div>
						</div>
					</div>

					{/* Performance Indicator */}
					<div className="bg-muted/50 rounded-lg p-4">
						<div className="flex items-center justify-between">
							<span className="text-sm font-medium">Overall Performance</span>
							<div className="flex items-center space-x-2">
								{userStats.accuracy >= 80 ? (
									<CheckCircle className="h-4 w-4 text-green-600" />
								) : (
									<XCircle className="h-4 w-4 text-red-600" />
								)}
								<span
									className={cn(
										"text-sm font-medium",
										userStats.accuracy >= 80 ? "text-green-600" : "text-red-600"
									)}
								>
									{userStats.accuracy >= 90
										? "Excellent"
										: userStats.accuracy >= 80
										? "Very Good"
										: userStats.accuracy >= 70
										? "Good"
										: userStats.accuracy >= 60
										? "Fair"
										: "Needs Improvement"}
								</span>
							</div>
						</div>
						<Progress value={userStats.accuracy} className="mt-2 h-3" />
					</div>
				</CardContent>
			</Card>
		</motion.div>
	);
}
