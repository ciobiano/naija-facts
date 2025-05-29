import { useState, useEffect } from "react";
import {
	ProfileData,
	MessageState,
	FormErrors,
	ProfileFormData,
} from "@/types";
import { profileApi } from "@/app/profile/services/profile-api";
import { useSession } from "next-auth/react";

interface UseProfileFormProps {
	profileData: ProfileData | null;
	setProfileData: (data: ProfileData) => void;
	setIsLoading: (loading: boolean) => void;
	setMessage: (message: { type: "success" | "error"; text: string }) => void;
	setErrors: (errors: Record<string, string>) => void;
}

export function useProfileForm({
	profileData,
	setProfileData,
	setIsLoading,
	setMessage,
	setErrors,
}: UseProfileFormProps) {
	const { data: session, update } = useSession();
	const [isEditing, setIsEditing] = useState(false);

	const [formData, setFormData] = useState<ProfileFormData>({
		fullName: profileData?.full_name || "",
		email: profileData?.email || "",
		location: profileData?.location || "",
		timezone: profileData?.timezone || "UTC",
		preferredLanguage: profileData?.preferred_language || "en",
	});

	// Update form data when profile data changes
	useEffect(() => {
		if (profileData) {
			setFormData({
				fullName: profileData.full_name || "",
				email: profileData.email || "",
				location: profileData.location || "",
				timezone: profileData.timezone || "UTC",
				preferredLanguage: profileData.preferred_language || "en",
			});
		}
	}, [profileData]);

	const updateFormData = (updates: Partial<ProfileFormData>) => {
		setFormData((prev) => ({ ...prev, ...updates }));
	};

	const resetForm = () => {
		if (profileData) {
			setFormData({
				fullName: profileData.full_name || "",
				email: profileData.email || "",
				location: profileData.location || "",
				timezone: profileData.timezone || "UTC",
				preferredLanguage: profileData.preferred_language || "en",
			});
		}
	};

	const handleSubmit = async () => {
		setIsLoading(true);
		setErrors({});
		setMessage({ type: "success", text: "" });

		try {
			const result = await profileApi.updateProfile(formData);

			setMessage({ type: "success", text: "Profile updated successfully!" });
			setIsEditing(false);
			setProfileData(result.profile);

			// Update session if name changed
			if (result.profile.full_name !== session?.user?.name) {
				await update({ name: result.profile.full_name });
			}
		} catch (error: any) {
			if (error.details) {
				const newErrors: Record<string, string> = {};
				error.details.forEach((err: any) => {
					newErrors[err.path[0]] = err.message;
				});
				setErrors(newErrors);
			} else {
				setMessage({
					type: "error",
					text: error.message || "Failed to update profile",
				});
			}
		} finally {
			setIsLoading(false);
		}
	};

	return {
		formData,
		updateFormData,
		isEditing,
		setIsEditing,
		resetForm,
		handleSubmit,
	};
}

export function useProfile() {
	const [profileData, setProfileData] = useState<ProfileData | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [message, setMessage] = useState<MessageState | null>(null);
	const [errors, setErrors] = useState<FormErrors>({});

	const fetchProfile = async () => {
		try {
			setIsLoading(true);
			const data = await profileApi.fetchProfile();
			setProfileData(data.profile);
		} catch (error) {
			console.error("Failed to fetch profile:", error);
			setMessage({
				type: "error",
				text: "Failed to load profile data",
			});
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchProfile();
	}, []);

	const clearMessage = () => setMessage(null);
	const clearErrors = () => setErrors({});

	return {
		profileData,
		setProfileData,
		isLoading,
		setIsLoading,
		message,
		setMessage,
		errors,
		setErrors,
		fetchProfile,
		clearMessage,
		clearErrors,
	};
}
