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
import { Clock, CheckCircle, Lock, Play } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { QuizCategory } from "@/types";
import {
	getDifficultyColor,
	getEstimatedTime,
	isChapterUnlocked,
} from "@/lib/quiz";

interface ChapterCardProps {
	category: QuizCategory;
	index: number;
	categories: QuizCategory[];
}

export function ChapterCard({ category, index, categories }: ChapterCardProps) {
	const isUnlocked = isChapterUnlocked(index, categories);
	const progress = category.progress;
	const completionPercentage = progress?.completion_percentage || 0;
	const isCompleted = completionPercentage >= 80;

	return (
		<Card
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
						{isCompleted && <CheckCircle className="h-5 w-5 text-green-500" />}
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
}
