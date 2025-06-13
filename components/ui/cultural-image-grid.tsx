import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, Eye, Calendar, Camera, MapPin, Share2 } from "lucide-react";
import { CulturalImage } from "@/types/cultural-content";

interface CulturalImageGridProps {
	images: CulturalImage[];
	viewMode: "grid" | "list";
	onImageClick: (image: CulturalImage, index: number) => void;
	onDownload: (imageId: string, imageTitle: string) => void;
	onShare: (image: CulturalImage) => void;
}

export function CulturalImageGrid({
	images,
	viewMode,
	onImageClick,
	onDownload,
	onShare,
}: CulturalImageGridProps) {
	if (viewMode === "grid") {
		return (
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
				{images.map((image, index) => (
					<Card
						key={image.id}
						className="group overflow-hidden hover:shadow-lg transition-all duration-200 hover:transform hover:scale-[1.02]"
					>
						<div className="relative aspect-square overflow-hidden">
							<Image
								src={image.file_path}
								alt={image.alt_text || image.title}
								fill
								className="object-cover transition-transform group-hover:scale-105"
								sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
								loading="lazy"
							/>
							<div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
								<Button
									size="sm"
									variant="secondary"
									onClick={() => onImageClick(image, index)}
									aria-label={`View ${image.title}`}
								>
									<Eye className="h-4 w-4" />
								</Button>
								<Button
									size="sm"
									variant="secondary"
									onClick={() => onDownload(image.id, image.title)}
									aria-label={`Download ${image.title}`}
								>
									<Download className="h-4 w-4" />
								</Button>
								<Button
									size="sm"
									variant="secondary"
									onClick={() => onShare(image)}
									aria-label={`Share ${image.title}`}
								>
									<Share2 className="h-4 w-4" />
								</Button>
							</div>
						</div>
						<CardContent className="p-4">
							<h3 className="font-semibold truncate mb-2" title={image.title}>
								{image.title}
							</h3>
							<div className="flex items-center justify-between text-xs text-muted-foreground">
								<div className="flex items-center gap-1">
									<Eye className="h-3 w-3" />
									{image.view_count}
								</div>
								<div className="flex items-center gap-1">
									<Download className="h-3 w-3" />
									{image.download_count}
								</div>
							</div>
							{image.region && (
								<Badge variant="secondary" className="mt-2 text-xs">
									{image.region}
								</Badge>
							)}
						</CardContent>
					</Card>
				))}
			</div>
		);
	}

	// List view
	return (
		<div className="space-y-4">
			{images.map((image, index) => (
				<Card
					key={image.id}
					className="overflow-hidden hover:shadow-md transition-shadow"
				>
					<div className="flex flex-col sm:flex-row gap-4 p-4">
						<div className="relative w-full sm:w-32 h-32 flex-shrink-0">
							<Image
								src={image.file_path}
								alt={image.alt_text || image.title}
								fill
								className="object-cover rounded"
								sizes="128px"
								loading="lazy"
							/>
						</div>
						<div className="flex-1">
							<h3 className="font-semibold mb-2">{image.title}</h3>
							{image.description && (
								<p className="text-sm text-muted-foreground mb-2 line-clamp-2">
									{image.description}
								</p>
							)}
							<div className="flex flex-wrap gap-4 text-xs text-muted-foreground mb-2">
								{image.photographer && (
									<div className="flex items-center gap-1">
										<Camera className="h-3 w-3" />
										{image.photographer}
									</div>
								)}
								{image.region && (
									<div className="flex items-center gap-1">
										<MapPin className="h-3 w-3" />
										{image.region}
									</div>
								)}
								<div className="flex items-center gap-1">
									<Calendar className="h-3 w-3" />
									{new Date(image.date_uploaded).toLocaleDateString()}
								</div>
							</div>
							<div className="flex items-center justify-between">
								<div className="flex gap-4 text-xs text-muted-foreground">
									<div className="flex items-center gap-1">
										<Eye className="h-3 w-3" />
										{image.view_count} views
									</div>
									<div className="flex items-center gap-1">
										<Download className="h-3 w-3" />
										{image.download_count} downloads
									</div>
								</div>
								<div className="flex gap-2">
									<Button
										size="sm"
										variant="outline"
										onClick={() => onImageClick(image, index)}
									>
										<Eye className="h-4 w-4 mr-1" />
										View
									</Button>
									<Button
										size="sm"
										variant="outline"
										onClick={() => onShare(image)}
									>
										<Share2 className="h-4 w-4 mr-1" />
										Share
									</Button>
									<Button
										size="sm"
										onClick={() => onDownload(image.id, image.title)}
									>
										<Download className="h-4 w-4 mr-1" />
										Download
									</Button>
								</div>
							</div>
						</div>
					</div>
				</Card>
			))}
		</div>
	);
}
