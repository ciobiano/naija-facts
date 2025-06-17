"use client";

import { useEffect } from "react";
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
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { FloatingPanel } from "@/components/ui/sections/home/floating-panel";
import { FeatureCard } from "@/components/ui/sections/home/feature-card";
import { StatCard } from "@/components/ui/sections/home/stat-card";

export default function ModernLanding() {
	const mouseX = useMotionValue(0);
	const mouseY = useMotionValue(0);
	const { theme, systemTheme } = useTheme();

	// Determine if we're in dark mode
	const isDark =
		theme === "dark" || (theme === "system" && systemTheme === "dark");

	useEffect(() => {
		const handleMouseMove = (event: MouseEvent) => {
			mouseX.set(event.clientX);
			mouseY.set(event.clientY);
		};

		window.addEventListener("mousemove", handleMouseMove);
		return () => window.removeEventListener("mousemove", handleMouseMove);
	}, [mouseX, mouseY]);

	return (
		<main className="relative overflow-visible gap-10">
			<div className="relative z-10">
				<section className="container mx-auto px-4 py-16 flex flex-col justify-center">
					<div className="flex flex-col items-center text-center space-y-8">
						{/* Hero Badge */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6 }}
							className={cn(
								"inline-flex items-center rounded-full border backdrop-blur-md px-4 py-2 text-sm",
								isDark
									? "border-naija-green-700/30 bg-naija-green-950/40 text-naija-green-300"
									: "border-naija-green-200/60 bg-naija-green-50/80 text-naija-green-700"
							)}
						>
							<motion.span
								className={cn(
									"mr-2 h-2 w-2 rounded-full",
									isDark ? "bg-naija-green-400" : "bg-naija-green-600"
								)}
								animate={{ opacity: [1, 0.3, 1] }}
								transition={{ duration: 2, repeat: Infinity }}
							/>
							🌍 Discover Nigeria&apos;s Rich Heritage
						</motion.div>

						{/* Main Headline */}
						<motion.div
							initial={{ opacity: 0, y: 30 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.8, delay: 0.2 }}
							className="space-y-8"
						>
							<h1
								className={cn(
									"text-3xl lg:text-4xl xl:text-6xl font-bold tracking-tight leading-[0.9] max-w-6xl",
									isDark ? "text-white" : "text-gray-900"
								)}
							>
								<span>The free, fun way</span>
								<br />
								<span>learn about Naija</span>
							</h1>

							<p
								className={cn(
									"text-xl lg:text-xl max-w-3xl mx-auto leading-relaxed",
									isDark ? "text-gray-300" : "text-gray-600"
								)}
							>
								Immerse yourself in Nigeria&apos;s diverse cultures through
								<span
									className={cn(
										"border-b-2",
										isDark ? "border-naija-green-400" : "border-naija-green-500"
									)}
								>
									{" "}
									interactive quizzes
								</span>
								,<span className="font-semibold"> stunning visuals</span>, and
								<span className="font-semibold"> fascinating facts</span>.
							</p>
						</motion.div>

						{/* CTA Buttons */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.6 }}
							className="flex flex-wrap gap-4 justify-center mt-10"
						>
							<Button
								variant="outline"
								size="lg"
								asChild
								className={cn(
									"group relative overflow-hidden shadow-2xl rounded-2xl transition-all duration-300",
									isDark
										? "hover:shadow-naija-green-500/25"
										: "hover:shadow-naija-green-500/20 bg-naija-green-600 hover:bg-naija-green-700 text-white border-naija-green-600"
								)}
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
								className={cn(
									"group backdrop-blur-md shadow-xl rounded-2xl transition-all duration-300",
									isDark
										? "bg-white/10 border-white/20 text-white hover:bg-white/20"
										: "bg-white/80 border-gray-200/60 text-gray-900 hover:bg-white/90"
								)}
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
							initial={{ opacity: 0, scale: 0.9 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ duration: 0.8, delay: 0.8 }}
							className="relative w-full max-w-7xl mx-auto mt-10"
						>
							{/* Central Main Panel */}
							<div className="relative group cursor-pointer mt-28">
								<motion.div
									className={cn(
										"relative rounded-3xl overflow-hidden backdrop-blur-2xl shadow-2xl",
										isDark
											? "bg-gradient-to-br from-white/10 to-white/5 border border-white/20"
											: "bg-gradient-to-br from-white/70 to-white/50 border border-gray-200/50"
									)}
									whileHover={{ scale: 1.02 }}
									transition={{ type: "spring", stiffness: 300, damping: 30 }}
								>
									<div
										className={cn(
											"absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500",
											isDark
												? "from-naija-green-500/20 via-transparent to-cultural-gold/20"
												: "from-naija-green-500/10 via-transparent to-cultural-gold/10"
										)}
									/>

									<div className="relative p-8 lg:p-12">
										<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
											<div className="space-y-6">
												<div className="flex items-center space-x-3">
													<div
														className={cn(
															"p-2 rounded-full backdrop-blur-sm",
															isDark
																? "bg-naija-green-500/20"
																: "bg-naija-green-100/80"
														)}
													>
														<Globe
															className={cn(
																"size-6",
																isDark
																	? "text-naija-green-400"
																	: "text-naija-green-600"
															)}
														/>
													</div>
													<span
														className={cn(
															"font-semibold text-lg",
															isDark
																? "text-naija-green-400"
																: "text-naija-green-700"
														)}
													>
														Featured Experience
													</span>
												</div>

												<h3
													className={cn(
														"text-3xl lg:text-4xl font-bold leading-tight",
														isDark ? "text-white" : "text-gray-900"
													)}
												>
													Interactive Cultural Journey
												</h3>

												<p
													className={cn(
														"text-lg leading-relaxed",
														isDark ? "text-gray-300" : "text-gray-600"
													)}
												>
													Embark on a comprehensive exploration of
													Nigeria&apos;s 36 states, 250+ ethnic groups, and
													centuries of rich history through our gamified
													learning platform.
												</p>

												<div className="flex items-center space-x-6 text-sm">
													<div className="flex items-center space-x-2">
														<Users
															className={cn(
																"size-4",
																isDark
																	? "text-naija-green-400"
																	: "text-naija-green-600"
															)}
														/>
														<span
															className={cn(
																isDark ? "text-gray-300" : "text-gray-600"
															)}
														>
															10K+ Learners
														</span>
													</div>
													<div className="flex items-center space-x-2">
														<Star className="size-4 text-cultural-gold" />
														<span
															className={cn(
																isDark ? "text-gray-300" : "text-gray-600"
															)}
														>
															4.9 Rating
														</span>
													</div>
												</div>
											</div>

											<div className="relative">
												<motion.div
													className="aspect-video rounded-2xl overflow-hidden shadow-xl relative"
													whileHover={{ scale: 1.05 }}
												>
													<div
														className={cn(
															"w-full h-full bg-gradient-to-br flex items-center justify-center",
															isDark
																? "from-naija-green-900/50 to-cultural-gold/20"
																: "from-naija-green-100/80 to-cultural-gold/30"
														)}
													>
														<div className="text-center">
															<Globe
																className={cn(
																	"size-12 mx-auto mb-4",
																	isDark
																		? "text-naija-green-400"
																		: "text-naija-green-600"
																)}
															/>
															<p
																className={cn(
																	"text-lg font-semibold",
																	isDark ? "text-white" : "text-gray-900"
																)}
															>
																Nigerian Cultural Showcase
															</p>
															<p
																className={cn(
																	"text-sm mt-2",
																	isDark ? "text-gray-300" : "text-gray-600"
																)}
															>
																Interactive Experience Preview
															</p>
														</div>
													</div>
													<div
														className={cn(
															"absolute inset-0",
															isDark
																? "bg-gradient-to-t from-black/50 via-transparent to-transparent"
																: "bg-gradient-to-t from-gray-900/20 via-transparent to-transparent"
														)}
													/>

													<motion.div
														className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
														whileHover={{ scale: 1.1 }}
													>
														<div
															className={cn(
																"p-4 rounded-full backdrop-blur-md",
																isDark ? "bg-white/20" : "bg-white/60"
															)}
														>
															<Play
																className={cn(
																	"size-8",
																	isDark ? "text-white" : "text-gray-800"
																)}
															/>
														</div>
													</motion.div>
												</motion.div>
											</div>
										</div>
									</div>
								</motion.div>
							</div>

							{/* Floating Glass Panels */}
							<FloatingPanel
								title="Quiz Performance"
								metric="87%"
								description="Average Score"
								icon={
									<Brain
										className={cn(
											"size-6 z-50",
											isDark ? "text-naija-green-400" : "text-naija-green-600"
										)}
									/>
								}
								position={{ top: "15%", right: "-8%" }}
								mouseX={mouseX}
								mouseY={mouseY}
								delay={1.2}
								gradient={
									isDark
										? "from-naija-green-500/20 to-naija-green-600/10"
										: "from-naija-green-500/10 to-naija-green-600/5"
								}
								isDark={isDark}
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
								gradient={
									isDark
										? "from-cultural-gold/20 to-cultural-bronze/10"
										: "from-cultural-gold/10 to-cultural-bronze/5"
								}
								isDark={isDark}
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
								gradient={
									isDark
										? "from-cultural-indigo/20 to-naija-green-500/10"
										: "from-cultural-indigo/10 to-naija-green-500/5"
								}
								isDark={isDark}
							/>

							<FloatingPanel
								title="Progress Track"
								metric="94%"
								description="Completion Rate"
								icon={
									<TrendingUp
										className={cn(
											"size-6",
											isDark ? "text-naija-green-300" : "text-naija-green-600"
										)}
									/>
								}
								position={{ bottom: "-20%", left: "20%" }}
								mouseX={mouseX}
								mouseY={mouseY}
								delay={1.8}
								gradient={
									isDark
										? "from-cultural-terracotta/20 to-cultural-gold/10"
										: "from-cultural-terracotta/10 to-cultural-gold/5"
								}
								isDark={isDark}
							/>
						</motion.div>

						{/* Feature Cards */}
						<div className="mt-10">
							<motion.div
								initial={{ opacity: 0, y: 30 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.6, delay: 1.2 }}
								className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl mx-auto mt-40"
							>
								<FeatureCard
									title="Interactive Quizzes"
									description="Test your knowledge of Nigerian culture, history, and traditions through engaging quizzes."
									icon={<Trophy className="size-6 text-cultural-gold" />}
									gradient={
										isDark
											? "from-cultural-gold/20 to-naija-green-500/10"
											: "from-cultural-gold/10 to-naija-green-500/5"
									}
									isDark={isDark}
								/>
								<FeatureCard
									title="Cultural Insights"
									description="Discover the rich diversity of Nigerian ethnic groups, languages, and cultural practices."
									icon={
										<BookOpen
											className={cn(
												"size-6",
												isDark ? "text-naija-green-400" : "text-naija-green-600"
											)}
										/>
									}
									gradient={
										isDark
											? "from-naija-green-500/20 to-cultural-indigo/10"
											: "from-naija-green-500/10 to-cultural-indigo/5"
									}
									isDark={isDark}
								/>
								<FeatureCard
									title="Historical Facts"
									description="Explore Nigeria's fascinating history from ancient kingdoms to modern times."
									icon={
										<Calendar className="size-6 text-cultural-terracotta" />
									}
									gradient={
										isDark
											? "from-cultural-terracotta/20 to-cultural-gold/10"
											: "from-cultural-terracotta/10 to-cultural-gold/5"
									}
									isDark={isDark}
								/>
							</motion.div>
						</div>

						{/* Stats Row */}
						<motion.div
							initial={{ opacity: 0, y: 30 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 1.4 }}
							className="grid grid-cols-2 lg:grid-cols-4 gap-8 w-full max-w-4xl mx-auto mt-16"
						>
							<StatCard number="36" label="States Covered" isDark={isDark} />
							<StatCard number="250+" label="Ethnic Groups" isDark={isDark} />
							<StatCard number="500+" label="Quiz Questions" isDark={isDark} />
							<StatCard number="50+" label="Cultural Facts" isDark={isDark} />
						</motion.div>
					</div>
				</section>
			</div>
		</main>
	);
}
