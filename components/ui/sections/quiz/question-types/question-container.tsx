"use client";

import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, HelpCircle, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { QuizQuestionData, QuizFeedback } from "@/types";

interface QuestionContainerProps {
	question: QuizQuestionData;
	children: React.ReactNode;
	questionNumber?: number;
	totalQuestions?: number;
	timeRemaining?: number;
	feedback?: QuizFeedback;
	showResult?: boolean;
	className?: string;
}

export function QuestionContainer({
	question,
	children,
	questionNumber,
	totalQuestions,
	timeRemaining,
	feedback,
	showResult = false,
	className,
}: QuestionContainerProps) {
	const getDifficultyColor = (difficulty: string) => {
		switch (difficulty) {
			case "beginner":
				return "bg-green-100 text-green-800";
			case "intermediate":
				return "bg-yellow-100 text-yellow-800";
			case "advanced":
				return "bg-red-100 text-red-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, "0")}`;
	};

	return (
		<Card className={cn("w-full max-w-4xl mx-auto", className)}>
			<CardHeader className="pb-4">
				{/* Question Header */}
				<div className="flex items-center justify-between mb-4">
					<div className="flex items-center space-x-3">
						{questionNumber && totalQuestions && (
							<Badge variant="outline" className="text-sm">
								Question {questionNumber} of {totalQuestions}
							</Badge>
						)}
						<Badge
							className={cn(
								"text-xs",
								getDifficultyColor(question.difficulty_level)
							)}
						>
							{question.difficulty_level}
						</Badge>
						<div className="flex items-center text-sm text-muted-foreground">
							<HelpCircle className="h-4 w-4 mr-1" />
							{question.points} points
						</div>
					</div>

					{timeRemaining !== undefined && (
						<div className="flex items-center text-sm text-muted-foreground">
							<Clock className="h-4 w-4 mr-1" />
							{formatTime(timeRemaining)}
						</div>
					)}
				</div>

				{/* Question Text */}
				<div className="space-y-3">
					<h2
						className="text-xl font-semibold leading-relaxed"
						role="heading"
						aria-level={2}
					>
						{question.question_text}
					</h2>

					{question.image_url && (
						<div className="flex justify-center">
							<img
								src={question.image_url}
								alt="Question illustration"
								className="max-w-full h-auto rounded-lg shadow-sm"
								loading="lazy"
							/>
						</div>
					)}
				</div>

				{/* Result Feedback */}
				{showResult && feedback && (
					<div
						className={cn(
							"flex items-center space-x-2 p-3 rounded-lg border",
							feedback.isCorrect
								? "bg-green-50 border-green-200 text-green-800"
								: "bg-red-50 border-red-200 text-red-800"
						)}
					>
						{feedback.isCorrect ? (
							<CheckCircle className="h-5 w-5 text-green-600" />
						) : (
							<XCircle className="h-5 w-5 text-red-600" />
						)}
						<div className="flex-1">
							<p className="font-medium">
								{feedback.isCorrect ? "Correct!" : "Incorrect"}
							</p>
							{feedback.pointsEarned > 0 && (
								<p className="text-sm">
									You earned {feedback.pointsEarned} points!
								</p>
							)}
						</div>
					</div>
				)}
			</CardHeader>

			<CardContent>
				{/* Question Component */}
				<div className="space-y-4">{children}</div>

				{/* Explanation - Only show for incorrect answers */}
				{showResult &&
					feedback &&
					!feedback.isCorrect &&
					(feedback?.explanation || question.explanation) && (
						<div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
							<h3 className="font-semibold text-blue-900 mb-2">Explanation</h3>
							<p className="text-blue-800 leading-relaxed">
								{feedback?.explanation || question.explanation}
							</p>
						</div>
					)}
			</CardContent>
		</Card>
	);
}
