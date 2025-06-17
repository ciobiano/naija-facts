"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
	title: string;
	description: string;
	icon: React.ReactNode;
	gradient: string;
	isDark: boolean;
}

export const FeatureCard = ({
	title,
	description,
	icon,
	gradient,
	isDark,
}: FeatureCardProps) => (
	<motion.div
		whileHover={{ scale: 1.05 }}
		className={cn(
			"group relative p-6 rounded-2xl backdrop-blur-xl shadow-xl cursor-pointer transition-all duration-300",
			isDark
				? "bg-white/5 border border-white/10 hover:bg-white/10"
				: "bg-white/70 border border-gray-200/50 hover:bg-white/80"
		)}
	>
		<div
			className={cn(
				"absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-300",
				gradient
			)}
		/>

		<div className="relative z-10 space-y-4">
			<div
				className={cn(
					"p-3 rounded-xl backdrop-blur-sm w-fit",
					isDark ? "bg-white/10" : "bg-gray-100/80"
				)}
			>
				{icon}
			</div>
			<h3
				className={cn(
					"text-xl font-bold",
					isDark ? "text-white" : "text-gray-900"
				)}
			>
				{title}
			</h3>
			<p
				className={cn(
					"leading-relaxed",
					isDark ? "text-gray-300" : "text-gray-600"
				)}
			>
				{description}
			</p>
		</div>
	</motion.div>
);
