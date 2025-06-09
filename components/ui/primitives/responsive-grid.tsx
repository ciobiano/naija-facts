import React from "react";
import { cn } from "@/lib/utils";

interface ResponsiveGridProps {
	children: React.ReactNode;
	className?: string;
	cols?: {
		default?: number;
		sm?: number;
		md?: number;
		lg?: number;
		xl?: number;
	};
	gap?: "none" | "sm" | "md" | "lg" | "xl";
	align?: "start" | "center" | "end" | "stretch";
}

export function ResponsiveGrid({
	children,
	className,
	cols = { default: 1, sm: 2, md: 3, lg: 4 },
	gap = "md",
	align = "stretch",
}: ResponsiveGridProps) {
	const gapClasses = {
		none: "gap-0",
		sm: "gap-2 sm:gap-3",
		md: "gap-4 sm:gap-6",
		lg: "gap-6 sm:gap-8",
		xl: "gap-8 sm:gap-12",
	};

	const alignClasses = {
		start: "items-start",
		center: "items-center",
		end: "items-end",
		stretch: "items-stretch",
	};

	const colClasses = [
		cols.default && `grid-cols-${cols.default}`,
		cols.sm && `sm:grid-cols-${cols.sm}`,
		cols.md && `md:grid-cols-${cols.md}`,
		cols.lg && `lg:grid-cols-${cols.lg}`,
		cols.xl && `xl:grid-cols-${cols.xl}`,
	]
		.filter(Boolean)
		.join(" ");

	return (
		<div
			className={cn(
				"grid w-full",
				colClasses,
				gapClasses[gap],
				alignClasses[align],
				className
			)}
		>
			{children}
		</div>
	);
}

interface ResponsiveStackProps {
	children: React.ReactNode;
	className?: string;
	direction?: {
		default?: "row" | "col";
		sm?: "row" | "col";
		md?: "row" | "col";
		lg?: "row" | "col";
	};
	gap?: "none" | "sm" | "md" | "lg" | "xl";
	align?: "start" | "center" | "end" | "stretch";
	justify?: "start" | "center" | "end" | "between" | "around" | "evenly";
}

export function ResponsiveStack({
	children,
	className,
	direction = { default: "col", md: "row" },
	gap = "md",
	align = "stretch",
	justify = "start",
}: ResponsiveStackProps) {
	const gapClasses = {
		none: "gap-0",
		sm: "gap-2 sm:gap-3",
		md: "gap-4 sm:gap-6",
		lg: "gap-6 sm:gap-8",
		xl: "gap-8 sm:gap-12",
	};

	const alignClasses = {
		start: "items-start",
		center: "items-center",
		end: "items-end",
		stretch: "items-stretch",
	};

	const justifyClasses = {
		start: "justify-start",
		center: "justify-center",
		end: "justify-end",
		between: "justify-between",
		around: "justify-around",
		evenly: "justify-evenly",
	};

	const directionClasses = [
		direction.default && `flex-${direction.default}`,
		direction.sm && `sm:flex-${direction.sm}`,
		direction.md && `md:flex-${direction.md}`,
		direction.lg && `lg:flex-${direction.lg}`,
	]
		.filter(Boolean)
		.join(" ");

	return (
		<div
			className={cn(
				"flex w-full",
				directionClasses,
				gapClasses[gap],
				alignClasses[align],
				justifyClasses[justify],
				className
			)}
		>
			{children}
		</div>
	);
}

interface ContainerProps {
	children: React.ReactNode;
	className?: string;
	size?: "sm" | "md" | "lg" | "xl" | "full";
	padding?: "none" | "sm" | "md" | "lg";
}

export function Container({
	children,
	className,
	size = "lg",
	padding = "md",
}: ContainerProps) {
	const sizeClasses = {
		sm: "max-w-2xl",
		md: "max-w-4xl",
		lg: "max-w-6xl",
		xl: "max-w-7xl",
		full: "max-w-none",
	};

	const paddingClasses = {
		none: "px-0",
		sm: "px-4 sm:px-6",
		md: "px-4 sm:px-6 lg:px-8",
		lg: "px-6 sm:px-8 lg:px-12",
	};

	return (
		<div
			className={cn(
				"w-full mx-auto",
				sizeClasses[size],
				paddingClasses[padding],
				className
			)}
		>
			{children}
		</div>
	);
}
