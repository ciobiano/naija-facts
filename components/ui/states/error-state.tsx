import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface ErrorStateProps {
	title?: string;
	description?: string;
	error?: Error | string;
	onRetry?: () => void;
	showHomeButton?: boolean;
	showRetryButton?: boolean;
	variant?: "default" | "minimal" | "inline";
	className?: string;
	size?: "sm" | "md" | "lg";
}

export function ErrorState({
	title = "Something went wrong",
	description = "We're sorry, but an error occurred while processing your request.",
	error,
	onRetry,
	showHomeButton = true,
	showRetryButton = true,
	variant = "default",
	className,
	size = "md",
}: ErrorStateProps) {
	const sizeClasses = {
		sm: "py-8",
		md: "py-12",
		lg: "py-20",
	};

	const iconSizes = {
		sm: "h-8 w-8",
		md: "h-12 w-12",
		lg: "h-16 w-16",
	};

	if (variant === "minimal") {
		return (
			<div
				className={cn("flex items-center space-x-3 text-red-600", className)}
			>
				<AlertTriangle className="h-5 w-5" />
				<span className="font-medium">{title}</span>
			</div>
		);
	}

	if (variant === "inline") {
		return (
			<div
				className={cn(
					"p-4 bg-red-50 border border-red-200 rounded-lg",
					className
				)}
			>
				<div className="flex items-start space-x-3">
					<AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
					<div className="flex-1">
						<h4 className="font-medium text-red-900">{title}</h4>
						<p className="text-sm text-red-800 mt-1">{description}</p>
						{error && typeof error === "string" && (
							<p className="text-xs text-red-700 mt-2 font-mono">{error}</p>
						)}
						{onRetry && showRetryButton && (
							<Button
								onClick={onRetry}
								variant="outline"
								size="sm"
								className="mt-3 text-red-700 border-red-300 hover:bg-red-100"
							>
								<RefreshCw className="h-4 w-4 mr-2" />
								Try Again
							</Button>
						)}
					</div>
				</div>
			</div>
		);
	}

	// Default variant - full page error with consistent screen height
	return (
		<div
			className={cn(
				"min-h-screen flex items-center justify-center px-4",
				className
			)}
		>
			<div className="text-center max-w-md">
				<div className="flex flex-col items-center space-y-6">
					<AlertTriangle className={cn("text-red-500", iconSizes[size])} />

					<div className="space-y-2">
						<h2 className="text-2xl font-bold text-red-900">{title}</h2>
						<p className="text-muted-foreground">{description}</p>
					</div>

					{error && typeof error === "string" && (
						<div className="p-3 bg-red-50 border border-red-200 rounded-lg w-full">
							<p className="text-sm text-red-800 font-mono break-words">
								{error}
							</p>
						</div>
					)}

					<div className="flex items-center gap-3">
						{onRetry && showRetryButton && (
							<Button onClick={onRetry} variant="outline">
								<RefreshCw className="h-4 w-4 mr-2" />
								Try Again
							</Button>
						)}
						{showHomeButton && (
							<Button asChild>
								<a href="/">
									<Home className="h-4 w-4 mr-2" />
									Back to Home
								</a>
							</Button>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
