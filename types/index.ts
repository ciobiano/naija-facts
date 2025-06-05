export interface ProfileData {
	id: string;
	email: string;
	full_name: string;
	avatar_url?: string;
	location?: string;
	timezone?: string;
	preferred_language?: string;
	created_at: string;
	last_login: string;
	is_active: boolean;
}

export interface ProfileFormData {
	fullName: string;
	email: string;
	location: string;
	timezone: string;
	preferredLanguage: string;
}

export interface PasswordFormData {
	currentPassword: string;
	newPassword: string;
	confirmNewPassword: string;
}

export interface EmailFormData {
	newEmail: string;
	password: string;
}

export interface MessageState {
	type: "success" | "error";
	text: string;
}

export type TabValue = "profile" | "security" | "preferences" | "danger";

export interface FormErrors {
	[key: string]: string;
}

//Quiz
export interface QuizProgress {
	completion_percentage: number;
	total_points_earned: number;
	current_streak: number;
	total_questions_attempted: number;
	correct_answers: number;
	average_score: number;
	last_activity: string | null;
}

export interface QuizCategory {
	id: string;
	name: string;
	description: string;
	slug: string;
	icon?: string;
	color?: string;
	sort_order: number;
	totalQuestions: number;
	progress: QuizProgress | null;
}

export interface QuizPagination {
	page: number;
	pageSize: number;
	total: number;
	totalPages: number;
}

export interface QuizCategoriesResponse {
	categories: QuizCategory[];
	meta: {
		pagination: QuizPagination;
	};
}

export type DifficultyLevel = "all" | "easy" | "medium" | "hard";

export interface QuizStats {
	totalChapters: number;
	totalPoints: number;
	completedChapters: number;
	bestStreak: number;
}

// Quiz Question Component Types
export interface QuizQuestionAnswer {
	id: string;
	answer_text: string;
	is_correct?: boolean;
	explanation?: string;
	sort_order: number;
}

export interface QuizQuestionData {
	id: string;
	question_text: string;
	question_type: "multiple_choice" | "true_false" | "fill_blank" | "matching";
	difficulty_level: "beginner" | "intermediate" | "advanced";
	points: number;
	explanation?: string;
	image_url?: string;
	audio_url?: string;
	quiz_answers: QuizQuestionAnswer[];
	category: {
		id: string;
		name: string;
		slug: string;
	};
}

export interface QuestionComponentProps {
	question: QuizQuestionData;
	selectedAnswer?: string;
	userAnswer?: string;
	onAnswerSelect: (answerId?: string, answerText?: string) => void;
	disabled?: boolean;
	showResult?: boolean;
	showExplanation?: boolean;
	className?: string;
}

export interface QuizFeedback {
	isCorrect: boolean;
	explanation?: string;
	correctAnswerId?: string;
	pointsEarned: number;
	// Enhanced feedback properties
	detailedExplanation?: string;
	learningMaterials?: LearningMaterial[];
	relatedTopics?: string[];
	difficultyAnalysis?: {
		attemptedLevel: string;
		recommendedLevel: string;
		adjustmentReason?: string;
	};
	performanceInsights?: string[];
	nextSteps?: string[];
}

export interface LearningMaterial {
	id: string;
	title: string;
	type: "constitutional_section" | "article" | "chapter" | "external_link";
	url?: string;
	content?: string;
	chapter?: string;
	section?: string;
	description?: string;
}

export interface FeedbackAnimation {
	type: "correct" | "incorrect" | "streak" | "achievement";
	duration?: number;
	intensity?: "subtle" | "normal" | "celebration";
}
