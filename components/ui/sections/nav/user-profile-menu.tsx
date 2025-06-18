"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
	User,
	Settings,
	LogOut,
	Shield,
	ChevronDown,
	Trophy,
} from "lucide-react";
import { useAuth } from "@/components/ui/sections/auth/ProtectedRoute";
import { cn } from "@/lib/utils";

interface UserProfileMenuProps {
	variant?: "default" | "compact";
	showBadge?: boolean;
	className?: string;
}

export function UserProfileMenu({
	variant = "default",
	showBadge = true,
	className,
}: UserProfileMenuProps) {
	const { user, isAuthenticated, role, isLoading } = useAuth();
	const [isSigningOut, setIsSigningOut] = useState(false);

	// Don't render if not authenticated or still loading
	if (!isAuthenticated || isLoading || !user) {
		return null;
	}

	const handleSignOut = async () => {
		try {
			setIsSigningOut(true);
			await signOut({
				callbackUrl: "/",
				redirect: true,
			});
		} catch (error) {
			console.error("Sign out error:", error);
			setIsSigningOut(false);
		}
	};

	// Get user initials for avatar fallback
	const getInitials = (name?: string | null) => {
		if (!name) return "U";
		return name
			.split(" ")
			.map((n) => n[0])
			.join("")
			.toUpperCase()
			.substring(0, 2);
	};

	const isCompact = variant === "compact";

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					className={cn(
						"relative h-auto p-1 hover:bg-accent",
						isCompact ? "w-10 h-10" : "w-auto px-2 py-1",
						className
					)}
					aria-label="User profile menu"
				>
					<div className="flex items-center gap-2">
						<div className="relative">
							<Avatar className={cn(isCompact ? "h-8 w-8" : "h-9 w-9")}>
								<AvatarImage
									src={user.image || undefined}
									alt={user.name || "User avatar"}
								/>
								<AvatarFallback className="bg-naija-green-100 text-naija-green-700 dark:bg-naija-green-900 dark:text-naija-green-300 font-semibold">
									{getInitials(user.name)}
								</AvatarFallback>
							</Avatar>
							{role === "admin" && showBadge && (
								<div className="absolute -top-1 -right-1">
									<Badge
										variant="destructive"
										className="h-4 w-4 p-0 flex items-center justify-center text-xs"
									>
										<Shield className="h-2.5 w-2.5" />
									</Badge>
								</div>
							)}
						</div>

						{!isCompact && (
							<div className="flex items-center gap-1 max-w-32">
								<div className="text-left min-w-0">
									<p className="text-sm font-medium leading-none truncate">
										{user.name || "User"}
									</p>
									<p className="text-xs text-muted-foreground truncate">
										{user.email}
									</p>
								</div>
								<ChevronDown className="h-3 w-3 text-muted-foreground" />
							</div>
						)}
					</div>
				</Button>
			</DropdownMenuTrigger>

			<DropdownMenuContent align="end" className="w-64" sideOffset={8}>
				{/* User Info Header */}
				<DropdownMenuLabel className="pb-2">
					<div className="flex items-center gap-3">
						<Avatar className="h-10 w-10">
							<AvatarImage
								src={user.image || undefined}
								alt={user.name || "User avatar"}
							/>
							<AvatarFallback className="bg-naija-green-100 text-naija-green-700 dark:bg-naija-green-900 dark:text-naija-green-300">
								{getInitials(user.name)}
							</AvatarFallback>
						</Avatar>
						<div className="flex-1 min-w-0">
							<p className="font-medium text-sm truncate">
								{user.name || "User"}
							</p>
							<p className="text-xs text-muted-foreground truncate">
								{user.email}
							</p>
							<div className="flex items-center gap-1 mt-1">
								{role === "admin" && (
									<Badge variant="secondary" className="text-xs px-1.5 py-0">
										<Shield className="h-3 w-3 mr-1" />
										Admin
									</Badge>
								)}
							</div>
						</div>
					</div>
				</DropdownMenuLabel>

				<DropdownMenuSeparator />

				{/* Profile Settings */}
				<DropdownMenuItem asChild>
					<Link
						href="/profile"
						className="flex items-center gap-2 cursor-pointer"
					>
						<User className="h-4 w-4" />
						<span>Profile Settings</span>
					</Link>
				</DropdownMenuItem>

				{/* Quiz Progress/Stats - could be added later */}
				<DropdownMenuItem asChild>
					<Link
						href="/profile?tab=progress"
						className="flex items-center gap-2 cursor-pointer"
					>
						<Trophy className="h-4 w-4" />
						<span>My Progress</span>
					</Link>
				</DropdownMenuItem>

				{/* Admin Settings */}
				{role === "admin" && (
					<>
						<DropdownMenuSeparator />
						<DropdownMenuItem asChild>
							<Link
								href="/admin"
								className="flex items-center gap-2 cursor-pointer"
							>
								<Settings className="h-4 w-4" />
								<span>Admin Dashboard</span>
							</Link>
						</DropdownMenuItem>
					</>
				)}

				<DropdownMenuSeparator />

				{/* Sign Out */}
				<DropdownMenuItem
					className="text-red-600 focus:text-red-600 cursor-pointer"
					onClick={handleSignOut}
					disabled={isSigningOut}
				>
					<LogOut className="h-4 w-4 mr-2" />
					<span>{isSigningOut ? "Signing out..." : "Sign out"}</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

// Simple profile badge for areas where you just want to show authentication status
export function ProfileBadge({
	showName = true,
	className,
}: {
	showName?: boolean;
	className?: string;
}) {
	const { user, isAuthenticated, role } = useAuth();

	if (!isAuthenticated || !user) {
		return null;
	}

	const getInitials = (name?: string | null) => {
		if (!name) return "U";
		return name
			.split(" ")
			.map((n) => n[0])
			.join("")
			.toUpperCase()
			.substring(0, 2);
	};

	return (
		<div className={cn("flex items-center gap-2", className)}>
			<div className="relative">
				<Avatar className="h-8 w-8">
					<AvatarImage
						src={user.image || undefined}
						alt={user.name || "User avatar"}
					/>
					<AvatarFallback className="bg-naija-green-100 text-naija-green-700 dark:bg-naija-green-900 dark:text-naija-green-300 text-sm">
						{getInitials(user.name)}
					</AvatarFallback>
				</Avatar>
				{role === "admin" && (
					<div className="absolute -top-1 -right-1">
						<Badge
							variant="destructive"
							className="h-4 w-4 p-0 flex items-center justify-center"
						>
							<Shield className="h-2.5 w-2.5" />
						</Badge>
					</div>
				)}
			</div>
			{showName && (
				<div className="text-left min-w-0">
					<p className="text-sm font-medium leading-none truncate">
						{user.name || "User"}
					</p>
				</div>
			)}
		</div>
	);
}
