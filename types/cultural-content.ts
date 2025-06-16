export interface CulturalImage {
	id: string;
	title: string;
	description?: string;
	region?: string;
	photographer?: string;
	file_path: string;
	file_size: number;
	mime_type: string;
	width?: number; // Optional for videos
	height?: number; // Optional for videos
	aspect_ratio?: number; // Optional for videos
	duration?: number; // Duration in seconds for videos
	thumbnail_url?: string; // Thumbnail for videos
	alt_text?: string;
	content_type: "image" | "video";
	date_taken?: string;
	date_uploaded: string;
	updated_at: string;
	view_count: number;
	download_count: number;
	metadata?: Record<string, unknown>;
	uploader: {
		id: string;
		first_name?: string;
		last_name?: string;
	};
}

export interface CulturalImageDownload {
	id: string;
	image_id: string;
	user_id?: string;
	ip_address?: string;
	user_agent?: string;
	download_at: string;
	file_format?: string;
	file_size?: number;
}

export interface ApiResponse<T> {
	data?: T;
	error?: string;
	success: boolean;
	message?: string;
}

export interface CulturalImagesResponse {
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

export interface DownloadResponse {
	success: boolean;
	downloadUrl: string;
	filename: string;
	fileSize: number;
	mimeType: string;
}

export interface UploadResponse {
	success: boolean;
	imageId?: string;
	url?: string;
	title?: string;
	altText?: string;
	error?: string;
}

export interface ImageMetadataUpdate {
	title?: string;
	description?: string;
	region?: string;
	photographer?: string;
	alt_text?: string;
}

export interface ImageFilters {
	search?: string;
	region?: string;
	sortBy?: "date_uploaded" | "title" | "view_count" | "download_count";
	sortOrder?: "asc" | "desc";
	page?: number;
	limit?: number;
}

// Cloud storage configuration types
export interface CloudStorageConfig {
	provider: "uploadthing";
	maxFileSize: string;
	maxFileCount: number;
	allowedTypes: string[];
}

// Analytics types for cultural content
export interface ContentAnalytics {
	totalImages: number;
	totalViews: number;
	totalDownloads: number;
	topRegions: Array<{
		region: string;
		count: number;
	}>;
	recentUploads: CulturalImage[];
	popularImages: CulturalImage[];
}

export interface PaginationInfo {
	page: number;
	totalCount: number;
	totalPages: number;
	hasNext: boolean;
	hasPrevious: boolean;
}

// Upload modal specific types
export interface UploadServerData {
	success: boolean;
	imageId: string;
	fileKey: string;
	url: string;
	title: string;
	uploadedBy: string;
	fileName: string;
	fileSize: number;
	mimeType: string;
	contentType: "image" | "video";
}

export interface UploadedFile {
	id: string;
	file: File | null;
	preview: string;
	serverData?: UploadServerData;
	// Metadata from UploadThing response
	title: string;
	uploadUrl: string;
	fileKey: string;
	fileName: string;
	fileSize: number;
	mimeType: string;
	uploadedBy: string;
	contentType: "image" | "video";
	// Auto-extracted metadata
	width?: number;
	height?: number;
	duration?: number;
}

export interface CulturalUploadModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export type UploadStep = "upload" | "metadata" | "success";
