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
import {  LogoIcon, NavMenu } from "../sections/nav";
import { FooterButtons } from "../sections/footer";

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
	return (
		<Sheet>
			<SheetTrigger asChild>
				<Button variant="ghost" size="icon" className="md:hidden flex">
					<AlignLeftIcon />
				</Button>
			</SheetTrigger>
			<SheetContent className="flex flex-col gap-4 px-0" side="left">
				<DialogTitle className="sr-only">Menu</DialogTitle>
				<SheetHeader>
					<SheetClose className="px-5" asChild>
						<LogoIcon />
					</SheetClose>
				</SheetHeader>
				<div className="flex flex-col gap-4 overflow-y-auto">
					<div className="flex flex-col gap-2.5 mt-3 mx-2 px-5">
						<NavMenu isSheet />
					</div>
					<div className="ml-2 pl-5">
						<DocsMenu isSheet />
					</div>
					<div className="p-6 pb-4 flex gap-2.5">
						<FooterButtons />
					</div>
				</div>
			</SheetContent>
		</Sheet>
	);
}
