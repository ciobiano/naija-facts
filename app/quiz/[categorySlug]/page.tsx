"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, RotateCcw } from "lucide-react";
import { QuizQuestionData, QuizFeedback } from "@/types";
import { QuizQuestion } from "@/components/ui/sections/quiz/question-types/quiz-question";
import {
	QuizSessionManager,
	SessionRecovery,
} from "@/components/ui/sections/quiz/quiz-session-manager";
import { useQuizSession } from "@/hooks/useQuizSession";
import { fetcher } from "@/lib/quiz";
import {
	LoadingState,
	ErrorState,
	UnauthorizedState,
} from "@/components/ui/states";

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
	const params = useParams();
	const router = useRouter();
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

				setFeedback(currentQuestionIndex, feedbackData);
				showResult(currentQuestionIndex);
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

	const handleSessionExpired = () => {
		// Quiz completed due to timeout
		console.log("Quiz session expired");
	};

	const handleSessionPaused = () => {
		console.log("Quiz session paused");
	};

	const handleSessionResumed = () => {
		console.log("Quiz session resumed");
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
				<SessionRecovery
					onRecover={handleSessionRecoveryRecover}
					onDiscard={handleSessionRecoveryDiscard}
					sessionInfo={{
						categoryName,
						timeRemaining,
						progress: getProgress(),
						lastActivity: useQuizSession.getState().lastActivityTime,
					}}
				/>
			</div>
		);
	}

	// Quiz completed state
	if (isQuizCompleted) {
		const totalAnswered = getAnsweredCount();
		const correctAnswers = getCorrectAnswers();
		const totalPoints = getTotalPoints();

		return (
			<div className="container mx-auto py-8 px-4 max-w-2xl text-center">
				<h1 className="text-3xl font-bold mb-4">Quiz Completed!</h1>
				<div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
					<h2 className="text-xl font-semibold mb-4">Your Results</h2>
					<div className="grid grid-cols-2 gap-4 text-center">
						<div>
							<p className="text-2xl font-bold text-primary">
								{correctAnswers}/{totalAnswered}
							</p>
							<p className="text-sm text-muted-foreground">Correct Answers</p>
						</div>
						<div>
							<p className="text-2xl font-bold text-primary">{totalPoints}</p>
							<p className="text-sm text-muted-foreground">Points Earned</p>
						</div>
					</div>
				</div>
				<div className="space-x-4">
					<Button onClick={handleRestartQuiz}>
						<RotateCcw className="h-4 w-4 mr-2" />
						Retake Quiz
					</Button>
					<Button variant="outline" onClick={() => router.push("/quiz")}>
						<ArrowLeft className="h-4 w-4 mr-2" />
						Back to Categories
					</Button>
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
			<QuizSessionManager
				onSessionExpired={handleSessionExpired}
				onSessionPaused={handleSessionPaused}
				onSessionResumed={handleSessionResumed}
				autoSave={true}
				showControls={true}
			/>

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
