import Link from "next/link";
import { buttonVariants } from "../../button";
import { CommandIcon, TwitterIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function Footer() {
	return (
		<footer className="border-t w-full h-16">
			<div className="container flex items-center sm:justify-between justify-center sm:gap-0 gap-4 h-full text-muted-foreground text-sm flex-wrap sm:py-0 py-3 max-sm:px-4">
				<div className="flex items-center gap-3">
					<CommandIcon className="sm:block hidden w-5 h-5 text-muted-foreground" />
					<p className="text-center">
						Build by{" "}
						<Link
							className="px-1 underline underline-offset-2"
							href="https://github.com/ciobiano"
						>
							ciobiano
						</Link>
						. The source code is available on{" "}
						<Link
							className="px-1 underline underline-offset-2"
							href="https://github.com/ciobiano/naija-facts"
						>
							GitHub
						</Link>
						.
					</p>
				</div>


				<div className="gap-4 items-center hidden md:flex">
					<FooterButtons />
				</div>
			</div>
		</footer>
	);
}

export function FooterButtons() {
	return (
		<>
			{/* social media links */}
			<div className="flex items-center gap-2">
				<Link href="https://x.com/sire_ralph" target="_blank"
				className={cn(
					buttonVariants({
						variant: "ghost",
						size: "icon",
					}),
					"touch-target hidden sm:flex hover:bg-naija-green-100 dark:hover:bg-naija-green-900"
				)}
				>
					<TwitterIcon	 className="h-5 w-5" />
				</Link>
			</div>
		



		</>
	);
}
