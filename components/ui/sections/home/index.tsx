"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useMotionValue, useSpring, MotionValue } from "framer-motion";
import { ArrowRight, BookOpen, Calendar, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomeHero() {
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

			{/* Gradient background */}
			<div className="absolute inset-0 bg-gradient-to-br from-black via-black to-black/90 z-0" />

			<div className="container relative z-10 mx-auto px-4">
				<div className="flex flex-col gap-y-2 items-center text-center relative">
					{/* Hero Badge */}
					<div className="inline-flex items-center rounded-full border border-naija-green-700/20 bg-naija-green-950/30 px-3 py-1 text-sm text-naija-green-300 backdrop-blur-md mb-6">
						<span className="animate-pulse mr-2 h-2 w-2 rounded-full bg-naija-green-500"></span>
						Discover Nigeria&apos;s Rich Heritage
					</div>

					{/* Main Headline */}
					<h1 className="mt-3 text-5xl lg:text-[72px] font-bold tracking-tight leading-[1.1] max-w-5xl py-1.5 items-center">
						<span className="tracking-tighter text-gradient from-white to-white/75 animate-fade-in-up">
							Explore Nigeria&apos;s <br /> Cultural Treasures
						</span>
					</h1>

					{/* Sub-headline */}
					<p className="max-w-3xl text-gray-400 text-xl tracking-tight mt-6 md:mt-2 animate-fade-in-up [animation-delay:300ms] leading-relaxed">
						Immerse yourself in Nigeria&apos;s diverse cultures, traditions, and
						history through interactive quizzes, stunning visuals, and
						fascinating facts.
					</p>

					{/* CTA Buttons */}
					<div className="animate-fade-in-up [animation-delay:600ms] w-full max-w-xl mt-8">
						<div className="flex flex-wrap items-center justify-center gap-4 relative">
							<Button
								variant="naija"
								size="lg"
								asChild
								className="flex-1 px-6 py-6 flex items-center group shadow-lg hover:shadow-xl transition-all duration-300"
							>
								<Link href="/quiz">
									Take a Quiz
									<ArrowRight
										size={16}
										className="ml-2 size-4 group-hover:translate-x-1 transition-all duration-300"
									/>
								</Link>
							</Button>
							<Button
								variant="outline"
								size="lg"
								asChild
								className="flex-1 px-6 py-6 flex items-center group shadow-lg hover:shadow-xl transition-all duration-300 border-naija-green-700/20 backdrop-blur-sm"
							>
								<Link href="/cultural-content">
									Explore Content
									<ArrowRight
										size={16}
										className="ml-2 size-4 group-hover:translate-x-1 transition-all duration-300"
									/>
								</Link>
							</Button>
						</div>
					</div>

					{/* Floating Glass Panels */}
					<div className="py-16 animate-fade-in-up [animation-delay:900ms] max-w-6xl relative group mt-8">
						{/* Main panel */}
						<div className="relative rounded-lg border border-naija-green-700/10 shadow-2xl group overflow-hidden">
							<div className="absolute -inset-1 bg-gradient-to-r from-naija-green-700/20 to-cultural-gold/10 rounded-xl blur-md"></div>
							<div className="relative rounded-lg border border-white/5 overflow-hidden">
								<Image
									src="/images/hero-main.jpg"
									alt="Nigerian cultural showcase featuring traditional attire, art and ceremonies"
									width={1200}
									height={675}
									className="rounded-lg transition-all duration-300 group-hover:scale-105"
									priority
									loading="eager"
									quality={90}
								/>
								<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>

								{/* Hover overlay with button */}
								<div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
									<Button
										asChild
										variant="ghost"
										className="px-6 py-3 bg-naija-green-600 text-white font-medium rounded-lg shadow-lg hover:bg-naija-green-700 transition-all transform hover:scale-105"
									>
										<Link href="/cultural-content">
											Discover Now
											<ArrowRight className="ml-2 size-3" />
										</Link>
									</Button>
								</div>
							</div>
						</div>

						{/* Floating panel 1 - Facts */}
						<FloatingPanel
							src="/images/floating-facts.jpg"
							alt="Nigerian facts showcase"
							position={{ top: "15%", right: "-5%" }}
							width={400}
							height={200}
							widthPct="22%"
							mouseX={mouseX}
							mouseY={mouseY}
						/>

						{/* Floating panel 2 - Quiz */}
						<FloatingPanel
							src="/images/floating-quiz.jpg"
							alt="Nigerian quiz showcase"
							position={{ bottom: "10%", left: "-8%" }}
							width={350}
							height={175}
							widthPct="20%"
							mouseX={mouseX}
							mouseY={mouseY}
						/>

						{/* Floating panel 3 - Cultural */}
						<FloatingPanel
							src="/images/floating-cultural.jpg"
							alt="Nigerian cultural showcase"
							position={{ bottom: "-5%", right: "15%" }}
							width={380}
							height={190}
							widthPct="18%"
							mouseX={mouseX}
							mouseY={mouseY}
						/>
					</div>

					{/* Feature highlights */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 w-full max-w-6xl">
						<FeatureCard
							title="Interactive Quizzes"
							description="Test your knowledge of Nigerian culture, history, and traditions through engaging quizzes."
							icon={<Trophy className="size-6" />}
						/>
						<FeatureCard
							title="Cultural Insights"
							description="Discover the rich diversity of Nigerian ethnic groups, languages, and cultural practices."
							icon={<BookOpen className="size-6" />}
						/>
						<FeatureCard
							title="Historical Facts"
							description="Explore Nigeria&apos;s fascinating history from ancient kingdoms to modern times."
							icon={<Calendar className="size-6" />}
						/>
					</div>
				</div>
			</div>
		</section>
	);
}

interface FloatingPanelProps {
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
}

const FloatingPanel = ({
	src,
	alt,
	position,
	width,
	height,
	widthPct,
	mouseX,
	mouseY,
}: FloatingPanelProps) => {
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
			className="absolute shadow-xl z-10"
			style={{
				...position,
				width: widthPct,
				x,
				y,
			}}
			whileHover={{ scale: 1.05 }}
			whileTap={{ scale: 0.98 }}
		>
			<div className="rounded-lg overflow-hidden backdrop-blur-[15px] bg-naija-green-950/20 border border-naija-green-700/20">
				<Image
					src={src}
					alt={alt}
					width={width}
					height={height}
					className="rounded-lg"
				/>
			</div>
		</motion.div>
	);
};

interface FeatureCardProps {
	title: string;
	description: string;
	icon: React.ReactNode;
}

const FeatureCard = ({ title, description, icon }: FeatureCardProps) => {
	return (
		<div className="flex flex-col items-center p-6 rounded-xl backdrop-blur-[15px] bg-naija-green-950/10 border border-naija-green-700/10 transition-all hover:bg-naija-green-950/20">
			<div className="mb-4 p-3 rounded-full bg-naija-green-600/20 text-naija-green-500">
				{icon}
			</div>
			<h3 className="text-xl font-bold mb-2 text-white">{title}</h3>
			<p className="text-gray-400 text-center">{description}</p>
		</div>
	);
};
