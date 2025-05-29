import { SignupFormData, AuthErrors } from "@/types/auth";
import { z } from "zod";

export const validateEmail = (email: string): boolean => {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
	// At least 8 characters, 1 uppercase, 1 lowercase, 1 number
	const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
	return passwordRegex.test(password);
};

export const validateFullName = (name: string): boolean => {
	return name.trim().length >= 2;
};

export const validateSignupForm = (formData: SignupFormData): AuthErrors => {
	const errors: AuthErrors = {};

	// Full name validation
	if (!formData.fullName.trim()) {
		errors.fullName = "Full name is required";
	} else if (!validateFullName(formData.fullName)) {
		errors.fullName = "Full name must be at least 2 characters";
	}

	// Email validation
	if (!formData.email.trim()) {
		errors.email = "Email is required";
	} else if (!validateEmail(formData.email)) {
		errors.email = "Please enter a valid email address";
	}

	// Password validation
	if (!formData.password) {
		errors.password = "Password is required";
	} else if (!validatePassword(formData.password)) {
		errors.password =
			"Password must be at least 8 characters with uppercase, lowercase, and number";
	}

	// Confirm password validation
	if (!formData.confirmPassword) {
		errors.confirmPassword = "Please confirm your password";
	} else if (formData.password !== formData.confirmPassword) {
		errors.confirmPassword = "Passwords do not match";
	}

	return errors;
};

// Enhanced password validation schema
export const passwordSchema = z
	.string()
	.min(8, "Password must be at least 8 characters")
	.regex(/[A-Z]/, "Password must contain at least one uppercase letter")
	.regex(/[a-z]/, "Password must contain at least one lowercase letter")
	.regex(/[0-9]/, "Password must contain at least one number")
	.regex(
		/[^A-Za-z0-9]/,
		"Password must contain at least one special character"
	);

// Email validation schema
export const emailSchema = z
	.string()
	.email("Please enter a valid email address")
	.min(1, "Email is required");

// Profile validation schemas
export const profileUpdateSchema = z.object({
	fullName: z
		.string()
		.min(2, "Full name must be at least 2 characters")
		.max(100, "Full name must be less than 100 characters")
		.regex(
			/^[a-zA-Z\s'-]+$/,
			"Full name can only contain letters, spaces, hyphens, and apostrophes"
		),
	location: z
		.string()
		.max(100, "Location must be less than 100 characters")
		.optional(),
	timezone: z.string().optional(),
	preferredLanguage: z.string().optional(),
});

// Password change validation schema
export const passwordChangeSchema = z
	.object({
		currentPassword: z.string().min(1, "Current password is required"),
		newPassword: passwordSchema,
		confirmNewPassword: z.string().min(1, "Please confirm your new password"),
	})
	.refine((data) => data.newPassword === data.confirmNewPassword, {
		message: "New passwords don't match",
		path: ["confirmNewPassword"],
	})
	.refine((data) => data.currentPassword !== data.newPassword, {
		message: "New password must be different from current password",
		path: ["newPassword"],
	});

// Email change validation schema
export const emailChangeSchema = z
	.object({
		newEmail: emailSchema,
		password: z.string().min(1, "Password is required to change email"),
	})
	.refine((data) => {
		// Add any additional email validation logic here
		return true;
	});

// Registration validation schema
export const registrationSchema = z
	.object({
		fullName: z
			.string()
			.min(2, "Full name must be at least 2 characters")
			.max(100, "Full name must be less than 100 characters"),
		email: emailSchema,
		password: passwordSchema,
		confirmPassword: z.string().min(1, "Please confirm your password"),
		agreeToTerms: z.boolean().refine((val) => val === true, {
			message: "You must agree to the terms and conditions",
		}),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords don't match",
		path: ["confirmPassword"],
	});

// Login validation schema
export const loginSchema = z.object({
	email: emailSchema,
	password: z.string().min(1, "Password is required"),
	rememberMe: z.boolean().optional(),
});

// Password reset request schema
export const passwordResetRequestSchema = z.object({
	email: emailSchema,
});

// Password reset validation schema
export const passwordResetSchema = z
	.object({
		token: z.string().min(1, "Reset token is required"),
		newPassword: passwordSchema,
		confirmNewPassword: z.string().min(1, "Please confirm your new password"),
	})
	.refine((data) => data.newPassword === data.confirmNewPassword, {
		message: "Passwords don't match",
		path: ["confirmNewPassword"],
	});

// Real-time validation helpers
export const validateField = <T>(
	schema: z.ZodSchema<T>,
	value: unknown
): { isValid: boolean; error?: string } => {
	try {
		schema.parse(value);
		return { isValid: true };
	} catch (error) {
		if (error instanceof z.ZodError) {
			return {
				isValid: false,
				error: error.errors[0]?.message || "Invalid input",
			};
		}
		return { isValid: false, error: "Validation error" };
	}
};

// Password strength validation helper
export const validatePasswordStrength = (password: string) => {
	const requirements = {
		minLength: password.length >= 8,
		hasUppercase: /[A-Z]/.test(password),
		hasLowercase: /[a-z]/.test(password),
		hasNumber: /[0-9]/.test(password),
		hasSpecialChar: /[^A-Za-z0-9]/.test(password),
	};

	const errors: string[] = [];
	if (!requirements.minLength)
		errors.push("Password must be at least 8 characters");
	if (!requirements.hasUppercase)
		errors.push("Password must contain at least one uppercase letter");
	if (!requirements.hasLowercase)
		errors.push("Password must contain at least one lowercase letter");
	if (!requirements.hasNumber)
		errors.push("Password must contain at least one number");
	if (!requirements.hasSpecialChar)
		errors.push("Password must contain at least one special character");

	return {
		isValid: Object.values(requirements).every(Boolean),
		requirements,
		errors,
		strength:
			Object.values(requirements).filter(Boolean).length /
			Object.keys(requirements).length,
	};
};

// Form validation helper
export const validateForm = <T>(
	schema: z.ZodSchema<T>,
	data: unknown
): { isValid: boolean; errors: Record<string, string>; data?: T } => {
	try {
		const validatedData = schema.parse(data);
		return { isValid: true, errors: {}, data: validatedData };
	} catch (error) {
		if (error instanceof z.ZodError) {
			const errors: Record<string, string> = {};
			error.errors.forEach((err) => {
				if (err.path.length > 0) {
					errors[err.path[0] as string] = err.message;
				}
			});
			return { isValid: false, errors };
		}
		return { isValid: false, errors: { general: "Validation failed" } };
	}
};
