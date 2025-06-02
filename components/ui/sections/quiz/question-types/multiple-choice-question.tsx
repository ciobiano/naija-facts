"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { QuestionComponentProps } from "@/types";
import { CheckCircle, XCircle } from "lucide-react";

export function MultipleChoiceQuestion({
	question,
	selectedAnswer,
	onAnswerSelect,
	disabled = false,
	showResult = false,
	className,
}: QuestionComponentProps) {
	const sortedAnswers = question.quiz_answers
		.sort((a, b) => a.sort_order - b.sort_order)
		.slice(0, 4); // Ensure exactly 4 options

	const getOptionLabel = (index: number) => {
		return String.fromCharCode(65 + index); // A, B, C, D
	};

	const getButtonVariant = (answerId: string, isCorrect?: boolean) => {
		if (!showResult) {
			return selectedAnswer === answerId ? "default" : "outline";
		}

		// Show results
		if (isCorrect) {
			return "default"; // Correct answer gets primary color
		} else if (selectedAnswer === answerId && !isCorrect) {
			return "destructive"; // Selected wrong answer gets destructive color
		}
		return "outline"; // Other options remain outlined
	};

	const getButtonStyles = (answerId: string, isCorrect?: boolean) => {
		if (!showResult) {
			return selectedAnswer === answerId
				? "ring-2 ring-primary/20 bg-primary text-primary-foreground"
				: "hover:bg-accent hover:text-accent-foreground";
		}

		// Show results
		if (isCorrect) {
			return "bg-green-600 text-white border-green-600 hover:bg-green-700";
		} else if (selectedAnswer === answerId && !isCorrect) {
			return "bg-red-600 text-white border-red-600 hover:bg-red-700";
		}
		return "opacity-60";
	};

	const handleAnswerClick = (answerId: string) => {
		if (disabled || showResult) return;
		onAnswerSelect(answerId);
	};

	return (
		<div
			className={cn("space-y-3", className)}
			role="radiogroup"
			aria-label="Answer options"
		>
			{sortedAnswers.map((answer, index) => {
				const isSelected = selectedAnswer === answer.id;
				const isCorrect = answer.is_correct;
				const optionLabel = getOptionLabel(index);

				return (
					<Button
						key={answer.id}
						variant={getButtonVariant(answer.id, isCorrect)}
						className={cn(
							"w-full h-auto min-h-[60px] p-4 text-left flex items-center justify-start transition-all duration-200",
							"text-wrap break-words whitespace-normal",
							"touch-manipulation", // Better touch experience
							getButtonStyles(answer.id, isCorrect),
							disabled && "cursor-not-allowed"
						)}
						onClick={() => handleAnswerClick(answer.id)}
						disabled={disabled}
						role="radio"
						aria-checked={isSelected}
						aria-describedby={
							showResult ? `explanation-${answer.id}` : undefined
						}
					>
						<div className="flex items-center space-x-3 w-full">
							{/* Option Label */}
							<div
								className={cn(
									"flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-semibold",
									isSelected && !showResult
										? "border-primary-foreground text-primary-foreground"
										: "border-current",
									showResult && isCorrect ? "border-white text-white" : "",
									showResult && isSelected && !isCorrect
										? "border-white text-white"
										: ""
								)}
							>
								{optionLabel}
							</div>

							{/* Answer Text */}
							<span className="flex-1 text-sm md:text-base leading-relaxed">
								{answer.answer_text}
							</span>

							{/* Result Icons */}
							{showResult && (
								<div className="flex-shrink-0">
									{isCorrect && (
										<CheckCircle className="h-5 w-5 text-green-100" />
									)}
									{isSelected && !isCorrect && (
										<XCircle className="h-5 w-5 text-red-100" />
									)}
								</div>
							)}
						</div>
					</Button>
				);
			})}

			{/* Accessibility instruction */}
			<div className="sr-only" id="multiple-choice-instructions">
				Select one answer from the options below. Use arrow keys to navigate
				between options and press Enter or Space to select.
			</div>
		</div>
	);
}
