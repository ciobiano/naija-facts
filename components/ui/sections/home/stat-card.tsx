"use client";

import { motion } from "framer-motion";

interface StatCardProps {
	number: string;
	label: string;
}

export const StatCard = ({ number, label }: StatCardProps) => (
	<motion.div className="text-center space-y-2" whileHover={{ scale: 1.05 }}>
		<div className="text-3xl lg:text-4xl font-bold bg-gradient-to-r bg-clip-text text-transparent from-naija-green-600 to-cultural-gold dark:from-naija-green-400 dark:to-cultural-gold">
			{number}
		</div>
		<div className="text-sm font-medium text-gray-600 dark:text-gray-400">
			{label}
		</div>
	</motion.div>
);
