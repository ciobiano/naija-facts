"use client";

import { motion } from "framer-motion";
import { Trophy, Medal, Star, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface QuizResultsHeaderProps {
	categoryName: string;
	userStats: {
		accuracy: number;
		totalPoints: number;
		currentStreak: number;
		totalAttempts: number;
		correctAnswers: number;
	};
}

export function QuizResultsHeader({
	categoryName,
	userStats,
}: QuizResultsHeaderProps) {
	const getPerformanceLevel = (accuracy: number) => {
		if (accuracy >= 90) return { level: "Excellent", color: "text-green-600" };
		if (accuracy >= 80) return { level: "Very Good", color: "text-blue-600" };
		if (accuracy >= 70) return { level: "Good", color: "text-yellow-600" };
		if (accuracy >= 60) return { level: "Fair", color: "text-orange-600" };
		return { level: "Needs Improvement", color: "text-red-600" };
	};

	const getAchievementIcon = (accuracy: number) => {
		if (accuracy >= 90) return Trophy;
		if (accuracy >= 80) return Medal;
		if (accuracy >= 70) return Star;
		return Award;
	};

	const performance = getPerformanceLevel(userStats.accuracy);
	const AchievementIcon = getAchievementIcon(userStats.accuracy);

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
		>
			<Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-none shadow-lg">
				<CardContent className="p-8">
					<div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
						{/* Achievement Display */}
						<div className="flex items-center space-x-4">
							<motion.div
								initial={{ scale: 0 }}
								animate={{ scale: 1 }}
								transition={{ duration: 0.5, delay: 0.2 }}
								className={cn(
									"p-4 rounded-full",
									userStats.accuracy >= 90
										? "bg-yellow-100 text-yellow-600"
										: userStats.accuracy >= 80
										? "bg-blue-100 text-blue-600"
										: userStats.accuracy >= 70
										? "bg-green-100 text-green-600"
										: "bg-gray-100 text-gray-600"
								)}
							>
								<AchievementIcon className="h-8 w-8" />
							</motion.div>
							<div>
								<h1 className="text-3xl font-bold text-foreground">
									{categoryName} Results
								</h1>
								<p className={cn("text-lg font-semibold", performance.color)}>
									{performance.level} Performance
								</p>
								<p className="text-muted-foreground">
									You&apos;ve completed {userStats.totalAttempts} questions with{" "}
									{userStats.correctAnswers} correct answers
								</p>
							</div>
						</div>

						{/* Key Metrics */}
						<div className="grid grid-cols-3 gap-4 text-center">
							<motion.div
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.4, delay: 0.3 }}
							>
								<div className="text-3xl font-bold text-primary">
									{userStats.accuracy}%
								</div>
								<div className="text-sm text-muted-foreground">Accuracy</div>
							</motion.div>
							<motion.div
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.4, delay: 0.4 }}
							>
								<div className="text-3xl font-bold text-secondary-foreground">
									{userStats.totalPoints}
								</div>
								<div className="text-sm text-muted-foreground">
									Points Earned
								</div>
							</motion.div>
							<motion.div
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.4, delay: 0.5 }}
							>
								<div className="text-3xl font-bold text-accent-foreground">
									{userStats.currentStreak}
								</div>
								<div className="text-sm text-muted-foreground">
									Current Streak
								</div>
							</motion.div>
						</div>
					</div>
				</CardContent>
			</Card>
		</motion.div>
	);
}
