"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { QuestionComponentProps } from "@/types";
import { CheckCircle, XCircle } from "lucide-react";

export function TrueFalseQuestion({
	question,
	selectedAnswer,
	onAnswerSelect,
	disabled = false,
	showResult = false,
	className,
}: QuestionComponentProps) {
	// Find True and False answers
	const trueAnswer = question.quiz_answers.find(
		(answer) => answer.answer_text.toLowerCase() === "true"
	);
	const falseAnswer = question.quiz_answers.find(
		(answer) => answer.answer_text.toLowerCase() === "false"
	);

	if (!trueAnswer || !falseAnswer) {
		console.error(
			"True/False question must have exactly one 'True' and one 'False' answer"
		);
		return (
			<div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
				Error: Invalid True/False question format
			</div>
		);
	}

	const getButtonStyles = (
		answerId: string,
		isCorrect?: boolean
	): {
		variant: "default" | "destructive" | "outline";
		className: string;
	} => {
		const isSelected = selectedAnswer === answerId;

		if (!showResult) {
			return {
				variant: isSelected ? "default" : "outline",
				className: cn(
					"transition-all duration-200",
					isSelected ? "ring-2 ring-primary/20 scale-105" : "hover:scale-102"
				),
			};
		}

		// Show results
		if (isCorrect) {
			return {
				variant: "default",
				className:
					"bg-green-600 text-white border-green-600 hover:bg-green-700",
			};
		} else if (isSelected && !isCorrect) {
			return {
				variant: "destructive",
				className: "bg-red-600 text-white border-red-600 hover:bg-red-700",
			};
		}

		return {
			variant: "outline",
			className: "opacity-60",
		};
	};

	const handleAnswerClick = (answerId: string) => {
		if (disabled || showResult) return;
		onAnswerSelect(answerId);
	};

	const renderAnswerButton = (
		answer: typeof trueAnswer,
		label: string,
		bgColor: string
	) => {
		if (!answer) return null;

		const isSelected = selectedAnswer === answer.id;
		const isCorrect = answer.is_correct;
		const buttonStyles = getButtonStyles(answer.id, isCorrect);

		return (
			<Button
				variant={buttonStyles.variant}
				className={cn(
					"h-20 md:h-24 text-xl md:text-2xl font-bold flex items-center justify-center space-x-3",
					"touch-manipulation min-w-[120px] w-full",
					buttonStyles.className,
					disabled && "cursor-not-allowed"
				)}
				onClick={() => handleAnswerClick(answer.id)}
				disabled={disabled}
				role="radio"
				aria-checked={isSelected}
				aria-label={`Select ${label}`}
			>
				<span>{label}</span>

				{/* Result Icons */}
				{showResult && (
					<div className="ml-2">
						{isCorrect && <CheckCircle className="h-6 w-6 text-green-100" />}
						{isSelected && !isCorrect && (
							<XCircle className="h-6 w-6 text-red-100" />
						)}
					</div>
				)}
			</Button>
		);
	};

	return (
		<div
			className={cn("space-y-4", className)}
			role="radiogroup"
			aria-label="True or False options"
		>
			{/* Instructions */}
			<p className="text-sm text-muted-foreground text-center">
				Select whether the statement is True or False
			</p>

			{/* Answer Buttons */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
				{renderAnswerButton(trueAnswer, "TRUE", "bg-green-50")}
				{renderAnswerButton(falseAnswer, "FALSE", "bg-red-50")}
			</div>

			{/* Accessibility instruction */}
			<div className="sr-only" id="true-false-instructions">
				Select True or False. Use arrow keys to navigate between options and
				press Enter or Space to select.
			</div>
		</div>
	);
}
