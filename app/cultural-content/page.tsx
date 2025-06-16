"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CulturalUploadModal } from "@/components/ui/sections/cultural/cultural-upload-modal";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Upload } from "lucide-react";
import { useSession } from "next-auth/react";

// Modular components
import { CulturalGalleryFilters } from "@/components/ui/sections/cultural/cultural-gallery-filters";
import { CulturalImageGrid } from "@/components/ui/sections/cultural/cultural-image-grid";
import { CulturalImageModal } from "@/components/ui/sections/cultural/cultural-image-modal";
import { CulturalGalleryPagination } from "@/components/ui/sections/cultural/cultural-gallery-pagination";
import {
	ImageSkeleton,
	ListItemSkeleton,
} from "@/components/ui/sections/cultural/cultural-gallery-skeleton";
import {
	ErrorState,
	EmptyState,
} from "@/components/ui/sections/cultural/cultural-gallery-states";

// Custom hook
import { useCulturalGallery } from "@/hooks/use-cultural-gallery";

export default function CulturalContentPage() {
	const { data: session } = useSession();
	const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

	// Use the custom hook for all gallery state and logic
	const {
		// State
		images,
		loading,
		error,
		pagination,
		searchTerm,
		regionFilter,
		sortBy,
		sortOrder,
		viewMode,
		selectedImage,
		selectedImageIndex,

		// Computed values
		uniqueRegions,
		hasFilters,
		debouncedSearchTerm,
		hasPreviousImage,
		hasNextImage,

		// Actions
		setSearchTerm,
		setRegionFilter,
		setSortBy,
		setSortOrder,
		setViewMode,
		setSelectedImage,
		fetchImages,
		handleDownload,
		handleShare,
		clearFilters,
		handleImageClick,
		handlePreviousImage,
		handleNextImage,
	} = useCulturalGallery();

	return (
		<div className="container mx-auto px-4 py-8">
			{/* Header */}
			<Card className="mb-8">
				<CardHeader>
					<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
						<div>
							<CardTitle className="text-2xl">
								Cultural Heritage Gallery
							</CardTitle>
							<CardDescription>
								Explore and discover Nigeria&apos;s rich cultural heritage
								through our community-contributed image collection
							</CardDescription>
						</div>
						{session && (
							<Button onClick={() => setIsUploadModalOpen(true)}>
								<Upload className="h-4 w-4 mr-2" />
								Upload Images
							</Button>
						)}
					</div>
				</CardHeader>
			</Card>

			{/* Filters */}
			<CulturalGalleryFilters
				searchTerm={searchTerm}
				onSearchChange={setSearchTerm}
				regionFilter={regionFilter}
				onRegionChange={setRegionFilter}
				sortBy={sortBy}
				onSortByChange={setSortBy}
				sortOrder={sortOrder}
				onSortOrderChange={setSortOrder}
				viewMode={viewMode}
				onViewModeChange={setViewMode}
				uniqueRegions={uniqueRegions}
				hasActiveFilters={hasFilters}
				onClearFilters={clearFilters}
				debouncedSearchTerm={debouncedSearchTerm}
				loading={loading}
				totalCount={pagination.totalCount}
			/>

			{/* Content */}
			{error ? (
				<ErrorState
					error={error}
					onRetry={() => fetchImages(pagination.page)}
				/>
			) : loading ? (
				<div
					className={`${
						viewMode === "grid"
							? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
							: "space-y-4"
					}`}
				>
					{[...Array(8)].map((_, i) =>
						viewMode === "grid" ? (
							<ImageSkeleton key={i} />
						) : (
							<ListItemSkeleton key={i} />
						)
					)}
				</div>
			) : images.length === 0 ? (
				<EmptyState hasFilters={hasFilters} onClearFilters={clearFilters} />
			) : (
				<>
					<CulturalImageGrid
						images={images}
						viewMode={viewMode}
						onImageClick={handleImageClick}
						onDownload={handleDownload}
						onShare={handleShare}
					/>

					<CulturalGalleryPagination
						pagination={pagination}
						onPageChange={fetchImages}
						loading={loading}
					/>
				</>
			)}

			{/* Image Modal */}
			<CulturalImageModal
				image={selectedImage}
				isOpen={!!selectedImage}
				onClose={() => setSelectedImage(null)}
				onDownload={handleDownload}
				onShare={handleShare}
				onPrevious={handlePreviousImage}
				onNext={handleNextImage}
				hasPrevious={hasPreviousImage}
				hasNext={hasNextImage}
				currentIndex={selectedImageIndex}
				totalImages={images.length}
			/>

			{/* Upload Modal */}
			<CulturalUploadModal
				isOpen={isUploadModalOpen}
				onClose={() => {
					setIsUploadModalOpen(false);
					fetchImages(1); // Refresh gallery after upload
				}}
			/>
		</div>
	);
}
