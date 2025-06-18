	"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, BookOpen, Trophy, Users, ArrowRight } from "lucide-react";
import { LoadingState } from "@/components/ui/states";

export default function WelcomePage() {
	const { data: session, status } = useSession();
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		if (status === "loading") return;

		if (!session) {
			router.push("/auth/signin");
			return;
		}

		setIsLoading(false);
	}, [session, status, router]);

	const handleGetStarted = () => {
		router.push("/");
	};

	const handleTakeQuiz = () => {
		router.push("/quiz");
	};

	const handleExploreContent = () => {
		router.push("/docs");
	};

	if (isLoading) {
		return (
			<LoadingState
				title="Setting up your account"
				description="Please wait while we prepare your dashboard..."
				size="md"
				
			/>
		);
	}

	return (
		<div className="min-h-screen ">
			<div className="container mx-auto px-4 py-12">
				<div className="max-w-4xl mx-auto">
					{/* Welcome Header */}
					<div className="text-center mb-12">
						<div className="flex justify-center mb-6">
							<CheckCircle className="h-16 w-16 text-green-500" />
						</div>
						<h1 className="text-4xl font-bold mb-4">
							Welcome to Naija Facts,{" "}
							{session?.user?.name?.split(" ")[0] || "Explorer"}! 🇳🇬
						</h1>
						<p className="text-xl text-muted-foreground mb-6">
							Your journey to discover Nigeria&apos;s rich culture, history, and
							heritage starts here.
						</p>
						<Badge variant="secondary" className="text-lg px-4 py-2">
							Account Created Successfully
						</Badge>
					</div>

					{/* Feature Cards */}
					<div className="grid md:grid-cols-3 gap-6 mb-12">
						<Card className="text-center hover:shadow-lg transition-shadow">
							<CardHeader>
								<BookOpen className="h-12 w-12 text-blue-500 mx-auto mb-4" />
								<CardTitle>Learn & Explore</CardTitle>
								<CardDescription>
									Discover fascinating facts about Nigeria&apos;s diverse culture,
									history, and traditions
								</CardDescription>
							</CardHeader>
							<CardContent>
								<Button
									variant="outline"
									onClick={handleExploreContent}
									className="w-full"
								>
									Start Learning
								</Button>
							</CardContent>
						</Card>

						<Card className="text-center hover:shadow-lg transition-shadow">
							<CardHeader>
								<Trophy className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
								<CardTitle>Take Quizzes</CardTitle>
								<CardDescription>
									Test your knowledge with interactive quizzes and earn
									achievements
								</CardDescription>
							</CardHeader>
							<CardContent>
								<Button
									variant="outline"
									onClick={handleTakeQuiz}
									className="w-full"
								>
									Start Quiz
								</Button>
							</CardContent>
						</Card>

						<Card className="text-center hover:shadow-lg transition-shadow">
							<CardHeader>
								<Users className="h-12 w-12 text-green-500 mx-auto mb-4" />
								<CardTitle>Join Community</CardTitle>
								<CardDescription>
									Connect with other learners and share your cultural knowledge
								</CardDescription>
							</CardHeader>
							<CardContent>
								<Button variant="outline" className="w-full">
									Coming Soon
								</Button>
							</CardContent>
						</Card>
					</div>

					{/* Getting Started Section */}
					<Card className="mb-8">
						<CardHeader>
							<CardTitle className="text-2xl">🚀 Getting Started</CardTitle>
							<CardDescription>
									Here&apos;s what you can do to make the most of your Naija Facts
								experience:
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								<div className="flex items-start space-x-3">
									<div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
										1
									</div>
									<div>
										<h4 className="font-semibold">Complete Your Profile</h4>
										<p className="text-muted-foreground">
											Add your preferences and customize your learning
											experience
										</p>
									</div>
								</div>
								<div className="flex items-start space-x-3">
									<div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
										2
									</div>
									<div>
										<h4 className="font-semibold">Explore Nigerian Culture</h4>
										<p className="text-muted-foreground">
											Browse through our comprehensive collection of cultural
											content
										</p>
									</div>
								</div>
								<div className="flex items-start space-x-3">
									<div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
										3
									</div>
									<div>
										<h4 className="font-semibold">Take Your First Quiz</h4>
										<p className="text-muted-foreground">
											Test your knowledge and start earning achievements
										</p>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Action Buttons */}
					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						<Button
							onClick={handleGetStarted}
							size="lg"
							className="text-lg px-8"
						>
							Explore Naija Facts
							<ArrowRight className="ml-2 h-5 w-5" />
						</Button>
						<Button
							onClick={handleTakeQuiz}
							variant="outline"
							size="lg"
							className="text-lg px-8"
						>
							Take a Quiz
						</Button>
					</div>

					{/* Fun Fact */}
					<div className="mt-12 text-center">
						<Card className="bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/20 dark:to-blue-900/20 border-none">
							<CardContent className="pt-6">
								<h3 className="text-lg font-semibold mb-2">🌟 Did You Know?</h3>
								<p className="text-muted-foreground">
									Nigeria is home to over 250 ethnic groups and more than 500
									languages, making it one of the most culturally diverse
									countries in the world!
								</p>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
}
