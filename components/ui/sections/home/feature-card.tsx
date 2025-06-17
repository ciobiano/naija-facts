"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
	title: string;
	description: string;
	icon: React.ReactNode;
	gradient: string;
}

export const FeatureCard = ({
	title,
	description,
	icon,
	gradient,
}: FeatureCardProps) => (
	<motion.div
		whileHover={{ scale: 1.05 }}
		className="group relative p-6 rounded-2xl backdrop-blur-xl shadow-xl cursor-pointer transition-all duration-300 bg-white/70 border border-gray-200/50 hover:bg-white/80 dark:bg-white/5 dark:border-white/10 dark:hover:bg-white/10"
	>
		<div
			className={cn(
				"absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-300",
				gradient
			)}
		/>

		<div className="relative z-10 space-y-4">
			<div className="p-3 rounded-xl backdrop-blur-sm w-fit bg-gray-100/80 dark:bg-white/10">
				{icon}
			</div>
			<h3 className="text-xl font-bold text-gray-900 dark:text-white">
				{title}
			</h3>
			<p className="leading-relaxed text-gray-600 dark:text-gray-300">
				{description}
			</p>
		</div>
	</motion.div>
);
