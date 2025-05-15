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
        body: JSON.stringify({ query, indexName: "vector-search" }), // Replace "your-index-name" with your actual index name
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
        <button className="px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200">
          Search
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Search</DialogTitle>
          <DialogDescription>
            Enter your search query to find information.
          </DialogDescription>
        </DialogHeader>
        <Input
          placeholder="Type your query..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch(searchQuery);
            }
          }}
        />
        <button
          className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          onClick={() => handleSearch(searchQuery)}
        >
          Search
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