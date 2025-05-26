"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SignupFormData, AuthErrors } from "@/types/auth";
import { validateSignupForm } from "@/lib/auth/validation";

export function useSignupForm() {
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
			const response = await fetch("/api/auth/register", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					fullName: formData.fullName,
					email: formData.email,
					password: formData.password,
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				if (data.error) {
					setErrors({ general: data.error });
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
		setIsLoading(true);
		try {
			// Implement OAuth sign in logic here
			console.log(`OAuth sign in with ${provider}`);
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
