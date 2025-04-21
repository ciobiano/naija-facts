import { buttonVariants } from "@/components/ui/button";
import { page_routes } from "@/lib/routes-config";
import clsx from "clsx";
import { MoveUpRightIcon, TerminalSquareIcon } from "lucide-react";
import Link from "next/link";

export default function Home() {
	return (
		<div className="flex sm:min-h-[87.5vh] min-h-[82vh] flex-col sm:items-center justify-center  sm:py-8 py-14">
			<Link
				href="#"
				target="_blank"
				className={clsx(
					"text-off-white bg-green-200 bg-opacity-10 border border-transparent-white backdrop-filter-[18px] hover:bg-opacity-30 transition-colors ease-in",
					"[&_.highlight]:bg-transparent-white [&_.highlight]:rounded-full [&_.highlight]:px-2 [&_.highlight:last-child]:ml-2 [&_.highlight:last-child]:-mr-2 [&_.highlight:first-child]:-ml-2 [&_.highlight:first-child]:mr-2 w-fit items-center",
					"rounded-md inline-flex gap-2 items-center text-black-text  sm:mb-8 mb-4 px-4 py-1 text-sm font-medium"
				)}
			>
				🇳🇬 Nigeria's verified Resource{" "}
			</Link>
			<h1 className="text-[1.80rem] leading-8 sm:px-8 md:leading-[4.5rem] font-bold mb-4 sm:text-6xl text-left sm:text-center">
				Know Your Rights, Know Your Country
			</h1>
			<p className="mb-8 md:text-lg text-base  max-w-[1200px] text-muted-foreground text-left sm:text-center">
				Uncover the vibrant heartbeat of Nigeria’s diverse population with our
				groundbreaking platform—your all-in-one gateway to exploring, analyzing,
				and mastering the nation's demography! Dive deep into interactive maps,
				real-time data visualizations, and engaging insights tailored to empower
				students, professionals, policymakers, and curious citizens alike.
			</p>
			<div className="sm:flex sm:flex-row grid grid-cols-2 items-center sm;gap-5 gap-3 mb-8">
				<Link
					href={`/docs${page_routes[0].href}`}
					className={buttonVariants({ className: "px-6 gap-2", size: "sm" })}
				>
					Explore constitution
					<MoveUpRightIcon className="w-4 h-4 font-extrabold" />
				</Link>
				<Link
					href="/blog"
					className={buttonVariants({
						variant: "secondary",
						className: "px-6",
						size: "sm",
					})}
				>
					Start Learning
				</Link>
			</div>
		</div>
	);
}
