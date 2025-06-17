 "use client";

 import { useEffect } from "react";
 import { motion, useMotionValue, useSpring, MotionValue } from "framer-motion";
 import { cn } from "@/lib/utils";

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
		isDark: boolean;
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
		isDark,
 }: FloatingPanelProps) => {
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
				className="absolute hidden lg:block w-64 z-50"
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
				<div
					className={cn(
						"rounded-2xl backdrop-blur-2xl p-4 shadow-2xl group cursor-pointer transition-all duration-300",
						isDark
							? "bg-white/10 border border-white/20 hover:bg-white/15"
							: "bg-white/80 border border-gray-200/60 hover:bg-white/90"
					)}
				>
					<div
						className={cn(
							"absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-300",
							gradient
						)}
					/>

					<div className="relative z-10 space-y-4">
						<div className="flex items-center justify-between">
							<div
								className={cn(
									"p-2 rounded-lg",
									isDark ? "bg-white/10" : "bg-gray-100/80"
								)}
							>
								{icon}
							</div>
							<span
								className={cn(
									"text-xs font-medium",
									isDark ? "text-gray-400" : "text-gray-600"
								)}
							>
								{title}
							</span>
						</div>

						<div className="space-y-1">
							<div
								className={cn(
									"text-md font-bold",
									isDark ? "text-white" : "text-gray-900"
								)}
							>
								{metric}
							</div>
							<div
								className={cn(
									"text-xs",
									isDark ? "text-gray-300" : "text-gray-600"
								)}
							>
								{description}
							</div>
						</div>
					</div>
				</div>
			</motion.div>
		);
 };