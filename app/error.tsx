"use client"; // Error components must be Client Components

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({ reset }: { reset: () => void }) {
	useEffect(() => {
		// Log the error to an error reporting service
		console.error("Application error occurred");
	}, []);

	return (
		<div className="min-h-screen flex items-center justify-center">
			<div className="text-center">
				<h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
				<Button onClick={() => reset()}>Try again</Button>
			</div>
		</div>
	);
}
