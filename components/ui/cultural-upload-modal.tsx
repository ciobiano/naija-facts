"use client";

import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Upload } from "lucide-react";
import { CulturalUploadModalProps } from "@/types/cultural-content";
import { useCulturalUpload } from "@/hooks/use-cultural-upload";
import {
	uploadFormSchema,
	UploadFormData,
} from "@/lib/cultural-upload-constants";
import {
	UploadStepIndicator,
	UploadArea,
	UploadedFilesPreview,
	MetadataForm,
} from "@/components/ui/sections/cultural";
import { UploadedFileData } from "uploadthing/types";

export function CulturalUploadModal({
	children,
	onUploadComplete,
}: CulturalUploadModalProps) {
	const [open, setOpen] = useState(false);

	const {
		currentStep,
		setCurrentStep,
		uploadedFiles,
		isUploading,
		isSaving,
		removeFile,
		handleMetadataSubmit,
		resetUpload,
	} = useCulturalUpload();

	// Form for metadata
	const form = useForm<UploadFormData>({
		resolver: zodResolver(uploadFormSchema),
		defaultValues: {
			title: "",
			description: "",
			region: "",
			photographer: "",
			alt_text: "",
		},
	});

	// Handle modal open/close state
	const handleOpenChange = useCallback(
		(newOpen: boolean) => {
			console.log("Modal open state changed:", newOpen);
			setOpen(newOpen);
			if (!newOpen) {
				resetUpload();
				form.reset();
			}
		},
		[resetUpload, form]
	);

	// Handle upload completion from UploadThing
	const handleUploadThingComplete = useCallback(
		(res: UploadedFileData[]) => {
			console.log("Upload completed:", res);
			setCurrentStep("metadata");
			onUploadComplete?.();
		},
		[setCurrentStep, onUploadComplete]
	);

	// Handle upload error
	const handleUploadError = useCallback((error: Error) => {
		console.error("Upload error:", error);
	}, []);

	// Handle upload begin
	const handleUploadBegin = useCallback(() => {
		console.log("Upload started");
	}, []);

	// Handle form submission
	const handleFormSubmit = useCallback(
		async (data: UploadFormData) => {
			await handleMetadataSubmit(data);
			setOpen(false);
			form.reset();
		},
		[handleMetadataSubmit, form]
	);

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Upload className="h-5 w-5" />
						Upload Cultural Images
					</DialogTitle>
					<DialogDescription>
						Share Nigerian cultural heritage by uploading images with detailed
						information.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-6">
					{/* Step Indicator */}
					<UploadStepIndicator
						currentStep={currentStep}
						uploadedFiles={uploadedFiles}
					/>

					{/* Upload Step */}
					{currentStep === "upload" && (
						<UploadArea
							isUploading={isUploading}
							onUploadComplete={handleUploadThingComplete}
							onUploadError={handleUploadError}
							onUploadBegin={handleUploadBegin}
						/>
					)}

					{/* Metadata Step */}
					{currentStep === "metadata" && uploadedFiles.length > 0 && (
						<div className="space-y-6">
							{/* Uploaded Files Preview */}
							<UploadedFilesPreview
								uploadedFiles={uploadedFiles}
								onRemoveFile={removeFile}
							/>

							{/* Metadata Form */}
							<MetadataForm
								form={form}
								isSubmitting={isSaving}
								onSubmit={handleFormSubmit}
								onBackToUpload={() => setCurrentStep("upload")}
							/>
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
