import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Download,
	Eye,
	Calendar,
	Camera,
	MapPin,
	Share2,
	Expand,
	Minimize,
	X,
	ChevronLeft,
	ChevronRight,
} from "lucide-react";
import { CulturalImage } from "@/types/cultural-content";

interface CulturalImageModalProps {
	image: CulturalImage | null;
	isOpen: boolean;
	onClose: () => void;
	onDownload: (imageId: string, imageTitle: string) => void;
	onShare: (image: CulturalImage) => void;
	onPrevious?: () => void;
	onNext?: () => void;
	hasPrevious?: boolean;
	hasNext?: boolean;
	currentIndex?: number;
	totalImages?: number;
}

export function CulturalImageModal({
	image,
	isOpen,
	onClose,
	onDownload,
	onShare,
	onPrevious,
	onNext,
	hasPrevious = false,
	hasNext = false,
	currentIndex,
	totalImages,
}: CulturalImageModalProps) {
	const [isFullscreen, setIsFullscreen] = useState(false);

	// Handle escape key to exit fullscreen or close modal
	const handleKeyDown = useCallback(
		(event: KeyboardEvent) => {
			if (event.key === "Escape") {
				if (isFullscreen) {
					setIsFullscreen(false);
				} else {
					onClose();
				}
			}
			// Handle arrow keys for navigation
			if (event.key === "ArrowLeft" && hasPrevious && onPrevious) {
				onPrevious();
			}
			if (event.key === "ArrowRight" && hasNext && onNext) {
				onNext();
			}
		},
		[isFullscreen, onClose, hasPrevious, onPrevious, hasNext, onNext]
	);

	useEffect(() => {
		if (isOpen) {
			document.addEventListener("keydown", handleKeyDown);
			return () => document.removeEventListener("keydown", handleKeyDown);
		}
	}, [isOpen, handleKeyDown]);

	// Reset fullscreen when modal closes
	useEffect(() => {
		if (!isOpen) {
			setIsFullscreen(false);
		}
	}, [isOpen]);

	const toggleFullscreen = () => {
		setIsFullscreen(!isFullscreen);
	};

	const handleModalClose = () => {
		setIsFullscreen(false);
		onClose();
	};

	if (!image) return null;

	// Fullscreen overlay
	if (isFullscreen) {
		return (
			<div className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
				{/* Fullscreen controls */}
				<div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
					<div className="text-white">
						<h3 className="font-semibold text-lg truncate max-w-md">
							{image.title}
						</h3>
						{currentIndex !== undefined && totalImages && (
							<p className="text-sm text-white/75">
								{currentIndex + 1} of {totalImages}
							</p>
						)}
					</div>
					<div className="flex items-center gap-2">
						<Button
							variant="ghost"
							size="icon"
							className="text-white hover:bg-white/20"
							onClick={toggleFullscreen}
							aria-label="Exit fullscreen"
						>
							<Minimize className="h-5 w-5" />
						</Button>
						<Button
							variant="ghost"
							size="icon"
							className="text-white hover:bg-white/20"
							onClick={handleModalClose}
							aria-label="Close modal"
						>
							<X className="h-5 w-5" />
						</Button>
					</div>
				</div>

				{/* Fullscreen image */}
				<div className="relative w-full h-full flex items-center justify-center p-16">
					<div className="relative w-full h-full">
						<Image
							src={image.file_path}
							alt={image.alt_text || image.title}
							fill
							className="object-contain"
							sizes="100vw"
							priority
							quality={100}
						/>
					</div>

					{/* Navigation arrows for fullscreen */}
					{hasPrevious && onPrevious && (
						<Button
							variant="ghost"
							size="lg"
							className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20 opacity-75 hover:opacity-100"
							onClick={onPrevious}
							aria-label="Previous image"
						>
							<ChevronLeft className="h-8 w-8" />
						</Button>
					)}
					{hasNext && onNext && (
						<Button
							variant="ghost"
							size="lg"
							className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20 opacity-75 hover:opacity-100"
							onClick={onNext}
							aria-label="Next image"
						>
							<ChevronRight className="h-8 w-8" />
						</Button>
					)}
				</div>

				{/* Bottom controls */}
				<div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
					<div className="flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2">
						<Button
							variant="ghost"
							size="sm"
							className="text-white hover:bg-white/20"
							onClick={() => onDownload(image.id, image.title)}
						>
							<Download className="h-4 w-4 mr-2" />
							Download
						</Button>
						<Button
							variant="ghost"
							size="sm"
							className="text-white hover:bg-white/20"
							onClick={() => onShare(image)}
						>
							<Share2 className="h-4 w-4 mr-2" />
							Share
						</Button>
					</div>
				</div>
			</div>
		);
	}

	// Regular modal view
	return (
		<Dialog open={isOpen} onOpenChange={handleModalClose}>
			<DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
				<DialogHeader className="pb-4">
					<div className="flex items-start justify-between gap-4">
						<div className="flex-1">
							<DialogTitle className="text-xl">{image.title}</DialogTitle>
							{image.description && (
								<DialogDescription className="mt-2 text-base">
									{image.description}
								</DialogDescription>
							)}
						</div>
					</div>

					{/* Image counter */}
					{currentIndex !== undefined && totalImages && (
						<div className="text-sm text-muted-foreground">
							{currentIndex + 1} of {totalImages}
						</div>
					)}
				</DialogHeader>

				<div className="flex flex-col lg:flex-row gap-6">
					{/* Image */}
					<div className="relative flex-1">
						<div className="relative aspect-square lg:aspect-[4/3] w-full overflow-hidden rounded-lg group">
							<Image
								src={image.file_path}
								alt={image.alt_text || image.title}
								fill
								className="object-cover cursor-pointer transition-transform group-hover:scale-105"
								sizes="(max-width: 1024px) 100vw, 60vw"
								priority
								onClick={toggleFullscreen}
							/>

							{/* Fullscreen button overlay on hover */}
							<div className="absolute  top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 hidden group-hover:flex ">
								<Button
									variant="ghost"
									size="icon"
									onClick={toggleFullscreen}
									aria-label="View fullscreen"
									className="flex-shrink-0 touch-target dark:bg-black/50 bg-white/50 rounded-full p-2"
								>
									<Expand className="h-4 w-4    " />
								</Button>
							</div>

							{/* Navigation arrows */}
							{hasPrevious && onPrevious && (
								<Button
									variant="secondary"
									size="sm"
									className="absolute left-2 top-1/2 transform -translate-y-1/2 opacity-75 hover:opacity-100 z-10"
									onClick={onPrevious}
									aria-label="Previous image"
								>
									<ChevronLeft className="h-4 w-4" />
								</Button>
							)}
							{hasNext && onNext && (
								<Button
									variant="secondary"
									size="sm"
									className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-75 hover:opacity-100 z-10"
									onClick={onNext}
									aria-label="Next image"
								>
									<ChevronRight className="h-4 w-4" />
								</Button>
							)}
						</div>
					</div>

					{/* Details */}
					<div className="lg:w-80 space-y-4">
						{/* Metadata */}
						<div className="space-y-3">
							{image.photographer && (
								<div className="flex items-center gap-2">
									<Camera className="h-4 w-4 text-muted-foreground" />
									<span className="text-sm">{image.photographer}</span>
								</div>
							)}
							{image.region && (
								<div className="flex items-center gap-2">
									<MapPin className="h-4 w-4 text-muted-foreground" />
									<Badge variant="secondary">{image.region}</Badge>
								</div>
							)}
							<div className="flex items-center gap-2">
								<Calendar className="h-4 w-4 text-muted-foreground" />
								<span className="text-sm">
									{new Date(image.date_uploaded).toLocaleDateString()}
								</span>
							</div>
						</div>

						{/* Stats */}
						<div className="grid grid-cols-2 gap-4">
							<div className="text-center p-3 bg-muted rounded-lg">
								<div className="flex items-center justify-center gap-1 mb-1">
									<Eye className="h-4 w-4 text-muted-foreground" />
									<span className="font-medium">{image.view_count}</span>
								</div>
								<div className="text-muted-foreground text-sm">Views</div>
							</div>
							<div className="text-center p-3 bg-muted rounded-lg">
								<div className="flex items-center justify-center gap-1 mb-1">
									<Download className="h-4 w-4 text-muted-foreground" />
									<span className="font-medium">{image.download_count}</span>
								</div>
								<div className="text-muted-foreground text-sm">Downloads</div>
							</div>
						</div>

						{/* Actions */}
						<div className="space-y-2">
							<Button
								className="w-full"
								onClick={() => onDownload(image.id, image.title)}
							>
								<Download className="h-4 w-4 mr-2" />
								Download Image
							</Button>
							<Button
								variant="outline"
								className="w-full"
								onClick={() => onShare(image)}
							>
								<Share2 className="h-4 w-4 mr-2" />
								Share
							</Button>
							<Button
								variant="outline"
								className="w-full"
								onClick={toggleFullscreen}
							>
								<Expand className="h-4 w-4 mr-2" />
								View Fullscreen
							</Button>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
