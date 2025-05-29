import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { FormInput } from "@/components/ui/form-input";
import { Globe } from "lucide-react";
import { ProfileFormData, FormErrors } from "@/types";

interface PreferencesTabProps {
	formData: ProfileFormData;
	onFormChange: (updates: Partial<ProfileFormData>) => void;
	errors: FormErrors;
}

export function PreferencesTab({
	formData,
	onFormChange,
	errors,
}: PreferencesTabProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Globe className="h-5 w-5" />
					Language & Region
				</CardTitle>
				<CardDescription>
					Set your preferred language and timezone
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div className="space-y-2">
						<Label htmlFor="preferredLanguage">Preferred Language</Label>
						<Select
							value={formData.preferredLanguage}
							onValueChange={(value) =>
								onFormChange({ preferredLanguage: value })
							}
						>
							<SelectTrigger id="preferredLanguage">
								<SelectValue placeholder="Select language" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="en">English</SelectItem>
								<SelectItem value="ha">Hausa</SelectItem>
								<SelectItem value="yo">Yoruba</SelectItem>
								<SelectItem value="ig">Igbo</SelectItem>
								<SelectItem value="pcm">Nigerian Pidgin</SelectItem>
								<SelectItem value="fr">French</SelectItem>
							</SelectContent>
						</Select>
						{errors.preferredLanguage && (
							<p className="text-sm text-red-500">{errors.preferredLanguage}</p>
						)}
					</div>

					<FormInput
						label="Timezone"
						name="timezone"
						value={formData.timezone}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
							onFormChange({ timezone: e.target.value })
						}
						error={errors.timezone}
						placeholder="e.g., Africa/Lagos"
					/>
				</div>

				<div className="bg-muted/50 p-4 rounded-lg">
					<h4 className="font-medium text-sm mb-2">Language Support</h4>
					<p className="text-xs text-muted-foreground">
						Your language preference affects quiz questions and cultural
						content. Some content may only be available in English.
					</p>
				</div>
			</CardContent>
		</Card>
	);
}
