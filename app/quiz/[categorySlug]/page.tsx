"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import {
	ArrowLeft,
	ArrowRight,
	RotateCcw,
	Trophy,
	Medal,
	Star,
	Award,
	BarChart3,
} from "lucide-react";

import { QuizQuestionData, QuizFeedback } from "@/types";
import { QuizQuestion } from "@/components/ui/sections/quiz/question-types/quiz-question";
import { QuizSessionManager } from "@/components/ui/sections/quiz/quiz-session-manager";
import { useQuizSession } from "@/hooks/useQuizSession";
import { fetcher } from "@/lib/quiz";
import {
	LoadingState,
	ErrorState,
	UnauthorizedState,
} from "@/components/ui/states";
import { QuizFeedbackDisplay } from "@/components/ui/sections/quiz/feedback/quiz-feedback-display";
import { useQuizFeedback } from "@/hooks/useQuizFeedback";

interface QuizSessionResponse {
	questions: QuizQuestionData[];
	category: {
		id: string;
		name: string;
		slug: string;
	};
}

export default function QuizSessionPage() {
	const { data: session } = useSession();
	const router = useRouter();
	const params = useParams();
	const categorySlug = params.categorySlug as string;

	// Zustand store
	const {
		sessionId,
		categoryId,
		categoryName,
		questions,
		currentQuestionIndex,
		answers,
		feedback,
		showResults,
		timeRemaining,
		isQuizCompleted,
		isQuizPaused,
		getProgress,
		getCorrectAnswers,
		getTotalPoints,
		getAnsweredCount,
		initializeSession,
		setCurrentQuestion,
		submitAnswer,
		setFeedback,
		showResult,
		restartQuiz,
		clearSession,
		canGoPrevious,
		canGoNext,
		isAnswered,
		completeQuiz,
	} = useQuizSession();

	const [showSessionRecovery, setShowSessionRecovery] = useState(false);

	// Add enhanced feedback system
	const {
		currentFeedback: enhancedFeedback,
		isVisible: feedbackVisible,
		displayFeedback,
	} = useQuizFeedback({
		autoHideDuration: 0, // Don't auto-hide, let user control
		showDetailedFeedback: true,
		showLearningMaterials: true,
		showPerformanceInsights: true,
	});

	// Fetch quiz questions
	const { data, error, isLoading } = useSWR<QuizSessionResponse>(
		session && categorySlug
			? `/api/quiz?categoryId=${categorySlug}&limit=5`
			: null,
		fetcher
	);

	// Check for existing session on mount
	useEffect(() => {
		if (data && session?.user?.id) {
			// Check if there's a different session or need to start new one
			if (!sessionId || categoryId !== categorySlug) {
				// Check if user has an active session for different category
				if (sessionId && categoryId && categoryId !== categorySlug) {
					setShowSessionRecovery(true);
					return;
				}

				// Initialize new session
				const newSessionId = `${session.user.id}-${categorySlug}-${Date.now()}`;
				initializeSession(
					newSessionId,
					categorySlug,
					data.category?.name || categorySlug,
					data.questions,
					300
				);
			}
		}
	}, [
		data,
		session?.user?.id,
		categorySlug,
		sessionId,
		categoryId,
		initializeSession,
	]);

	const currentQuestion = questions[currentQuestionIndex];
	const currentAnswer = answers[currentQuestionIndex];
	const currentFeedback = feedback[currentQuestionIndex];
	const showCurrentResult = showResults[currentQuestionIndex];

	const handleAnswerSelect = (answerId?: string, answerText?: string) => {
		const timeTaken = timeRemaining;
		submitAnswer(currentQuestionIndex, answerId, answerText, timeTaken);
	};

	const handleSubmitAnswer = async () => {
		if (!currentQuestion || !session?.user?.id) return;

		const currentAnswer = answers[currentQuestionIndex];
		if (!currentAnswer?.answerId && !currentAnswer?.answerText) return;

		try {
			const response = await fetch("/api/quiz", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({
					questionId: currentQuestion.id,
					answerId: currentAnswer.answerId,
					answerText: currentAnswer.answerText,
					timeTaken: currentAnswer.timeTaken,
				}),
			});

			const result = await response.json();

			if (result.success) {
				const feedbackData: QuizFeedback = {
					isCorrect: result.isCorrect,
					explanation: result.explanation,
					pointsEarned: result.pointsEarned,
				};

				// Store feedback in session
				setFeedback(currentQuestionIndex, feedbackData);
				showResult(currentQuestionIndex);

				// Generate enhanced feedback for display
				const correctAnswers = currentQuestion.quiz_answers
					.filter((answer) => answer.is_correct)
					.map((answer) => answer.answer_text);

				await displayFeedback(
					currentQuestion.id,
					currentAnswer.answerId || currentAnswer.answerText || "",
					correctAnswers,
					currentQuestion.question_text,
					currentQuestion.category.slug
				);
			}
		} catch (error) {
			console.error("Error submitting answer:", error);
		}
	};

	const handleNextQuestion = () => {
		if (canGoNext()) {
			setCurrentQuestion(currentQuestionIndex + 1);
		} else {
			// Complete the quiz
			completeQuiz();
		}
	};

	const handlePreviousQuestion = () => {
		if (canGoPrevious()) {
			setCurrentQuestion(currentQuestionIndex - 1);
		}
	};

	const handleRestartQuiz = () => {
		restartQuiz();
	};

	const handleSessionRecoveryRecover = () => {
		setShowSessionRecovery(false);
		// Continue with existing session
	};

	const handleSessionRecoveryDiscard = () => {
		clearSession();
		setShowSessionRecovery(false);
		// Initialize new session
		if (data && session?.user?.id) {
			const newSessionId = `${session.user.id}-${categorySlug}-${Date.now()}`;
			initializeSession(
				newSessionId,
				categorySlug,
				data.category?.name || categorySlug,
				data.questions,
				300
			);
		}
	};

	if (!session) {
		return (
			<UnauthorizedState
				title="Quiz Access Restricted"
				description="You need to be signed in to take a quiz and track your progress."
			/>
		);
	}

	if (isLoading) {
		return (
			<LoadingState
				title="Loading Quiz Questions"
				description="Preparing your personalized quiz session..."
				variant="full"
				size="lg"
			/>
		);
	}

	if (error || !data || !data.questions || data.questions.length === 0) {
		return (
			<ErrorState
				title="Quiz Not Available"
				description="Unable to load quiz questions for this category."
				error={error?.message}
				onRetry={() => window.location.reload()}
				showHomeButton={false}
				showRetryButton={true}
			/>
		);
	}

	// Show session recovery dialog
	if (showSessionRecovery && sessionId && categoryName) {
		return (
			<div className="container mx-auto py-8 px-4 max-w-2xl">
				<Card>
					<CardContent className="p-6">
						<h2 className="text-xl font-semibold mb-4">Session Recovery</h2>
						<p className="mb-4">
							You have an existing quiz session for {categoryName}.
						</p>
						<div className="flex gap-4">
							<Button onClick={handleSessionRecoveryRecover}>
								Continue Session
							</Button>
							<Button variant="outline" onClick={handleSessionRecoveryDiscard}>
								Start New
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	// Quiz completed state
	if (isQuizCompleted) {
		const totalAnswered = getAnsweredCount();
		const correctAnswers = getCorrectAnswers();
		const totalPoints = getTotalPoints();
		const accuracy =
			totalAnswered > 0
				? Math.round((correctAnswers / totalAnswered) * 100)
				: 0;

		return (
			<div className="container mx-auto py-8 px-4 max-w-3xl">
				<div className="text-center">
					<div className="mb-6">
						{accuracy >= 90 ? (
							<Trophy className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
						) : accuracy >= 80 ? (
							<Medal className="h-16 w-16 text-blue-500 mx-auto mb-4" />
						) : accuracy >= 70 ? (
							<Star className="h-16 w-16 text-green-500 mx-auto mb-4" />
						) : (
							<Award className="h-16 w-16 text-gray-500 mx-auto mb-4" />
						)}
						<h1 className="text-4xl font-bold mb-2">Quiz Completed!</h1>
						<p className="text-lg text-muted-foreground">
							{accuracy >= 90
								? "Outstanding performance!"
								: accuracy >= 80
								? "Great job!"
								: accuracy >= 70
								? "Well done!"
								: accuracy >= 60
								? "Good effort!"
								: "Keep practicing!"}
						</p>
					</div>

					<Card className="mb-8">
						<CardContent className="p-8">
							<h2 className="text-2xl font-semibold mb-6">Your Results</h2>
							<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
								<div className="text-center">
									<div className="text-4xl font-bold text-primary mb-2">
										{accuracy}%
									</div>
									<div className="text-sm text-muted-foreground">Accuracy</div>
									<Progress value={accuracy} className="mt-2" />
								</div>
								<div className="text-center">
									<div className="text-4xl font-bold text-green-600 mb-2">
										{correctAnswers}/{totalAnswered}
									</div>
									<div className="text-sm text-muted-foreground">
										Correct Answers
									</div>
								</div>
								<div className="text-center">
									<div className="text-4xl font-bold text-blue-600 mb-2">
										{totalPoints}
									</div>
									<div className="text-sm text-muted-foreground">
										Points Earned
									</div>
								</div>
							</div>
						</CardContent>
					</Card>

					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						<Button
							onClick={() => router.push(`/quiz/${categorySlug}/results`)}
							size="lg"
							className="flex items-center"
						>
							<BarChart3 className="h-5 w-5 mr-2" />
							View Detailed Analytics
						</Button>
						<Button
							onClick={handleRestartQuiz}
							variant="outline"
							size="lg"
							className="flex items-center"
						>
							<RotateCcw className="h-5 w-5 mr-2" />
							Retake Quiz
						</Button>
						<Button
							variant="outline"
							onClick={() => router.push("/quiz")}
							size="lg"
							className="flex items-center"
						>
							<ArrowLeft className="h-5 w-5 mr-2" />
							Back to Categories
						</Button>
					</div>
				</div>
			</div>
		);
	}

	// No session or questions available
	if (!sessionId || !questions || questions.length === 0) {
		return (
			<LoadingState
				title="Initializing Quiz Session"
				description="Setting up your quiz session..."
				variant="full"
				size="md"
			/>
		);
	}

	const progress = getProgress();

	return (
		<div className="container mx-auto py-6 px-4 max-w-4xl">
			{/* Session Manager */}
			<QuizSessionManager>
				<div></div>
			</QuizSessionManager>

			{/* Header */}
			<div className="mb-6">
				<div className="flex items-center justify-between mb-4">
					<Button
						variant="outline"
						onClick={() => router.push("/quiz")}
						className="flex items-center"
					>
						<ArrowLeft className="h-4 w-4 mr-2" />
						Back to Categories
					</Button>
				</div>

				<h1 className="text-2xl font-bold mb-2">{categoryName} Quiz</h1>
				<Progress value={progress} className="w-full" />
			</div>

			{/* Current Question */}
			{currentQuestion && (
				<div className="space-y-6">
					<QuizQuestion
						question={currentQuestion}
						selectedAnswer={currentAnswer?.answerId}
						userAnswer={currentAnswer?.answerText}
						onAnswerSelect={handleAnswerSelect}
						disabled={showCurrentResult || isQuizPaused}
						showResult={showCurrentResult}
						questionNumber={currentQuestionIndex + 1}
						totalQuestions={questions.length}
						timeRemaining={timeRemaining}
						feedback={currentFeedback}
					/>

					{/* Enhanced Real-Time Feedback Display - Only for incorrect answers */}
					{feedbackVisible &&
						enhancedFeedback &&
						showCurrentResult &&
						currentFeedback &&
						!currentFeedback.isCorrect && (
							<QuizFeedbackDisplay
								feedback={enhancedFeedback}
								showLearningMaterials={true}
								showPerformanceInsights={true}
								className="mt-6"
							/>
						)}
				</div>
			)}

			{/* Navigation */}
			<div className="flex items-center justify-between mt-8">
				<Button
					variant="outline"
					onClick={handlePreviousQuestion}
					disabled={!canGoPrevious() || isQuizPaused}
				>
					<ArrowLeft className="h-4 w-4 mr-2" />
					Previous
				</Button>

				{!showCurrentResult ? (
					<Button
						onClick={handleSubmitAnswer}
						disabled={
							!isAnswered(currentQuestionIndex) ||
							isQuizPaused ||
							isQuizCompleted
						}
					>
						Submit Answer
					</Button>
				) : (
					<Button onClick={handleNextQuestion} disabled={isQuizPaused}>
						{currentQuestionIndex === questions.length - 1
							? "Finish Quiz"
							: "Next Question"}
						<ArrowRight className="h-4 w-4 ml-2" />
					</Button>
				)}
			</div>
		</div>
	);
}
