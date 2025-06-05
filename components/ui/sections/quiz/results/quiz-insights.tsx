"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lightbulb, Target, CheckCircle, Award, BookOpen } from "lucide-react";

interface QuizInsightsProps {
	userStats: {
		accuracy: number;
		totalAttempts: number;
		correctAnswers: number;
		currentStreak: number;
		longestStreak: number;
		averageTime: number;
		bestTime: number;
	};
	categoryData: {
		name: string;
		totalQuestions: number;
	};
}

export function QuizInsights({ userStats, categoryData }: QuizInsightsProps) {
	const getPerformanceLevel = () => {
		if (userStats.accuracy >= 90)
			return { level: "Expert", color: "bg-green-100 text-green-800" };
		if (userStats.accuracy >= 80)
			return { level: "Advanced", color: "bg-blue-100 text-blue-800" };
		if (userStats.accuracy >= 70)
			return { level: "Intermediate", color: "bg-yellow-100 text-yellow-800" };
		if (userStats.accuracy >= 60)
			return { level: "Beginner", color: "bg-orange-100 text-orange-800" };
		return { level: "Novice", color: "bg-gray-100 text-gray-800" };
	};

	const getRecommendations = () => {
		const recommendations = [];

		if (userStats.accuracy < 70) {
			recommendations.push(
				"Review the fundamentals before attempting more questions"
			);
			recommendations.push(
				"Focus on understanding explanations for incorrect answers"
			);
		} else if (userStats.accuracy < 85) {
			recommendations.push("Practice more challenging questions to improve");
			recommendations.push("Review topics where you made mistakes");
		} else {
			recommendations.push("Explore advanced topics in this category");
			recommendations.push("Try other categories to broaden your knowledge");
		}

		if (userStats.totalAttempts < 20) {
			recommendations.push("Take more quizzes to better assess your knowledge");
		}

		return recommendations;
	};

	const performanceLevel = getPerformanceLevel();
	const recommendations = getRecommendations();

	return (
		<div className="space-y-6">
			{/* Performance Level */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center space-x-2">
						<Target className="h-5 w-5 text-primary" />
						<span>Your Level</span>
					</CardTitle>
				</CardHeader>
				<CardContent className="text-center space-y-4">
					<Badge className={performanceLevel.color}>
						{performanceLevel.level}
					</Badge>
					<div className="space-y-2">
						<div className="text-2xl font-bold">{userStats.accuracy}%</div>
						<div className="text-sm text-muted-foreground">
							Overall Accuracy
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Quick Stats */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center space-x-2">
						<Award className="h-5 w-5 text-primary" />
						<span>Achievement Stats</span>
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-2 gap-4 text-center">
						<div>
							<div className="text-xl font-bold text-green-600">
								{userStats.currentStreak}
							</div>
							<div className="text-xs text-muted-foreground">
								Current Streak
							</div>
						</div>
						<div>
							<div className="text-xl font-bold text-blue-600">
								{userStats.longestStreak}
							</div>
							<div className="text-xs text-muted-foreground">Best Streak</div>
						</div>
					</div>
					<div className="pt-2 border-t">
						<div className="text-sm text-muted-foreground">
							{userStats.correctAnswers} out of {userStats.totalAttempts}{" "}
							questions correct in {categoryData.name}
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Recommendations */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center space-x-2">
						<BookOpen className="h-5 w-5 text-primary" />
						<span>Recommendations</span>
					</CardTitle>
				</CardHeader>
				<CardContent>
					<ul className="space-y-3">
						{recommendations.map((recommendation, index) => (
							<li key={index} className="flex items-start space-x-2">
								<CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
								<span className="text-sm">{recommendation}</span>
							</li>
						))}
					</ul>
					<div className="mt-4 pt-4 border-t">
						<Button className="w-full" variant="outline">
							<Lightbulb className="h-4 w-4 mr-2" />
							Get More Study Tips
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
