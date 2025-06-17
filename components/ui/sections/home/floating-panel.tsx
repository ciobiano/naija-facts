"use client";

import { useEffect } from "react";
import { motion, useMotionValue, useSpring, MotionValue } from "framer-motion";

interface FloatingPanelProps {
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
	mouseX: MotionValue<number>;
	mouseY: MotionValue<number>;
	delay: number;
	gradient: string;
}

export const FloatingPanel = ({
	title,
	metric,
	description,
	icon,
	position,
	mouseX,
	mouseY,
	delay,
	gradient,
}: FloatingPanelProps) => {
	const x = useSpring(useMotionValue(0), { stiffness: 50, damping: 30 });
	const y = useSpring(useMotionValue(0), { stiffness: 50, damping: 30 });

	useEffect(() => {
		const unsubscribeX = mouseX.on("change", (latest) => {
			x.set((latest - window.innerWidth / 2) * 0.01);
		});
		const unsubscribeY = mouseY.on("change", (latest) => {
			y.set((latest - window.innerHeight / 2) * 0.01);
		});

		return () => {
			unsubscribeX();
			unsubscribeY();
		};
	}, [mouseX, mouseY, x, y]);

	return (
		<motion.div
			className="absolute hidden xl:block w-64 pointer-events-none"
			style={{
				...position,
				x,
				y,
				willChange: "transform",
			}}
			initial={{ opacity: 0, scale: 0.8 }}
			animate={{ opacity: 1, scale: 1 }}
			transition={{ duration: 0.6, delay, ease: "easeOut" }}
		>
			<div className="rounded-2xl backdrop-blur-2xl p-4 shadow-2xl group cursor-pointer transition-all duration-300 bg-white/60 border border-gray-200/50 hover:bg-white/80 dark:bg-white/10 dark:border-white/20 dark:hover:bg-white/20 transform-gpu">
				<div
					className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-300 ${gradient}`}
				/>

				<div className="relative z-10 space-y-3">
					<div className="flex items-center justify-between">
						<div className="p-2 rounded-lg bg-gray-100/80 dark:bg-white/10">
							{icon}
						</div>
						<span className="text-xs font-medium text-gray-600 dark:text-gray-400">
							{title}
						</span>
					</div>

					<div className="space-y-1">
						<div className="text-md font-bold text-gray-900 dark:text-white">
							{metric}
						</div>
						<div className="text-xs text-gray-600 dark:text-gray-300">
							{description}
						</div>
					</div>
				</div>
			</div>
		</motion.div>
	);
};
