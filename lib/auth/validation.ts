import { SignupFormData, AuthErrors } from "@/types/auth";

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
