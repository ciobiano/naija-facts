"use client";

import { useEffect } from "react";
import { useQuizSession } from "@/hooks/useQuizSession";

interface QuizSessionManagerProps {
	children: React.ReactNode;
}

export function QuizSessionManager({ children }: QuizSessionManagerProps) {
	const { sessionId, clearSession } = useQuizSession();

	useEffect(() => {
		const handleBeforeUnload = () => {
			if (sessionId) {
				clearSession();
			}
		};

		window.addEventListener("beforeunload", handleBeforeUnload);
		return () => window.removeEventListener("beforeunload", handleBeforeUnload);
	}, [sessionId, clearSession]);

	return <>{children}</>;
}
