"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	TrendingUp,
	Target,
	Award,
	Clock,
	BarChart3,
	ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface QuizResultsDashboardProps {
	categoryName: string;
	userStats: {
		accuracy: number;
		totalAttempts: number;
		correctAnswers: number;
		totalPoints: number;
		currentStreak: number;
		averageTime: number;
	};
	onViewDetails?: () => void;
	compact?: boolean;
	className?: string;
}

export function QuizResultsDashboard({
	categoryName,
	userStats,
	onViewDetails,
	compact = false,
	className,
}: QuizResultsDashboardProps) {
	const getPerformanceLevel = (accuracy: number) => {
		if (accuracy >= 90)
			return { level: "Expert", color: "bg-green-100 text-green-800" };
		if (accuracy >= 80)
			return { level: "Advanced", color: "bg-blue-100 text-blue-800" };
		if (accuracy >= 70)
			return { level: "Intermediate", color: "bg-yellow-100 text-yellow-800" };
		if (accuracy >= 60)
			return { level: "Beginner", color: "bg-gray-100 text-gray-800" };
		return { level: "Novice", color: "bg-gray-100 text-gray-800" };
	};

	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, "0")}`;
	};

	const performanceLevel = getPerformanceLevel(userStats.accuracy);

	if (compact) {
		return (
			<Card className={cn("w-full", className)}>
				<CardContent className="p-4">
					<div className="flex items-center justify-between mb-3">
						<div>
							<h3 className="font-semibold text-sm">{categoryName}</h3>
							<Badge className={cn("text-xs", performanceLevel.color)}>
								{performanceLevel.level}
							</Badge>
						</div>
						<div className="text-right">
							<div className="text-lg font-bold">{userStats.accuracy}%</div>
							<div className="text-xs text-muted-foreground">Accuracy</div>
						</div>
					</div>
					<Progress value={userStats.accuracy} className="h-2 mb-3" />
					<div className="grid grid-cols-3 gap-2 text-center text-xs">
						<div>
							<div className="font-semibold">{userStats.totalPoints}</div>
							<div className="text-muted-foreground">Points</div>
						</div>
						<div>
							<div className="font-semibold">{userStats.currentStreak}</div>
							<div className="text-muted-foreground">Streak</div>
						</div>
						<div>
							<div className="font-semibold">{userStats.totalAttempts}</div>
							<div className="text-muted-foreground">Questions</div>
						</div>
					</div>
					{onViewDetails && (
						<Button
							variant="outline"
							size="sm"
							className="w-full mt-3"
							onClick={onViewDetails}
						>
							<BarChart3 className="h-3 w-3 mr-1" />
							View Details
						</Button>
					)}
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className={cn("w-full", className)}>
			<CardHeader>
				<CardTitle className="flex items-center justify-between">
					<span className="flex items-center space-x-2">
						<TrendingUp className="h-5 w-5 text-primary" />
						<span>{categoryName} Performance</span>
					</span>
					<Badge className={performanceLevel.color}>
						{performanceLevel.level}
					</Badge>
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* Main Accuracy Display */}
				<div className="text-center">
					<div className="text-4xl font-bold text-primary mb-2">
						{userStats.accuracy}%
					</div>
					<div className="text-sm text-muted-foreground mb-3">
						Overall Accuracy
					</div>
					<Progress value={userStats.accuracy} className="h-3" />
				</div>

				{/* Stats Grid */}
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
					<div className="text-center p-3 bg-muted/50 rounded-lg">
						<Target className="h-5 w-5 text-green-600 mx-auto mb-1" />
						<div className="text-lg font-bold">
							{userStats.correctAnswers}/{userStats.totalAttempts}
						</div>
						<div className="text-xs text-muted-foreground">Correct</div>
					</div>
					<div className="text-center p-3 bg-muted/50 rounded-lg">
						<Award className="h-5 w-5 text-blue-600 mx-auto mb-1" />
						<div className="text-lg font-bold">{userStats.totalPoints}</div>
						<div className="text-xs text-muted-foreground">Points</div>
					</div>
					<div className="text-center p-3 bg-muted/50 rounded-lg">
						<TrendingUp className="h-5 w-5 text-purple-600 mx-auto mb-1" />
						<div className="text-lg font-bold">{userStats.currentStreak}</div>
						<div className="text-xs text-muted-foreground">Streak</div>
					</div>
					<div className="text-center p-3 bg-muted/50 rounded-lg">
						<Clock className="h-5 w-5 text-orange-600 mx-auto mb-1" />
						<div className="text-lg font-bold">
							{formatTime(userStats.averageTime)}
						</div>
						<div className="text-xs text-muted-foreground">Avg Time</div>
					</div>
				</div>

				{/* Action Button */}
				{onViewDetails && (
					<Button onClick={onViewDetails} className="w-full">
						<BarChart3 className="h-4 w-4 mr-2" />
						View Detailed Analytics
						<ExternalLink className="h-4 w-4 ml-2" />
					</Button>
				)}
			</CardContent>
		</Card>
	);
}
