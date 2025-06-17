"use client";

import { useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { motion, useMotionValue } from "framer-motion";
import {
	ArrowRight,
	BookOpen,
	Brain,
	Trophy,
	Users,
	Sparkles,
	Globe,
	Star,
	TrendingUp,
	Calendar,
	Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";

import { FeatureCard } from "@/components/ui/sections/home/feature-card";
import { StatCard } from "@/components/ui/sections/home/stat-card";
import { FloatingPanel } from "@/components/ui/sections/home/floating-panel";

export default function ModernLanding() {
	const mouseX = useMotionValue(0);
	const mouseY = useMotionValue(0);

	// Throttle mouse movement for better performance
	const throttledMouseMove = useCallback(
		(event: MouseEvent) => {
			mouseX.set(event.clientX);
			mouseY.set(event.clientY);
		},
		[mouseX, mouseY]
	);
	

	useEffect(() => {
		window.addEventListener("mousemove", throttledMouseMove, { passive: true });
		return () => window.removeEventListener("mousemove", throttledMouseMove);
	}, [throttledMouseMove]);

	// Memoize animation variants for better performance
	const fadeInUp = useMemo(
		() => ({
			initial: { opacity: 0, y: 20 },
			animate: { opacity: 1, y: 0 },
		}),
		[]
	);

	const scaleIn = useMemo(
		() => ({
			initial: { opacity: 0, scale: 0.9 },
			animate: { opacity: 1, scale: 1 },
		}),
		[]
	);

	return (
		<main className="relative overflow-visible gap-10">
			<div className="relative z-10">
				<section className="container mx-auto px-4 py-16 flex flex-col justify-center">
					<div className="flex flex-col items-center text-center space-y-8">
						{/* Hero Badge */}
						<motion.div
							{...fadeInUp}
							transition={{ duration: 0.6 }}
							className="inline-flex items-center rounded-full border backdrop-blur-md px-4 py-2 text-sm border-naija-green-200/60 bg-naija-green-50/80 text-naija-green-700 dark:border-naija-green-700/30 dark:bg-naija-green-950/40 dark:text-naija-green-300"
							style={{ willChange: "transform" }}
						>
							<motion.span
								className="mr-2 h-2 w-2 rounded-full bg-naija-green-600 dark:bg-naija-green-400"
								animate={{ opacity: [1, 0.3, 1] }}
								transition={{
									duration: 2,
									repeat: Infinity,
									ease: "easeInOut",
								}}
							/>
							🌍 Discover Nigeria&apos;s Rich Heritage
						</motion.div>

						{/* Main Headline */}
						<motion.div
							initial={{ opacity: 0, y: 30 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.8, delay: 0.2 }}
							className="space-y-8"
							style={{ willChange: "transform" }}
						>
							<h1 className="text-3xl lg:text-4xl xl:text-6xl font-bold tracking-tight leading-[0.9] max-w-6xl text-gray-900 dark:text-white">
								<span>The free, fun way</span>
								<br />
								<span>learn about Naija</span>
							</h1>

							<p className="text-xl lg:text-xl max-w-3xl mx-auto leading-relaxed text-gray-600 dark:text-gray-300">
								Immerse yourself in Nigeria&apos;s diverse cultures through
								<span className="border-b-2 border-naija-green-500 dark:border-naija-green-400">
									{" "}
									interactive quizzes
								</span>
								,<span className="font-semibold"> stunning visuals</span>, and
								<span className="font-semibold"> fascinating facts</span>.
							</p>
						</motion.div>

						{/* CTA Buttons */}
						<motion.div
							{...fadeInUp}
							transition={{ duration: 0.6, delay: 0.6 }}
							className="flex flex-wrap gap-4 justify-center mt-10"
							style={{ willChange: "transform" }}
						>
							<Button
								variant="outline"
								size="lg"
								asChild
								className="group relative overflow-hidden shadow-2xl rounded-2xl transition-all duration-300 hover:shadow-naija-green-500/20 bg-naija-green-600 hover:bg-naija-green-700 text-white border-naija-green-600 dark:hover:shadow-naija-green-500/25 transform-gpu"
							>
								<Link href="/quiz">
									<span className="relative z-10">Start Quiz Challenge</span>
									<ArrowRight className="ml-2 size-5 group-hover:translate-x-1 transition-transform duration-300" />
								</Link>
							</Button>

							<Button
								variant="ghost"
								size="lg"
								asChild
								className="group backdrop-blur-md shadow-xl rounded-2xl transition-all duration-300 bg-white/80 border-gray-200/60 text-gray-900 hover:bg-white/90 dark:bg-white/10 dark:border-white/20 dark:text-white dark:hover:bg-white/20 transform-gpu"
							>
								<Link href="/cultural-content">
									<Sparkles className="mr-2 size-5" />
									Explore Culture
									<ArrowRight className="ml-2 size-5 group-hover:translate-x-1 transition-transform duration-300" />
								</Link>
							</Button>
						</motion.div>

						{/* Glassmorphic Feature Showcase */}
						<motion.div
							{...scaleIn}
							transition={{ duration: 0.8, delay: 0.8 }}
							className="relative w-full max-w-7xl mx-auto mt-10"
							style={{ willChange: "transform" }}
						>
							{/* Central Main Panel */}
							<div className="relative group cursor-pointer mt-28">
								<motion.div
									className="relative rounded-3xl overflow-hidden backdrop-blur-2xl shadow-2xl bg-gradient-to-br from-white/70 to-white/50 border border-gray-200/50 dark:from-white/10 dark:to-white/5 dark:border-white/20 transform-gpu"
									whileHover={{ scale: 1.02 }}
									transition={{ type: "spring", stiffness: 300, damping: 30 }}
								>
									<div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500 from-naija-green-500/10 via-transparent to-cultural-gold/10 dark:from-naija-green-500/20 dark:via-transparent dark:to-cultural-gold/20" />

									<div className="relative p-8 lg:p-12">
										<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
											<div className="space-y-6">
												<div className="flex items-center space-x-3">
													<div className="p-2 rounded-full backdrop-blur-sm bg-naija-green-100/80 dark:bg-naija-green-500/20">
														<Globe className="size-6 text-naija-green-600 dark:text-naija-green-400" />
													</div>
													<span className="font-semibold text-lg text-naija-green-700 dark:text-naija-green-400">
														Featured Experience
													</span>
												</div>

												<h3 className="text-3xl lg:text-4xl font-bold leading-tight text-gray-900 dark:text-white">
													Interactive Cultural Journey
												</h3>

												<p className="text-lg leading-relaxed text-gray-600 dark:text-gray-300">
													Embark on a comprehensive exploration of
													Nigeria&apos;s 36 states, 250+ ethnic groups, and
													centuries of rich history through our gamified
													learning platform.
												</p>

												<div className="flex items-center space-x-6 text-sm">
													<div className="flex items-center space-x-2">
														<Users className="size-4 text-naija-green-600 dark:text-naija-green-400" />
														<span className="text-gray-600 dark:text-gray-300">
															10K+ Learners
														</span>
													</div>
													<div className="flex items-center space-x-2">
														<Star className="size-4 text-cultural-gold" />
														<span className="text-gray-600 dark:text-gray-300">
															4.9 Rating
														</span>
													</div>
												</div>
											</div>

											<div className="relative">
												<motion.div
													className="aspect-video rounded-2xl overflow-hidden shadow-xl relative transform-gpu"
													whileHover={{ scale: 1.05 }}
													transition={{ duration: 0.2 }}
												>
													<div className="w-full h-full bg-gradient-to-br from-naija-green-100/80 to-cultural-gold/30 dark:from-naija-green-900/50 dark:to-cultural-gold/20 flex items-center justify-center">
														<div className="text-center">
															<Globe className="size-12 mx-auto mb-4 text-naija-green-600 dark:text-naija-green-400" />
															<p className="text-lg font-semibold text-gray-900 dark:text-white">
																Nigerian Cultural Showcase
															</p>
															<p className="text-sm mt-2 text-gray-600 dark:text-gray-300">
																Interactive Experience Preview
															</p>
														</div>
													</div>
													<div className="absolute inset-0 bg-gradient-to-t from-gray-900/20 via-transparent to-transparent dark:from-black/50 dark:via-transparent dark:to-transparent" />

													<motion.div
														className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
														whileHover={{ scale: 1.1 }}
														transition={{ duration: 0.2 }}
													>
														<div className="p-4 rounded-full backdrop-blur-md bg-white/60 dark:bg-white/20">
															<Play className="size-8 text-gray-800 dark:text-white" />
														</div>
													</motion.div>
												</motion.div>
											</div>
										</div>
									</div>
								</motion.div>
							</div>

							{/* Floating Glass Panels - Only show on larger screens to reduce complexity */}
							<div className="hidden xl:block">
								<FloatingPanel
									title="Quiz Performance"
									metric="87%"
									description="Average Score"
									icon={
										<Brain className="size-6 z-50 text-naija-green-600 dark:text-naija-green-400" />
									}
									position={{ top: "15%", right: "-8%" }}
									mouseX={mouseX}
									mouseY={mouseY}
									delay={1.2}
									gradient="from-naija-green-500/10 to-naija-green-600/5 dark:from-naija-green-500/20 dark:to-naija-green-600/10"
								/>

								<FloatingPanel
									title="Cultural Facts"
									metric="500+"
									description="Discoveries Made"
									icon={<BookOpen className="size-6 text-cultural-gold" />}
									position={{ bottom: "40%", left: "-12%" }}
									mouseX={mouseX}
									mouseY={mouseY}
									delay={1.4}
									gradient="from-cultural-gold/10 to-cultural-bronze/5 dark:from-cultural-gold/20 dark:to-cultural-bronze/10"
								/>

								<FloatingPanel
									title="Learning Streak"
									metric="12 Days"
									description="Current Streak"
									icon={<Trophy className="size-6 text-cultural-gold" />}
									position={{ top: "60%", right: "-10%" }}
									mouseX={mouseX}
									mouseY={mouseY}
									delay={1.6}
									gradient="from-cultural-indigo/10 to-naija-green-500/5 dark:from-cultural-indigo/20 dark:to-naija-green-500/10"
								/>

								<FloatingPanel
									title="Progress Track"
									metric="94%"
									description="Completion Rate"
									icon={
										<TrendingUp className="size-6 text-naija-green-600 dark:text-naija-green-300" />
									}
									position={{ bottom: "-20%", left: "20%" }}
									mouseX={mouseX}
									mouseY={mouseY}
									delay={1.8}
									gradient="from-cultural-terracotta/10 to-cultural-gold/5 dark:from-cultural-terracotta/20 dark:to-cultural-gold/10"
								/>
							</div>
						</motion.div>

						{/* Feature Cards */}
						<div className="mt-10">
							<motion.div
								initial={{ opacity: 0, y: 30 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.6, delay: 1.2 }}
								className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl mx-auto mt-40"
								style={{ willChange: "transform" }}
							>
								<FeatureCard
									title="Interactive Quizzes"
									description="Test your knowledge of Nigerian culture, history, and traditions through engaging quizzes."
									icon={<Trophy className="size-6 text-cultural-gold" />}
									gradient="from-cultural-gold/10 to-naija-green-500/5 dark:from-cultural-gold/20 dark:to-naija-green-500/10"
								/>
								<FeatureCard
									title="Cultural Insights"
									description="Discover the rich diversity of Nigerian ethnic groups, languages, and cultural practices."
									icon={
										<BookOpen className="size-6 text-naija-green-600 dark:text-naija-green-400" />
									}
									gradient="from-naija-green-500/10 to-cultural-indigo/5 dark:from-naija-green-500/20 dark:to-cultural-indigo/10"
								/>
								<FeatureCard
									title="Historical Facts"
									description="Explore Nigeria's fascinating history from ancient kingdoms to modern times."
									icon={
										<Calendar className="size-6 text-cultural-terracotta" />
									}
									gradient="from-cultural-terracotta/10 to-cultural-gold/5 dark:from-cultural-terracotta/20 dark:to-cultural-gold/10"
								/>
							</motion.div>
						</div>

						{/* Stats Row */}
						<motion.div
							initial={{ opacity: 0, y: 30 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 1.4 }}
							className="grid grid-cols-2 lg:grid-cols-4 gap-8 w-full max-w-4xl mx-auto mt-16"
							style={{ willChange: "transform" }}
						>
							<StatCard number="36" label="States Covered" />
							<StatCard number="250+" label="Ethnic Groups" />
							<StatCard number="500+" label="Quiz Questions" />
							<StatCard number="50+" label="Cultural Facts" />
						</motion.div>
					</div>
				</section>
			</div>
		</main>
	);
}


