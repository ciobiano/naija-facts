import { toast } from "sonner";
import { CulturalImage } from "@/types/cultural-content";

export async function handleImageShare(image: CulturalImage): Promise<void> {
	const shareData = {
		title: image.title,
		text: `Check out this cultural image: ${image.title}`,
		url: `${window.location.origin}/cultural-content?image=${image.id}`,
	};

	try {
		if (navigator.share && navigator.canShare(shareData)) {
			await navigator.share(shareData);
			toast.success("Shared successfully!");
		} else {
			// Fallback: copy to clipboard
			await navigator.clipboard.writeText(shareData.url);
			toast.success("Link copied to clipboard!");
		}
	} catch (error) {
		console.error("Error sharing:", error);
		// Fallback: copy to clipboard
		try {
			await navigator.clipboard.writeText(shareData.url);
			toast.success("Link copied to clipboard!");
		} catch {
			console.error("Error copying to clipboard");
			toast.error("Failed to share or copy link");
		}
	}
}

export async function handleImageDownload(
	imageId: string,
	imageTitle: string,
	onSuccess?: () => void
): Promise<void> {
	try {
		toast.loading("Preparing download...", { id: `download-${imageId}` });

		const response = await fetch(
			`/api/cultural-content/images/${imageId}/download`,
			{
				method: "POST",
			}
		);

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

		toast.success("Download started!", {
			id: `download-${imageId}`,
			description: `${imageTitle} is being downloaded`,
		});

		// Call success callback if provided
		onSuccess?.();
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : "Download failed";
		toast.error("Download failed", {
			id: `download-${imageId}`,
			description: errorMessage,
		});
		console.error("Error downloading image:", error);
	}
}

export function hasActiveFilters(
	searchTerm: string,
	regionFilter: string,
	sortBy: string,
	sortOrder: string
): boolean {
	return (
		!!searchTerm ||
		(!!regionFilter && regionFilter !== "all") ||
		sortBy !== "date_uploaded" ||
		sortOrder !== "desc"
	);
}

export function getUniqueRegions(
	images: CulturalImage[] | undefined | null
): string[] {
	// Defensive programming: ensure images is an array
	if (!images || !Array.isArray(images)) {
		return [];
	}

	return [
		...new Set(images.map((img) => img.region).filter(Boolean)),
	] as string[];
}
