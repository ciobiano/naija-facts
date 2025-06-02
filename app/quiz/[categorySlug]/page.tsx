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

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function QuizSessionPage() {
	const { data: session } = useSession();
	const params = useParams();
	const router = useRouter();
	const categorySlug = params.categorySlug as string;

	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
	const [answers, setAnswers] = useState<
		Record<number, { answerId?: string; answerText?: string }>
	>({});
	const [feedback, setFeedback] = useState<Record<number, QuizFeedback>>({});
	const [showResults, setShowResults] = useState<Record<number, boolean>>({});
	const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes
	const [isQuizCompleted, setIsQuizCompleted] = useState(false);

	// Fetch quiz questions
	const { data, error, isLoading } = useSWR<QuizSessionResponse>(
		session && categorySlug
			? `/api/quiz?categoryId=${categorySlug}&limit=5`
			: null,
		fetcher
	);

	const questions = data?.questions || [];
	const currentQuestion = questions[currentQuestionIndex];

	// Timer effect
	useEffect(() => {
		if (isQuizCompleted || timeRemaining <= 0) return;

		const timer = setInterval(() => {
			setTimeRemaining((prev) => {
				if (prev <= 1) {
					setIsQuizCompleted(true);
					return 0;
				}
				return prev - 1;
			});
		}, 1000);

		return () => clearInterval(timer);
	}, [timeRemaining, isQuizCompleted]);

	const handleAnswerSelect = (answerId?: string, answerText?: string) => {
		setAnswers((prev) => ({
			...prev,
			[currentQuestionIndex]: { answerId, answerText },
		}));
	};

	const handleSubmitAnswer = async () => {
		if (!currentQuestion || !session?.user?.id) return;

		const currentAnswer = answers[currentQuestionIndex];
		if (!currentAnswer?.answerId && !currentAnswer?.answerText) return;

		try {
			const response = await fetch("/api/quiz", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					questionId: currentQuestion.id,
					answerId: currentAnswer.answerId,
					answerText: currentAnswer.answerText,
					timeTaken: 300 - timeRemaining,
				}),
			});

			const result = await response.json();

			if (result.success) {
				setFeedback((prev) => ({
					...prev,
					[currentQuestionIndex]: {
						isCorrect: result.isCorrect,
						explanation: result.explanation,
						pointsEarned: result.pointsEarned,
					},
				}));
				setShowResults((prev) => ({
					...prev,
					[currentQuestionIndex]: true,
				}));
			}
		} catch (error) {
			console.error("Error submitting answer:", error);
		}
	};

	const handleNextQuestion = () => {
		if (currentQuestionIndex < questions.length - 1) {
			setCurrentQuestionIndex((prev) => prev + 1);
		} else {
			setIsQuizCompleted(true);
		}
	};

	const handlePreviousQuestion = () => {
		if (currentQuestionIndex > 0) {
			setCurrentQuestionIndex((prev) => prev - 1);
		}
	};

	const handleRestartQuiz = () => {
		setCurrentQuestionIndex(0);
		setAnswers({});
		setFeedback({});
		setShowResults({});
		setTimeRemaining(300);
		setIsQuizCompleted(false);
	};

	const progress =
		questions.length > 0
			? ((currentQuestionIndex + 1) / questions.length) * 100
			: 0;
	const currentAnswer = answers[currentQuestionIndex];
	const currentFeedback = feedback[currentQuestionIndex];
	const showCurrentResult = showResults[currentQuestionIndex];

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

	if (error || !data || questions.length === 0) {
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

	if (isQuizCompleted) {
		const totalAnswered = Object.keys(answers).length;
		const correctAnswers = Object.values(feedback).filter(
			(f) => f.isCorrect
		).length;
		const totalPoints = Object.values(feedback).reduce(
			(sum, f) => sum + f.pointsEarned,
			0
		);

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

	return (
		<div className="container mx-auto py-6 px-4 max-w-4xl">
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
					<div className="text-sm text-muted-foreground">
						Time: {Math.floor(timeRemaining / 60)}:
						{(timeRemaining % 60).toString().padStart(2, "0")}
					</div>
				</div>

				<h1 className="text-2xl font-bold mb-2">{data.category.name} Quiz</h1>
				<Progress value={progress} className="w-full" />
			</div>

			{/* Current Question */}
			{currentQuestion && (
				<QuizQuestion
					question={currentQuestion}
					selectedAnswer={currentAnswer?.answerId}
					userAnswer={currentAnswer?.answerText}
					onAnswerSelect={handleAnswerSelect}
					disabled={showCurrentResult}
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
					disabled={currentQuestionIndex === 0}
				>
					<ArrowLeft className="h-4 w-4 mr-2" />
					Previous
				</Button>

				{!showCurrentResult ? (
					<Button
						onClick={handleSubmitAnswer}
						disabled={!currentAnswer?.answerId && !currentAnswer?.answerText}
					>
						Submit Answer
					</Button>
				) : (
					<Button onClick={handleNextQuestion}>
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
