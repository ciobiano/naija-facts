"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { QuizQuestionData, QuizFeedback } from "@/types";

export interface QuizSessionAnswer {
	answerId?: string;
	answerText?: string;
	timestamp: number;
	timeTaken: number;
}

export interface QuizSessionState {
	// Session data
	sessionId: string | null;
	categoryId: string | null;
	categoryName: string | null;
	questions: QuizQuestionData[];

	// Progress tracking
	currentQuestionIndex: number;
	answers: Record<number, QuizSessionAnswer>;
	feedback: Record<number, QuizFeedback>;
	showResults: Record<number, boolean>;

	// Timer and status
	timeRemaining: number;
	totalTimeLimit: number;
	isQuizCompleted: boolean;
	isQuizPaused: boolean;
	startTime: number | null;

	// Session management
	lastActivityTime: number;
	autoSaveInterval: number;

	// Actions
	initializeSession: (
		sessionId: string,
		categoryId: string,
		categoryName: string,
		questions: QuizQuestionData[],
		timeLimit?: number
	) => void;

	setCurrentQuestion: (index: number) => void;
	submitAnswer: (
		questionIndex: number,
		answerId?: string,
		answerText?: string,
		timeTaken?: number
	) => void;

	setFeedback: (questionIndex: number, feedback: QuizFeedback) => void;
	showResult: (questionIndex: number) => void;

	// Timer management
	decrementTime: () => void;
	pauseQuiz: () => void;
	resumeQuiz: () => void;
	resetTimer: (newTime?: number) => void;

	// Session management
	saveSession: () => void;
	loadSession: (sessionId: string) => boolean;
	clearSession: () => void;
	completeQuiz: () => void;
	restartQuiz: () => void;

	// Navigation helpers
	canGoPrevious: () => boolean;
	canGoNext: () => boolean;
	isAnswered: (questionIndex: number) => boolean;
	getProgress: () => number;

	// Statistics
	getCorrectAnswers: () => number;
	getTotalPoints: () => number;
	getAnsweredCount: () => number;
	getTimeSpent: () => number;
}

const QUIZ_SESSION_STORAGE_KEY = "naija-facts-quiz-session";
const DEFAULT_TIME_LIMIT = 300; // 5 minutes
const AUTO_SAVE_INTERVAL = 10000; // 10 seconds

export const useQuizSession = create<QuizSessionState>()(
	persist(
		(set, get) => ({
			// Initial state
			sessionId: null,
			categoryId: null,
			categoryName: null,
			questions: [],

			currentQuestionIndex: 0,
			answers: {},
			feedback: {},
			showResults: {},

			timeRemaining: DEFAULT_TIME_LIMIT,
			totalTimeLimit: DEFAULT_TIME_LIMIT,
			isQuizCompleted: false,
			isQuizPaused: false,
			startTime: null,

			lastActivityTime: Date.now(),
			autoSaveInterval: AUTO_SAVE_INTERVAL,

			// Initialize a new quiz session
			initializeSession: (
				sessionId,
				categoryId,
				categoryName,
				questions,
				timeLimit = DEFAULT_TIME_LIMIT
			) => {
				const now = Date.now();
				set({
					sessionId,
					categoryId,
					categoryName,
					questions,
					currentQuestionIndex: 0,
					answers: {},
					feedback: {},
					showResults: {},
					timeRemaining: timeLimit,
					totalTimeLimit: timeLimit,
					isQuizCompleted: false,
					isQuizPaused: false,
					startTime: now,
					lastActivityTime: now,
				});
			},

			// Navigation
			setCurrentQuestion: (index) => {
				const state = get();
				if (index >= 0 && index < state.questions.length) {
					set({
						currentQuestionIndex: index,
						lastActivityTime: Date.now(),
					});
				}
			},

			// Answer submission
			submitAnswer: (questionIndex, answerId, answerText, timeTaken = 0) => {
				const state = get();
				const timestamp = Date.now();

				set({
					answers: {
						...state.answers,
						[questionIndex]: {
							answerId,
							answerText,
							timestamp,
							timeTaken,
						},
					},
					lastActivityTime: timestamp,
				});
			},

			// Feedback management
			setFeedback: (questionIndex, feedback) => {
				const state = get();
				set({
					feedback: {
						...state.feedback,
						[questionIndex]: feedback,
					},
					lastActivityTime: Date.now(),
				});
			},

			showResult: (questionIndex) => {
				const state = get();
				set({
					showResults: {
						...state.showResults,
						[questionIndex]: true,
					},
					lastActivityTime: Date.now(),
				});
			},

			// Timer management
			decrementTime: () => {
				const state = get();
				if (
					!state.isQuizPaused &&
					!state.isQuizCompleted &&
					state.timeRemaining > 0
				) {
					const newTime = state.timeRemaining - 1;
					if (newTime <= 0) {
						set({
							timeRemaining: 0,
							isQuizCompleted: true,
							lastActivityTime: Date.now(),
						});
					} else {
						set({
							timeRemaining: newTime,
							lastActivityTime: Date.now(),
						});
					}
				}
			},

			pauseQuiz: () => {
				set({
					isQuizPaused: true,
					lastActivityTime: Date.now(),
				});
			},

			resumeQuiz: () => {
				set({
					isQuizPaused: false,
					lastActivityTime: Date.now(),
				});
			},

			resetTimer: (newTime) => {
				const state = get();
				set({
					timeRemaining: newTime || state.totalTimeLimit,
					isQuizPaused: false,
					lastActivityTime: Date.now(),
				});
			},

			// Session persistence
			saveSession: () => {
				const state = get();
				// This is handled automatically by the persist middleware
				// but we can add custom logic here if needed
				set({
					lastActivityTime: Date.now(),
				});
			},

			loadSession: (sessionId) => {
				// Custom session loading logic
				// For now, return false as sessions are loaded automatically
				return false;
			},

			clearSession: () => {
				set({
					sessionId: null,
					categoryId: null,
					categoryName: null,
					questions: [],
					currentQuestionIndex: 0,
					answers: {},
					feedback: {},
					showResults: {},
					timeRemaining: DEFAULT_TIME_LIMIT,
					totalTimeLimit: DEFAULT_TIME_LIMIT,
					isQuizCompleted: false,
					isQuizPaused: false,
					startTime: null,
					lastActivityTime: Date.now(),
				});
			},

			completeQuiz: () => {
				set({
					isQuizCompleted: true,
					isQuizPaused: false,
					lastActivityTime: Date.now(),
				});
			},

			restartQuiz: () => {
				const state = get();
				const now = Date.now();
				set({
					currentQuestionIndex: 0,
					answers: {},
					feedback: {},
					showResults: {},
					timeRemaining: state.totalTimeLimit,
					isQuizCompleted: false,
					isQuizPaused: false,
					startTime: now,
					lastActivityTime: now,
				});
			},

			// Navigation helpers
			canGoPrevious: () => {
				const state = get();
				return state.currentQuestionIndex > 0;
			},

			canGoNext: () => {
				const state = get();
				return state.currentQuestionIndex < state.questions.length - 1;
			},

			isAnswered: (questionIndex) => {
				const state = get();
				const answer = state.answers[questionIndex];
				return !!(answer?.answerId || answer?.answerText);
			},

			getProgress: () => {
				const state = get();
				if (state.questions.length === 0) return 0;
				return (
					((state.currentQuestionIndex + 1) / state.questions.length) * 100
				);
			},

			// Statistics
			getCorrectAnswers: () => {
				const state = get();
				return Object.values(state.feedback).filter((f) => f.isCorrect).length;
			},

			getTotalPoints: () => {
				const state = get();
				return Object.values(state.feedback).reduce(
					(sum, f) => sum + f.pointsEarned,
					0
				);
			},

			getAnsweredCount: () => {
				const state = get();
				return Object.keys(state.answers).length;
			},

			getTimeSpent: () => {
				const state = get();
				if (!state.startTime) return 0;
				return state.totalTimeLimit - state.timeRemaining;
			},
		}),
		{
			name: QUIZ_SESSION_STORAGE_KEY,
			storage: createJSONStorage(() => localStorage),
			partialize: (state) => ({
				// Only persist essential session data
				sessionId: state.sessionId,
				categoryId: state.categoryId,
				categoryName: state.categoryName,
				questions: state.questions,
				currentQuestionIndex: state.currentQuestionIndex,
				answers: state.answers,
				feedback: state.feedback,
				showResults: state.showResults,
				timeRemaining: state.timeRemaining,
				totalTimeLimit: state.totalTimeLimit,
				isQuizCompleted: state.isQuizCompleted,
				startTime: state.startTime,
				lastActivityTime: state.lastActivityTime,
			}),
			// Only rehydrate if session is recent (within 1 hour)
			onRehydrateStorage: () => (state) => {
				if (state && state.lastActivityTime) {
					const now = Date.now();
					const timeDiff = now - state.lastActivityTime;
					const oneHour = 60 * 60 * 1000;

					// Clear session if it's too old
					if (timeDiff > oneHour) {
						state.clearSession();
					}
				}
			},
		}
	)
);

// Helper hook for quiz timer management
export const useQuizTimer = () => {
	const {
		timeRemaining,
		isQuizCompleted,
		isQuizPaused,
		decrementTime,
		pauseQuiz,
		resumeQuiz,
		completeQuiz,
	} = useQuizSession();

	// This will be used in a useEffect to manage the timer
	return {
		timeRemaining,
		isQuizCompleted,
		isQuizPaused,
		decrementTime,
		pauseQuiz,
		resumeQuiz,
		completeQuiz,
		formatTime: (seconds: number) => {
			const mins = Math.floor(seconds / 60);
			const secs = seconds % 60;
			return `${mins}:${secs.toString().padStart(2, "0")}`;
		},
	};
};
