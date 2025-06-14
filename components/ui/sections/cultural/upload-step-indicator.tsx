import { CheckCircle2 } from "lucide-react";
import { UploadStep } from "@/types/cultural-content";

interface UploadStepIndicatorProps {
	currentStep: UploadStep;
	uploadedFiles: unknown[];
}

export function UploadStepIndicator({
	currentStep,
	uploadedFiles,
}: UploadStepIndicatorProps) {
	return (
		<div className="flex items-center gap-4">
			<div
				className={`flex items-center gap-2 ${
					currentStep === "upload" ? "text-primary" : "text-muted-foreground"
				}`}
			>
				<div
					className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
						currentStep === "upload"
							? "bg-primary text-primary-foreground"
							: uploadedFiles.length > 0
							? "bg-green-500 text-white"
							: "bg-muted"
					}`}
				>
					{uploadedFiles.length > 0 ? (
						<CheckCircle2 className="h-4 w-4" />
					) : (
						"1"
					)}
				</div>
				<span className="text-sm font-medium">Upload Files</span>
			</div>
			<div className="flex-1 h-px bg-border" />
			<div
				className={`flex items-center gap-2 ${
					currentStep === "metadata" ? "text-primary" : "text-muted-foreground"
				}`}
			>
				<div
					className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
						currentStep === "metadata"
							? "bg-primary text-primary-foreground"
							: "bg-muted"
					}`}
				>
					2
				</div>
				<span className="text-sm font-medium">Add Details</span>
			</div>
		</div>
	);
}
