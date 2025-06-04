import { QuizCategory, QuizProgress, QuizStats } from "@/types";

/**
 * Calculate estimated time to complete a quiz based on number of questions
 */
export const getEstimatedTime = (totalQuestions: number): string => {
	// Estimate 1.5 minutes per question
	const minutes = Math.ceil(totalQuestions * 1.5);
	if (minutes < 60) return `${minutes}m`;
	const hours = Math.floor(minutes / 60);
	const remainingMinutes = minutes % 60;
	return `${hours}h ${remainingMinutes}m`;
};

/**
 * Get difficulty color class based on quiz progress
 */
export const getDifficultyColor = (progress: QuizProgress | null): string => {
	if (!progress) return "bg-gray-100";
	const score = progress.average_score;
	if (score >= 80) return "bg-green-100 text-green-800";
	if (score >= 60) return "bg-yellow-100 text-yellow-800";
	return "bg-red-100 text-red-800";
};

/**
 * Check if a chapter is unlocked based on prerequisites
 */
export const isChapterUnlocked = (
	categoryIndex: number,
	categories: QuizCategory[]
): boolean => {
	// First chapter is always unlocked
	if (categoryIndex === 0) return true;

	// For other chapters, check if previous chapter has some progress
	const previousCategory = categories[categoryIndex - 1];
	return (
		previousCategory?.progress != null &&
		previousCategory.progress.total_questions_attempted > 0
	);
};

/**
 * Calculate quiz statistics from categories
 */
export const calculateQuizStats = (categories: QuizCategory[]): QuizStats => {
	const totalPoints = categories.reduce(
		(sum: number, cat: QuizCategory) =>
			sum + (cat.progress?.total_points_earned || 0),
		0
	);

	const completedChapters = categories.filter(
		(cat: QuizCategory) =>
			cat.progress && cat.progress.completion_percentage >= 80
	).length;

	const bestStreak = Math.max(
		...categories.map((cat: QuizCategory) => cat.progress?.current_streak || 0)
	);

	return {
		totalChapters: categories.length,
		totalPoints,
		completedChapters,
		bestStreak,
	};
};

/**
 * API fetcher function for SWR
 */
export const fetcher = (url: string) =>
	fetch(url, {
		credentials: "include",
	}).then((res) => res.json());
