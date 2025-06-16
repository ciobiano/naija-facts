"use client";

import { useState } from "react";
import { UploadDropzone } from "@/lib/uploadthing";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, Upload } from "lucide-react";
import Image from "next/image";

interface UploadedFile {
	url: string;
	name: string;
	size: number;
}

export function CulturalImageUploader() {
	const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
	const [isUploading, setIsUploading] = useState(false);

	return (
		<div className="w-full max-w-4xl mx-auto space-y-6">
			{/* Upload Section */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Upload className="h-5 w-5" />
						Upload Cultural Images
					</CardTitle>
					<CardDescription>
						Upload images of Nigerian cultural artifacts, traditional art, or
						historical items. Maximum 10 files, 10MB each. Supported formats:
						JPEG, PNG, WebP.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<UploadDropzone
						endpoint="culturalImageUploader"
						onClientUploadComplete={(res) => {
							// res is an array of files that were uploaded
							if (res) {
								const newFiles = res.map((file) => ({
									url: file.ufsUrl,
									name: file.name,
									size: file.size,
								}));
								setUploadedFiles((prev) => [...prev, ...newFiles]);
								setIsUploading(false);
							}
						}}
						onUploadError={(error: Error) => {
							console.error("Upload error:", error);
							setIsUploading(false);
							alert(`Upload error: ${error.message}`);
						}}
						onUploadBegin={() => {
							setIsUploading(true);
						}}
						className="ut-button:bg-cultural-bronze ut-button:hover:bg-cultural-terracotta ut-allowed-content:text-muted-foreground"
					/>

					{isUploading && (
						<div className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground">
							<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cultural-bronze"></div>
							Uploading files...
						</div>
					)}
				</CardContent>
			</Card>

			{/* Upload Guidelines */}
			<Card>
				<CardHeader>
					<CardTitle className="text-lg">Upload Guidelines</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
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

			{/* Uploaded Files Display */}
			{uploadedFiles.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle>Recently Uploaded</CardTitle>
						<CardDescription>
							{uploadedFiles.length} file{uploadedFiles.length !== 1 ? "s" : ""}{" "}
							uploaded successfully
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
							{uploadedFiles.map((file, index) => (
								<div key={index} className="relative group">
									<div className="aspect-square relative overflow-hidden rounded-lg border">
										<Image
											src={file.url}
											alt={file.name}
											fill
											className="object-cover transition-transform group-hover:scale-105"
										/>
									</div>
									<div className="mt-2 space-y-1">
										<p className="text-sm font-medium truncate">{file.name}</p>
										<div className="flex items-center gap-2">
											<Badge variant="secondary" className="text-xs">
												{(file.size / (1024 * 1024)).toFixed(1)} MB
											</Badge>
											<Badge
												variant="outline"
												className="text-xs text-green-600"
											>
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
			)}
		</div>
	);
}
