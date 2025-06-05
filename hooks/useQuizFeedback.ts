"use client";

import { useState, useCallback, useEffect } from "react";
import { QuizFeedback, LearningMaterial } from "@/types";
import { useQuizSession } from "./useQuizSession";

interface UseFeedbackOptions {
	autoHideDuration?: number;
	showDetailedFeedback?: boolean;
	showLearningMaterials?: boolean;
	showPerformanceInsights?: boolean;
}

export function useQuizFeedback(options: UseFeedbackOptions = {}) {
	const {
		autoHideDuration = 5000,
		showDetailedFeedback = true,
		showLearningMaterials = true,
		showPerformanceInsights = true,
	} = options;

	const [currentFeedback, setCurrentFeedback] = useState<QuizFeedback | null>(
		null
	);
	const [isVisible, setIsVisible] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const { setFeedback } = useQuizSession();

	// Auto-hide feedback after duration
	useEffect(() => {
		if (currentFeedback && isVisible && autoHideDuration > 0) {
			const timer = setTimeout(() => {
				setIsVisible(false);
			}, autoHideDuration);

			return () => clearTimeout(timer);
		}
	}, [currentFeedback, isVisible, autoHideDuration]);

	const generateFeedback = useCallback(
		async (
			questionId: string,
			userAnswer: string | string[],
			correctAnswer: string | string[],
			questionText: string,
			category: string
		): Promise<QuizFeedback> => {
			setIsLoading(true);

			try {
				// Check if answer is correct
				const isCorrect = Array.isArray(correctAnswer)
					? Array.isArray(userAnswer) &&
					  userAnswer.length === correctAnswer.length &&
					  userAnswer.every((answer) => correctAnswer.includes(answer))
					: userAnswer === correctAnswer;

				// Calculate points based on correctness and difficulty
				const pointsEarned = isCorrect ? calculatePoints(category) : 0;

				// Generate basic feedback
				const basicFeedback: QuizFeedback = {
					isCorrect,
					pointsEarned,
					explanation: generateBasicExplanation(isCorrect, correctAnswer),
					detailedExplanation:
						showDetailedFeedback && !isCorrect
							? await generateDetailedExplanation(
									questionText,
									correctAnswer,
									userAnswer
							  )
							: undefined,
					learningMaterials: showLearningMaterials
						? await generateLearningMaterials(category, questionText)
						: undefined,
					relatedTopics: await generateRelatedTopics(category, questionText),
					difficultyAnalysis: {
						attemptedLevel: isCorrect ? "easy" : "hard",
						recommendedLevel: "medium",
						adjustmentReason: isCorrect
							? "You answered correctly"
							: "Consider reviewing this topic",
					},
					performanceInsights: showPerformanceInsights
						? await generatePerformanceInsights(questionId, isCorrect)
						: undefined,
					nextSteps: generateNextSteps(isCorrect, category),
				};

				return basicFeedback;
			} catch (error) {
				console.error("Error generating feedback:", error);

				// Return basic feedback in case of error
				return {
					isCorrect: userAnswer === correctAnswer,
					pointsEarned: 0,
					explanation: "Unable to generate detailed feedback at this time.",
				};
			} finally {
				setIsLoading(false);
			}
		},
		[showDetailedFeedback, showLearningMaterials, showPerformanceInsights]
	);

	const displayFeedback = useCallback(
		async (
			questionId: string,
			userAnswer: string | string[],
			correctAnswer: string | string[],
			questionText: string,
			category: string
		) => {
			const feedback = await generateFeedback(
				questionId,
				userAnswer,
				correctAnswer,
				questionText,
				category
			);

			setCurrentFeedback(feedback);
			setIsVisible(true);

			// Update quiz session with the feedback
			// Note: The parent component should handle storing the feedback
			// using setFeedback(questionIndex, feedback)

			return feedback;
		},
		[generateFeedback]
	);

	const hideFeedback = useCallback(() => {
		setIsVisible(false);
	}, []);

	const clearFeedback = useCallback(() => {
		setCurrentFeedback(null);
		setIsVisible(false);
	}, []);

	return {
		currentFeedback,
		isVisible,
		isLoading,
		displayFeedback,
		hideFeedback,
		clearFeedback,
	};
}

// Helper functions
function calculatePoints(category: string): number {
	// Basic point calculation - can be enhanced based on difficulty, streak, etc.
	const basePoints = 10;
	const categoryMultiplier = getCategoryMultiplier(category);
	return Math.round(basePoints * categoryMultiplier);
}

function getCategoryMultiplier(category: string): number {
	const multipliers: Record<string, number> = {
		"constitutional-law": 1.5,
		"federal-structure": 1.3,
		"fundamental-rights": 1.4,
		"directive-principles": 1.2,
		governance: 1.1,
		amendments: 1.6,
		judiciary: 1.3,
		"emergency-provisions": 1.4,
	};

	return multipliers[category.toLowerCase()] || 1.0;
}

function generateBasicExplanation(
	isCorrect: boolean,
	correctAnswer: string | string[]
): string {
	if (isCorrect) {
		return "Great job! You selected the correct answer.";
	}

	const correctAnswerText = Array.isArray(correctAnswer)
		? correctAnswer.join(", ")
		: correctAnswer;

	return `The correct answer is: ${correctAnswerText}. Review the explanation below to understand why.`;
}

async function generateDetailedExplanation(
	questionText: string,
	correctAnswer: string | string[],
	userAnswer: string | string[]
): Promise<string> {
	// In a real implementation, this could call an AI service
	// For now, return a placeholder that would be replaced with actual explanations
	return `This question tests your understanding of constitutional principles. The correct answer provides the most accurate interpretation based on the relevant articles and provisions.`;
}

async function generateLearningMaterials(
	category: string,
	questionText: string
): Promise<LearningMaterial[]> {
	// Generate relevant learning materials based on category and question
	const materials: LearningMaterial[] = [];

	// Add constitutional articles/sections based on category
	if (category.includes("fundamental-rights")) {
		materials.push({
			id: "fundamental-rights-articles",
			type: "article",
			title: "Fundamental Rights (Articles 12-35)",
			url: "/docs/constitution/part-3",
			description:
				"Detailed explanation of fundamental rights guaranteed by the Constitution",
		});
	}

	if (category.includes("directive-principles")) {
		materials.push({
			id: "directive-principles-articles",
			type: "article",
			title: "Directive Principles (Articles 36-51)",
			url: "/docs/constitution/part-4",
			description: "Understanding the directive principles of state policy",
		});
	}

	// Add relevant chapters from docs
	materials.push({
		id: `${category}-guide`,
		type: "chapter",
		title: `${category
			.replace("-", " ")
			.replace(/\b\w/g, (l) => l.toUpperCase())} Guide`,
		url: `/docs/getting-started/${category}`,
		description: `Comprehensive guide covering ${category.replace("-", " ")}`,
	});

	return materials;
}

async function generateRelatedTopics(
	category: string,
	questionText: string
): Promise<string[]> {
	// Generate related topics based on the question content
	const topicMap: Record<string, string[]> = {
		"constitutional-law": [
			"Constitutional Amendments",
			"Judicial Review",
			"Basic Structure",
		],
		"fundamental-rights": [
			"Right to Equality",
			"Right to Freedom",
			"Cultural Rights",
		],
		"directive-principles": [
			"Social Justice",
			"Economic Welfare",
			"Environmental Protection",
		],
		"federal-structure": [
			"Centre-State Relations",
			"Legislative Powers",
			"Administrative Relations",
		],
		governance: ["Parliamentary System", "Executive Powers", "Accountability"],
		judiciary: ["Supreme Court", "High Courts", "Judicial Independence"],
		"emergency-provisions": [
			"National Emergency",
			"President's Rule",
			"Financial Emergency",
		],
		amendments: [
			"Constitutional Amendments",
			"Amendment Procedure",
			"Limitations",
		],
	};

	return (
		topicMap[category] || ["Constitutional Law", "Indian Polity", "Governance"]
	);
}

async function generatePerformanceInsights(
	questionId: string,
	isCorrect: boolean
): Promise<string[]> {
	const insights: string[] = [];

	if (isCorrect) {
		insights.push(
			"You're demonstrating strong understanding of this topic area."
		);
		insights.push(
			"Consider exploring related advanced concepts to deepen your knowledge."
		);
	} else {
		insights.push(
			"This topic area may benefit from additional review and practice."
		);
		insights.push(
			"Focus on understanding the underlying principles rather than memorizing facts."
		);
	}

	// Add contextual insights based on performance patterns
	insights.push(
		"Review the recommended learning materials to strengthen your foundation."
	);

	return insights;
}

function generateNextSteps(isCorrect: boolean, category: string): string[] {
	const steps: string[] = [];

	if (isCorrect) {
		steps.push(`Explore advanced topics in ${category.replace("-", " ")}`);
		steps.push("Practice similar questions to reinforce your understanding");
	} else {
		steps.push(
			`Review the fundamental concepts of ${category.replace("-", " ")}`
		);
		steps.push("Study the recommended learning materials");
		steps.push("Practice more questions in this category");
	}

	steps.push("Track your progress and identify areas for improvement");

	return steps;
}
