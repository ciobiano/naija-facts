"use client";

import * as React from "react";
import {
	Dialog,
	DialogTrigger,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import { ScrollArea } from "@/components/ui/scroll-area";

export function SearchDialog() {
	const [open, setOpen] = React.useState(false);
	const [searchQuery, setSearchQuery] = React.useState("");
	const [searchResults, setSearchResults] = React.useState<any[]>([]);
	const [isLoading, setIsLoading] = React.useState(false);

	const handleSearch = async (query: string) => {
		setSearchResults([]);
		setIsLoading(true);
		try {
			const response = await fetch("/api/ai-search", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ query, indexName: "vector-search" }),
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const data = await response.json();
			setSearchResults(data.topChunks || []);
		} catch (error) {
			console.error("Error during search:", error);
			setSearchResults([]);
		} finally {
			setIsLoading(false);
		}
	};

	return (
    <Dialog open={open} onOpenChange={setOpen}>
				<DialogTrigger asChild>
        <div className="relative border rounded-lg sm:w-fit w-[68%]">
          <Input
            type="text"
            placeholder="Ask AI..."
            className="w-full h-10 pl-10 pr-4 text-sm font-medium text-muted-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 focus-visible:border-none"
            onClick={() => setOpen(true)}
            
         
          />
          <div className="absolute right-2 top-[0.4rem] hidden items-center gap-0.5 text-xs font-code sm:flex pointer-events-none">
            <div className="bg-background/30 border rounded-md py-0.5 px-1 dark:border-neutral-700 border-neutral-300">
              Ctrl
            </div>
            <div className="bg-background/30 border rounded-md py-0.5 px-[0.28rem] dark:border-neutral-700 border-neutral-300">
              K
            </div>
          </div>
          </div>
				</DialogTrigger>
				<DialogContent className="sm:max-w-[600px]">
					<DialogHeader>
						<DialogTitle> Ask AI</DialogTitle>
						<DialogDescription>
							Enter your search query to find information.
						</DialogDescription>
					</DialogHeader>
					<Input
						placeholder="Asking AI your query..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								handleSearch(searchQuery);
							}
						}}
					/>
					<button
						className="ml-2 px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-600"
						onClick={() => handleSearch(searchQuery)}
					>
						send
					</button>
					{isLoading ? (
						<div>Loading...</div>
					) : (
						<ScrollArea className="h-[300px] w-full rounded-md border p-4 mt-4">
							{searchResults.length > 0 ? (
								<ul>
									{searchResults.map((result, index) => (
										<li key={index} className="mb-4">
											<p className="text-sm font-medium">{result.content}</p>
											<p className="text-xs text-muted-foreground">
												Source: {result.source}
											</p>
										</li>
									))}
								</ul>
							) : (
								<div>No results found.</div>
							)}
						</ScrollArea>
					)}
				</DialogContent>
			</Dialog>
		
	);
}
