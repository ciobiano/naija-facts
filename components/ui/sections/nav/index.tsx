import { ModeToggle } from "@/components/ui/primitives/theme-toggle";
import { GithubIcon, TwitterIcon, CommandIcon, LucideAlertOctagon } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/ui/primitives/logo";
import Anchor from "@/components/ui/anchor";
import { SheetLeftbar } from "@/components/ui/primitives/leftbar";
import { page_routes } from "@/lib/routes-config";
import AlgoliaSearch from "./algolia-search";
import { SheetClose } from "@/components/ui/sheet";
import { buttonVariants } from "@/components/ui/button";
import TransformersSearch from "./transformers-search";
import { SearchDialog } from "./search-dialog";

export const NAVLINKS = [
	{
		title: "Docs",
		href: `/docs${page_routes[0].href}`,
	},
	{
		title: "Constitution",
		href: `/constitution`,
	},
	// {
	// 	title: "History",
	// 	href: `/docs${page_routes[2].href}`,
	// },
	// {
	// 	title: "Culture",
	// 	href: `/docs${page_routes[3].href}`,
	// },
	// {
	// 	title: "Demographics",
	// 	href: `/docs${page_routes[4].href}`,
	// },
	{
		title: "Quiz",
		href: "/blog",
	},
	
	{
		title: "Community",
		href: "https://github.com/",
	},
];

const algolia_props = {
	appId: process.env.ALGOLIA_APP_ID!,
	indexName: process.env.ALGOLIA_INDEX!,
	apiKey: process.env.ALGOLIA_SEARCH_API_KEY!,
};

export function Navbar() {
	return (
		<nav className="w-full border-b h-16 sticky top-0 z-50 bg-background">
			<div className="sm:container mx-auto w-[95vw] h-full flex items-center sm:justify-between md:gap-2">
				<div className="flex items-center sm:gap-5 gap-2.5">
					<SheetLeftbar />
					<div className="flex items-center gap-8">
						<div className="lg:flex hidden">
							<LogoIcon />
						</div>
						<div className="md:flex hidden items-center gap-4 text-sm font-medium text-muted-foreground">
							<NavMenu />
						</div>
					</div>
				</div>

				<div className="flex items-center sm:justify-normal justify-between sm:gap-3 ml-1 sm:w-fit w-[90%]">

					<SearchDialog />
					<div className="flex items-center justify-between sm:gap-2">
						<div className="flex ml-4 sm:ml-0">
							<Link
								href="https://github.com/nisabmohd/NexDocs"
								className={buttonVariants({
									variant: "ghost",
									size: "icon",
								})}
							>
								<GithubIcon className="h-[1.1rem] w-[1.1rem]" />
							</Link>
							<Link
								href="#"
								className={buttonVariants({
									variant: "ghost",
									size: "icon",
								})}
							>
								<TwitterIcon className="h-[1.1rem] w-[1.1rem]" />
							</Link>
							<ModeToggle />
						</div>
					</div>
				</div>
			</div>
		</nav>
	);
}

export function LogoIcon() {
	return (
		<Link href="/" className="flex items-center gap-2.5">
			<span>

			<Logo className="h-8 w-8 "/>
			</span>
			
			<h2 className="text-md font-bold font-code">Naija Facts</h2>
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
						activeClassName="!text-primary dark:font-medium font-semibold"
						absolute
						className="flex items-center gap-1 sm:text-sm text-[14.5px] dark:text-stone-300/85 text-stone-800"
						href={item.href}
					>
						{item.title}
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
