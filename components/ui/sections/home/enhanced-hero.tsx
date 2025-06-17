"use client";

import {  useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useMotionValue, useSpring, MotionValue } from "framer-motion";
import {
	ArrowRight,
	BookOpen,
	Calendar,
	Trophy,
	Brain,
	Users,
	Sparkles,
	Globe,
  } from "lucide-react";
import { Button } from "../../button";


export default function EnhancedHomeHero() {
	// Mouse tracking for floating elements
	const mouseX = useMotionValue(0);
	const mouseY = useMotionValue(0);

	useEffect(() => {
		const handleMouseMove = (event: MouseEvent) => {
			mouseX.set(event.clientX);
			mouseY.set(event.clientY);
		};

		window.addEventListener("mousemove", handleMouseMove);

		return () => {
			window.removeEventListener("mousemove", handleMouseMove);
		};
	}, [mouseX, mouseY]);

	return (
		<section className="relative pb-16 pt-28 md:pb-20 md:pt-32 xl:pb-40 xl:pt-40 overflow-hidden bg-black">
			{/* Noise texture overlay */}
			<div
				className="absolute inset-0 opacity-[0.03] bg-repeat pointer-events-none z-0"
				style={{ backgroundImage: 'url("/noise-texture.png")' }}
			/>

			{/* Enhanced gradient background with animated orbs */}
			<div className="absolute inset-0 bg-gradient-to-br from-black via-black to-black/90 z-0" />

			{/* Floating ambient orbs */}
			<motion.div
				className="absolute top-1/4 left-1/4 w-64 h-64 bg-naija-green-500/8 rounded-full blur-3xl pointer-events-none"
				animate={{
					scale: [1, 1.3, 1],
					opacity: [0.3, 0.6, 0.3],
				}}
				transition={{
					duration: 8,
					repeat: Infinity,
					ease: "easeInOut",
				}}
			/>
			<motion.div
				className="absolute bottom-1/3 right-1/3 w-48 h-48 bg-cultural-gold/8 rounded-full blur-3xl pointer-events-none"
				animate={{
					scale: [1.3, 1, 1.3],
					opacity: [0.2, 0.5, 0.2],
				}}
				transition={{
					duration: 10,
					repeat: Infinity,
					ease: "easeInOut",
				}}
			/>

			<div className="container relative z-10 mx-auto px-4">
				<div className="flex flex-col gap-y-2 items-center text-center relative">
					{/* Enhanced Hero Badge */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6 }}
						className="inline-flex items-center rounded-full border border-naija-green-700/20 bg-naija-green-950/30 backdrop-blur-xl px-4 py-2 text-sm text-naija-green-300 mb-6 shadow-lg"
					>
						<motion.span
							className="animate-pulse mr-2 h-2 w-2 rounded-full bg-naija-green-500"
							animate={{ scale: [1, 1.2, 1] }}
							transition={{ duration: 2, repeat: Infinity }}
						/>
						<Sparkles className="mr-2 size-3" />
						Discover Nigeria&apos;s Rich Heritage
					</motion.div>

					{/* Enhanced Main Headline */}
					<motion.h1
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8, delay: 0.2 }}
						className="mt-3 text-5xl lg:text-[72px] font-bold tracking-tight leading-[1.1] max-w-5xl py-1.5 items-center"
					>
						<span className="tracking-tighter bg-gradient-to-r from-white via-naija-green-100 to-cultural-gold bg-clip-text text-transparent">
							Explore Nigeria&apos;s <br />
						</span>
						<span className="tracking-tighter bg-gradient-to-r from-cultural-gold via-naija-green-300 to-white bg-clip-text text-transparent">
							Cultural Treasures
						</span>
					</motion.h1>

					{/* Enhanced Sub-headline */}
					<motion.p
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.4 }}
						className="max-w-3xl text-gray-400 text-xl tracking-tight mt-6 md:mt-2 leading-relaxed"
					>
						Immerse yourself in Nigeria&apos;s diverse cultures, traditions, and
						history through{" "}
						<span className="text-naija-green-400 font-semibold">
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
					</motion.p>

					{/* Enhanced CTA Buttons */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.6 }}
						className="w-full max-w-xl mt-8"
					>
						<div className="flex flex-wrap items-center justify-center gap-4 relative">
							<Button
								variant="naija"
								size="lg"
								asChild
								className="flex-1 px-6 py-6 flex items-center group shadow-2xl hover:shadow-naija-green-500/25 transition-all duration-300 relative overflow-hidden"
							>
								<Link href="/quiz">
									<motion.div
										className="absolute inset-0 bg-gradient-to-r from-naija-green-600 to-naija-green-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
										whileHover={{ scale: 1.05 }}
									/>
									<span className="relative z-10">Take a Quiz</span>
									<ArrowRight
										size={16}
										className="ml-2 size-4 group-hover:translate-x-1 transition-all duration-300 relative z-10"
									/>
								</Link>
							</Button>
							<Button
								variant="outline"
								size="lg"
								asChild
								className="flex-1 px-6 py-6 flex items-center group shadow-2xl hover:shadow-xl transition-all duration-300 border-naija-green-700/20 backdrop-blur-xl bg-white/5 hover:bg-white/10 text-white"
							>
								<Link href="/cultural-content">
									<Globe className="mr-2 size-4" />
									Explore Content
									<ArrowRight
										size={16}
										className="ml-2 size-4 group-hover:translate-x-1 transition-all duration-300"
									/>
								</Link>
							</Button>
						</div>
					</motion.div>

					{/* Enhanced Floating Glass Panels */}
					<motion.div
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ duration: 0.8, delay: 0.8 }}
						className="py-16 max-w-6xl relative group mt-8"
					>
						{/* Enhanced main panel with glassmorphic effect */}
						<div className="relative rounded-2xl border border-naija-green-700/10 shadow-2xl group overflow-hidden backdrop-blur-xl">
							<div className="absolute -inset-1 bg-gradient-to-r from-naija-green-700/20 to-cultural-gold/10 rounded-2xl blur-md"></div>
							<div className="relative rounded-2xl border border-white/10 overflow-hidden bg-white/5 backdrop-blur-2xl">
								<Image
									src="/images/hero-main.jpg"
									alt="Nigerian cultural showcase featuring traditional attire, art and ceremonies"
									width={1200}
									height={675}
									className="rounded-2xl transition-all duration-500 group-hover:scale-105"
									priority
									loading="eager"
									quality={90}
								/>
								<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>

								{/* Enhanced hover overlay */}
								<div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
									<motion.div
										whileHover={{ scale: 1.1 }}
										whileTap={{ scale: 0.95 }}
									>
										<Button
											asChild
											variant="ghost"
											className="px-8 py-4 bg-naija-green-600/90 backdrop-blur-xl text-white font-medium rounded-xl shadow-2xl hover:bg-naija-green-700/90 transition-all border border-white/20"
										>
											<Link href="/cultural-content">
												<Sparkles className="mr-2 size-4" />
												Discover Now
												<ArrowRight className="ml-2 size-4" />
											</Link>
										</Button>
									</motion.div>
								</div>
							</div>
						</div>

						{/* Enhanced Floating panels with glassmorphic design */}
						<FloatingGlassPanel
							src="/images/floating-facts.jpg"
							alt="Nigerian facts showcase"
							position={{ top: "15%", right: "-5%" }}
							width={400}
							height={200}
							widthPct="22%"
							mouseX={mouseX}
							mouseY={mouseY}
							title="Quiz Performance"
							metric="87%"
							description="Average Score"
							icon={<Brain className="size-5 text-naija-green-400" />}
						/>

						<FloatingGlassPanel
							src="/images/floating-quiz.jpg"
							alt="Nigerian quiz showcase"
							position={{ bottom: "10%", left: "-8%" }}
							width={350}
							height={175}
							widthPct="20%"
							mouseX={mouseX}
							mouseY={mouseY}
							title="Cultural Facts"
							metric="500+"
							description="Discoveries Made"
							icon={<BookOpen className="size-5 text-cultural-gold" />}
						/>

						<FloatingGlassPanel
							src="/images/floating-cultural.jpg"
							alt="Nigerian cultural showcase"
							position={{ bottom: "-5%", right: "15%" }}
							width={380}
							height={190}
							widthPct="18%"
							mouseX={mouseX}
							mouseY={mouseY}
							title="Active Learners"
							metric="10K+"
							description="Community Members"
							icon={<Users className="size-5 text-naija-green-300" />}
						/>
					</motion.div>

					{/* Enhanced feature highlights with glassmorphic cards */}
					<motion.div
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 1.2 }}
						className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 w-full max-w-6xl"
					>
						<EnhancedFeatureCard
							title="Interactive Quizzes"
							description="Test your knowledge of Nigerian culture, history, and traditions through engaging quizzes."
							icon={<Trophy className="size-6 text-cultural-gold" />}
							gradient="from-cultural-gold/20 to-naija-green-500/10"
						/>
						<EnhancedFeatureCard
							title="Cultural Insights"
							description="Discover the rich diversity of Nigerian ethnic groups, languages, and cultural practices."
							icon={<BookOpen className="size-6 text-naija-green-400" />}
							gradient="from-naija-green-500/20 to-cultural-indigo/10"
						/>
						<EnhancedFeatureCard
							title="Historical Facts"
							description="Explore Nigeria&apos;s fascinating history from ancient kingdoms to modern times."
							icon={<Calendar className="size-6 text-cultural-terracotta" />}
							gradient="from-cultural-terracotta/20 to-cultural-gold/10"
						/>
					</motion.div>

					{/* Stats section */}
					<motion.div
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 1.4 }}
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

interface EnhancedFloatingPanelProps {
	src: string;
	alt: string;
	position: {
		top?: string;
		right?: string;
		bottom?: string;
		left?: string;
	};
	width: number;
	height: number;
	widthPct: string;
	mouseX: MotionValue<number>;
	mouseY: MotionValue<number>;
	title: string;
	metric: string;
	description: string;
	icon: React.ReactNode;
}

const FloatingGlassPanel = ({
	src,
	alt,
	position,
	width,
	height,
	widthPct,
	mouseX,
	mouseY,
	title,
	metric,
	description,
	icon,
}: EnhancedFloatingPanelProps) => {
	const x = useSpring(useMotionValue(0), { stiffness: 40, damping: 30 });
	const y = useSpring(useMotionValue(0), { stiffness: 40, damping: 30 });

	useEffect(() => {
		const unsubscribeX = mouseX.onChange((latestX: number) => {
			const deltaX = latestX - window.innerWidth / 2;
			x.set(deltaX / 50);
		});

		const unsubscribeY = mouseY.onChange((latestY: number) => {
			const deltaY = latestY - window.innerHeight / 2;
			y.set(deltaY / 50);
		});

		return () => {
			unsubscribeX();
			unsubscribeY();
		};
	}, [mouseX, mouseY, x, y]);

	return (
		<motion.div
			className="absolute shadow-2xl z-10 hidden lg:block"
			style={{
				...position,
				width: widthPct,
				x,
				y,
			}}
			whileHover={{ scale: 1.05 }}
			whileTap={{ scale: 0.98 }}
		>
			{/* Enhanced glassmorphic container */}
			<div className="rounded-2xl overflow-hidden backdrop-blur-2xl bg-white/10 border border-white/20 shadow-2xl group cursor-pointer">
				<div className="relative">
					<Image
						src={src}
						alt={alt}
						width={width}
						height={height}
						className="transition-all duration-300 group-hover:scale-110"
					/>
					<div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

					{/* Enhanced overlay content */}
					<div className="absolute inset-0 p-4 flex flex-col justify-end">
						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<div className="p-1.5 rounded-lg bg-white/10 backdrop-blur-sm">
									{icon}
								</div>
								<span className="text-xs text-gray-300 font-medium">
									{title}
								</span>
							</div>
							<div className="text-lg font-bold text-white">{metric}</div>
							<div className="text-xs text-gray-300">{description}</div>
						</div>
					</div>
				</div>
			</div>
		</motion.div>
	);
};

interface EnhancedFeatureCardProps {
	title: string;
	description: string;
	icon: React.ReactNode;
	gradient: string;
}

const EnhancedFeatureCard = ({
	title,
	description,
	icon,
	gradient,
}: EnhancedFeatureCardProps) => {
	return (
		<motion.div
			whileHover={{ scale: 1.05 }}
			className="group relative p-6 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 shadow-xl cursor-pointer transition-all duration-300 hover:bg-white/10"
		>
			<div
				className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-300`}
			/>

			<div className="relative z-10 space-y-4">
				<div className="p-3 rounded-xl bg-white/10 backdrop-blur-sm w-fit">
					{icon}
				</div>
				<h3 className="text-xl font-bold text-white">{title}</h3>
				<p className="text-gray-300 leading-relaxed">{description}</p>
			</div>
		</motion.div>
	);
};

const StatCard = ({ number, label }: { number: string; label: string }) => (
	<motion.div
		className="text-center space-y-2 group cursor-pointer"
		whileHover={{ scale: 1.05 }}
	>
		<div className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-naija-green-400 to-cultural-gold bg-clip-text text-transparent group-hover:from-cultural-gold group-hover:to-naija-green-400 transition-all duration-300">
			{number}
		</div>
		<div className="text-sm text-gray-400 font-medium group-hover:text-gray-300 transition-colors duration-300">
			{label}
		</div>
	</motion.div>
);
