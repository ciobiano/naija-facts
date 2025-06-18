import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Search, Grid3X3, List, X, RefreshCw } from "lucide-react";

interface CulturalGalleryFiltersProps {
	searchTerm: string;
	onSearchChange: (value: string) => void;
	regionFilter: string;
	onRegionChange: (value: string) => void;
	sortBy: string;
	onSortByChange: (value: string) => void;
	sortOrder: string;
	onSortOrderChange: (value: string) => void;
	viewMode: "grid" | "list";
	onViewModeChange: (mode: "grid" | "list") => void;
	uniqueRegions: string[];
	hasActiveFilters: boolean;
	onClearFilters: () => void;
	debouncedSearchTerm: string;
	loading: boolean;
	totalCount: number;
}

export function CulturalGalleryFilters({
	searchTerm,
	onSearchChange,
	regionFilter,
	onRegionChange,
	sortBy,
	onSortByChange,
	sortOrder,
	onSortOrderChange,
	viewMode,
	onViewModeChange,
	uniqueRegions,
	hasActiveFilters,
	onClearFilters,
	debouncedSearchTerm,
	loading,
	totalCount,
}: CulturalGalleryFiltersProps) {
	return (
		<>
			{/* Search and Filters */}
			<div className="flex flex-col lg:flex-row gap-4 mb-6">
				<div className="flex-1">
					<div className="relative">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Search images, descriptions, or keywords..."
							value={searchTerm}
							onChange={(e) => onSearchChange(e.target.value)}
							className="pl-10 pr-10"
						/>
						{searchTerm && (
							<Button
								variant="ghost"
								size="sm"
								className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
								onClick={() => onSearchChange("")}
							>
								<X className="h-4 w-4" />
							</Button>
						)}
					</div>
				</div>
				<div className="flex flex-wrap gap-2">
					<Select value={regionFilter} onValueChange={onRegionChange}>
						<SelectTrigger className="w-40">
							<SelectValue placeholder="All Regions" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Regions</SelectItem>
							{uniqueRegions.map((region) => (
								<SelectItem key={region} value={region}>
									{region}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<Select value={sortBy} onValueChange={onSortByChange}>
						<SelectTrigger className="w-40">
							<SelectValue placeholder="Sort by" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="date_uploaded">Upload Date</SelectItem>
							<SelectItem value="title">Title</SelectItem>
							<SelectItem value="view_count">Views</SelectItem>
							<SelectItem value="download_count">Downloads</SelectItem>
						</SelectContent>
					</Select>
					<Select value={sortOrder} onValueChange={onSortOrderChange}>
						<SelectTrigger className="w-32">
							<SelectValue placeholder="Order" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="desc">Newest</SelectItem>
							<SelectItem value="asc">Oldest</SelectItem>
						</SelectContent>
					</Select>
					<div className="flex border rounded-md">
						<Button
							variant={viewMode === "grid" ? "default" : "ghost"}
							size="sm"
							onClick={() => onViewModeChange("grid")}
							className="rounded-r-none"
							aria-label="Grid view"
						>
							<Grid3X3 className="h-4 w-4" />
						</Button>
						<Button
							variant={viewMode === "list" ? "default" : "ghost"}
							size="sm"
							onClick={() => onViewModeChange("list")}
							className="rounded-l-none"
							aria-label="List view"
						>
							<List className="h-4 w-4" />
						</Button>
					</div>
					{hasActiveFilters && (
						<Button variant="outline" size="sm" onClick={onClearFilters}>
							<X className="h-4 w-4 mr-1" />
							Clear
						</Button>
					)}
				</div>
			</div>

			{/* Results count and status */}
			<div className="flex justify-between items-center mb-4">
				<div className="text-sm text-muted-foreground">
					{loading ? (
						<div className="flex items-center gap-2">
							<RefreshCw className="h-4 w-4 animate-spin" />
							Loading...
						</div>
					) : (
						`${totalCount} ${totalCount === 1 ? "image" : "images"} found`
					)}
				</div>
				{debouncedSearchTerm && (
					<Badge variant="secondary">
						Searching for: &quot;{debouncedSearchTerm}&quot;
					</Badge>
				)}
			</div>
		</>
	);
}
