"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SignupFormData, AuthErrors, UseSignupFormReturn } from "@/types/auth";
import { validateSignupForm } from "@/lib/auth/validation";

export function useSignupForm(): UseSignupFormReturn {
	const router = useRouter();
	const [formData, setFormData] = useState<SignupFormData>({
		fullName: "",
		email: "",
		password: "",
		confirmPassword: "",
	});
	const [errors, setErrors] = useState<AuthErrors>({});
	const [isLoading, setIsLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));

		// Clear error when user starts typing
		if (errors[name as keyof AuthErrors]) {
			setErrors((prev) => ({ ...prev, [name]: "" }));
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// Validate form
		const validationErrors = validateSignupForm(formData);
		if (Object.keys(validationErrors).length > 0) {
			setErrors(validationErrors);
			return;
		}

		setIsLoading(true);
		setErrors({});

		try {
			const requestBody = {
				fullName: formData.fullName,
				email: formData.email,
				password: formData.password,
				confirmPassword: formData.confirmPassword,
			};
			
			console.log("Sending registration request:", {
				...requestBody,
				password: "***hidden***",
				confirmPassword: "***hidden***",
			});

			const response = await fetch("/api/auth/register", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(requestBody),
			});

			const data = await response.json();

			if (!response.ok) {
				console.error("Registration failed:", {
					status: response.status,
					statusText: response.statusText,
					data: data,
					formData: {
						fullName: formData.fullName,
						email: formData.email,
						password: "***hidden***",
					},
				});

				if (data.error) {
					setErrors({ general: data.error });
				} else if (data.details) {
					// Handle validation errors from Zod
					const validationErrors: AuthErrors = {};
					data.details.forEach((detail: any) => {
						if (detail.path && detail.path.length > 0) {
							const field = detail.path[0];
							validationErrors[field as keyof AuthErrors] = detail.message;
						}
					});
					setErrors(validationErrors);
				} else {
					setErrors({ general: "Registration failed. Please try again." });
				}
				return;
			}

			// Registration successful
			router.push("/auth/welcome?email=" + encodeURIComponent(formData.email));
		} catch (error) {
			console.error("Registration error:", error);
			setErrors({ general: "An unexpected error occurred. Please try again." });
		} finally {
			setIsLoading(false);
		}
	};

	const handleOAuthSignIn = async (provider: string) => {
		if (isLoading) {
			console.log(`OAuth ${provider} already in progress, ignoring...`);
			return;
		}
		
		setIsLoading(true);
		try {
			console.log(`OAuth sign in with ${provider}`);
			// TODO: Implement actual OAuth sign in logic here
			// For now, just log the provider
		} catch (error) {
			console.error(`${provider} sign in error:`, error);
			setErrors({ general: `Failed to sign in with ${provider}` });
		} finally {
			setIsLoading(false);
		}
	};

	return {
		formData,
		errors,
		isLoading,
		showPassword,
		showConfirmPassword,
		handleInputChange,
		handleSubmit,
		handleOAuthSignIn,
		setShowPassword,
		setShowConfirmPassword,
	};
}
