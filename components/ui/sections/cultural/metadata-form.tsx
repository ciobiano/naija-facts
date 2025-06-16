import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { NIGERIAN_REGIONS, UploadFormData } from "@/lib/upload-constants";

interface MetadataFormProps {
	form: UseFormReturn<UploadFormData>;
	isSubmitting: boolean;
	onSubmit: (data: UploadFormData) => void;
	onBackToUpload: () => void;
}

export function MetadataForm({
	form,
	isSubmitting,
	onSubmit,
	onBackToUpload,
}: MetadataFormProps) {
	return (
		<Card>
			<CardContent className="pt-6">
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div className="space-y-2">
							<label htmlFor="title" className="text-sm font-medium">
								Title *
							</label>
							<Input
								id="title"
								placeholder="Enter title"
								{...form.register("title")}
							/>
							{form.formState.errors.title && (
								<p className="text-sm text-destructive">
									{form.formState.errors.title.message}
								</p>
							)}
							<p className="text-xs text-muted-foreground">
								A descriptive title for the cultural content
							</p>
						</div>

						<div className="space-y-2">
							<label htmlFor="region" className="text-sm font-medium">
								Region
							</label>
							<Select onValueChange={(value) => form.setValue("region", value)}>
								<SelectTrigger>
									<SelectValue placeholder="Select region" />
								</SelectTrigger>
								<SelectContent>
									{NIGERIAN_REGIONS.map((region) => (
										<SelectItem key={region} value={region}>
											{region}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<p className="text-xs text-muted-foreground">
								The Nigerian region where this cultural item originates
							</p>
						</div>
					</div>

					<div className="space-y-2">
						<label htmlFor="description" className="text-sm font-medium">
							Description
						</label>
						<Textarea
							id="description"
							placeholder="Describe the cultural significance, history, or context..."
							className="min-h-[100px]"
							{...form.register("description")}
						/>
						<p className="text-xs text-muted-foreground">
							Provide context about the cultural significance, history, or
							meaning
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div className="space-y-2">
							<label htmlFor="photographer" className="text-sm font-medium">
								Photographer/Creator
							</label>
							<Input
								id="photographer"
								placeholder="Photographer or creator name"
								{...form.register("photographer")}
							/>
							<p className="text-xs text-muted-foreground">
								Credit the photographer or creator of the content
							</p>
						</div>

						<div className="space-y-2">
							<label htmlFor="alt_text" className="text-sm font-medium">
								Alt Text
							</label>
							<Input
								id="alt_text"
								placeholder="Descriptive text for accessibility"
								{...form.register("alt_text")}
							/>
							<p className="text-xs text-muted-foreground">
								Describe the content for screen readers and accessibility
							</p>
						</div>
					</div>

					<div className="flex justify-between pt-4">
						<Button type="button" variant="outline" onClick={onBackToUpload}>
							Back to Upload
						</Button>
						<Button
							type="submit"
							disabled={isSubmitting}
							className="min-w-[120px]"
						>
							{isSubmitting ? (
								<>
									<Loader2 className="h-4 w-4 mr-2 animate-spin" />
									Saving...
								</>
							) : (
								"Complete Upload"
							)}
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	);
}
