"use client";

import React from "react";
import { QuestionComponentProps, QuizQuestionData } from "@/types";
import { MultipleChoiceQuestion } from "./multiple-choice-question";
import { TrueFalseQuestion } from "./true-false-question";
import { ShortAnswerQuestion } from "./short-answer-question";
import { QuestionContainer } from "./question-container";

interface QuizQuestionProps extends Omit<QuestionComponentProps, "question"> {
	question: QuizQuestionData;
	questionNumber?: number;
	totalQuestions?: number;
	timeRemaining?: number;
	feedback?: {
		isCorrect: boolean;
		explanation?: string;
		correctAnswerId?: string;
		pointsEarned: number;
	};
}

export function QuizQuestion({
	question,
	selectedAnswer,
	userAnswer,
	onAnswerSelect,
	disabled = false,
	showResult = false,
	showExplanation = false,
	questionNumber,
	totalQuestions,
	timeRemaining,
	feedback,
	className,
}: QuizQuestionProps) {
	const renderQuestionComponent = () => {
		const commonProps = {
			question,
			selectedAnswer,
			userAnswer,
			onAnswerSelect,
			disabled,
			showResult,
			showExplanation,
		};

		switch (question.question_type) {
			case "multiple_choice":
				return <MultipleChoiceQuestion {...commonProps} />;

			case "true_false":
				return <TrueFalseQuestion {...commonProps} />;

			case "fill_blank":
				// Using short answer for fill in the blank questions
				return <ShortAnswerQuestion {...commonProps} />;

			case "matching":
				// TODO: Implement matching question type in a future task
				return (
					<div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
						<p className="font-medium">Matching Question Type</p>
						<p className="text-sm">
							This question type is not yet implemented.
						</p>
					</div>
				);

			default:
				return (
					<div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
						<p className="font-medium">Unknown Question Type</p>
						<p className="text-sm">
							Question type &quot;{question.question_type} is not supported.
						</p>
					</div>
				);
		}
	};

	return (
		<QuestionContainer
			question={question}
			questionNumber={questionNumber}
			totalQuestions={totalQuestions}
			timeRemaining={timeRemaining}
			feedback={feedback}
			showResult={showResult}
			className={className}
		>
			{renderQuestionComponent()}
		</QuestionContainer>
	);
}
