"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface StatCardProps {
	number: string;
	label: string;
	isDark: boolean;
}

export const StatCard = ({ number, label, isDark }: StatCardProps) => (
	<motion.div className="text-center space-y-2" whileHover={{ scale: 1.05 }}>
		<div
			className={cn(
				"text-3xl lg:text-4xl font-bold bg-gradient-to-r bg-clip-text text-transparent",
				isDark
					? "from-naija-green-400 to-cultural-gold"
					: "from-naija-green-600 to-cultural-gold"
			)}
		>
			{number}
		</div>
		<div
			className={cn(
				"text-sm font-medium",
				isDark ? "text-gray-400" : "text-gray-600"
			)}
		>
			{label}
		</div>
	</motion.div>
); 