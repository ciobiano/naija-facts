"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { useUpload } from "@/hooks/use-upload";
import { UploadStepIndicator } from "./upload-step-indicator";
import { UploadArea } from "./upload-area";
import { UploadedFilesPreview } from "./uploaded-files-preview";
import { MetadataForm } from "./metadata-form";
import { uploadFormSchema, UploadFormData } from "@/lib/upload-constants";
import { CulturalUploadModalProps } from "@/types/cultural-content";
import { CheckCircle } from "lucide-react";

export function CulturalUploadModal({
	isOpen,
	onClose,
}: CulturalUploadModalProps) {
	const [currentStep, setCurrentStep] = useState<
		"upload" | "metadata" | "success"
	>("upload");

	const {
		isUploading,
		isSaving,
		isComplete,
		isExtractingMetadata,
		uploadedFiles,
		hasFiles,
		startUpload,
		saveFiles,
		reset,
		extractMetadataFromFiles,
	} = useUpload();

	const form = useForm<UploadFormData>({
		resolver: zodResolver(uploadFormSchema),
		defaultValues: {
			title: "",
			description: "",
			region: "",
			photographer: "",
			alt_text: "",
			// content_type removed - auto-determined by UploadThing
		},
	});

	const handleFileUpload = async (files: File[]) => {
		// Extract metadata first, then upload
		await extractMetadataFromFiles(files);
		await startUpload(files);

		if (hasFiles) {
			setCurrentStep("metadata");
		}
	};

	const onSubmit = async (data: UploadFormData) => {
		await saveFiles(data);
		setCurrentStep("success");
	};

	const handleBackToUpload = () => {
		setCurrentStep("upload");
		reset();
	};

	const handleClose = () => {
		if (!isUploading && !isSaving) {
			onClose();
			setCurrentStep("upload");
			reset();
			form.reset();
		}
	};

	// Auto-advance to metadata step when files are uploaded
	if (hasFiles && currentStep === "upload") {
		setCurrentStep("metadata");
	}

	// Auto-advance to success when complete
	if (isComplete && currentStep === "metadata") {
		setCurrentStep("success");
	}

	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
			<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Upload Cultural Content</DialogTitle>
					<DialogDescription>
						Share images and videos of Nigerian culture, traditions, and
						heritage.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-6">
					<UploadStepIndicator
						currentStep={currentStep}
						uploadedFiles={uploadedFiles}
					/>

					{currentStep === "upload" && (
						<UploadArea
							onFileUpload={handleFileUpload}
							isUploading={isUploading || isExtractingMetadata}
							isExtractingMetadata={isExtractingMetadata}
						/>
					)}

					{currentStep === "metadata" && (
						<div className="space-y-4">
							<UploadedFilesPreview
								uploadedFiles={uploadedFiles}
								onRemoveFile={(fileId) => {
									
									console.log("Remove file:", fileId);
								}}
							/>
							<MetadataForm
								form={form}
								isSubmitting={isSaving}
								onSubmit={onSubmit}
								onBackToUpload={handleBackToUpload}
							/>
						</div>
					)}

					{currentStep === "success" && (
						<div className="text-center py-8">
							<CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
							<h3 className="text-lg font-semibold mb-2">Upload Successful!</h3>
							<p className="text-muted-foreground">
								Your cultural content has been uploaded and saved successfully.
							</p>
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
