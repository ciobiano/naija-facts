import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import {
	AlertTriangle,
	Upload,
	Search,
	ImageOff,
	RefreshCw,
} from "lucide-react";

interface ErrorStateProps {
	error: string;
	onRetry?: () => void;
}

export function ErrorState({ error, onRetry }: ErrorStateProps) {
	return (
		<div className="flex flex-col items-center justify-center py-12">
			<Alert className="max-w-md">
				<AlertTriangle className="h-4 w-4" />
				<AlertDescription>{error}</AlertDescription>
			</Alert>
			{onRetry && (
				<Button variant="outline" className="mt-4" onClick={onRetry}>
					<RefreshCw className="h-4 w-4 mr-2" />
					Try Again
				</Button>
			)}
		</div>
	);
}

interface EmptyStateProps {
	hasFilters: boolean;
	onClearFilters?: () => void;
}

export function EmptyState({ hasFilters, onClearFilters }: EmptyStateProps) {
	if (hasFilters) {
		return (
			<Card className="max-w-md mx-auto">
				<CardContent className="flex flex-col items-center justify-center py-12 text-center">
					<Search className="h-12 w-12 text-muted-foreground mb-4" />
					<h3 className="text-lg font-semibold mb-2">No images found</h3>
					<p className="text-muted-foreground mb-4">
						Try adjusting your search terms or filters to find what you&apos;re
						looking for.
					</p>
					{onClearFilters && (
						<Button variant="outline" onClick={onClearFilters}>
							Clear Filters
						</Button>
					)}
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="max-w-md mx-auto">
			<CardContent className="flex flex-col items-center justify-center py-12 text-center">
				<ImageOff className="h-12 w-12 text-muted-foreground mb-4" />
				<h3 className="text-lg font-semibold mb-2">No cultural images yet</h3>
				<p className="text-muted-foreground mb-4">
					Be the first to share your cultural heritage with the community.
				</p>
				<Link href="/cultural-content/upload">
					<Button>
						<Upload className="h-4 w-4 mr-2" />
						Upload Images
					</Button>
				</Link>
			</CardContent>
		</Card>
	);
}
