import { z } from "zod";

// Nigerian regions for the dropdown
export const NIGERIAN_REGIONS = [
	"North Central",
	"North East", 
	"North West",
	"South East",
	"South South",
	"South West",
] as const;

// Form validation schema
export const uploadFormSchema = z.object({
	title: z.string().min(3, "Title must be at least 3 characters"),
	description: z.string().optional(),
	region: z.string().optional(),
	photographer: z.string().optional(),
	alt_text: z.string().optional(),
});

export type UploadFormData = z.infer<typeof uploadFormSchema>; 