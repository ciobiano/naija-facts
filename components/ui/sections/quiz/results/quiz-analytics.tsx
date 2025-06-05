"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { BarChart3, Activity, Clock, Target, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuizAnalyticsProps {
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
	recentActivity: Array<{
		date: string;
		score: number;
		questionsAnswered: number;
		timeSpent: number;
	}>;
}

export function QuizAnalytics({
	performanceByDifficulty,
	progressOverTime,
	recentActivity,
}: QuizAnalyticsProps) {
	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
		});
	};

	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, "0")}`;
	};

	const getDifficultyAccuracy = (correct: number, total: number) => {
		return total > 0 ? Math.round((correct / total) * 100) : 0;
	};

	const difficultyData = [
		{
			level: "Beginner",
			...performanceByDifficulty.beginner,
			accuracy: getDifficultyAccuracy(
				performanceByDifficulty.beginner.correct,
				performanceByDifficulty.beginner.total
			),
			icon: "🟢",
		},
		{
			level: "Intermediate",
			...performanceByDifficulty.intermediate,
			accuracy: getDifficultyAccuracy(
				performanceByDifficulty.intermediate.correct,
				performanceByDifficulty.intermediate.total
			),
			icon: "🟡",
		},
		{
			level: "Advanced",
			...performanceByDifficulty.advanced,
			accuracy: getDifficultyAccuracy(
				performanceByDifficulty.advanced.correct,
				performanceByDifficulty.advanced.total
			),
			icon: "🔴",
		},
	];

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5, delay: 0.2 }}
		>
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center space-x-2">
						<BarChart3 className="h-5 w-5 text-primary" />
						<span>Performance Analytics</span>
					</CardTitle>
				</CardHeader>
				<CardContent>
					<Tabs defaultValue="difficulty" className="w-full">
						<TabsList className="grid w-full grid-cols-3">
							<TabsTrigger value="difficulty">By Difficulty</TabsTrigger>
							<TabsTrigger value="progress">Progress</TabsTrigger>
							<TabsTrigger value="activity">Recent Activity</TabsTrigger>
						</TabsList>

						{/* Difficulty Analysis Tab */}
						<TabsContent value="difficulty" className="space-y-4">
							<div className="space-y-4">
								{difficultyData.map((difficulty, index) => (
									<motion.div
										key={difficulty.level}
										initial={{ opacity: 0, x: -20 }}
										animate={{ opacity: 1, x: 0 }}
										transition={{ duration: 0.4, delay: index * 0.1 }}
										className="p-4 border rounded-lg"
									>
										<div className="flex items-center justify-between mb-2">
											<div className="flex items-center space-x-2">
												<span className="text-lg">{difficulty.icon}</span>
												<span className="font-medium">{difficulty.level}</span>
											</div>
											<div className="text-right">
												<div className="text-lg font-bold">
													{difficulty.accuracy}%
												</div>
												<div className="text-xs text-muted-foreground">
													{difficulty.correct}/{difficulty.total} correct
												</div>
											</div>
										</div>
										<Progress value={difficulty.accuracy} className="h-2" />
									</motion.div>
								))}
							</div>
						</TabsContent>

						{/* Progress Over Time Tab */}
						<TabsContent value="progress" className="space-y-4">
							<div className="space-y-3">
								{progressOverTime.slice(-7).map((session, index) => (
									<motion.div
										key={session.date}
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ duration: 0.3, delay: index * 0.05 }}
										className="flex items-center justify-between p-3 border rounded-lg"
									>
										<div className="flex items-center space-x-3">
											<div className="text-sm font-medium text-muted-foreground">
												{formatDate(session.date)}
											</div>
										</div>
										<div className="flex items-center space-x-4 text-sm">
											<div className="flex items-center space-x-1">
												<Target className="h-3 w-3 text-green-600" />
												<span>{session.accuracy}%</span>
											</div>
											<div className="flex items-center space-x-1">
												<Activity className="h-3 w-3 text-blue-600" />
												<span>{session.points}pts</span>
											</div>
											<div className="flex items-center space-x-1">
												<Layers className="h-3 w-3 text-purple-600" />
												<span>{session.questionsAnswered}q</span>
											</div>
										</div>
									</motion.div>
								))}
							</div>
						</TabsContent>

						{/* Recent Activity Tab */}
						<TabsContent value="activity" className="space-y-4">
							<div className="space-y-3">
								{recentActivity.slice(-5).map((activity, index) => (
									<motion.div
										key={activity.date}
										initial={{ opacity: 0, scale: 0.95 }}
										animate={{ opacity: 1, scale: 1 }}
										transition={{ duration: 0.3, delay: index * 0.05 }}
										className="p-4 border rounded-lg bg-card"
									>
										<div className="flex items-center justify-between">
											<div>
												<div className="font-medium">
													{formatDate(activity.date)}
												</div>
												<div className="text-sm text-muted-foreground">
													{activity.questionsAnswered} questions answered
												</div>
											</div>
											<div className="text-right space-y-1">
												<div
													className={cn(
														"text-lg font-bold",
														activity.score >= 80
															? "text-green-600"
															: activity.score >= 60
															? "text-yellow-600"
															: "text-red-600"
													)}
												>
													{activity.score}%
												</div>
												<div className="flex items-center space-x-1 text-xs text-muted-foreground">
													<Clock className="h-3 w-3" />
													<span>{formatTime(activity.timeSpent)}</span>
												</div>
											</div>
										</div>
									</motion.div>
								))}
							</div>
						</TabsContent>
					</Tabs>
				</CardContent>
			</Card>
		</motion.div>
	);
}
