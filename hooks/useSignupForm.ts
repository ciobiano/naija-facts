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

		// Clear general error when any field changes
		if (errors.general) {
			setErrors((prev) => ({ ...prev, general: "" }));
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
				fullName: formData.fullName.trim(),
				email: formData.email.toLowerCase().trim(),
				password: formData.password,
				confirmPassword: formData.confirmPassword,
			};

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
					// Handle specific error messages
					if (data.error.includes("already exists")) {
						setErrors({ email: "An account with this email already exists" });
					} else {
						setErrors({ general: data.error });
					}
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

			// Registration successful - redirect to welcome page with email
			router.push("/auth/welcome?email=" + encodeURIComponent(formData.email));
		} catch (error) {
			console.error("Registration error:", error);
			if (error instanceof TypeError && error.message.includes("fetch")) {
				setErrors({
					general: "Network error. Please check your connection and try again.",
				});
			} else {
				setErrors({
					general: "An unexpected error occurred. Please try again.",
				});
			}
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
		setErrors({});

		try {
			console.log(`OAuth sign in with ${provider}`);
			// Import signIn dynamically to avoid SSR issues
			const { signIn } = await import("next-auth/react");

			const result = await signIn(provider, {
				callbackUrl: "/auth/welcome",
				redirect: false,
			});

			if (result?.error) {
				console.error(`${provider} sign in error:`, result.error);
				setErrors({
					general: `Failed to sign in with ${provider}. Please try again.`,
				});
			} else if (result?.ok) {
				// Redirect will be handled by NextAuth
				router.push("/auth/welcome");
			}
		} catch (error) {
			console.error(`${provider} sign in error:`, error);
			setErrors({
				general: `Failed to sign in with ${provider}. Please try again.`,
			});
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
