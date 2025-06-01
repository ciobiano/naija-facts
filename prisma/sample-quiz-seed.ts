import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedQuizCategories() {
	console.log("🌱 Seeding quiz categories...");

	// Nigerian Constitutional Chapters
	const categories = [
		{
			name: "Chapter I: General Provisions",
			description:
				"The Federal Republic of Nigeria, its powers, and fundamental principles",
			slug: "chapter-1",
			icon: "🏛️",
			color: "bg-blue-500",
			sort_order: 1,
		},
		{
			name: "Chapter II: Fundamental Objectives and Directive Principles",
			description: "State policy objectives and principles of state governance",
			slug: "chapter-2",
			icon: "🎯",
			color: "bg-green-500",
			sort_order: 2,
		},
		{
			name: "Chapter III: Citizenship",
			description: "Nigerian citizenship, acquisition, and loss of citizenship",
			slug: "chapter-3",
			icon: "🇳🇬",
			color: "bg-red-500",
			sort_order: 3,
		},
		{
			name: "Chapter IV: Fundamental Rights",
			description: "Fundamental human rights guaranteed by the constitution",
			slug: "chapter-4",
			icon: "⚖️",
			color: "bg-purple-500",
			sort_order: 4,
		},
		{
			name: "Chapter V: The Legislature",
			description: "National Assembly, powers, and legislative procedures",
			slug: "chapter-5",
			icon: "🏛️",
			color: "bg-yellow-500",
			sort_order: 5,
		},
		{
			name: "Chapter VI: The Executive",
			description: "President, Vice-President, and executive powers",
			slug: "chapter-6",
			icon: "👥",
			color: "bg-indigo-500",
			sort_order: 6,
		},
		{
			name: "Chapter VII: The Judicature",
			description: "Judicial system, courts, and administration of justice",
			slug: "chapter-7",
			icon: "⚖️",
			color: "bg-pink-500",
			sort_order: 7,
		},
		{
			name: "Chapter VIII: Federal Capital Territory and General Supplementary Provisions",
			description:
				"Federal Capital Territory, miscellaneous and supplementary provisions",
			slug: "chapter-8",
			icon: "🏙️",
			color: "bg-teal-500",
			sort_order: 8,
		},
	];

	// Create categories
	for (const category of categories) {
		try {
			const existingCategory = await prisma.category.findUnique({
				where: { slug: category.slug },
			});

			if (!existingCategory) {
				await prisma.category.create({
					data: category,
				});
				console.log(`✅ Created category: ${category.name}`);
			} else {
				console.log(`⏭️ Category already exists: ${category.name}`);
			}
		} catch (error) {
			console.error(`❌ Error creating category ${category.name}:`, error);
		}
	}
}

async function seedSampleQuestions() {
	console.log("🌱 Seeding sample quiz questions...");

	// Get the first category (Chapter I)
	const chapter1 = await prisma.category.findUnique({
		where: { slug: "chapter-1" },
	});

	if (!chapter1) {
		console.log("❌ Chapter 1 category not found, skipping question seeding");
		return;
	}

	// Create a dummy user for question creation
	let creator = await prisma.profile.findFirst({
		where: { email: "admin@example.com" },
	});

	if (!creator) {
		creator = await prisma.profile.create({
			data: {
				email: "admin@example.com",
				full_name: "Admin User",
				is_active: true,
			},
		});
	}

	// Sample questions for Chapter I
	const sampleQuestions = [
		{
			question_text:
				"What is the official name of Nigeria according to the 1999 Constitution?",
			question_type: "multiple_choice" as const,
			difficulty_level: "beginner" as const,
			points: 10,
			explanation:
				"The 1999 Constitution establishes Nigeria as the Federal Republic of Nigeria.",
			answers: [
				{ text: "Republic of Nigeria", isCorrect: false },
				{ text: "Federal Republic of Nigeria", isCorrect: true },
				{ text: "Democratic Republic of Nigeria", isCorrect: false },
				{ text: "United Republic of Nigeria", isCorrect: false },
			],
		},
		{
			question_text:
				"Nigeria is a federal state composed of how many states and the Federal Capital Territory?",
			question_type: "multiple_choice" as const,
			difficulty_level: "beginner" as const,
			points: 10,
			explanation:
				"Nigeria consists of 36 states and the Federal Capital Territory (Abuja).",
			answers: [
				{ text: "35 states", isCorrect: false },
				{ text: "36 states", isCorrect: true },
				{ text: "37 states", isCorrect: false },
				{ text: "38 states", isCorrect: false },
			],
		},
		{
			question_text:
				"The sovereignty of Nigeria belongs to the people. True or False?",
			question_type: "true_false" as const,
			difficulty_level: "beginner" as const,
			points: 10,
			explanation:
				"Section 14(2)(a) of the Constitution states that sovereignty belongs to the people of Nigeria from whom government derives its authority.",
			answers: [
				{ text: "True", isCorrect: true },
				{ text: "False", isCorrect: false },
			],
		},
	];

	// Create questions and answers
	for (let i = 0; i < sampleQuestions.length; i++) {
		const questionData = sampleQuestions[i];

		try {
			const question = await prisma.quizQuestion.create({
				data: {
					category_id: chapter1.id,
					question_text: questionData.question_text,
					question_type: questionData.question_type,
					difficulty_level: questionData.difficulty_level,
					points: questionData.points,
					explanation: questionData.explanation,
					created_by: creator.id,
				},
			});

			// Create answers
			for (let j = 0; j < questionData.answers.length; j++) {
				const answerData = questionData.answers[j];
				await prisma.quizAnswer.create({
					data: {
						question_id: question.id,
						answer_text: answerData.text,
						is_correct: answerData.isCorrect,
						sort_order: j + 1,
					},
				});
			}

			console.log(
				`✅ Created question ${i + 1}: ${questionData.question_text.substring(
					0,
					50
				)}...`
			);
		} catch (error) {
			console.error(`❌ Error creating question ${i + 1}:`, error);
		}
	}
}

async function main() {
	try {
		await seedQuizCategories();
		await seedSampleQuestions();
		console.log("🎉 Quiz seeding completed successfully!");
	} catch (error) {
		console.error("❌ Error during seeding:", error);
	} finally {
		await prisma.$disconnect();
	}
}

// Only run if this file is executed directly
if (require.main === module) {
	main().catch((error) => {
		console.error(error);
		process.exit(1);
	});
}

export { seedQuizCategories, seedSampleQuestions };
