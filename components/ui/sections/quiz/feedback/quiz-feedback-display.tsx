"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	CheckCircle,
	XCircle,
	ExternalLink,
	TrendingUp,
	Lightbulb,
	Target,
	Award,
	Brain,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { QuizFeedback, LearningMaterial, FeedbackAnimation } from "@/types";

interface QuizFeedbackDisplayProps {
	feedback: QuizFeedback;
	questionId: string;
	questionText: string;
	showLearningMaterials?: boolean;
	showPerformanceInsights?: boolean;
	className?: string;
}

export function QuizFeedbackDisplay({
	feedback,
	questionId,
	questionText,
	showLearningMaterials = true,
	showPerformanceInsights = true,
	className,
}: QuizFeedbackDisplayProps) {
	const [showAnimation, setShowAnimation] = useState(true);

	useEffect(() => {
		// Trigger animation for immediate feedback
		setShowAnimation(true);
		const timer = setTimeout(() => setShowAnimation(false), 2000);
		return () => clearTimeout(timer);
	}, [feedback]);

	const getFeedbackIcon = () => {
		return feedback.isCorrect ? (
			<CheckCircle className="h-6 w-6 text-green-600" />
		) : (
			<XCircle className="h-6 w-6 text-red-600" />
		);
	};

	const getFeedbackColors = () => {
		return feedback.isCorrect
			? {
					border: "border-green-200",
					bg: "bg-green-50",
					text: "text-green-800",
					accent: "text-green-600",
			  }
			: {
					border: "border-red-200",
					bg: "bg-red-50",
					text: "text-red-800",
					accent: "text-red-600",
			  };
	};

	const colors = getFeedbackColors();

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3 }}
			className={cn("space-y-6", className)}
		>
			{/* Immediate Feedback Section */}
			<Card
				className={cn("relative overflow-hidden", colors.border, colors.bg)}
			>
				<AnimatePresence>
					{showAnimation && (
						<motion.div
							initial={{ opacity: 0, scale: 0 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0 }}
							className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm"
						>
							<motion.div
								initial={{ scale: 0 }}
								animate={{ scale: [0, 1.2, 1] }}
								transition={{ duration: 0.6, times: [0, 0.6, 1] }}
								className="flex items-center space-x-3"
							>
								{getFeedbackIcon()}
								<span className={cn("text-2xl font-bold", colors.accent)}>
									{feedback.isCorrect ? "Correct!" : "Try Again!"}
								</span>
							</motion.div>
						</motion.div>
					)}
				</AnimatePresence>

				<CardHeader className="pb-3">
					<div className="flex items-center space-x-3">
						{getFeedbackIcon()}
						<div>
							<CardTitle className={cn("text-lg", colors.text)}>
								{feedback.isCorrect ? "Well done!" : "Not quite right"}
							</CardTitle>
							{feedback.pointsEarned > 0 && (
								<p className={cn("text-sm", colors.accent)}>
									+{feedback.pointsEarned} points earned
								</p>
							)}
						</div>
					</div>
				</CardHeader>

				<CardContent className="space-y-4">
					{/* Basic Explanation */}
					{feedback.explanation && (
						<div className="space-y-2">
							<h4 className={cn("font-medium", colors.text)}>Explanation</h4>
							<p className={cn("text-sm leading-relaxed", colors.text)}>
								{feedback.explanation}
							</p>
						</div>
					)}

					{/* Detailed Content Tabs - Only show for incorrect answers or if there are learning materials/insights */}
					{((!feedback.isCorrect && feedback.detailedExplanation) ||
						feedback.learningMaterials?.length ||
						feedback.performanceInsights?.length) && (
						<Tabs
							defaultValue={
								!feedback.isCorrect && feedback.detailedExplanation
									? "explanation"
									: feedback.learningMaterials?.length
									? "materials"
									: "insights"
							}
							className="w-full"
						>
							<TabsList
								className={cn(
									"grid w-full",
									(() => {
										const tabs = [
											!feedback.isCorrect && feedback.detailedExplanation,
											showLearningMaterials &&
												feedback.learningMaterials?.length,
											showPerformanceInsights &&
												feedback.performanceInsights?.length,
										].filter(Boolean);
										return `grid-cols-${tabs.length}`;
									})()
								)}
							>
								{!feedback.isCorrect && feedback.detailedExplanation && (
									<TabsTrigger
										value="explanation"
										className="flex items-center space-x-1"
									>
										<Brain className="h-3 w-3" />
										<span>Details</span>
									</TabsTrigger>
								)}
								{showLearningMaterials &&
									feedback.learningMaterials?.length && (
										<TabsTrigger
											value="materials"
											className="flex items-center space-x-1"
										>
											<Lightbulb className="h-3 w-3" />
											<span>Learn More</span>
										</TabsTrigger>
									)}
								{showPerformanceInsights &&
									feedback.performanceInsights?.length && (
										<TabsTrigger
											value="insights"
											className="flex items-center space-x-1"
										>
											<TrendingUp className="h-3 w-3" />
											<span>Insights</span>
										</TabsTrigger>
									)}
							</TabsList>

							{!feedback.isCorrect && feedback.detailedExplanation && (
								<TabsContent value="explanation" className="mt-4 space-y-3">
									<div className="space-y-2">
										<h5 className="font-medium text-sm">
											Detailed Explanation
										</h5>
										<p className="text-sm leading-relaxed text-muted-foreground">
											{feedback.detailedExplanation}
										</p>
									</div>

									{feedback.relatedTopics?.length && (
										<div className="space-y-2">
											<h5 className="font-medium text-sm">Related Topics</h5>
											<div className="flex flex-wrap gap-1">
												{feedback.relatedTopics.map((topic, index) => (
													<Badge
														key={index}
														variant="secondary"
														className="text-xs"
													>
														{topic}
													</Badge>
												))}
											</div>
										</div>
									)}

									{feedback.nextSteps?.length && (
										<div className="space-y-2">
											<h5 className="font-medium text-sm flex items-center space-x-1">
												<Target className="h-3 w-3" />
												<span>Next Steps</span>
											</h5>
											<ul className="text-sm space-y-1">
												{feedback.nextSteps.map((step, index) => (
													<li
														key={index}
														className="flex items-start space-x-2"
													>
														<span className="text-primary">•</span>
														<span>{step}</span>
													</li>
												))}
											</ul>
										</div>
									)}
								</TabsContent>
							)}

							{showLearningMaterials && feedback.learningMaterials?.length && (
								<TabsContent value="materials" className="mt-4">
									<LearningMaterialsList
										materials={feedback.learningMaterials}
									/>
								</TabsContent>
							)}

							{showPerformanceInsights &&
								feedback.performanceInsights?.length && (
									<TabsContent value="insights" className="mt-4">
										<PerformanceInsights
											insights={feedback.performanceInsights}
											difficultyAnalysis={feedback.difficultyAnalysis}
										/>
									</TabsContent>
								)}
						</Tabs>
					)}
				</CardContent>
			</Card>
		</motion.div>
	);
}

// Learning Materials Component
function LearningMaterialsList({
	materials,
}: {
	materials: LearningMaterial[];
}) {
	const getTypeIcon = (type: LearningMaterial["type"]) => {
		switch (type) {
			case "constitutional_section":
				return "📜";
			case "article":
				return "📰";
			case "chapter":
				return "📚";
			case "external_link":
				return "🔗";
			default:
				return "📄";
		}
	};

	const getTypeColor = (type: LearningMaterial["type"]) => {
		switch (type) {
			case "constitutional_section":
				return "bg-blue-100 text-blue-800";
			case "article":
				return "bg-green-100 text-green-800";
			case "chapter":
				return "bg-purple-100 text-purple-800";
			case "external_link":
				return "bg-orange-100 text-orange-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	return (
		<div className="space-y-3">
			<h5 className="font-medium text-sm flex items-center space-x-1">
				<Lightbulb className="h-3 w-3" />
				<span>Related Learning Materials</span>
			</h5>
			<div className="space-y-2">
				{materials.map((material) => (
					<Card
						key={material.id}
						className="p-3 hover:shadow-sm transition-shadow"
					>
						<div className="flex items-start justify-between space-x-3">
							<div className="flex-1 space-y-1">
								<div className="flex items-center space-x-2">
									<span className="text-sm">{getTypeIcon(material.type)}</span>
									<h6 className="font-medium text-sm">{material.title}</h6>
									<Badge
										variant="secondary"
										className={cn("text-xs", getTypeColor(material.type))}
									>
										{material.type.replace("_", " ")}
									</Badge>
								</div>
								{material.description && (
									<p className="text-xs text-muted-foreground">
										{material.description}
									</p>
								)}
								{(material.chapter || material.section) && (
									<p className="text-xs text-muted-foreground">
										{material.chapter && `Chapter: ${material.chapter}`}
										{material.chapter && material.section && " • "}
										{material.section && `Section: ${material.section}`}
									</p>
								)}
							</div>
							{material.url && (
								<Button variant="ghost" size="sm" asChild>
									<a
										href={material.url}
										target="_blank"
										rel="noopener noreferrer"
										className="flex items-center space-x-1"
									>
										<ExternalLink className="h-3 w-3" />
									</a>
								</Button>
							)}
						</div>
					</Card>
				))}
			</div>
		</div>
	);
}

// Performance Insights Component
function PerformanceInsights({
	insights,
	difficultyAnalysis,
}: {
	insights: string[];
	difficultyAnalysis?: QuizFeedback["difficultyAnalysis"];
}) {
	return (
		<div className="space-y-4">
			<h5 className="font-medium text-sm flex items-center space-x-1">
				<TrendingUp className="h-3 w-3" />
				<span>Performance Insights</span>
			</h5>

			{difficultyAnalysis && (
				<Card className="p-3 bg-blue-50 border-blue-200">
					<div className="space-y-2">
						<h6 className="font-medium text-sm text-blue-900">
							Difficulty Analysis
						</h6>
						<div className="grid grid-cols-2 gap-2 text-xs">
							<div>
								<span className="text-blue-700">Current Level:</span>
								<Badge variant="outline" className="ml-1">
									{difficultyAnalysis.attemptedLevel}
								</Badge>
							</div>
							<div>
								<span className="text-blue-700">Recommended:</span>
								<Badge variant="outline" className="ml-1">
									{difficultyAnalysis.recommendedLevel}
								</Badge>
							</div>
						</div>
						{difficultyAnalysis.adjustmentReason && (
							<p className="text-xs text-blue-800">
								{difficultyAnalysis.adjustmentReason}
							</p>
						)}
					</div>
				</Card>
			)}

			<div className="space-y-2">
				{insights.map((insight, index) => (
					<div key={index} className="flex items-start space-x-2 text-sm">
						<Award className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
						<span>{insight}</span>
					</div>
				))}
			</div>
		</div>
	);
}
