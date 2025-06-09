import React from "react";
import { cn } from "@/lib/utils";

interface NaijaPatternProps {
	className?: string;
	variant?: "flag" | "pattern" | "gradient" | "subtle";
	size?: "sm" | "md" | "lg";
}

export function NaijaPattern({
	className,
	variant = "pattern",
	size = "md",
}: NaijaPatternProps) {
	const baseClasses = "relative overflow-hidden";

	const sizeClasses = {
		sm: "h-2",
		md: "h-4",
		lg: "h-8",
	};

	if (variant === "flag") {
		return (
			<div className={cn(baseClasses, sizeClasses[size], className)}>
				<div className="flex h-full">
					<div className="flex-1 bg-naija-green-700" />
					<div className="flex-1 bg-white" />
					<div className="flex-1 bg-naija-green-700" />
				</div>
			</div>
		);
	}

	if (variant === "gradient") {
		return (
			<div
				className={cn(
					baseClasses,
					sizeClasses[size],
					"cultural-gradient",
					className
				)}
			/>
		);
	}

	if (variant === "subtle") {
		return (
			<div
				className={cn(
					baseClasses,
					sizeClasses[size],
					"naija-pattern opacity-30",
					className
				)}
			/>
		);
	}

	// Default pattern variant
	return (
		<div
			className={cn(baseClasses, sizeClasses[size], "naija-pattern", className)}
		/>
	);
}

interface CulturalAccentProps {
	children: React.ReactNode;
	className?: string;
	accent?: "bronze" | "terracotta" | "indigo" | "gold" | "earth";
}

export function CulturalAccent({
	children,
	className,
	accent = "bronze",
}: CulturalAccentProps) {
	const accentClasses = {
		bronze: "border-l-4 border-cultural-bronze bg-cultural-bronze/5",
		terracotta:
			"border-l-4 border-cultural-terracotta bg-cultural-terracotta/5",
		indigo: "border-l-4 border-cultural-indigo bg-cultural-indigo/5",
		gold: "border-l-4 border-cultural-gold bg-cultural-gold/5",
		earth: "border-l-4 border-cultural-earth bg-cultural-earth/5",
	};

	return (
		<div className={cn("pl-4 py-2", accentClasses[accent], className)}>
			{children}
		</div>
	);
}

interface NaijaCardProps {
	children: React.ReactNode;
	className?: string;
	variant?: "default" | "cultural" | "flag";
}

export function NaijaCard({
	children,
	className,
	variant = "default",
}: NaijaCardProps) {
	const variantClasses = {
		default: "bg-card border border-border",
		cultural:
			"bg-gradient-to-br from-naija-green-50 to-cultural-bronze/10 border border-naija-green-200 dark:from-naija-green-950 dark:to-cultural-bronze/5 dark:border-naija-green-800",
		flag: "bg-gradient-to-r from-naija-green-500 via-white to-naija-green-500 text-foreground border border-naija-green-300",
	};

	return (
		<div
			className={cn(
				"rounded-lg p-6 shadow-sm transition-shadow hover:shadow-md",
				variantClasses[variant],
				className
			)}
		>
			{children}
		</div>
	);
}
