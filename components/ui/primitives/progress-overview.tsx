import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Calendar, MapPin } from "lucide-react";
import { ProfileData } from "@/types";
import { calculateDaysActive } from "@/lib/utils";

interface ProgressOverviewProps {
	profileData: ProfileData | null;
}

export function ProgressOverview({ profileData }: ProgressOverviewProps) {
	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
			<Card>
				<CardContent className="pt-6">
					<div className="flex items-center space-x-4">
						<div className="flex-shrink-0">
							<Trophy className="h-8 w-8 text-yellow-500" />
						</div>
						<div className="flex-1 min-w-0">
							<p className="text-2xl font-bold">0</p>
							<p className="text-sm text-muted-foreground truncate">
								Achievements
							</p>
						</div>
					</div>
				</CardContent>
			</Card>
			<Card>
				<CardContent className="pt-6">
					<div className="flex items-center space-x-4">
						<div className="flex-shrink-0">
							<Calendar className="h-8 w-8 text-blue-500" />
						</div>
						<div className="flex-1 min-w-0">
							<p className="text-2xl font-bold">
								{profileData?.last_login
									? calculateDaysActive(profileData.last_login)
									: 0}
							</p>
							<p className="text-sm text-muted-foreground truncate">
								Days Active
							</p>
						</div>
					</div>
				</CardContent>
			</Card>
			<Card>
				<CardContent className="pt-6">
					<div className="flex items-center space-x-4">
						<div className="flex-shrink-0">
							<MapPin className="h-8 w-8 text-green-500" />
						</div>
						<div className="flex-1 min-w-0">
							<p className="text-2xl font-bold">0</p>
							<p className="text-sm text-muted-foreground truncate">
								Quizzes Completed
							</p>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
