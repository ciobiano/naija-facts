export interface ProfileData {
	id: string;
	email: string;
	full_name: string;
	avatar_url?: string;
	location?: string;
	timezone?: string;
	preferred_language?: string;
	created_at: string;
	last_login: string;
	is_active: boolean;
}

export interface ProfileFormData {
	fullName: string;
	email: string;
	location: string;
	timezone: string;
	preferredLanguage: string;
}

export interface PasswordFormData {
	currentPassword: string;
	newPassword: string;
	confirmNewPassword: string;
}

export interface EmailFormData {
	newEmail: string;
	password: string;
}

export interface MessageState {
	type: "success" | "error";
	text: string;
}

export type TabValue = "profile" | "security" | "preferences" | "danger";

export interface FormErrors {
	[key: string]: string;
}
