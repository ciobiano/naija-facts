import { buttonVariants } from "@/components/ui/button";
import {
	MoveUpRightIcon,
	BookOpenIcon,
	PlayIcon,
	UsersIcon,
	CheckCircleIcon,
	StarIcon,
	TrendingUpIcon,
	ShieldCheckIcon,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function HomePage() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-naija-green-50/50 to-white dark:from-naija-green-950/20 dark:to-background">
			{/* Hero Section */}
			<section className="relative overflow-hidden">
				{/* Background Pattern */}
				<div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
				<div className="absolute top-0 right-0 w-96 h-96 bg-naija-green-100 rounded-full blur-3xl opacity-20 dark:bg-naija-green-900"></div>
				<div className="absolute bottom-0 left-0 w-80 h-80 bg-cultural-gold/10 rounded-full blur-3xl opacity-30"></div>

				<div className="content-section relative">
					<div className="max-w-4xl mx-auto text-center pt-20 pb-16 sm:pt-24 sm:pb-20 lg:pt-32 lg:pb-24">
						{/* Nigerian Flag Badge */}
						<div className="inline-flex items-center gap-3 px-4 py-2 mb-8 bg-white/80 dark:bg-black/20 backdrop-blur-sm rounded-full border border-naija-green-200 dark:border-naija-green-800 shadow-soft">
							<div className="w-6 h-4 nigeria-flag-pattern rounded-sm shadow-sm"></div>
							<span className="text-sm font-medium text-naija-green-700 dark:text-naija-green-300">
								Nigeria&apos;s Premier Educational Platform
							</span>
						</div>

						{/* Main Headline */}
						<h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight mb-6">
							<span className="text-naija-green-700 dark:text-naija-green-400">
								Master
							</span>{" "}
							<span className="bg-gradient-to-r from-naija-green-700 to-cultural-bronze bg-clip-text text-transparent">
								Nigerian Heritage
							</span>
							<br />
							<span className="text-foreground">Build Your Future</span>
						</h1>

						{/* Subheading */}
						<p className="text-lg sm:text-xl lg:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
							Interactive learning platform for Nigerian culture, history, and
							constitution.{" "}
							<span className="text-naija-green-700 dark:text-naija-green-400 font-medium">
								Join 10,000+ learners
							</span>{" "}
							exploring their heritage.
						</p>

						{/* Trust Indicators */}
						<div className="flex items-center justify-center gap-6 mb-10 text-sm text-muted-foreground">
							<div className="flex items-center gap-2">
								<CheckCircleIcon className="w-4 h-4 text-naija-green-600" />
								<span>Verified Content</span>
							</div>
							<div className="flex items-center gap-2">
								<StarIcon className="w-4 h-4 text-cultural-gold" />
								<span>4.9/5 Rating</span>
							</div>
							<div className="flex items-center gap-2">
								<ShieldCheckIcon className="w-4 h-4 text-naija-green-600" />
								<span>Secure & Private</span>
							</div>
						</div>

						{/* CTA Buttons */}
						<div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
							<Link
								href="/quiz"
								className={cn(
									buttonVariants({
										variant: "naija",
										size: "lg",
									}),
									"gap-2 font-semibold text-base px-8 py-4 h-12"
								)}
							>
								<PlayIcon className="w-5 h-5" />
								Start Learning Free
							</Link>
							<Link
								href="/docs"
								className={cn(
									buttonVariants({
										variant: "outline",
										size: "lg",
									}),
									"gap-2 font-semibold text-base px-8 py-4 h-12"
								)}
							>
								<BookOpenIcon className="w-5 h-5" />
								Explore Constitution
								<MoveUpRightIcon className="w-4 h-4" />
							</Link>
						</div>

						{/* Social Proof */}
						<div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
							<div className="text-center">
								<div className="text-2xl font-bold text-naija-green-700">
									50K+
								</div>
								<div>Quiz Attempts</div>
							</div>
							<div className="text-center">
								<div className="text-2xl font-bold text-naija-green-700">
									15+
								</div>
								<div>Chapters</div>
							</div>
							<div className="text-center">
								<div className="text-2xl font-bold text-naija-green-700">
									98%
								</div>
								<div>Success Rate</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section className="py-20 sm:py-24 lg:py-32 bg-white/50 dark:bg-black/5">
				<div className="content-section">
					{/* Section Header */}
					<div className="max-w-3xl mx-auto text-center mb-16">
						<h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
							Why Choose{" "}
							<span className="text-naija-green-700 dark:text-naija-green-400">
								Naija Facts?
							</span>
						</h2>
						<p className="text-lg sm:text-xl text-muted-foreground">
							Experience the most comprehensive and engaging way to learn about
							Nigeria
						</p>
					</div>

					{/* Features Grid */}
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
						{/* Feature 1 */}
						<div className="group">
							<div className="card-cultural p-8 h-full transition-all duration-300 hover:-translate-y-2">
								<div className="w-14 h-14 bg-naija-green-100 dark:bg-naija-green-900 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
									<BookOpenIcon className="w-7 h-7 text-naija-green-700 dark:text-naija-green-400" />
								</div>
								<h3 className="text-xl font-semibold mb-4 text-foreground">
									Constitutional Mastery
								</h3>
								<p className="text-muted-foreground leading-relaxed mb-6">
									Deep dive into Nigeria&apos;s constitution with interactive
									guides, real-world examples, and expert explanations.
								</p>
								<Link
									href="/docs"
									className="inline-flex items-center gap-2 text-naija-green-700 dark:text-naija-green-400 font-medium hover:gap-3 transition-all duration-200"
								>
									Explore Docs
									<MoveUpRightIcon className="w-4 h-4" />
								</Link>
							</div>
						</div>

						{/* Feature 2 */}
						<div className="group">
							<div className="card-cultural p-8 h-full transition-all duration-300 hover:-translate-y-2">
								<div className="w-14 h-14 bg-cultural-bronze/10 dark:bg-cultural-bronze/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
									<PlayIcon className="w-7 h-7 text-cultural-bronze" />
								</div>
								<h3 className="text-xl font-semibold mb-4 text-foreground">
									Adaptive Learning
								</h3>
								<p className="text-muted-foreground leading-relaxed mb-6">
									AI-powered quizzes that adapt to your learning pace. Track
									progress with detailed analytics and insights.
								</p>
								<Link
									href="/quiz"
									className="inline-flex items-center gap-2 text-naija-green-700 dark:text-naija-green-400 font-medium hover:gap-3 transition-all duration-200"
								>
									Start Quiz
									<MoveUpRightIcon className="w-4 h-4" />
								</Link>
							</div>
						</div>

						{/* Feature 3 */}
						<div className="group">
							<div className="card-cultural p-8 h-full transition-all duration-300 hover:-translate-y-2">
								<div className="w-14 h-14 bg-cultural-gold/10 dark:bg-cultural-gold/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
									<TrendingUpIcon className="w-7 h-7 text-cultural-gold" />
								</div>
								<h3 className="text-xl font-semibold mb-4 text-foreground">
									Progress Tracking
								</h3>
								<p className="text-muted-foreground leading-relaxed mb-6">
									Comprehensive dashboard to monitor your learning journey. Set
									goals, earn badges, and celebrate achievements.
								</p>
								<Link
									href="/profile"
									className="inline-flex items-center gap-2 text-naija-green-700 dark:text-naija-green-400 font-medium hover:gap-3 transition-all duration-200"
								>
									View Progress
									<MoveUpRightIcon className="w-4 h-4" />
								</Link>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Stats Section */}
			<section className="py-16 sm:py-20 lg:py-24 bg-naija-green-700 dark:bg-naija-green-800 text-white">
				<div className="content-section">
					<div className="max-w-4xl mx-auto text-center">
						<h2 className="text-3xl sm:text-4xl font-bold mb-4">
							Trusted by Thousands of Nigerians
						</h2>
						<p className="text-xl opacity-90 mb-12">
							Join a community passionate about Nigerian heritage and civic
							knowledge
						</p>

						<div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
							<div className="text-center">
								<div className="text-4xl sm:text-5xl font-bold mb-2">50K+</div>
								<div className="text-lg opacity-80">Active Learners</div>
							</div>
							<div className="text-center">
								<div className="text-4xl sm:text-5xl font-bold mb-2">500K+</div>
								<div className="text-lg opacity-80">Questions Answered</div>
							</div>
							<div className="text-center">
								<div className="text-4xl sm:text-5xl font-bold mb-2">15+</div>
								<div className="text-lg opacity-80">Learning Chapters</div>
							</div>
							<div className="text-center">
								<div className="text-4xl sm:text-5xl font-bold mb-2">98%</div>
								<div className="text-lg opacity-80">Satisfaction Rate</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-r from-naija-green-50 to-cultural-bronze/5 dark:from-naija-green-950/20 dark:to-cultural-bronze/5">
				<div className="content-section">
					<div className="max-w-3xl mx-auto text-center">
						<h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
							Ready to Begin Your{" "}
							<span className="text-naija-green-700 dark:text-naija-green-400">
								Learning Journey?
							</span>
						</h2>
						<p className="text-lg sm:text-xl text-muted-foreground mb-8">
							Join thousands of Nigerians mastering their heritage. Start with
							our constitutional fundamentals or dive into cultural history.
						</p>
						<div className="flex flex-col sm:flex-row items-center justify-center gap-4">
							<Link
								href="/quiz"
								className={cn(
									buttonVariants({
										variant: "naija",
										size: "lg",
									}),
									"gap-2 font-semibold text-base px-8 py-4 h-12"
								)}
							>
								<PlayIcon className="w-5 h-5" />
								Start Free Trial
							</Link>
							<Link
								href="/docs"
								className={cn(
									buttonVariants({
										variant: "outline",
										size: "lg",
									}),
									"gap-2 font-semibold text-base px-8 py-4 h-12"
								)}
							>
								<UsersIcon className="w-5 h-5" />
								Join Community
							</Link>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
}
