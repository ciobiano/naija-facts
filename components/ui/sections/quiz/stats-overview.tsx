import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Trophy, CheckCircle, Star } from "lucide-react";
import { QuizStats } from "@/types";

interface StatsOverviewProps {
	stats: QuizStats;
}

export function StatsOverview({ stats }: StatsOverviewProps) {
	const statItems = [
		{
			icon: BookOpen,
			label: "Total Chapters",
			value: stats.totalChapters,
			color: "text-blue-500",
		},
		{
			icon: Trophy,
			label: "Total Points",
			value: stats.totalPoints,
			color: "text-yellow-500",
		},
		{
			icon: CheckCircle,
			label: "Completed",
			value: stats.completedChapters,
			color: "text-green-500",
		},
		{
			icon: Star,
			label: "Best Streak",
			value: stats.bestStreak,
			color: "text-purple-500",
		},
	];

	return (
		<div className="grid md:grid-cols-4 gap-4 mb-8">
			{statItems.map((stat) => {
				const IconComponent = stat.icon;
				return (
					<Card key={stat.label}>
						<CardContent className="p-4">
							<div className="flex items-center space-x-2">
								<IconComponent className={`h-5 w-5 ${stat.color}`} />
								<div>
									<p className="text-sm font-medium">{stat.label}</p>
									<p className="text-2xl font-bold">{stat.value}</p>
								</div>
							</div>
						</CardContent>
					</Card>
				);
			})}
		</div>
	);
}
