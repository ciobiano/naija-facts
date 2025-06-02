import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Lock, LogIn, UserPlus } from "lucide-react";

interface UnauthorizedStateProps {
	title?: string;
	description?: string;
	showSignInButton?: boolean;
	showSignUpButton?: boolean;
	variant?: "default" | "minimal" | "inline";
	className?: string;
	size?: "sm" | "md" | "lg";
	signInPath?: string;
	signUpPath?: string;
}

export function UnauthorizedState({
	title = "Authentication Required",
	description = "You need to be signed in to access this feature.",
	showSignInButton = true,
	showSignUpButton = true,
	variant = "default",
	className,
	size = "md",
	signInPath = "/auth/signin",
	signUpPath = "/auth/signup",
}: UnauthorizedStateProps) {
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
				className={cn("flex items-center space-x-3 text-amber-600", className)}
			>
				<Lock className="h-5 w-5" />
				<span className="font-medium">{title}</span>
			</div>
		);
	}

	if (variant === "inline") {
		return (
			<div
				className={cn(
					"p-4 bg-amber-50 border border-amber-200 rounded-lg",
					className
				)}
			>
				<div className="flex items-start space-x-3">
					<Lock className="h-5 w-5 text-amber-600 mt-0.5" />
					<div className="flex-1">
						<h4 className="font-medium text-amber-900">{title}</h4>
						<p className="text-sm text-amber-800 mt-1">{description}</p>
						<div className="flex items-center gap-2 mt-3">
							{showSignInButton && (
								<Button asChild variant="outline" size="sm">
									<a href={signInPath}>
										<LogIn className="h-4 w-4 mr-2" />
										Sign In
									</a>
								</Button>
							)}
							{showSignUpButton && (
								<Button asChild size="sm">
									<a href={signUpPath}>
										<UserPlus className="h-4 w-4 mr-2" />
										Sign Up
									</a>
								</Button>
							)}
						</div>
					</div>
				</div>
			</div>
		);
	}

	// Default variant - full page unauthorized with consistent screen height
	return (
		<div
			className={cn(
				"min-h-screen flex items-center justify-center px-4",
				className
			)}
		>
			<div className="text-center max-w-md">
				<div className="flex flex-col items-center space-y-6">
					<Lock className={cn("text-amber-500", iconSizes[size])} />

					<div className="space-y-2">
						<h2 className="text-2xl font-bold text-amber-900">{title}</h2>
						<p className="text-muted-foreground">{description}</p>
					</div>

					<div className="flex items-center gap-3">
						{showSignInButton && (
							<Button asChild variant="outline">
								<a href={signInPath}>
									<LogIn className="h-4 w-4 mr-2" />
									Sign In
								</a>
							</Button>
						)}
						{showSignUpButton && (
							<Button asChild>
								<a href={signUpPath}>
									<UserPlus className="h-4 w-4 mr-2" />
									Sign Up
								</a>
							</Button>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
