import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { CulturalImage, PaginationInfo } from "@/types/cultural-content";
import { useDebounce } from "./use-debounce";
import {
	handleImageDownload,
	handleImageShare,
	hasActiveFilters,
	getUniqueRegions,
} from "@/lib/cultural-content-utils";
import { toast } from "sonner";

interface UseCulturalGalleryProps {
	initialPage?: number;
}

interface GalleryState {
	images: CulturalImage[];
	loading: boolean;
	error: string | null;
	pagination: PaginationInfo;
	searchTerm: string;
	regionFilter: string;
	sortBy: string;
	sortOrder: string;
	viewMode: "grid" | "list";
	selectedImage: CulturalImage | null;
	selectedImageIndex: number;
}

interface GalleryActions {
	setSearchTerm: (term: string) => void;
	setRegionFilter: (region: string) => void;
	setSortBy: (sortBy: string) => void;
	setSortOrder: (order: string) => void;
	setViewMode: (mode: "grid" | "list") => void;
	setSelectedImage: (image: CulturalImage | null) => void;
	setSelectedImageIndex: (index: number) => void;
	fetchImages: (page?: number) => Promise<void>;
	handleDownload: (imageId: string, imageTitle: string) => Promise<void>;
	handleShare: (image: CulturalImage) => Promise<void>;
	clearFilters: () => void;
	hasFilters: boolean;
	uniqueRegions: string[];
	debouncedSearchTerm: string;
	handleImageClick: (image: CulturalImage, index: number) => void;
	handlePreviousImage: () => void;
	handleNextImage: () => void;
	hasPreviousImage: boolean;
	hasNextImage: boolean;
}

export function useCulturalGallery({
	initialPage = 1,
}: UseCulturalGalleryProps = {}): GalleryState & GalleryActions {
	const searchParams = useSearchParams();

	// State
	const [images, setImages] = useState<CulturalImage[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [selectedImage, setSelectedImage] = useState<CulturalImage | null>(
		null
	);
	const [selectedImageIndex, setSelectedImageIndex] = useState<number>(-1);
	const [searchTerm, setSearchTerm] = useState("");
	const [regionFilter, setRegionFilter] = useState("all");
	const [sortBy, setSortBy] = useState("date_uploaded");
	const [sortOrder, setSortOrder] = useState("desc");
	const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
	const [pagination, setPagination] = useState<PaginationInfo>({
		page: initialPage,
		totalPages: 1,
		totalCount: 0,
		hasNext: false,
		hasPrevious: false,
	});

	// Debounced search
	const debouncedSearchTerm = useDebounce(searchTerm, 500);

	// Computed values
	const uniqueRegions = useMemo(() => getUniqueRegions(images), [images]);
	const hasFilters = useMemo(
		() => hasActiveFilters(searchTerm, regionFilter, sortBy, sortOrder),
		[searchTerm, regionFilter, sortBy, sortOrder]
	);

	// Navigation helpers
	const hasPreviousImage = selectedImageIndex > 0;
	const hasNextImage = selectedImageIndex < images.length - 1;

	// Fetch images function
	const fetchImages = useCallback(
		async (page = 1) => {
			try {
				setLoading(true);
				setError(null);

				const params = new URLSearchParams({
					page: page.toString(),
					limit: "20",
					...(debouncedSearchTerm && { search: debouncedSearchTerm }),
					...(regionFilter &&
						regionFilter !== "all" && { region: regionFilter }),
					...(sortBy && { sortBy }),
					...(sortOrder && { sortOrder }),
				});

				const response = await fetch(`/api/cultural-content?${params}`);

				if (!response.ok) {
					const errorData = await response.json().catch(() => ({}));
					throw new Error(
						errorData.error || `HTTP ${response.status}: Failed to fetch images`
					);
				}

				const data = await response.json();
				setImages(data.images);
				setPagination({
					page: data.pagination.page,
					totalPages: data.pagination.totalPages,
					totalCount: data.pagination.totalCount,
					hasNext: data.pagination.hasNext,
					hasPrevious: data.pagination.hasPrevious,
				});
			} catch (error) {
				const errorMessage =
					error instanceof Error ? error.message : "Unknown error occurred";
				setError(errorMessage);
				toast.error("Failed to load images", {
					description: errorMessage,
				});
			} finally {
				setLoading(false);
			}
		},
		[debouncedSearchTerm, regionFilter, sortBy, sortOrder]
	);

	// Handle download
	const handleDownload = useCallback(
		async (imageId: string, imageTitle: string) => {
			await handleImageDownload(imageId, imageTitle, () => {
				// Refresh images to update download count
				fetchImages(pagination.page);
			});
		},
		[fetchImages, pagination.page]
	);

	// Handle share
	const handleShare = useCallback(async (image: CulturalImage) => {
		await handleImageShare(image);
	}, []);

	// Clear all filters
	const clearFilters = useCallback(() => {
		setSearchTerm("");
		setRegionFilter("all");
		setSortBy("date_uploaded");
		setSortOrder("desc");
	}, []);

	// Handle image click for modal
	const handleImageClick = useCallback(
		(image: CulturalImage, index: number) => {
			setSelectedImage(image);
			setSelectedImageIndex(index);
		},
		[]
	);

	// Modal navigation
	const handlePreviousImage = useCallback(() => {
		if (hasPreviousImage) {
			const newIndex = selectedImageIndex - 1;
			setSelectedImageIndex(newIndex);
			setSelectedImage(images[newIndex]);
		}
	}, [hasPreviousImage, selectedImageIndex, images]);

	const handleNextImage = useCallback(() => {
		if (hasNextImage) {
			const newIndex = selectedImageIndex + 1;
			setSelectedImageIndex(newIndex);
			setSelectedImage(images[newIndex]);
		}
	}, [hasNextImage, selectedImageIndex, images]);

	// Effects
	useEffect(() => {
		fetchImages(1);
	}, [fetchImages]);

	// Handle URL search params
	useEffect(() => {
		const imageId = searchParams.get("image");
		if (imageId && images.length > 0) {
			const imageIndex = images.findIndex((img) => img.id === imageId);
			if (imageIndex !== -1) {
				handleImageClick(images[imageIndex], imageIndex);
			}
		}
	}, [searchParams, images, handleImageClick]);

	return {
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

		// Computed
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
		setSelectedImageIndex,
		fetchImages,
		handleDownload,
		handleShare,
		clearFilters,
		handleImageClick,
		handlePreviousImage,
		handleNextImage,
	};
}
