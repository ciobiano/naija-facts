"use client";

import {   useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useMotionValue, useSpring } from "framer-motion";
import {
	ArrowRight,
	BookOpen,
	Brain,
	Trophy,
	Users,
	Sparkles,
	Play,
	TrendingUp,
	Globe,
	Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
        
export default function GlassmorphicHero() {
	const mouseX = useMotionValue(0);
	const mouseY = useMotionValue(0);

	useEffect(() => {
		const handleMouseMove = (event: MouseEvent) => {
			mouseX.set(event.clientX);
			mouseY.set(event.clientY);
		};

		window.addEventListener("mousemove", handleMouseMove);
		return () => window.removeEventListener("mousemove", handleMouseMove);
	}, [mouseX, mouseY]);

	return (
		<section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
			{/* Animated background with noise texture */}
			<div
				className="absolute inset-0 opacity-[0.02] bg-repeat pointer-events-none"
				style={{
					backgroundImage: 'url("/noise-texture.png")',
					animation: "gradientShift 20s ease-in-out infinite",
				}}
			/>

			{/* Dynamic gradient background */}
			<div className="absolute inset-0 bg-gradient-to-br from-black via-black/95 to-naija-green-950/20" />

			{/* Floating orbs for ambiance */}
			<motion.div
				className="absolute top-1/4 left-1/4 w-64 h-64 bg-naija-green-500/10 rounded-full blur-3xl"
				animate={{
					scale: [1, 1.2, 1],
					opacity: [0.3, 0.5, 0.3],
				}}
				transition={{
					duration: 6,
					repeat: Infinity,
					ease: "easeInOut",
				}}
			/>
			<motion.div
				className="absolute bottom-1/3 right-1/3 w-48 h-48 bg-cultural-gold/10 rounded-full blur-3xl"
				animate={{
					scale: [1.2, 1, 1.2],
					opacity: [0.2, 0.4, 0.2],
				}}
				transition={{
					duration: 8,
					repeat: Infinity,
					ease: "easeInOut",
				}}
			/>

			<div className="container relative z-10 mx-auto px-4 py-16">
				<div className="flex flex-col items-center text-center space-y-8">
					{/* Status Badge */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6 }}
						className="inline-flex items-center rounded-full border border-naija-green-700/30 bg-naija-green-950/40 backdrop-blur-md px-4 py-2 text-sm text-naija-green-300"
					>
						<motion.span
							className="mr-2 h-2 w-2 rounded-full bg-naija-green-400"
							animate={{ opacity: [1, 0.3, 1] }}
							transition={{ duration: 2, repeat: Infinity }}
						/>
						🌍 Discover Nigeria's Rich Heritage
					</motion.div>

					{/* Main Headline */}
					<motion.div
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8, delay: 0.2 }}
						className="space-y-4"
					>
						<h1 className="text-5xl lg:text-7xl xl:text-8xl font-bold tracking-tight leading-[0.9] max-w-6xl">
							<span className="bg-gradient-to-r from-white via-naija-green-100 to-cultural-gold bg-clip-text text-transparent">
								Master Nigerian
							</span>
							<br />
							<span className="bg-gradient-to-r from-cultural-gold via-naija-green-300 to-white bg-clip-text text-transparent">
								Culture & History
							</span>
						</h1>

						<p className="text-xl lg:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
							Immerse yourself in Nigeria's diverse cultures through
							<span className="text-naija-green-400 font-semibold">
								{" "}
								interactive quizzes
							</span>
							,
							<span className="text-cultural-gold font-semibold">
								{" "}
								stunning visuals
							</span>
							, and
							<span className="text-naija-green-300 font-semibold">
								{" "}
								fascinating facts
							</span>
							.
						</p>
					</motion.div>

					{/* CTA Buttons */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.6 }}
						className="flex flex-wrap gap-4 justify-center"
					>
						<Button
							variant="naija"
							size="xl"
							asChild
							className="group relative overflow-hidden shadow-2xl hover:shadow-naija-green-500/25 transition-all duration-300"
						>
							<Link href="/quiz">
								<motion.div
									className="absolute inset-0 bg-gradient-to-r from-naija-green-600 to-naija-green-500"
									whileHover={{ scale: 1.05 }}
								/>
								<span className="relative z-10">Start Quiz Challenge</span>
								<ArrowRight className="ml-2 size-5 group-hover:translate-x-1 transition-transform duration-300" />
							</Link>
						</Button>

						<Button
							variant="outline"
							size="xl"
							asChild
							className="group backdrop-blur-md bg-white/10 border-white/20 text-white hover:bg-white/20 shadow-xl transition-all duration-300"
						>
							<Link href="/cultural-content">
								<Sparkles className="mr-2 size-5" />
								Explore Culture
								<ArrowRight className="ml-2 size-5 group-hover:translate-x-1 transition-transform duration-300" />
							</Link>
						</Button>
					</motion.div>

					{/* Glassmorphic Feature Panels */}
					<motion.div
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ duration: 0.8, delay: 0.8 }}
						className="relative w-full max-w-7xl mx-auto mt-16"
					>
						{/* Central Main Panel */}
						<div className="relative group cursor-pointer">
							<motion.div
								className="relative rounded-3xl overflow-hidden backdrop-blur-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 shadow-2xl"
								whileHover={{ scale: 1.02 }}
								transition={{ type: "spring", stiffness: 300, damping: 30 }}
							>
								<div className="absolute inset-0 bg-gradient-to-br from-naija-green-500/20 via-transparent to-cultural-gold/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

								<div className="relative p-8 lg:p-12">
									<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
										<div className="space-y-6">
											<div className="flex items-center space-x-3">
												<div className="p-2 rounded-full bg-naija-green-500/20 backdrop-blur-sm">
													<Globe className="size-6 text-naija-green-400" />
												</div>
												<span className="text-naija-green-400 font-semibold text-lg">
													Featured Experience
												</span>
											</div>

											<h3 className="text-3xl lg:text-4xl font-bold text-white leading-tight">
												Interactive Cultural Journey
											</h3>

											<p className="text-gray-300 text-lg leading-relaxed">
												Embark on a comprehensive exploration of Nigeria's 36
												states, 250+ ethnic groups, and centuries of rich
												history through our gamified learning platform.
											</p>

											<div className="flex items-center space-x-6 text-sm">
												<div className="flex items-center space-x-2">
													<Users className="size-4 text-naija-green-400" />
													<span className="text-gray-300">10K+ Learners</span>
												</div>
												<div className="flex items-center space-x-2">
													<Star className="size-4 text-cultural-gold" />
													<span className="text-gray-300">4.9 Rating</span>
												</div>
											</div>
										</div>

										<div className="relative">
											<motion.div
												className="aspect-video rounded-2xl overflow-hidden shadow-xl"
												whileHover={{ scale: 1.05 }}
											>
												<Image
													src="/images/hero-main.jpg"
													alt="Nigerian cultural showcase"
													width={600}
													height={400}
													className="w-full h-full object-cover"
													priority
												/>
												<div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

												<motion.div
													className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
													whileHover={{ scale: 1.1 }}
												>
													<div className="p-4 rounded-full bg-white/20 backdrop-blur-md">
														<Play className="size-8 text-white" />
													</div>
												</motion.div>
											</motion.div>
										</div>
									</div>
								</div>
							</motion.div>
						</div>

						{/* Floating Glass Panels */}
						<FloatingGlassPanel
							title="Quiz Performance"
							metric="87%"
							description="Average Score"
							icon={<Brain className="size-6" />}
							position={{ top: "10%", right: "-5%" }}
							mouseX={mouseX}
							mouseY={mouseY}
							delay={1.2}
							gradient="from-naija-green-500/20 to-naija-green-600/10"
						/>

						<FloatingGlassPanel
							title="Cultural Facts"
							metric="500+"
							description="Discoveries Made"
							icon={<BookOpen className="size-6" />}
							position={{ bottom: "15%", left: "-8%" }}
							mouseX={mouseX}
							mouseY={mouseY}
							delay={1.4}
							gradient="from-cultural-gold/20 to-cultural-bronze/10"
						/>

						<FloatingGlassPanel
							title="Learning Streak"
							metric="12 Days"
							description="Current Streak"
							icon={<Trophy className="size-6" />}
							position={{ top: "60%", right: "-10%" }}
							mouseX={mouseX}
							mouseY={mouseY}
							delay={1.6}
							gradient="from-cultural-indigo/20 to-naija-green-500/10"
						/>

						<FloatingGlassPanel
							title="Progress Track"
							metric="94%"
							description="Completion Rate"
							icon={<TrendingUp className="size-6" />}
							position={{ bottom: "-5%", left: "20%" }}
							mouseX={mouseX}
							mouseY={mouseY}
							delay={1.8}
							gradient="from-cultural-terracotta/20 to-cultural-gold/10"
						/>
					</motion.div>

					{/* Stats Row */}
					<motion.div
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 1.2 }}
						className="grid grid-cols-2 lg:grid-cols-4 gap-8 w-full max-w-4xl mx-auto mt-16"
					>
						<StatCard number="36" label="States Covered" />
						<StatCard number="250+" label="Ethnic Groups" />
						<StatCard number="500+" label="Quiz Questions" />
						<StatCard number="50+" label="Cultural Facts" />
					</motion.div>
				</div>
			</div>
		</section>
	);
}

interface FloatingGlassPanelProps {
	title: string;
	metric: string;
	description: string;
	icon: React.ReactNode;
	position: {
		top?: string;
		right?: string;
		bottom?: string;
		left?: string;
	};
	mouseX: any;
	mouseY: any;
	delay: number;
	gradient: string;
}

const FloatingGlassPanel = ({
	title,
	metric,
	description,
	icon,
	position,
	mouseX,
	mouseY,
	delay,
	gradient,
}: FloatingGlassPanelProps) => {
	const x = useSpring(useMotionValue(0), { stiffness: 50, damping: 30 });
	const y = useSpring(useMotionValue(0), { stiffness: 50, damping: 30 });

	useEffect(() => {
		const unsubscribeX = mouseX.onChange((latestX: number) => {
			const deltaX = latestX - window.innerWidth / 2;
			x.set(deltaX / 80);
		});

		const unsubscribeY = mouseY.onChange((latestY: number) => {
			const deltaY = latestY - window.innerHeight / 2;
			y.set(deltaY / 80);
		});

		return () => {
			unsubscribeX();
			unsubscribeY();
		};
	}, [mouseX, mouseY, x, y]);

	return (
		<motion.div
			className="absolute hidden lg:block w-64 z-20"
			style={{ ...position, x, y }}
			initial={{ opacity: 0, scale: 0.5 }}
			animate={{ opacity: 1, scale: 1 }}
			transition={{
				duration: 0.6,
				delay,
				type: "spring",
				stiffness: 100,
			}}
			whileHover={{ scale: 1.05 }}
		>
			<div className="rounded-2xl backdrop-blur-2xl bg-white/10 border border-white/20 p-6 shadow-2xl group cursor-pointer hover:bg-white/15 transition-all duration-300">
				<div
					className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-300`}
				/>

				<div className="relative z-10 space-y-4">
					<div className="flex items-center justify-between">
						<div className="p-2 rounded-lg bg-white/10">{icon}</div>
						<span className="text-xs text-gray-400 font-medium">{title}</span>
					</div>

					<div className="space-y-1">
						<div className="text-2xl font-bold text-white">{metric}</div>
						<div className="text-sm text-gray-300">{description}</div>
					</div>
				</div>
			</div>
		</motion.div>
	);
};

const StatCard = ({ number, label }: { number: string; label: string }) => (
	<motion.div className="text-center space-y-2" whileHover={{ scale: 1.05 }}>
		<div className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-naija-green-400 to-cultural-gold bg-clip-text text-transparent">
			{number}
		</div>
		<div className="text-sm text-gray-400 font-medium">{label}</div>
	</motion.div>
);
