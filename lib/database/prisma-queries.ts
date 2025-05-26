import { Prisma } from "@prisma/client";
import { prisma } from "../prisma";

// Type helpers
type ProfileWithRelations = Prisma.ProfileGetPayload<{
	include: {
		user_progress: {
			include: {
				category: true;
			};
		};
		user_achievements: {
			include: {
				achievement: true;
			};
		};
	};
}>;

type QuizQuestionWithAnswers = Prisma.QuizQuestionGetPayload<{
	include: {
		quiz_answers: true;
		category: true;
	};
}>;

// User Profile Operations
export const prismaProfileQueries = {
	async getProfile(userId: string): Promise<ProfileWithRelations | null> {
		try {
			return await prisma.profile.findUnique({
				where: { id: userId },
				include: {
					user_progress: {
						include: {
							category: true,
						},
					},
					user_achievements: {
						include: {
							achievement: true,
						},
					},
				},
			});
		} catch (error) {
			console.error("Error fetching profile:", error);
			return null;
		}
	},

	async updateProfile(
		userId: string,
		updates: Prisma.ProfileUpdateInput
	): Promise<Prisma.ProfileGetPayload<{}> | null> {
		try {
			return await prisma.profile.update({
				where: { id: userId },
				data: updates,
			});
		} catch (error) {
			console.error("Error updating profile:", error);
			return null;
		}
	},

	async createProfile(
		profile: Prisma.ProfileCreateInput
	): Promise<Prisma.ProfileGetPayload<{}> | null> {
		try {
			return await prisma.profile.create({
				data: profile,
			});
		} catch (error) {
			console.error("Error creating profile:", error);
			return null;
		}
	},
};

// Category Operations
export const prismaCategoryQueries = {
	async getAllCategories() {
		try {
			return await prisma.category.findMany({
				where: { is_active: true },
				orderBy: { sort_order: "asc" },
			});
		} catch (error) {
			console.error("Error fetching categories:", error);
			return [];
		}
	},

	async getCategoryBySlug(slug: string) {
		try {
			return await prisma.category.findUnique({
				where: {
					slug,
					is_active: true,
				},
			});
		} catch (error) {
			console.error("Error fetching category:", error);
			return null;
		}
	},
};

// Quiz Operations
export const prismaQuizQueries = {
	async getQuestionsByCategory(
		categoryId: string,
		limit?: number,
		difficulty?: Prisma.EnumDifficultyLevelFilter
	): Promise<QuizQuestionWithAnswers[]> {
		try {
			return await prisma.quizQuestion.findMany({
				where: {
					category_id: categoryId,
					is_active: true,
					...(difficulty && { difficulty_level: difficulty }),
				},
				include: {
					quiz_answers: {
						orderBy: { sort_order: "asc" },
					},
					category: true,
				},
				orderBy: { created_at: "asc" },
				...(limit && { take: limit }),
			});
		} catch (error) {
			console.error("Error fetching questions:", error);
			return [];
		}
	},

	async getRandomQuestions(
		categoryId: string,
		count: number = 10,
		difficulty?: Prisma.EnumDifficultyLevelFilter
	): Promise<QuizQuestionWithAnswers[]> {
		try {
			// Get total count first
			const totalCount = await prisma.quizQuestion.count({
				where: {
					category_id: categoryId,
					is_active: true,
					...(difficulty && { difficulty_level: difficulty }),
				},
			});

			if (totalCount === 0) return [];

			// Generate random skip value
			const skip = Math.floor(Math.random() * Math.max(0, totalCount - count));

			return await prisma.quizQuestion.findMany({
				where: {
					category_id: categoryId,
					is_active: true,
					...(difficulty && { difficulty_level: difficulty }),
				},
				include: {
					quiz_answers: {
						orderBy: { sort_order: "asc" },
					},
					category: true,
				},
				skip,
				take: count,
			});
		} catch (error) {
			console.error("Error fetching random questions:", error);
			return [];
		}
	},

	async submitQuizAttempt() {},
};
