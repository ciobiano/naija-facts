"use client";

import React, { useEffect, useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Play,
	Pause,
	Clock,
	Save,
	AlertTriangle,
	RotateCcw,
} from "lucide-react";
import { useQuizSession, useQuizTimer } from "@/hooks/useQuizSession";
import { cn } from "@/lib/utils";

interface QuizSessionManagerProps {
	onSessionExpired?: () => void;
	onSessionPaused?: () => void;
	onSessionResumed?: () => void;
	autoSave?: boolean;
	showControls?: boolean;
	className?: string;
}

export function QuizSessionManager({
	onSessionExpired,
	onSessionPaused,
	onSessionResumed,
	autoSave = true,
	showControls = true,
	className,
}: QuizSessionManagerProps) {
	const {
		sessionId,
		isQuizCompleted,
		isQuizPaused,
		timeRemaining,
		saveSession,
		pauseQuiz,
		resumeQuiz,
		completeQuiz,
		lastActivityTime,
		autoSaveInterval,
	} = useQuizSession();

	const { formatTime, decrementTime } = useQuizTimer();

	const [showPauseDialog, setShowPauseDialog] = useState(false);
	const [showTimeWarning, setShowTimeWarning] = useState(false);
	const [lastSaveTime, setLastSaveTime] = useState(Date.now());
	const [isVisible, setIsVisible] = useState(true);

	// Timer effect
	useEffect(() => {
		if (!sessionId || isQuizCompleted || isQuizPaused) return;

		const timer = setInterval(() => {
			decrementTime();
		}, 1000);

		return () => clearInterval(timer);
	}, [sessionId, isQuizCompleted, isQuizPaused, decrementTime]);

	// Auto-save effect
	useEffect(() => {
		if (!sessionId || !autoSave) return;

		const autoSaveTimer = setInterval(() => {
			saveSession();
			setLastSaveTime(Date.now());
		}, autoSaveInterval);

		return () => clearInterval(autoSaveTimer);
	}, [sessionId, autoSave, autoSaveInterval, saveSession]);

	// Time warning effect
	useEffect(() => {
		if (
			timeRemaining <= 30 &&
			timeRemaining > 0 &&
			!isQuizCompleted &&
			!isQuizPaused
		) {
			setShowTimeWarning(true);
		} else {
			setShowTimeWarning(false);
		}
	}, [timeRemaining, isQuizCompleted, isQuizPaused]);

	// Session expiry effect
	useEffect(() => {
		if (timeRemaining === 0 && !isQuizCompleted) {
			completeQuiz();
			onSessionExpired?.();
		}
	}, [timeRemaining, isQuizCompleted, completeQuiz, onSessionExpired]);

	// Page visibility change handler
	useEffect(() => {
		const handleVisibilityChange = () => {
			setIsVisible(!document.hidden);

			if (document.hidden && !isQuizPaused && !isQuizCompleted) {
				// Optionally pause when tab becomes hidden
				// pauseQuiz();
				// onSessionPaused?.();
			}
		};

		document.addEventListener("visibilitychange", handleVisibilityChange);
		return () => {
			document.removeEventListener("visibilitychange", handleVisibilityChange);
		};
	}, [isQuizPaused, isQuizCompleted]);

	// Beforeunload handler to save session
	useEffect(() => {
		const handleBeforeUnload = (e: BeforeUnloadEvent) => {
			if (sessionId && !isQuizCompleted) {
				saveSession();
				e.preventDefault();
				e.returnValue =
					"You have an active quiz session. Are you sure you want to leave?";
			}
		};

		window.addEventListener("beforeunload", handleBeforeUnload);
		return () => {
			window.removeEventListener("beforeunload", handleBeforeUnload);
		};
	}, [sessionId, isQuizCompleted, saveSession]);

	const handlePauseClick = () => {
		if (isQuizPaused) {
			resumeQuiz();
			setShowPauseDialog(false);
			onSessionResumed?.();
		} else {
			setShowPauseDialog(true);
		}
	};

	const confirmPause = () => {
		pauseQuiz();
		setShowPauseDialog(false);
		onSessionPaused?.();
	};

	const handleSaveClick = () => {
		saveSession();
		setLastSaveTime(Date.now());
	};

	const getTimeColor = () => {
		if (timeRemaining <= 30) return "text-red-600";
		if (timeRemaining <= 60) return "text-yellow-600";
		return "text-green-600";
	};

	if (!sessionId) return null;

	return (
		<>
			{/* Session Controls */}
			{showControls && (
				<Card className={cn("mb-4", className)}>
					<CardContent className="pt-4">
						<div className="flex items-center justify-between">
							{/* Timer Display */}
							<div className="flex items-center space-x-2">
								<Clock className="h-4 w-4" />
								<span
									className={cn(
										"font-mono text-sm font-medium",
										getTimeColor()
									)}
								>
									{formatTime(timeRemaining)}
								</span>
								{isQuizPaused && (
									<span className="text-xs text-muted-foreground">
										(Paused)
									</span>
								)}
							</div>

							{/* Control Buttons */}
							<div className="flex items-center space-x-2">
								{/* Auto-save indicator */}
								{autoSave && (
									<div className="flex items-center space-x-1 text-xs text-muted-foreground">
										<Save className="h-3 w-3" />
										<span>Auto-saving</span>
									</div>
								)}

								{/* Pause/Resume Button */}
								<Button
									variant="outline"
									size="sm"
									onClick={handlePauseClick}
									disabled={isQuizCompleted}
									className="flex items-center space-x-1"
								>
									{isQuizPaused ? (
										<>
											<Play className="h-4 w-4" />
											<span>Resume</span>
										</>
									) : (
										<>
											<Pause className="h-4 w-4" />
											<span>Pause</span>
										</>
									)}
								</Button>

								{/* Manual Save Button */}
								<Button
									variant="outline"
									size="sm"
									onClick={handleSaveClick}
									disabled={isQuizCompleted}
									className="flex items-center space-x-1"
								>
									<Save className="h-4 w-4" />
									<span>Save</span>
								</Button>
							</div>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Time Warning Alert */}
			{showTimeWarning && (
				<Alert className="mb-4 border-yellow-200 bg-yellow-50">
					<AlertTriangle className="h-4 w-4 text-yellow-600" />
					<AlertDescription className="text-yellow-800">
						<strong>Time Warning:</strong> You have less than 30 seconds
						remaining!
					</AlertDescription>
				</Alert>
			)}

			{/* Pause Confirmation Dialog */}
			<Dialog open={showPauseDialog} onOpenChange={setShowPauseDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Pause Quiz Session</DialogTitle>
						<DialogDescription>
							Are you sure you want to pause the quiz? Your progress will be
							saved, but the timer will stop until you resume.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={() => setShowPauseDialog(false)}>
							Cancel
						</Button>
						<Button onClick={confirmPause}>
							<Pause className="h-4 w-4 mr-2" />
							Pause Quiz
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Quiz Paused Overlay */}
			{isQuizPaused && (
				<Card className="mb-4 border-blue-200 bg-blue-50">
					<CardContent className="pt-4">
						<div className="flex items-center justify-between">
							<div className="flex items-center space-x-2">
								<Pause className="h-5 w-5 text-blue-600" />
								<div>
									<h3 className="font-medium text-blue-900">Quiz Paused</h3>
									<p className="text-sm text-blue-700">
										Click resume to continue your quiz session.
									</p>
								</div>
							</div>
							<Button onClick={() => resumeQuiz()} size="sm">
								<Play className="h-4 w-4 mr-2" />
								Resume Quiz
							</Button>
						</div>
					</CardContent>
				</Card>
			)}
		</>
	);
}

// Session Recovery Component
interface SessionRecoveryProps {
	onRecover: () => void;
	onDiscard: () => void;
	sessionInfo?: {
		categoryName: string;
		timeRemaining: number;
		progress: number;
		lastActivity: number;
	};
}

export function SessionRecovery({
	onRecover,
	onDiscard,
	sessionInfo,
}: SessionRecoveryProps) {
	const { formatTime } = useQuizTimer();

	if (!sessionInfo) return null;

	const timeSinceLastActivity = Math.floor(
		(Date.now() - sessionInfo.lastActivity) / 1000
	);

	return (
		<Card className="mb-4 border-green-200 bg-green-50">
			<CardContent className="pt-4">
				<div className="flex items-start justify-between">
					<div className="space-y-2">
						<div className="flex items-center space-x-2">
							<RotateCcw className="h-5 w-5 text-green-600" />
							<h3 className="font-medium text-green-900">
								Previous Session Found
							</h3>
						</div>
						<div className="text-sm text-green-700 space-y-1">
							<p>
								<strong>Quiz:</strong> {sessionInfo.categoryName}
							</p>
							<p>
								<strong>Progress:</strong> {Math.round(sessionInfo.progress)}%
								complete
							</p>
							<p>
								<strong>Time Remaining:</strong>{" "}
								{formatTime(sessionInfo.timeRemaining)}
							</p>
							<p>
								<strong>Last Activity:</strong>{" "}
								{timeSinceLastActivity < 60
									? `${timeSinceLastActivity} seconds ago`
									: `${Math.floor(timeSinceLastActivity / 60)} minutes ago`}
							</p>
						</div>
					</div>
					<div className="flex space-x-2">
						<Button
							variant="outline"
							size="sm"
							onClick={onDiscard}
							className="text-red-600 hover:text-red-700"
						>
							Discard
						</Button>
						<Button size="sm" onClick={onRecover}>
							Continue Session
						</Button>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
