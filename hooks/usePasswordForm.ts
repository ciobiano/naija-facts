import { useState, useCallback } from "react";
import { z } from "zod";
import { PasswordFormData } from "@/types";
import { profileApi } from "@/app/profile/services/profile-api";

const ErrorWithDetails = z.object({
	details: z.record(z.string()),
});

const ErrorWithMessage = z.object({
	message: z.string(),
});

interface UsePasswordFormProps {
	setIsLoading: (loading: boolean) => void;
	setMessage: (message: { type: "success" | "error"; text: string }) => void;
	setErrors: (errors: Record<string, string>) => void;
}

interface UsePasswordFormReturn {
	formData: PasswordFormData;
	updateFormData: (updates: Partial<PasswordFormData>) => void;
	resetForm: () => void;
	handleSubmit: () => Promise<void>;
}

const INITIAL_FORM_DATA: PasswordFormData = {
	currentPassword: "",
	newPassword: "",
	confirmNewPassword: "",
};

const SUCCESS_MESSAGE = "Password changed successfully!";
const FALLBACK_ERROR_MESSAGE = "Failed to change password";

export function usePasswordForm({
	setIsLoading,
	setMessage,
	setErrors,
}: UsePasswordFormProps): UsePasswordFormReturn {
	const [formData, setFormData] = useState<PasswordFormData>(INITIAL_FORM_DATA);

	/**
	 * Updates form data with partial updates
	 */
	const updateFormData = useCallback((updates: Partial<PasswordFormData>) => {
		setFormData((prev) => ({ ...prev, ...updates }));
	}, []);


	const resetForm = useCallback(() => {
		setFormData(INITIAL_FORM_DATA);
	}, []);


	const clearErrorStates = useCallback(() => {
		setErrors({});
		setMessage({ type: "success", text: "" });
	}, [setErrors, setMessage]);


	const handleApiError = useCallback(
		(error: unknown) => {
			console.error("Password change error:", error);

	
			const detailsResult = ErrorWithDetails.safeParse(error);
			if (detailsResult.success) {
				setErrors(detailsResult.data.details);
				return;
			}

			const messageResult = ErrorWithMessage.safeParse(error);
			if (messageResult.success) {
				setMessage({
					type: "error",
					text: messageResult.data.message,
				});
				return;
			}

			setMessage({
				type: "error",
				text: FALLBACK_ERROR_MESSAGE,
			});
		},
		[setErrors, setMessage]
	);

	const handleSubmit = useCallback(async () => {
		setIsLoading(true);
		clearErrorStates();

		try {
			await profileApi.changePassword(formData);
			setMessage({ type: "success", text: SUCCESS_MESSAGE });
			resetForm();
		} catch (error: unknown) {
			handleApiError(error);
		} finally {
			setIsLoading(false);
		}
	}, [
		formData,
		setIsLoading,
		clearErrorStates,
		setMessage,
		resetForm,
		handleApiError,
	]);

	return {
		formData,
		updateFormData,
		resetForm,
		handleSubmit,
	};
}
