import { useState, useCallback } from "react";
import { useUploadThing } from "@/lib/uploadthing";
import { UploadFormData } from "@/lib/upload-constants";
import { UploadedFile } from "@/types/cultural-content";
import { extractFileMetadata } from "@/utils/file-metadata";

export function useUpload() {
	const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
	const [isComplete, setIsComplete] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [isExtractingMetadata, setIsExtractingMetadata] = useState(false);
	const [extractedMetadata, setExtractedMetadata] = useState<
		Map<string, { width?: number; height?: number; duration?: number }>
	>(new Map());

	// Function to extract metadata from files before upload
	const extractMetadataFromFiles = useCallback(async (files: File[]) => {
		setIsExtractingMetadata(true);
		const metadataMap = new Map();

		try {
			await Promise.all(
				files.map(async (file) => {
					const metadata = await extractFileMetadata(file);
					metadataMap.set(file.name, metadata);
				})
			);

			setExtractedMetadata(metadataMap);
			console.log("Extracted metadata:", metadataMap);
		} catch (error) {
			console.error("Error extracting metadata:", error);
		}
	}, []);

	const { startUpload, isUploading } = useUploadThing("culturalImageUploader", {
		onClientUploadComplete: (res) => {
			console.log("Files uploaded to storage:", res);

			// Map UploadThing response to existing UploadedFile interface
			const fileInfos: UploadedFile[] = res.map((file) => {
				// Get metadata for this file using the original filename as key
				const metadata = extractedMetadata.get(file.serverData.fileName) || {};

				return {
					id: file.serverData.fileKey, // Use fileKey as ID
					file: null,
					preview: file.serverData.fileUrl, // Use uploaded URL as preview
					serverData: {
						success: file.serverData.success,
						imageId: file.serverData.fileKey, // Use fileKey as imageId for now
						fileKey: file.serverData.fileKey,
						url: file.serverData.fileUrl,
						title: file.serverData.fileName,
						uploadedBy: file.serverData.uploadedBy,
						fileName: file.serverData.fileName,
						fileSize: file.serverData.fileSize,
						mimeType: file.serverData.mimeType,
						contentType: file.serverData.contentType as "image" | "video",
					},
					// Metadata fields
					title: file.serverData.fileName.replace(/\.[^/.]+$/, ""),
					uploadUrl: file.serverData.fileUrl,
					fileKey: file.serverData.fileKey,
					fileName: file.serverData.fileName,
					fileSize: file.serverData.fileSize,
					mimeType: file.serverData.mimeType,
					uploadedBy: file.serverData.uploadedBy,
					contentType: file.serverData.contentType as "image" | "video",
					// Include extracted metadata
					width: metadata.width,
					height: metadata.height,
					duration: metadata.duration,
				};
			});

			setUploadedFiles(fileInfos);
			setIsExtractingMetadata(false);
		},
		onUploadError: (error) => {
			console.error("Upload error:", error);
			alert(`Upload failed: ${error.message}`);
		},
	});

	const saveFiles = useCallback(
		async (metadata: UploadFormData) => {
			if (uploadedFiles.length === 0) {
				alert("No files to save");
				return;
			}

			setIsSaving(true);

			try {
				// Use existing API endpoint that already works
				const createPromises = uploadedFiles.map(async (fileInfo) => {
					const response = await fetch("/api/cultural-content/images", {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							// Use the existing API schema field names
							title: metadata.title || fileInfo.title,
							description: metadata.description,
							region: metadata.region,
							photographer: metadata.photographer,
							content_type: fileInfo.contentType,

							// File data from UploadThing
							file_path: fileInfo.uploadUrl,
							file_size: fileInfo.fileSize,
							mime_type: fileInfo.mimeType,
							file_key: fileInfo.fileKey,
							original_name: fileInfo.fileName,

							// Include extracted metadata
							width: fileInfo.width,
							height: fileInfo.height,
						}),
					});

					if (!response.ok) {
						const errorData = await response.json();
						throw new Error(errorData.error || "Failed to save file");
					}

					return response.json();
				});

				const results = await Promise.all(createPromises);
				console.log("All files saved successfully:", results);

				// Success!
				setIsComplete(true);

				// Auto-reset after 3 seconds
				setTimeout(() => {
					setUploadedFiles([]);
					setIsComplete(false);
				}, 3000);
			} catch (error) {
				console.error("Error saving files:", error);
				alert("Failed to save files. Please try again.");
			} finally {
				setIsSaving(false);
			}
		},
		[uploadedFiles]
	);

	const reset = useCallback(() => {
		setUploadedFiles([]);
		setIsComplete(false);
		setIsSaving(false);
	}, []);

	return {
		// State
		isUploading,
		isSaving,
		isComplete,
		isExtractingMetadata,
		uploadedFiles,
		hasFiles: uploadedFiles.length > 0,

		// Actions
		startUpload,
		saveFiles,
		reset,
		extractMetadataFromFiles,
	};
}
