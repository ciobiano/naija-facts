"use client";

import { useState, useEffect, useRef } from "react";

export default function TransformersSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    if (!query) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/ai-search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.answer) {
        setResults([{ answer: data.answer, sources: data.sources }]);
      } else {
        setResults([{ answer: "No answer found.", sources: [] }]);
      }
    } catch (error: any) {
      console.error("Error during search:", error);
      setResults([{ answer: "Error during search. Please try again.", sources: [] }]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (query) {
      handleSearch();
    } else {
      setResults([]);
    }
  }, [query]);

  return (
    <div className="relative border rounded-lg sm:w-fit w-[68%]">
      <input
        type="text"
        placeholder="Search..."
        className="w-full px-4 py-2 rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-primary"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        ref={searchInputRef}
      />
      <div className="absolute right-2 top-[0.4rem] hidden items-center gap-0.5 text-xs font-code sm:flex pointer-events-none">
        <div className="bg-background/30 border rounded-md py-0.5 px-1 dark:border-neutral-700 border-neutral-300">
          Ctrl
        </div>
        <div className="bg-background/30 border rounded-md py-0.5 px-[0.28rem] dark:border-neutral-700 border-neutral-300">
          K
        </div>
      </div>
      {isLoading && <div className="absolute top-full left-0 w-full bg-white border rounded-md shadow-md p-4">Loading...</div>}
      {results.length > 0 && (
        <div className="absolute z-10 top-full left-0 w-full bg-white border rounded-md shadow-md">
          <ul>
            {results.map((result, index) => (
              <li key={index} className="px-4 py-2 hover:bg-gray-100">
                <p>{result.answer}</p>
                {result.sources && result.sources.length > 0 && (
                  <ul>
                    {result.sources.map((source: string, sourceIndex: number) => (
                      <li key={sourceIndex} className="text-sm text-gray-500">Source: {source}</li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}