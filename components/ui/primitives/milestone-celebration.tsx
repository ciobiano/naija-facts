"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Share2, Trophy, Target, CheckCircle } from "lucide-react";

interface CategoryCompletionData {
	categoryName: string;
	accuracy: number;
	totalQuestions: number;
	completedQuestions: number;
	totalPoints: number;
}

interface MilestoneCelebrationProps {
	completion: CategoryCompletionData;
	show: boolean;
	onClose: () => void;
	onShare?: () => void;
}

export function MilestoneCelebration({
	completion,
	show,
	onClose,
	onShare,
}: MilestoneCelebrationProps) {
	const [confettiComplete, setConfettiComplete] = useState(false);

	useEffect(() => {
		if (show) {
			// Auto-close after 10 seconds if user doesn't interact
			const timer = setTimeout(() => {
				onClose();
			}, 10000);

			return () => clearTimeout(timer);
		}
	}, [show, onClose]);

	if (!show) return null;

	const handleShare = () => {
		if (onShare) {
			onShare();
		} else if (navigator.share) {
			navigator.share({
				title: "Category Completed! 🎉",
				text: `Just completed ${completion.categoryName} with ${completion.accuracy}% accuracy on Naija Facts!`,
				url: window.location.origin,
			});
		}
	};

	return (
		<AnimatePresence>
			{show && (
				<>
					{/* Backdrop */}
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
						onClick={onClose}
					/>

					{/* Confetti Effect */}
					{!confettiComplete && (
						<div className="fixed inset-0 pointer-events-none z-50">
							{[...Array(50)].map((_, i) => (
								<motion.div
									key={i}
									className="absolute w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
									initial={{
										x: "50vw",
										y: "50vh",
										opacity: 1,
										scale: 1,
									}}
									animate={{
										x: `${Math.random() * 100}vw`,
										y: `${Math.random() * 100}vh`,
										opacity: 0,
										scale: 0,
										rotate: 360,
									}}
									transition={{
										duration: 3,
										ease: "easeOut",
									}}
									onAnimationComplete={() => {
										if (i === 49) setConfettiComplete(true);
									}}
								/>
							))}
						</div>
					)}

					{/* Celebration Modal */}
					<motion.div
						initial={{ opacity: 0, scale: 0.8, y: 50 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.8, y: 50 }}
						transition={{ type: "spring", duration: 0.5 }}
						className="fixed inset-0 flex items-center justify-center z-50 p-4"
					>
						<Card className="w-full max-w-md bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200 dark:border-green-800 shadow-2xl">
							<CardContent className="p-6 text-center space-y-6">
								{/* Close Button */}
								<div className="flex justify-end">
									<Button
										variant="ghost"
										size="icon"
										onClick={onClose}
										className="h-8 w-8 rounded-full"
									>
										<X className="h-4 w-4" />
									</Button>
								</div>

								{/* Trophy Icon with Animation */}
								<motion.div
									initial={{ scale: 0, rotate: -180 }}
									animate={{ scale: 1, rotate: 0 }}
									transition={{ delay: 0.2, type: "spring", duration: 0.8 }}
									className="flex justify-center"
								>
									<div className="relative">
										<div className="absolute -inset-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full opacity-20 blur-lg"></div>
										<div className="relative bg-gradient-to-r from-yellow-400 to-orange-500 p-4 rounded-full">
											<Trophy className="h-12 w-12 text-white" />
										</div>
									</div>
								</motion.div>

								{/* Title */}
								<motion.div
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: 0.4 }}
								>
									<h2 className="text-2xl font-bold text-green-800 dark:text-green-200">
										Category Completed! 🎉
									</h2>
									<p className="text-green-700 dark:text-green-300 mt-2">
										Excellent work mastering{" "}
										<span className="font-semibold">
											{completion.categoryName}
										</span>
										!
									</p>
								</motion.div>

								{/* Stats */}
								<motion.div
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: 0.6 }}
									className="grid grid-cols-3 gap-4"
								>
									<div className="text-center">
										<div className="flex items-center justify-center mb-1">
											<Target className="h-4 w-4 text-green-600" />
										</div>
										<div className="text-2xl font-bold text-green-800 dark:text-green-200">
											{completion.accuracy}%
										</div>
										<div className="text-xs text-green-600 dark:text-green-400">
											Accuracy
										</div>
									</div>
									<div className="text-center">
										<div className="flex items-center justify-center mb-1">
											<CheckCircle className="h-4 w-4 text-green-600" />
										</div>
										<div className="text-2xl font-bold text-green-800 dark:text-green-200">
											{completion.completedQuestions}
										</div>
										<div className="text-xs text-green-600 dark:text-green-400">
											Questions
										</div>
									</div>
									<div className="text-center">
										<div className="flex items-center justify-center mb-1">
											<Trophy className="h-4 w-4 text-green-600" />
										</div>
										<div className="text-2xl font-bold text-green-800 dark:text-green-200">
											{completion.totalPoints}
										</div>
										<div className="text-xs text-green-600 dark:text-green-400">
											Points
										</div>
									</div>
								</motion.div>

								{/* Achievement Badge */}
								<motion.div
									initial={{ opacity: 0, scale: 0.8 }}
									animate={{ opacity: 1, scale: 1 }}
									transition={{ delay: 0.8 }}
									className="flex justify-center"
								>
									<Badge
										variant="default"
										className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-1 text-sm"
									>
										{completion.accuracy >= 90
											? "🌟 Outstanding Performance!"
											: completion.accuracy >= 85
											? "⭐ Excellent Work!"
											: "✨ Great Achievement!"}
									</Badge>
								</motion.div>

								{/* Action Buttons */}
								<motion.div
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: 1 }}
									className="flex gap-3 pt-4"
								>
									<Button
										variant="outline"
										onClick={handleShare}
										className="flex-1 border-green-200 text-green-700 hover:bg-green-50 dark:border-green-700 dark:text-green-300 dark:hover:bg-green-950"
									>
										<Share2 className="h-4 w-4 mr-2" />
										Share Achievement
									</Button>
									<Button
										onClick={onClose}
										className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
									>
										Continue Learning
									</Button>
								</motion.div>

								{/* Motivational Message */}
								<motion.p
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									transition={{ delay: 1.2 }}
									className="text-sm text-green-600 dark:text-green-400 italic"
								>
									&quot;Knowledge is power, and you&apos;re getting stronger every day!&quot;
									💪
								</motion.p>
							</CardContent>
						</Card>
					</motion.div>
				</>
			)}
		</AnimatePresence>
	);
}
