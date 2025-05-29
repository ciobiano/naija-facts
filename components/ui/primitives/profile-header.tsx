import { Badge } from "@/components/ui/badge";
import { Shield } from "lucide-react";

interface ProfileHeaderProps {
	role: string;
	isAdmin: boolean;
}

export function ProfileHeader({ role, isAdmin }: ProfileHeaderProps) {
	return (
		<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
			<div className="space-y-2">
				<h1 className="text-2xl sm:text-3xl font-bold">Profile Settings</h1>
				<p className="text-muted-foreground text-sm sm:text-base">
					Manage your account settings and preferences
				</p>
			</div>
			<div className="flex items-center gap-2">
				<Badge variant={isAdmin ? "destructive" : "secondary"}>
					<Shield className="mr-1 h-3 w-3" />
					{role}
				</Badge>
			</div>
		</div>
	);
}
