import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PaginationInfo } from "@/types/cultural-content";

interface CulturalGalleryPaginationProps {
	pagination: PaginationInfo;
	onPageChange: (page: number) => void;
	loading?: boolean;
}

export function CulturalGalleryPagination({
	pagination,
	onPageChange,
	loading = false,
}: CulturalGalleryPaginationProps) {
	const { page, totalPages, hasPrevious, hasNext } = pagination;

	if (totalPages <= 1) return null;

	return (
		<div className="flex items-center justify-center gap-2 mt-8">
			<Button
				variant="outline"
				size="sm"
				onClick={() => onPageChange(page - 1)}
				disabled={!hasPrevious || loading}
				aria-label="Previous page"
			>
				<ChevronLeft className="h-4 w-4" />
				Previous
			</Button>
			
			<div className="flex items-center gap-1 mx-4">
				<span className="text-sm text-muted-foreground">
					Page {page} of {totalPages}
				</span>
			</div>
			
			<Button
				variant="outline"
				size="sm"
				onClick={() => onPageChange(page + 1)}
				disabled={!hasNext || loading}
				aria-label="Next page"
			>
				Next
				<ChevronRight className="h-4 w-4" />
			</Button>
		</div>
	);
} 