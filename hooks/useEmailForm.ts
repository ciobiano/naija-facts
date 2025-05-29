import { useState } from "react";
import { EmailFormData } from "@/types";
import { profileApi } from "@/app/profile/services/profile-api";

interface UseEmailFormProps {
	setIsLoading: (loading: boolean) => void;
	setMessage: (message: { type: "success" | "error"; text: string }) => void;
	setErrors: (errors: Record<string, string>) => void;
}

export function useEmailForm({
	setIsLoading,
	setMessage,
	setErrors,
}: UseEmailFormProps) {
	const [formData, setFormData] = useState<EmailFormData>({
		newEmail: "",
		password: "",
	});

	const updateFormData = (updates: Partial<EmailFormData>) => {
		setFormData((prev) => ({ ...prev, ...updates }));
	};

	const resetForm = () => {
		setFormData({
			newEmail: "",
			password: "",
		});
	};

	const handleSubmit = async () => {
		setIsLoading(true);
		setErrors({});
		setMessage({ type: "success", text: "" });

		try {
			await profileApi.changeEmail(formData);
			setMessage({
				type: "success",
				text: "Email change requested! Please check your new email for verification.",
			});
			resetForm();
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
					text: error.message || "Failed to change email",
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
