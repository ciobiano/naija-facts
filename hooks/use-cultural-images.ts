import { useState, useEffect, useCallback } from "react";

interface CulturalImage {
	id: string;
	title: string;
	description?: string;
	region?: string;
	photographer?: string;
	file_path: string;
	file_size: number;
	mime_type: string;
	width: number;
	height: number;
	aspect_ratio: number;
	alt_text?: string;
	date_taken?: string;
	date_uploaded: string;
	view_count: number;
	download_count: number;
	uploader: {
		id: string;
		first_name?: string;
		last_name?: string;
	};
}

interface ApiResponse {
	images: CulturalImage[];
	pagination: {
		page: number;
		limit: number;
		totalCount: number;
		totalPages: number;
		hasNextPage: boolean;
		hasPrevPage: boolean;
	};
}

interface UseImagesOptions {
	initialSearch?: string;
	initialRegion?: string;
	initialSortBy?: "date_uploaded" | "title" | "view_count" | "download_count";
	initialSortOrder?: "asc" | "desc";
	initialLimit?: number;
}

export function useCulturalImages(options: UseImagesOptions = {}) {
	const {
		initialSearch = "",
		initialRegion = "",
		initialSortBy = "date_uploaded",
		initialSortOrder = "desc",
		initialLimit = 20,
	} = options;

	const [images, setImages] = useState<CulturalImage[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [searchTerm, setSearchTerm] = useState(initialSearch);
	const [regionFilter, setRegionFilter] = useState(initialRegion);
	const [sortBy, setSortBy] = useState(initialSortBy);
	const [sortOrder, setSortOrder] = useState(initialSortOrder);
	const [pagination, setPagination] = useState({
		page: 1,
		limit: initialLimit,
		totalCount: 0,
		totalPages: 1,
		hasNextPage: false,
		hasPrevPage: false,
	});

	// Fetch images from the API
	const fetchImages = useCallback(async (page = 1) => {
		try {
			setLoading(true);
			setError(null);

			const params = new URLSearchParams({
				page: page.toString(),
				limit: pagination.limit.toString(),
				sortBy,
				sortOrder,
			});

			if (searchTerm) params.append("search", searchTerm);
			if (regionFilter) params.append("region", regionFilter);

			const response = await fetch(`/api/cultural-content/images?${params}`);
			
			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				throw new Error(errorData.error || "Failed to fetch images");
			}

			const data: ApiResponse = await response.json();
			setImages(data.images);
			setPagination(data.pagination);
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
			setError(errorMessage);
			console.error("Error fetching images:", err);
		} finally {
			setLoading(false);
		}
	}, [searchTerm, regionFilter, sortBy, sortOrder, pagination.limit]);

	// Get individual image with view tracking
	const getImage = useCallback(async (imageId: string): Promise<CulturalImage | null> => {
		try {
			const response = await fetch(`/api/cultural-content/images/${imageId}`);
			
			if (!response.ok) {
				throw new Error("Failed to fetch image");
			}

			const data = await response.json();
			return data.image;
		} catch (err) {
			console.error("Error fetching image:", err);
			return null;
		}
	}, []);

	// Download image with tracking
	const downloadImage = useCallback(async (imageId: string): Promise<boolean> => {
		try {
			const response = await fetch(`/api/cultural-content/images/${imageId}/download`, {
				method: "POST",
			});

			if (!response.ok) {
				throw new Error("Failed to process download");
			}

			const data = await response.json();
			
			// Create download link
			const link = document.createElement("a");
			link.href = data.downloadUrl;
			link.download = data.filename;
			link.target = "_blank";
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);

			// Refresh current page to update download count
			await fetchImages(pagination.page);
			
			return true;
		} catch (err) {
			console.error("Error downloading image:", err);
			setError("Failed to download image");
			return false;
		}
	}, [fetchImages, pagination.page]);

	// Update image metadata
	const updateImage = useCallback(async (
		imageId: string,
		updates: {
			title?: string;
			description?: string;
			region?: string;
			photographer?: string;
			alt_text?: string;
		}
	): Promise<boolean> => {
		try {
			const response = await fetch(`/api/cultural-content/images/${imageId}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(updates),
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				throw new Error(errorData.error || "Failed to update image");
			}

			// Refresh current page to show updated data
			await fetchImages(pagination.page);
			
			return true;
		} catch (err) {
			console.error("Error updating image:", err);
			setError("Failed to update image");
			return false;
		}
	}, [fetchImages, pagination.page]);

	// Delete image
	const deleteImage = useCallback(async (imageId: string): Promise<boolean> => {
		try {
			const response = await fetch(`/api/cultural-content/images/${imageId}`, {
				method: "DELETE",
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				throw new Error(errorData.error || "Failed to delete image");
			}

			// Refresh current page to remove deleted image
			await fetchImages(pagination.page);
			
			return true;
		} catch (err) {
			console.error("Error deleting image:", err);
			setError("Failed to delete image");
			return false;
		}
	}, [fetchImages, pagination.page]);

	// Load more images (for infinite scroll)
	const loadMore = useCallback(async () => {
		if (pagination.hasNextPage && !loading) {
			await fetchImages(pagination.page + 1);
		}
	}, [pagination.hasNextPage, pagination.page, loading, fetchImages]);

	// Reset to first page when search/filter changes
	useEffect(() => {
		fetchImages(1);
	}, [searchTerm, regionFilter, sortBy, sortOrder]);

	// Refresh current page
	const refresh = useCallback(() => {
		fetchImages(pagination.page);
	}, [fetchImages, pagination.page]);

	// Clear error
	const clearError = useCallback(() => {
		setError(null);
	}, []);

	// Get unique regions from current images
	const uniqueRegions = images
		.map(img => img.region)
		.filter((region): region is string => Boolean(region))
		.filter((region, index, array) => array.indexOf(region) === index)
		.sort();

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
		uniqueRegions,

		// Actions
		fetchImages,
		getImage,
		downloadImage,
		updateImage,
		deleteImage,
		loadMore,
		refresh,
		clearError,

		// Setters
		setSearchTerm,
		setRegionFilter,
		setSortBy,
		setSortOrder,
	};
} 