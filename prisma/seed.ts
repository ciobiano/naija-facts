
import { PrismaClient } from '@prisma/client';


const prisma = new PrismaClient();

async function main() {
	console.log("🌱 Starting database seeding...");

	// Create categories
	const categories = await Promise.all([
		prisma.category.upsert({
			where: { slug: "history" },
			update: {},
			create: {
				name: "Nigerian History",
				description: "Learn about Nigeria's rich historical heritage",
				slug: "history",
				icon: "🏛️",
				color: "#8B5CF6",
				sort_order: 1,
			},
		}),
		prisma.category.upsert({
			where: { slug: "culture" },
			update: {},
			create: {
				name: "Culture & Traditions",
				description: "Explore Nigerian cultural diversity and traditions",
				slug: "culture",
				icon: "🎭",
				color: "#10B981",
				sort_order: 2,
			},
		}),
		prisma.category.upsert({
			where: { slug: "geography" },
			update: {},
			create: {
				name: "Geography",
				description: "Discover Nigeria's geographical features and states",
				slug: "geography",
				icon: "🗺️",
				color: "#F59E0B",
				sort_order: 3,
			},
		}),
		prisma.category.upsert({
			where: { slug: "languages" },
			update: {},
			create: {
				name: "Languages",
				description: "Learn about Nigeria's linguistic diversity",
				slug: "languages",
				icon: "🗣️",
				color: "#EF4444",
				sort_order: 4,
			},
		}),
		prisma.category.upsert({
			where: { slug: "economy" },
			update: {},
			create: {
				name: "Economy",
				description: "Understanding Nigeria's economic landscape",
				slug: "economy",
				icon: "💰",
				color: "#3B82F6",
				sort_order: 5,
			},
		}),
	]);

	console.log("✅ Categories created:", categories.length);

	// Create achievements
	const achievements = await Promise.all([
		prisma.achievement.upsert({
			where: { name: "First Steps" },
			update: {},
			create: {
				name: "First Steps",
				description: "Complete your first quiz",
				icon: "👶",
				badge_color: "#10B981",
				criteria: { type: "quiz_completion", count: 1 },
				points_reward: 10,
				rarity: "common",
			},
		}),
		prisma.achievement.upsert({
			where: { name: "Quiz Master" },
			update: {},
			create: {
				name: "Quiz Master",
				description: "Complete 50 quizzes",
				icon: "🎓",
				badge_color: "#8B5CF6",
				criteria: { type: "quiz_completion", count: 50 },
				points_reward: 100,
				rarity: "rare",
			},
		}),
		prisma.achievement.upsert({
			where: { name: "Perfect Score" },
			update: {},
			create: {
				name: "Perfect Score",
				description: "Get 100% on a quiz",
				icon: "⭐",
				badge_color: "#F59E0B",
				criteria: { type: "perfect_score", count: 1 },
				points_reward: 25,
				rarity: "common",
			},
		}),
		prisma.achievement.upsert({
			where: { name: "Streak Master" },
			update: {},
			create: {
				name: "Streak Master",
				description: "Maintain a 7-day learning streak",
				icon: "🔥",
				badge_color: "#EF4444",
				criteria: { type: "daily_streak", count: 7 },
				points_reward: 50,
				rarity: "epic",
			},
		}),
		prisma.achievement.upsert({
			where: { name: "Culture Expert" },
			update: {},
			create: {
				name: "Culture Expert",
				description: "Complete all culture category quizzes",
				icon: "🎭",
				badge_color: "#10B981",
				criteria: { type: "category_completion", category: "culture" },
				points_reward: 200,
				rarity: "legendary",
			},
		}),
	]);

	console.log("✅ Achievements created:", achievements.length);

	console.log("🎉 Database seeding completed successfully!");
}

main()
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async (e) => {
		console.error("❌ Error during seeding:", e);
		await prisma.$disconnect();
		process.exit(1);
	});
