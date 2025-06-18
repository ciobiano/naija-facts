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
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search } from "lucide-react";

interface SearchResult {
	content: string;
	source: string;
}

interface SearchDialogProps {
	compact?: boolean;
}

export function SearchDialog({ compact = false }: SearchDialogProps) {
	const [open, setOpen] = React.useState(false);
	const [searchQuery, setSearchQuery] = React.useState("");
	const [searchResults, setSearchResults] = React.useState<SearchResult[]>([]);
	const [isLoading, setIsLoading] = React.useState(false);

	// Keyboard shortcut to open search
	React.useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key === "k") {
				e.preventDefault();
				setOpen(true);
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, []);

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

	// Compact version - shows only search icon on mobile
	if (compact) {
		return (
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogTrigger asChild>
					<div className="flex items-center">
						{/* Mobile: Icon only */}
						<Button
							variant="ghost"
							size="icon"
							className="md:hidden h-9 w-9"
							aria-label="Open search (Cmd+K)"
						>
							<Search className="h-4 w-4" />
						</Button>

						{/* Desktop: Compact search bar */}
						<div className="hidden md:block relative">
							<div className="relative border rounded-lg w-48">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
								<Input
									type="text"
									placeholder="Search..."
									className="w-full h-9 pl-10 pr-12 text-sm bg-transparent border-0 focus-visible:ring-1"
									onClick={() => setOpen(true)}
									readOnly
								/>
								<div className="absolute right-2 top-1/2 transform -translate-y-1/2 hidden sm:flex items-center gap-0.5 text-xs font-mono">
									<kbd className="bg-muted border rounded px-1 py-0.5">⌘</kbd>
									<kbd className="bg-muted border rounded px-1 py-0.5">K</kbd>
								</div>
							</div>
						</div>
					</div>
				</DialogTrigger>

				<DialogContent className="sm:max-w-[600px]">
					<DialogHeader>
						<DialogTitle>Ask AI</DialogTitle>
						<DialogDescription>
							Enter your search query to find information.
						</DialogDescription>
					</DialogHeader>

					<div className="flex gap-2">
						<Input
							placeholder="Ask AI your query..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									handleSearch(searchQuery);
								}
							}}
							className="flex-1"
							autoFocus
						/>
						<Button
							onClick={() => handleSearch(searchQuery)}
							disabled={!searchQuery.trim() || isLoading}
							className="bg-naija-green-600 hover:bg-naija-green-700"
						>
							{isLoading ? "..." : "Send"}
						</Button>
					</div>

					{isLoading ? (
						<div className="flex items-center justify-center py-8">
							<div className="text-sm text-muted-foreground">Searching...</div>
						</div>
					) : (
						<ScrollArea className="h-[300px] w-full rounded-md border p-4">
							{searchResults.length > 0 ? (
								<div className="space-y-4">
									{searchResults.map((result, index) => (
										<div key={index} className="border-b pb-3 last:border-b-0">
											<p className="text-sm leading-relaxed">
												{result.content}
											</p>
											<p className="text-xs text-muted-foreground mt-2">
												Source: {result.source}
											</p>
										</div>
									))}
								</div>
							) : searchQuery ? (
								<div className="text-center py-8 text-muted-foreground">
									No results found. Try a different query.
								</div>
							) : (
								<div className="text-center py-8 text-muted-foreground">
									Enter a query to search
								</div>
							)}
						</ScrollArea>
					)}
				</DialogContent>
			</Dialog>
		);
	}

	// Default full version
	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<div className="relative border rounded-lg">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
					<Input
						type="text"
						placeholder="Ask AI..."
						className="w-full h-10 pl-10 pr-16 text-sm bg-transparent border-0 focus-visible:ring-1"
						onClick={() => setOpen(true)}
						readOnly
					/>
					<div className="absolute right-2 top-1/2 transform -translate-y-1/2 hidden sm:flex items-center gap-0.5 text-xs font-mono">
						<kbd className="bg-muted border rounded px-1.5 py-0.5">⌘</kbd>
						<kbd className="bg-muted border rounded px-1.5 py-0.5">K</kbd>
					</div>
				</div>
			</DialogTrigger>

			<DialogContent className="sm:max-w-[600px]">
				<DialogHeader>
					<DialogTitle>Ask AI</DialogTitle>
					<DialogDescription>
						Enter your search query to find information.
					</DialogDescription>
				</DialogHeader>

				<div className="flex gap-2">
					<Input
						placeholder="Ask AI your query..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								handleSearch(searchQuery);
							}
						}}
						className="flex-1"
						autoFocus
					/>
					<Button
						onClick={() => handleSearch(searchQuery)}
						disabled={!searchQuery.trim() || isLoading}
						className="bg-naija-green-600 hover:bg-naija-green-700"
					>
						{isLoading ? "..." : "Send"}
					</Button>
				</div>

				{isLoading ? (
					<div className="flex items-center justify-center py-8">
						<div className="text-sm text-muted-foreground">Searching...</div>
					</div>
				) : (
					<ScrollArea className="h-[300px] w-full rounded-md border p-4">
						{searchResults.length > 0 ? (
							<div className="space-y-4">
								{searchResults.map((result, index) => (
									<div key={index} className="border-b pb-3 last:border-b-0">
										<p className="text-sm leading-relaxed">{result.content}</p>
										<p className="text-xs text-muted-foreground mt-2">
											Source: {result.source}
										</p>
									</div>
								))}
							</div>
						) : searchQuery ? (
							<div className="text-center py-8 text-muted-foreground">
								No results found. Try a different query.
							</div>
						) : (
							<div className="text-center py-8 text-muted-foreground">
								Enter a query to search
							</div>
						)}
					</ScrollArea>
				)}
			</DialogContent>
		</Dialog>
	);
}
