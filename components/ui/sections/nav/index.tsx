import { ModeToggle } from "@/components/ui/primitives/theme-toggle";
import Link from "next/link";
import { Logo } from "@/components/ui/primitives/logo";
import Anchor from "@/components/ui/anchor";
import { SheetLeftbar } from "@/components/ui/primitives/leftbar";
import { page_routes } from "@/lib/routes-config";
import { SheetClose } from "@/components/ui/sheet";
import { buttonVariants } from "@/components/ui/button";
import { SearchDialog } from "./search-dialog";
import { cn } from "@/lib/utils";
import { GithubIcon, TwitterIcon } from "lucide-react";

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
	return (
		<nav
			className="w-full border-b h-16 sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
			role="navigation"
			aria-label="Main navigation"
		>
			<div className="container mx-auto h-full flex items-center justify-between">
				{/* Mobile menu and logo section */}
				<div className="flex items-center gap-2 sm:gap-4">
					{/* Mobile menu button - only visible on small screens */}
					<div className="md:hidden">
						<SheetLeftbar />
					</div>

					{/* Logo - responsive sizing */}
					<div className="flex items-center">
						<LogoIcon />
					</div>
				</div>

				{/* Desktop navigation - hidden on mobile */}
				<div className="hidden md:flex items-center gap-6 lg:gap-8">
					<NavMenu />
				</div>

				{/* Right side actions */}
				<div className="flex items-center gap-1 sm:gap-2 space-x-2">
					{/* Search - responsive width */}
					<div className="w-full max-w-sm">
						<SearchDialog />
					</div>

					{/* Social links and theme toggle */}
					<div className="flex items-center">
						<Link
							href="https://github.com/nisabmohd/NexDocs"
							className={cn(
								buttonVariants({
									variant: "ghost",
									size: "icon",
								}),
								"touch-target hidden sm:flex hover:bg-naija-green-100 dark:hover:bg-naija-green-900"
							)}
							aria-label="Visit our GitHub repository"
						>
							<GithubIcon className="h-5 w-5" />
						</Link>

						<Link
							href="#"
							className={cn(
								buttonVariants({
									variant: "ghost",
									size: "icon",
								}),
								"touch-target hidden sm:flex hover:bg-naija-green-100 dark:hover:bg-naija-green-900"
							)}
							aria-label="Follow us on Twitter"
						>
							<TwitterIcon className="h-5 w-5" />
						</Link>

						<ModeToggle />
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
			className="flex items-center gap-2 sm:gap-3 touch-target "
			aria-label="Naija Facts - Go to homepage"
		>
			<span className="flex-shrink-0">
				<Logo className="h-7 w-7 sm:h-8 sm:w-8" />
			</span>

			<div className="hidden sm:block">
				<h2 className="text-lg sm:text-xl font-bold font-heading text-balance">
					<span className="text-naija-green-600 dark:text-naija-green-400">
						Naija
					</span>
					<span className="ml-1">Facts</span>
				</h2>
			</div>

			{/* Mobile-only abbreviated logo */}
			<div className="sm:hidden px-4">
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
	return (
		<>
			{NAVLINKS.map((item) => {
				const Comp = (
					<Anchor
						key={item.title + item.href}
						activeClassName="!text-primary dark:font-medium font-semibold bg-primary/10 dark:bg-primary/20"

						className={cn(
							"flex items-center  gap-1 px-3 py-2 rounded-md transition-colors",
							"text-sm sm:text-base font-medium",
							"text-muted-foreground hover:text-foreground",
							"hover:bg-accent dark:hover:bg-accent/80",
						
							isSheet ? "w-full justify-start " : "relative"
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
