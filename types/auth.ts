export interface SignupFormData {
	fullName: string;
	email: string;
	password: string;
	confirmPassword: string;
}

export interface AuthErrors {
	fullName?: string;
	email?: string;
	password?: string;
	confirmPassword?: string;
	general?: string;
}

export interface SignupFormProps {
	formData: SignupFormData;
	errors: AuthErrors;
	isLoading: boolean;
	showPassword: boolean;
	showConfirmPassword: boolean;
	onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onSubmit: (e: React.FormEvent) => void;
	onTogglePassword: () => void;
	onToggleConfirmPassword: () => void;
}

export interface SocialAuthProps {
	isLoading: boolean;
	onOAuthSignIn: (provider: string) => void;
}

export type OAuthProvider = "google" | "github";

export interface UseSignupFormReturn {
	formData: SignupFormData;
	errors: AuthErrors;
	isLoading: boolean;
	showPassword: boolean;
	showConfirmPassword: boolean;
	handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	handleSubmit: (e: React.FormEvent) => Promise<void>;
	handleOAuthSignIn: (provider: string) => Promise<void>;
	setShowPassword: (show: boolean) => void;
	setShowConfirmPassword: (show: boolean) => void;
}
