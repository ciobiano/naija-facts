import { ProfileFormData, PasswordFormData, EmailFormData } from "@/types";

class ProfileApiService {
	async fetchProfile() {
		const response = await fetch("/api/profile", {
			credentials: "include",
		});
		if (!response.ok) {
			throw new Error("Failed to fetch profile");
		}
		return response.json();
	}

	async updateProfile(data: ProfileFormData) {
		const response = await fetch("/api/profile", {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			credentials: "include",
			body: JSON.stringify(data),
		});

		const result = await response.json();

		if (!response.ok) {
			throw new Error(result.error || "Failed to update profile");
		}

		return result;
	}

	async changePassword(data: PasswordFormData) {
		const response = await fetch("/api/profile/change-password", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			credentials: "include",
			body: JSON.stringify(data),
		});

		const result = await response.json();

		if (!response.ok) {
			if (result.error === "Validation failed" && result.details) {
				const error = new Error(result.error);
				(error as any).details = result.details;
				throw error;
			}
			throw new Error(result.error || "Failed to change password");
		}

		return result;
	}

	async changeEmail(data: EmailFormData) {
		const response = await fetch("/api/profile/change-email", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			credentials: "include",
			body: JSON.stringify(data),
		});

		const result = await response.json();

		if (!response.ok) {
			throw new Error(result.error || "Failed to change email");
		}

		return result;
	}

	async deleteAccount() {
		const response = await fetch("/api/profile/delete", {
			method: "DELETE",
			credentials: "include",
		});

		if (!response.ok) {
			const result = await response.json();
			throw new Error(result.error || "Failed to delete account");
		}

		return response.json();
	}
}

export const profileApi = new ProfileApiService();
