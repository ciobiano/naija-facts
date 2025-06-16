import Image from "next/image";
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
	if (!image) return null;

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
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
						<div className="relative aspect-square lg:aspect-[4/3] w-full overflow-hidden rounded-lg">
							<Image
								src={image.file_path}
								alt={image.alt_text || image.title}
								fill
								className="object-cover"
								sizes="(max-width: 1024px) 100vw, 60vw"
								priority
							/>

							{/* Navigation arrows */}
							{hasPrevious && onPrevious && (
								<Button
									variant="secondary"
									size="sm"
									className="absolute left-2 top-1/2 transform -translate-y-1/2 opacity-75 hover:opacity-100"
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
									className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-75 hover:opacity-100"
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
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
