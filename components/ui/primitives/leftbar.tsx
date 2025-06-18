"use client";

import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetHeader,
	SheetTrigger,
} from "@/components/ui/sheet";

import { Button } from "../button";
import { AlignLeftIcon } from "lucide-react";

import { DialogTitle } from "../dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import DocsMenu from "./docs-menu";
import { LogoIcon, NavMenu } from "../sections/nav";
import { FooterButtons } from "../sections/footer";
import { UserProfileMenu } from "../sections/nav/user-profile-menu";
import { AuthButtons } from "../sections/nav/auth-buttons";
import { useAuth } from "@/components/ui/sections/auth/ProtectedRoute";
import { cn } from "@/lib/utils";

export function Leftbar() {
	return (
		<aside className="md:flex hidden w-[20rem] sticky top-16 flex-col h-[93.75vh] overflow-y-auto">
			<ScrollArea className="py-4 px-2">
				<DocsMenu />
			</ScrollArea>
		</aside>
	);
}

export function SheetLeftbar() {
	const { isAuthenticated, isLoading } = useAuth();

	return (
		<Sheet>
			<SheetTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					className={cn(
						"md:hidden flex touch-target",
						"hover:bg-naija-green-100 dark:hover:bg-naija-green-900",
						"focus-ring"
					)}
					aria-label="Open navigation menu"
				>
					<AlignLeftIcon className="h-5 w-5" />
					<span className="sr-only">Menu</span>
				</Button>
			</SheetTrigger>

			<SheetContent
				className="flex flex-col gap-0 px-0 w-[300px] sm:w-[350px]"
				side="left"
				aria-describedby="mobile-menu-description"
			>
				<DialogTitle className="sr-only">Navigation Menu</DialogTitle>
				<div id="mobile-menu-description" className="sr-only">
					Access all navigation links and documentation
				</div>

				{/* Header with logo/profile */}
				<SheetHeader className="px-6 py-4 border-b">
					<div className="flex items-center justify-between">
						<SheetClose asChild>
							<div className="cursor-pointer">
								<LogoIcon />
							</div>
						</SheetClose>

						{/* Auth section in mobile header */}
						{!isLoading && (
							<div className="flex items-center gap-2">
								{isAuthenticated ? (
									<UserProfileMenu variant="compact" />
								) : (
									<AuthButtons variant="compact" />
								)}
							</div>
						)}
					</div>
				</SheetHeader>

				{/* Navigation content */}
				<div className="flex flex-col flex-1 overflow-y-auto">
					{/* Main navigation links */}
					<div className="px-6 py-4 border-b">
						<h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
							Navigation
						</h3>
						<nav
							className="flex flex-col gap-1 items-start"
							role="navigation"
							aria-label="Main menu"
						>
							<NavMenu isSheet />
						</nav>
					</div>

					{/* Documentation menu */}
					<div className="flex-1 overflow-y-auto">
						<div className="px-6 py-4">
							<h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
								Laws
							</h3>
							<nav role="navigation" aria-label="Documentation menu">
								<DocsMenu isSheet />
							</nav>
						</div>
					</div>

					{/* Footer with social links */}
					<div className="px-6 py-4 border-t bg-muted/30">
						<h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
							Connect
						</h3>
						<div className="flex gap-2">
							<FooterButtons />
						</div>
					</div>
				</div>
			</SheetContent>
		</Sheet>
	);
}
