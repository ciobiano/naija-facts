import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface LoadingStateProps {
	title?: string;
	description?: string;
	variant?: "default" | "full" | "cards" | "form";
	className?: string;
	size?: "sm" | "md" | "lg";
}

export function LoadingState({
	title = "Loading...",
	description,
	variant = "default",
	className,
	size = "md",
}: LoadingStateProps) {
	const sizeClasses = {
		sm: "py-8",
		md: "py-12",
		lg: "py-20",
	};

	const spinnerSizes = {
		sm: "h-6 w-6",
		md: "h-8 w-8",
		lg: "h-12 w-12",
	};

	if (variant === "full") {
		return (
			<div
				className={cn(
					"flex min-h-[87vh] items-center justify-center",
					sizeClasses[size],
					className
				)}
			>
				<div className="items-center justify-center flex flex-col gap-4">
					<div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary "></div>
					<div className=" text-2xl font-bold text-center ">
						{title}
					</div>
				</div>
			</div>
		);
	}

	if (variant === "cards") {
		return (
			<div
				className={cn(
					"container mx-auto px-4 max-w-6xl",
					sizeClasses[size],
					className
				)}
			>
				<div className="animate-pulse">
					{/* Header Loading */}
					<div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
					<div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>

					{/* Stats Loading */}
					<div className="grid md:grid-cols-4 gap-4 mb-8">
						{[...Array(4)].map((_, i) => (
							<div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
						))}
					</div>

					{/* Cards Loading */}
					<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
						{[...Array(6)].map((_, i) => (
							<div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
						))}
					</div>
				</div>
			</div>
		);
	}

	if (variant === "form") {
		return (
			<div
				className={cn(
					"container mx-auto px-4 max-w-2xl",
					sizeClasses[size],
					className
				)}
			>
				<div className="animate-pulse space-y-6">
					{/* Form fields */}
					<div className="space-y-4">
						{[...Array(3)].map((_, i) => (
							<div key={i} className="space-y-2">
								<div className="h-4 bg-gray-200 rounded w-1/4"></div>
								<div className="h-10 bg-gray-200 rounded"></div>
							</div>
						))}
					</div>
					{/* Submit button */}
					<div className="h-10 bg-gray-200 rounded w-32"></div>
				</div>
			</div>
		);
	}

	// Default variant - Auth page style with card
	return (
		<div
			className={cn("min-h-screen flex items-center justify-center", className)}
		>
			<Card className="w-full max-w-md">
				<CardContent className="pt-6">
					<div className="flex flex-col items-center space-y-4 text-center">
						<Loader2
							className={cn("animate-spin text-primary", spinnerSizes[size])}
						/>
						<h3 className="text-lg font-semibold">{title}</h3>
						{description && (
							<p className="text-sm text-muted-foreground">{description}</p>
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
