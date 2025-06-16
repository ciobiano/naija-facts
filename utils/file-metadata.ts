/**
 * Client-side file metadata extraction utilities
 * Provides automatic width, height, aspect ratio, and duration extraction
 */

export interface ImageMetadata {
	width: number;
	height: number;
	aspect_ratio: number;
}

export interface VideoMetadata {
	width: number;
	height: number;
	duration: number;
	aspect_ratio: number;
}

/**
 * Extract metadata from an image file
 */
export async function extractImageMetadata(file: File): Promise<ImageMetadata> {
	return new Promise((resolve, reject) => {
		const img = new Image();

		img.onload = () => {
			const metadata = {
				width: img.naturalWidth,
				height: img.naturalHeight,
				aspect_ratio: img.naturalWidth / img.naturalHeight,
			};

			// Clean up object URL
			URL.revokeObjectURL(img.src);
			resolve(metadata);
		};

		img.onerror = () => {
			URL.revokeObjectURL(img.src);
			reject(new Error("Failed to load image for metadata extraction"));
		};

		img.src = URL.createObjectURL(file);
	});
}

/**
 * Extract metadata from a video file
 */
export async function extractVideoMetadata(file: File): Promise<VideoMetadata> {
	return new Promise((resolve, reject) => {
		const video = document.createElement("video");

		video.onloadedmetadata = () => {
			const metadata = {
				width: video.videoWidth,
				height: video.videoHeight,
				duration: video.duration,
				aspect_ratio: video.videoWidth / video.videoHeight,
			};

			// Clean up object URL
			URL.revokeObjectURL(video.src);
			resolve(metadata);
		};

		video.onerror = () => {
			URL.revokeObjectURL(video.src);
			reject(new Error("Failed to load video for metadata extraction"));
		};

		// Mute video to avoid autoplay issues
		video.muted = true;
		video.src = URL.createObjectURL(file);
	});
}

/**
 * Extract metadata from any supported file type
 */
export async function extractFileMetadata(
	file: File
): Promise<ImageMetadata | VideoMetadata> {
	if (file.type.startsWith("image/")) {
		return extractImageMetadata(file);
	} else if (file.type.startsWith("video/")) {
		return extractVideoMetadata(file);
	} else {
		throw new Error(`Unsupported file type: ${file.type}`);
	}
}

/**
 * Get file type category
 */
export function getFileTypeCategory(
	file: File
): "image" | "video" | "unsupported" {
	if (file.type.startsWith("image/")) return "image";
	if (file.type.startsWith("video/")) return "video";
	return "unsupported";
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
	if (bytes === 0) return "0 Bytes";

	const k = 1024;
	const sizes = ["Bytes", "KB", "MB", "GB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));

	return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/**
 * Format duration for display (in seconds to MM:SS)
 */
export function formatDuration(seconds: number): string {
	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = Math.floor(seconds % 60);

	return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}
