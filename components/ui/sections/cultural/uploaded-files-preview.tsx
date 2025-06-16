import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { X } from "lucide-react";
import Image from "next/image";
import { UploadedFile } from "@/types/cultural-content";
import { CheckCircle2 } from "lucide-react";

interface UploadedFilesPreviewProps {
	uploadedFiles: UploadedFile[];
	onRemoveFile: (fileId: string) => void;
}

export function UploadedFilesPreview({
	uploadedFiles,
	onRemoveFile,
}: UploadedFilesPreviewProps) {
	if (uploadedFiles.length === 0) {
		return null;
	}

	return (
		<Card>
			<CardContent className="pt-6">
				<h3 className="font-medium mb-4">Uploaded Files</h3>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{uploadedFiles.map((file) => (
						<div key={file.id} className="relative group">
							<div className="aspect-square relative overflow-hidden rounded-lg border">
								<Image
									src={file.preview}
									alt={file.fileName}
									fill
									className="object-cover"
								/>
								<Button
									variant="destructive"
									size="sm"
									className="absolute top-2 right-2 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
									onClick={() => onRemoveFile(file.id)}
								>
									<X className="h-4 w-4" />
								</Button>
							</div>
							<div className="mt-2 space-y-1">
								<p className="text-sm font-medium truncate">{file.fileName}</p>
								<div className="flex items-center gap-2 flex-wrap">
									<Badge variant="secondary" className="text-xs">
										{(file.fileSize / (1024 * 1024)).toFixed(1)} MB
									</Badge>
									{file.width && file.height && (
										<Badge variant="outline" className="text-xs">
											{file.width} × {file.height}
										</Badge>
									)}
									{file.duration && (
										<Badge variant="outline" className="text-xs">
											{Math.round(file.duration)}s
										</Badge>
									)}
									<Badge variant="outline" className="text-xs text-green-600">
										<CheckCircle2 className="h-3 w-3 mr-1" />
										Uploaded
									</Badge>
								</div>
							</div>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}
