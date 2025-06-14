import { useState, useCallback } from "react";
import { useUploadThing } from "@/lib/uploadthing";
import { toast } from "sonner";
import type { UploadedFile, UploadStep } from "@/types/cultural-content";
import type { UploadFormData } from "@/lib/cultural-upload-constants";

export function useCulturalUpload() {
	const [currentStep, setCurrentStep] = useState<UploadStep>("upload");
	const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
	const [isUploading, setIsUploading] = useState(false);
	const [isSaving, setIsSaving] = useState(false);

	const { startUpload, isUploading: isUploadThingUploading } = useUploadThing(
		"culturalImageUploader",
		{
			onClientUploadComplete: (res) => {
				console.log("Upload completed:", res);
				if (res) {
					const newFiles: UploadedFile[] = res.map((file) => ({
						id: file.serverData?.fileKey || file.key,
						file: null,
						preview: file.ufsUrl,
						serverData: file.serverData,
						// Extract metadata from server response
						title: file.serverData?.title || file.name,
						altText: file.serverData?.altText || "",
						uploadUrl: file.ufsUrl,
						fileKey: file.serverData?.fileKey || file.key,
						fileName: file.serverData?.fileName || file.name,
						fileSize: file.serverData?.fileSize || 0,
						mimeType: file.serverData?.mimeType || "",
						uploadedBy: file.serverData?.uploadedBy || "",
					}));
					setUploadedFiles(newFiles);
					setCurrentStep("metadata");
				}
				setIsUploading(false);
			},
			onUploadError: (error: Error) => {
				console.error("Upload error:", error);
				toast.error(`Upload failed: ${error.message}`);
				setIsUploading(false);
			},
		}
	);

	const handleFileUpload = useCallback(
		async (files: File[]) => {
			if (files.length === 0) return;

			setIsUploading(true);
			try {
				console.log(
					"Starting upload for files:",
					files.map((f) => f.name)
				);
				await startUpload(files);
			} catch (error) {
				console.error("File upload error:", error);
				toast.error("Failed to upload files");
				setIsUploading(false);
			}
		},
		[startUpload]
	);

	const removeFile = useCallback((fileId: string) => {
		setUploadedFiles((prev) => prev.filter((file) => file.id !== fileId));
	}, []);

	const handleMetadataSubmit = useCallback(
		async (formData: UploadFormData) => {
			if (uploadedFiles.length === 0) {
				toast.error("No files to save");
				return;
			}

			setIsSaving(true);
			try {
				const savePromises = uploadedFiles.map(async (file) => {
					const payload = {
						title: formData.title || file.title,
						description: formData.description,
						region: formData.region,
						photographer: formData.photographer,

						// File data from UploadThing
						file_path: file.uploadUrl,
						file_size: file.fileSize,
						mime_type: file.mimeType,
						file_key: file.fileKey,
						original_name: file.fileName,
					};

					console.log("Saving cultural image with payload:", payload);

					const response = await fetch("/api/cultural-content/images", {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify(payload),
					});

					if (!response.ok) {
						const errorData = await response.json();
						throw new Error(errorData.error || "Failed to save image");
					}

					return response.json();
				});

				const results = await Promise.all(savePromises);
				console.log("All images saved successfully:", results);

				toast.success(
					`Successfully saved ${uploadedFiles.length} cultural image(s)`
				);

				// Reset state
				setUploadedFiles([]);
				setCurrentStep("upload");
				setIsSaving(false);

				return results;
			} catch (error) {
				console.error("Error saving cultural images:", error);
				const errorMessage =
					error instanceof Error ? error.message : "Unknown error";
				toast.error(`Failed to save images: ${errorMessage}`);
				setIsSaving(false);
				throw error;
			}
		},
		[uploadedFiles]
	);

	const resetUpload = useCallback(() => {
		setUploadedFiles([]);
		setCurrentStep("upload");
		setIsUploading(false);
		setIsSaving(false);
	}, []);

	return {
		currentStep,
		setCurrentStep,
		uploadedFiles,
		isUploading: isUploading || isUploadThingUploading,
		isSaving,
		handleFileUpload,
		removeFile,
		handleMetadataSubmit,
		resetUpload,
	};
}
