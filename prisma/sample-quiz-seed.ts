import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedQuizCategories() {
	console.log("🌱 Seeding quiz categories...");

	// Comprehensive Nigerian Educational Categories (aligned with PRD)
	const categories = [
		{
			name: "Nigerian History",
			description:
				"Learn about Nigeria's rich historical heritage from pre-colonial times to modern day",
			slug: "history",
			icon: "🏛️",
			color: "bg-blue-500",
			sort_order: 1,
		},
		{
			name: "Culture & Traditions",
			description:
				"Explore Nigerian cultural diversity, festivals, traditions, and customs",
			slug: "culture",
			icon: "🎭",
			color: "bg-green-500",
			sort_order: 2,
		},
		{
			name: "Geography",
			description:
				"Discover Nigeria's geographical features, states, and landmarks",
			slug: "geography",
			icon: "🗺️",
			color: "bg-yellow-500",
			sort_order: 3,
		},
		{
			name: "Languages",
			description:
				"Learn about Nigeria's linguistic diversity and major languages",
			slug: "languages",
			icon: "🗣️",
			color: "bg-red-500",
			sort_order: 4,
		},
		{
			name: "Economy",
			description:
				"Understanding Nigeria's economic landscape, resources, and development",
			slug: "economy",
			icon: "💰",
			color: "bg-purple-500",
			sort_order: 5,
		},
		{
			name: "Constitution & Government",
			description:
				"Nigerian Constitution, government structure, and civic education",
			slug: "constitution",
			icon: "⚖️",
			color: "bg-indigo-500",
			sort_order: 6,
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

	// Get all categories
	const categories = await prisma.category.findMany({
		orderBy: { sort_order: "asc" },
	});

	// Sample questions for each category
	const questionsByCategory = {
		history: [
			{
				question_text: "Who was the first President of Nigeria?",
				question_type: "multiple_choice" as const,
				difficulty_level: "beginner" as const,
				points: 10,
				explanation:
					"Dr. Nnamdi Azikiwe was Nigeria's first President from 1963 to 1966.",
				answers: [
					{ text: "Dr. Nnamdi Azikiwe", isCorrect: true },
					{ text: "Alhaji Abubakar Tafawa Balewa", isCorrect: false },
					{ text: "Chief Obafemi Awolowo", isCorrect: false },
					{ text: "Sir Ahmadu Bello", isCorrect: false },
				],
			},
			{
				question_text:
					"Nigeria gained independence from Britain in 1960. True or False?",
				question_type: "true_false" as const,
				difficulty_level: "beginner" as const,
				points: 10,
				explanation:
					"Nigeria gained independence from Britain on October 1, 1960.",
				answers: [
					{ text: "True", isCorrect: true },
					{ text: "False", isCorrect: false },
				],
			},
		],
		culture: [
			{
				question_text:
					"Which festival is celebrated by the Yoruba people to welcome the New Year?",
				question_type: "multiple_choice" as const,
				difficulty_level: "intermediate" as const,
				points: 15,
				explanation:
					"Eyo Festival is a traditional Yoruba festival celebrated in Lagos.",
				answers: [
					{ text: "Eyo Festival", isCorrect: true },
					{ text: "New Yam Festival", isCorrect: false },
					{ text: "Durbar Festival", isCorrect: false },
					{ text: "Argungu Fishing Festival", isCorrect: false },
				],
			},
		],
		geography: [
			{
				question_text: "What is the capital city of Nigeria?",
				question_type: "multiple_choice" as const,
				difficulty_level: "beginner" as const,
				points: 10,
				explanation:
					"Abuja has been the capital of Nigeria since 1991, replacing Lagos.",
				answers: [
					{ text: "Lagos", isCorrect: false },
					{ text: "Abuja", isCorrect: true },
					{ text: "Kano", isCorrect: false },
					{ text: "Port Harcourt", isCorrect: false },
				],
			},
			{
				question_text: "Nigeria has 36 states. True or False?",
				question_type: "true_false" as const,
				difficulty_level: "beginner" as const,
				points: 10,
				explanation:
					"Nigeria consists of 36 states and the Federal Capital Territory (FCT).",
				answers: [
					{ text: "True", isCorrect: true },
					{ text: "False", isCorrect: false },
				],
			},
		],
		languages: [
			{
				question_text:
					"Which of these is NOT one of Nigeria's major indigenous languages?",
				question_type: "multiple_choice" as const,
				difficulty_level: "intermediate" as const,
				points: 15,
				explanation:
					"Swahili is an East African language. Nigeria's major languages are Hausa, Yoruba, and Igbo.",
				answers: [
					{ text: "Hausa", isCorrect: false },
					{ text: "Yoruba", isCorrect: false },
					{ text: "Igbo", isCorrect: false },
					{ text: "Swahili", isCorrect: true },
				],
			},
		],
		economy: [
			{
				question_text: "What is Nigeria's primary export commodity?",
				question_type: "multiple_choice" as const,
				difficulty_level: "intermediate" as const,
				points: 15,
				explanation:
					"Nigeria is Africa's largest oil producer and relies heavily on crude oil exports.",
				answers: [
					{ text: "Cocoa", isCorrect: false },
					{ text: "Crude Oil", isCorrect: true },
					{ text: "Cassava", isCorrect: false },
					{ text: "Palm Oil", isCorrect: false },
				],
			},
		],
		constitution: [
			{
				question_text:
					"What is the official name of Nigeria according to the Constitution?",
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
					"The sovereignty of Nigeria belongs to the people. True or False?",
				question_type: "true_false" as const,
				difficulty_level: "beginner" as const,
				points: 10,
				explanation:
					"Section 14(2)(a) of the Constitution states that sovereignty belongs to the people of Nigeria.",
				answers: [
					{ text: "True", isCorrect: true },
					{ text: "False", isCorrect: false },
				],
			},
		],
	};

	// Create questions for each category
	for (const category of categories) {
		const questions =
			questionsByCategory[category.slug as keyof typeof questionsByCategory];

		if (!questions) {
			console.log(
				`⏭️ No sample questions defined for category: ${category.name}`
			);
			continue;
		}

		for (let i = 0; i < questions.length; i++) {
			const questionData = questions[i];

			try {
				const question = await prisma.quizQuestion.create({
					data: {
						category_id: category.id,
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
					`✅ Created question for ${
						category.name
					}: ${questionData.question_text.substring(0, 50)}...`
				);
			} catch (error) {
				console.error(
					`❌ Error creating question for ${category.name}:`,
					error
				);
			}
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
if (import.meta.url === `file://${process.argv[1]}`) {
	main().catch((error) => {
		console.error(error);
		process.exit(1);
	});
}

export { seedQuizCategories, seedSampleQuestions };
