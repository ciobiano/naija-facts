import { useState } from "react";
import { PasswordFormData } from "@/types";
import { profileApi } from "@/app/profile/services/profile-api";

interface UsePasswordFormProps {
	setIsLoading: (loading: boolean) => void;
	setMessage: (message: { type: "success" | "error"; text: string }) => void;
	setErrors: (errors: Record<string, string>) => void;
}

export function usePasswordForm({
	setIsLoading,
	setMessage,
	setErrors,
}: UsePasswordFormProps) {
	const [formData, setFormData] = useState<PasswordFormData>({
		currentPassword: "",
		newPassword: "",
		confirmNewPassword: "",
	});

	const updateFormData = (updates: Partial<PasswordFormData>) => {
		setFormData((prev) => ({ ...prev, ...updates }));
	};

	const resetForm = () => {
		setFormData({
			currentPassword: "",
			newPassword: "",
			confirmNewPassword: "",
		});
	};

	const handleSubmit = async () => {
		setIsLoading(true);
		setErrors({});
		setMessage({ type: "success", text: "" });

		try {
			console.log("Submitting password change data:", formData);
			await profileApi.changePassword(formData);
			setMessage({ type: "success", text: "Password changed successfully!" });
			resetForm();
		} catch (error: any) {
			console.error("Password change error:", error);

			// Check if it's a validation error with details
			if (error.message && error.message.includes("Validation failed")) {
				try {
					// Try to parse the error response if it contains details
					const errorResponse = JSON.parse(
						error.message.split("Validation failed")[1] || "{}"
					);
					if (errorResponse.details) {
						setErrors(errorResponse.details);
						return;
					}
				} catch (parseError) {
					console.error("Error parsing validation details:", parseError);
				}
			}

			// Handle general validation errors from API
			if (error.details) {
				setErrors(error.details);
			} else {
				setMessage({
					type: "error",
					text: error.message || "Failed to change password",
				});
			}
		} finally {
			setIsLoading(false);
		}
	};

	return {
		formData,
		updateFormData,
		resetForm,
		handleSubmit,
	};
}
