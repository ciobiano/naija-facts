import { UploadDropzone } from "@/lib/uploadthing";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

interface UploadAreaProps {
	isUploading: boolean;
	isExtractingMetadata?: boolean;
	onFileUpload: (files: File[]) => void;
}

export function UploadArea({
	isUploading,
	isExtractingMetadata = false,
	onFileUpload,
}: UploadAreaProps) {
	return (
		<div className="space-y-6">
			<Card>
				<CardContent className="pt-6">
					<UploadDropzone
						endpoint="culturalImageUploader"
						onDrop={onFileUpload}
						className="ut-button:bg-primary ut-button:hover:bg-primary/90 ut-allowed-content:text-muted-foreground"
					/>

					{isExtractingMetadata && (
						<div className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground">
							<Loader2 className="h-4 w-4 animate-spin" />
							Extracting image metadata...
						</div>
					)}

					{isUploading && !isExtractingMetadata && (
						<div className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground">
							<Loader2 className="h-4 w-4 animate-spin" />
							Uploading files...
						</div>
					)}
				</CardContent>
			</Card>

			{/* Upload Guidelines */}
			<Card>
				<CardContent className="pt-6">
					<h3 className="font-medium mb-4">Upload Guidelines</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="space-y-2">
							<div className="flex items-center gap-2 text-sm">
								<CheckCircle2 className="h-4 w-4 text-green-600" />
								<span>High-quality cultural artifacts</span>
							</div>
							<div className="flex items-center gap-2 text-sm">
								<CheckCircle2 className="h-4 w-4 text-green-600" />
								<span>Traditional Nigerian art</span>
							</div>
							<div className="flex items-center gap-2 text-sm">
								<CheckCircle2 className="h-4 w-4 text-green-600" />
								<span>Historical photographs</span>
							</div>
						</div>
						<div className="space-y-2">
							<div className="flex items-center gap-2 text-sm">
								<AlertCircle className="h-4 w-4 text-amber-600" />
								<span>Ensure proper attribution</span>
							</div>
							<div className="flex items-center gap-2 text-sm">
								<AlertCircle className="h-4 w-4 text-amber-600" />
								<span>Respect cultural sensitivity</span>
							</div>
							<div className="flex items-center gap-2 text-sm">
								<AlertCircle className="h-4 w-4 text-amber-600" />
								<span>Clear, well-lit images preferred</span>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
