import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FormInput } from "@/components/ui/form-input";
import { FormTextarea } from "@/components/ui/form-textarea";
import { User, Mail, Settings, Save, Camera } from "lucide-react";
import { ProfileData, ProfileFormData, FormErrors } from "@/types";
import { getInitials, formatMemberSince } from "@/lib/utils";

interface ProfileInfoTabProps {
	profileData: ProfileData | null;
	formData: ProfileFormData;
	onFormChange: (updates: Partial<ProfileFormData>) => void;
	errors: FormErrors;
	isEditing: boolean;
	isLoading: boolean;
	onEditToggle: () => void;
	onSave: () => void;
	onCancel: () => void;
}

export function ProfileInfoTab({
	profileData,
	formData,
	onFormChange,
	errors,
	isEditing,
	isLoading,
	onEditToggle,
	onSave,
	onCancel,
}: ProfileInfoTabProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<User className="h-5 w-5" />
					Personal Information
				</CardTitle>
				<CardDescription>
					Update your personal details and profile information
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* Avatar Section */}
				<div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
					<div className="relative">
						<Avatar className="h-20 w-20">
							<AvatarImage
								src={profileData?.avatar_url || ""}
								alt={profileData?.full_name || ""}
							/>
							<AvatarFallback className="text-lg">
								{getInitials(profileData?.full_name || "User")}
							</AvatarFallback>
						</Avatar>
						<Button
							size="sm"
							variant="outline"
							className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
						>
							<Camera className="h-4 w-4" />
						</Button>
					</div>
					<div className="space-y-1 flex-1">
						<h3 className="text-lg font-semibold">{profileData?.full_name}</h3>
						<p className="text-sm text-muted-foreground flex items-center gap-1">
							<Mail className="h-4 w-4" />
							{profileData?.email}
						</p>
						<p className="text-xs text-muted-foreground">
							Member since{" "}
							{profileData?.created_at
								? formatMemberSince(profileData.created_at)
								: "Unknown"}
						</p>
					</div>
				</div>

				<Separator />

				{/* Form Fields */}
				<div className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<FormInput
							label="Full Name"
							name="fullName"
							value={formData.fullName}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
								onFormChange({ fullName: e.target.value })
							}
							error={errors.fullName}
							disabled={!isEditing}
							required
						/>
						<FormInput
							label="Location"
							name="location"
							value={formData.location}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
								onFormChange({ location: e.target.value })
							}
							error={errors.location}
							disabled={!isEditing}
							placeholder="City, Country"
						/>
					</div>
				</div>

				<div className="flex flex-col sm:flex-row justify-end gap-2">
					{isEditing ? (
						<>
							<Button
								variant="outline"
								onClick={onCancel}
								className="w-full sm:w-auto"
							>
								Cancel
							</Button>
							<Button
								onClick={onSave}
								disabled={isLoading}
								className="w-full sm:w-auto"
							>
								<Save className="mr-2 h-4 w-4" />
								{isLoading ? "Saving..." : "Save Changes"}
							</Button>
						</>
					) : (
						<Button onClick={onEditToggle} className="w-full sm:w-auto">
							<Settings className="mr-2 h-4 w-4" />
							Edit Profile
						</Button>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
