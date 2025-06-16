import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeleton component for grid view image cards
 */
export function ImageSkeleton() {
	return (
		<Card className="overflow-hidden">
			<Skeleton className="aspect-square w-full" />
			<CardContent className="p-4">
				<Skeleton className="h-4 w-full mb-2" />
				<Skeleton className="h-3 w-2/3" />
			</CardContent>
		</Card>
	);
}

/**
 * Skeleton component for list view image items
 */
export function ListItemSkeleton() {
	return (
		<Card className="overflow-hidden">
			<div className="flex flex-col sm:flex-row gap-4 p-4">
				<Skeleton className="w-full sm:w-32 h-32 flex-shrink-0" />
				<div className="flex-1 space-y-2">
					<Skeleton className="h-4 w-3/4" />
					<Skeleton className="h-3 w-full" />
					<Skeleton className="h-3 w-2/3" />
					<div className="flex gap-4">
						<Skeleton className="h-3 w-16" />
						<Skeleton className="h-3 w-16" />
					</div>
				</div>
			</div>
		</Card>
	);
}
