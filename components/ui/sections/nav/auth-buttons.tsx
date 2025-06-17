"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogIn, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";

interface AuthButtonsProps {
	variant?: "default" | "compact";
	showSignUp?: boolean;
	className?: string;
}

export function AuthButtons({
	variant = "default",
	showSignUp = true,
	className,
}: AuthButtonsProps) {
	const isCompact = variant === "compact";

	return (
		<div className={cn("flex items-center gap-2", className)}>
			<Button
				asChild
				variant="ghost"
				size={isCompact ? "sm" : "default"}
				className="touch-target"
			>
				<Link href="/auth/signin" className="flex items-center gap-2">
					<LogIn className="h-4 w-4" />
					{!isCompact && <span>Sign In</span>}
				</Link>
			</Button>

			{showSignUp && (
				<Button
					asChild
					variant="default"
					size={isCompact ? "sm" : "default"}
					className="bg-naija-green-600 hover:bg-naija-green-700 text-white touch-target"
				>
					<Link href="/auth/signup" className="flex items-center gap-2">
						<UserPlus className="h-4 w-4" />
						{!isCompact && <span>Sign Up</span>}
					</Link>
				</Button>
			)}
		</div>
	);
} 