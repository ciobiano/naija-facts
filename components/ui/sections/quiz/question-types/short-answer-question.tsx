"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { QuestionComponentProps } from "@/types";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";

export function ShortAnswerQuestion({
	question,
	selectedAnswer,
	userAnswer = "",
	onAnswerSelect,
	disabled = false,
	showResult = false,
	className,
}: QuestionComponentProps) {
	const [inputValue, setInputValue] = useState(userAnswer);
	const [isValid, setIsValid] = useState(false);

	// Extract keywords from correct answers for matching
	const correctAnswers = question.quiz_answers
		.filter((answer) => answer.is_correct)
		.map((answer) => answer.answer_text.toLowerCase().trim());

	// Simple keyword matching function
	const checkAnswer = (userInput: string): boolean => {
		const cleanInput = userInput.toLowerCase().trim();

		if (!cleanInput) return false;

		// Check for exact matches first
		if (correctAnswers.includes(cleanInput)) return true;

		// Check for keyword matches
		return correctAnswers.some((correctAnswer) => {
			const keywords = correctAnswer
				.split(/[\s,]+/)
				.filter((word) => word.length > 2);
			const inputWords = cleanInput.split(/[\s,]+/);

			// At least 70% of keywords should match
			const matchCount = keywords.filter((keyword) =>
				inputWords.some(
					(inputWord) =>
						inputWord.includes(keyword) || keyword.includes(inputWord)
				)
			).length;

			return matchCount / keywords.length >= 0.7;
		});
	};

	useEffect(() => {
		setIsValid(inputValue.trim().length > 0);
	}, [inputValue]);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setInputValue(value);

		if (!disabled && !showResult) {
			onAnswerSelect(undefined, value);
		}
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!disabled && !showResult && isValid) {
			onAnswerSelect(undefined, inputValue.trim());
		}
	};

	const isCorrect = showResult ? checkAnswer(inputValue) : false;

	const getInputStyles = () => {
		if (!showResult) {
			return "border-input focus:border-primary";
		}

		if (isCorrect) {
			return "border-green-500 bg-green-50 text-green-900";
		} else {
			return "border-red-500 bg-red-50 text-red-900";
		}
	};

	const getCorrectAnswersDisplay = () => {
		const displayAnswers = question.quiz_answers
			.filter((answer) => answer.is_correct)
			.map((answer) => answer.answer_text)
			.slice(0, 3); // Show max 3 examples

		return displayAnswers.join(", ");
	};

	return (
		<div className={cn("space-y-4", className)}>
			{/* Instructions */}
			<div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
				<div className="flex items-start space-x-2">
					<AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
					<div className="text-sm text-blue-800">
						<p className="font-medium">Instructions:</p>
						<p>
							Type your answer in the text field below. Keywords will be matched
							automatically.
						</p>
					</div>
				</div>
			</div>

			{/* Answer Input Form */}
			<form onSubmit={handleSubmit} className="space-y-4">
				<div className="space-y-2">
					<label htmlFor="short-answer-input" className="text-sm font-medium">
						Your Answer:
					</label>
					<Input
						id="short-answer-input"
						type="text"
						value={inputValue}
						onChange={handleInputChange}
						disabled={disabled || showResult}
						placeholder="Type your answer here..."
						className={cn("text-base h-12", getInputStyles())}
						aria-describedby="answer-help"
						aria-invalid={showResult && !isCorrect}
						autoComplete="off"
						spellCheck="true"
					/>

					{/* Character count */}
					<div className="flex justify-between text-xs text-muted-foreground">
						<span id="answer-help">
							Enter your answer using keywords or full phrases
						</span>
						<span>{inputValue.length} characters</span>
					</div>
				</div>

				{/* Submit Button (if not in result mode) */}
				{!showResult && (
					<Button
						type="submit"
						disabled={disabled || !isValid}
						className="w-full sm:w-auto"
					>
						Submit Answer
					</Button>
				)}
			</form>

			{/* Result Display */}
			{showResult && (
				<div className="space-y-3">
					{/* Result Status */}
					<div
						className={cn(
							"flex items-center space-x-2 p-3 rounded-lg border",
							isCorrect
								? "bg-green-50 border-green-200 text-green-800"
								: "bg-red-50 border-red-200 text-red-800"
						)}
					>
						{isCorrect ? (
							<CheckCircle className="h-5 w-5 text-green-600" />
						) : (
							<XCircle className="h-5 w-5 text-red-600" />
						)}
						<div>
							<p className="font-medium">
								{isCorrect ? "Correct!" : "Incorrect"}
							</p>
							<p className="text-sm">Your answer: "{inputValue}"</p>
						</div>
					</div>

					{/* Show correct answers if incorrect */}
					{!isCorrect && (
						<div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
							<h4 className="font-medium text-blue-900 mb-1">
								Acceptable answers include:
							</h4>
							<p className="text-sm text-blue-800">
								{getCorrectAnswersDisplay()}
							</p>
						</div>
					)}
				</div>
			)}

			{/* Accessibility information */}
			<div className="sr-only" id="short-answer-instructions">
				Type your answer in the text field. The system will match your answer
				against correct keywords and phrases.
			</div>
		</div>
	);
}
