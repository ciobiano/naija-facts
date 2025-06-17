"use client";

import { ModeToggle } from "@/components/ui/primitives/theme-toggle";
import Link from "next/link";
import { Logo } from "@/components/ui/primitives/logo";
import Anchor from "@/components/ui/anchor";
import { SheetLeftbar } from "@/components/ui/primitives/leftbar";
import { page_routes } from "@/lib/routes-config";
import { SheetClose } from "@/components/ui/sheet";
import { usePathname } from "next/navigation";

import { SearchDialog } from "./search-dialog";
import { UserProfileMenu } from "./user-profile-menu";
import { AuthButtons } from "./auth-buttons";
import { useAuth } from "@/components/auth/ProtectedRoute";
import { cn } from "@/lib/utils";

export const NAVLINKS = [
	{
		title: "Laws",
		href: `/docs${page_routes[0].href}`,
		description: "Learn about Nigerian constitution and history",
	},
	{
		title: "Quiz",
		href: "/quiz",
		description: "Test your knowledge with interactive quizzes",
	},
	{
		title: "Gallery",
		href: `/cultural-content`,
		description: "Nigerian cultural content",
	},
	{
		title: "Blog",
		href: `/blog`,
		description: "Read our latest blog posts",
	},
	// {
	// 	title: "Culture",
	// 	href: `/docs${page_routes[3].href}`,
	// },
	// {
	// 	title: "Demographics",
	// 	href: `/docs${page_routes[4].href}`,
	// },
	{
		title: "Community",
		href: "https://github.com/",
		description: "Join our community discussions",
		external: true,
	},
];

export function Navbar() {
	const { isAuthenticated, isLoading } = useAuth();
	const pathname = usePathname();

	// Determine if we're on a focused content page where search should be less prominent
	const isContentFocusedPage =
		pathname?.startsWith("/quiz/") ||
		pathname?.startsWith("/cultural-content/") ||
		pathname?.includes("/results");

	return (
		<nav
			className="w-full border-b h-16 sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
			role="navigation"
			aria-label="Main navigation"
		>
			<div className="container mx-auto h-full flex items-center justify-between">
				{/* Left side - Mobile menu and logo */}
				<div className="flex items-center gap-3">
					{/* Mobile menu button */}
					<div className="md:hidden">
						<SheetLeftbar />
					</div>

					{/* Logo - simplified on mobile */}
					<div className="flex items-center">
						<LogoIcon />
					</div>
				</div>

				{/* Center - Desktop navigation */}
				<div className="hidden lg:flex items-center gap-1">
					<NavMenu />
				</div>

				{/* Right side - Actions */}
				<div className="flex items-center gap-2">
					{/* Search - adaptive sizing and prominence */}
					<div
						className={cn(
							"transition-all duration-200",
							isContentFocusedPage
								? "w-8 md:w-48" // Minimal on mobile, compact on desktop when in focused mode
								: "w-32 sm:w-48 md:w-64" // Full width when search is primary
						)}
					>
						<SearchDialog compact={isContentFocusedPage} />
					</div>

					{/* Utilities group */}
					<div className="flex items-center gap-1 border-l pl-2 ml-1">
						<ModeToggle />

						{/* Authentication */}
						{!isLoading && (
							<>
								{isAuthenticated ? (
									<UserProfileMenu variant="compact" />
								) : (
									<AuthButtons
										variant="compact"
										showSignUp={!isContentFocusedPage}
									/>
								)}
							</>
						)}
					</div>
				</div>
			</div>
		</nav>
	);
}

export function LogoIcon() {
	return (
		<Link
			href="/"
			className="flex items-center gap-2 touch-target group"
			aria-label="Naija Facts - Go to homepage"
		>
			<span className="flex-shrink-0 transition-transform group-hover:scale-105">
				<Logo className="h-7 w-7 sm:h-8 sm:w-8" />
			</span>

			{/* Responsive logo text */}
			<div className="hidden sm:block">
				<h2 className="text-lg sm:text-xl font-bold font-heading text-balance">
					<span className="text-naija-green-600 dark:text-naija-green-400">
						Naija
					</span>
					<span className="ml-1">Facts</span>
				</h2>
			</div>

			{/* Mobile-only abbreviated logo */}
			<div className="sm:hidden">
				<h2 className="text-base font-bold font-heading">
					<span className="text-naija-green-600 dark:text-naija-green-400">
						NF
					</span>
				</h2>
			</div>
		</Link>
	);
}

export function NavMenu({ isSheet = false }) {
	const pathname = usePathname();

	return (
		<>
			{NAVLINKS.map((item) => {
				const isActive =
					pathname === item.href ||
					(item.href !== "/" && pathname?.startsWith(item.href));

				const Comp = (
					<Anchor
						key={item.title + item.href}
						activeClassName="!text-primary dark:font-medium font-semibold bg-primary/10 dark:bg-primary/20"
						className={cn(
							"flex items-center gap-1 px-3 py-2 rounded-md transition-all duration-200",
							"text-sm font-medium",
							"text-muted-foreground hover:text-foreground",
							"hover:bg-accent dark:hover:bg-accent/80",
							"relative overflow-hidden group",
							isSheet ? "w-full justify-start" : "relative",
							isActive && "text-primary font-semibold bg-primary/10"
						)}
						href={item.href}
						aria-label={`${item.title} - ${item.description}`}
						{...(item.external && {
							target: "_blank",
							rel: "noopener noreferrer",
						})}
					>
						{item.title}
						{item.external && (
							<span className="sr-only" id={`${item.title}-external-link`}>
								(opens in new tab)
							</span>
						)}

						{/* Active indicator */}
						{isActive && !isSheet && (
							<div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
						)}
					</Anchor>
				);

				return isSheet ? (
					<SheetClose key={item.title + item.href} asChild>
						{Comp}
					</SheetClose>
				) : (
					Comp
				);
			})}
		</>
	);
}
