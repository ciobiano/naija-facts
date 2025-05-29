import { signOut } from "next-auth/react";
import { profileApi } from "@/app/profile/services/profile-api";


interface UseAccountDeletionProps {
	setIsLoading: (loading: boolean) => void;
	setMessage: (message: { type: "success" | "error"; text: string }) => void;
}

export function useAccountDeletion({
	setIsLoading,
	setMessage,
}: UseAccountDeletionProps) {
	const handleAccountDeletion = async () => {
		if (
			!confirm(
				"Are you sure you want to delete your account? This action cannot be undone."
			)
		) {
			return;
		}

		setIsLoading(true);

		try {
			await profileApi.deleteAccount();
			await signOut({
				callbackUrl: "/?message=Account deleted successfully",
			});
		} catch (error: any) {
			setMessage({
				type: "error",
				text: error.message || "Failed to delete account",
			});
		} finally {
			setIsLoading(false);
		}
	};

	return { handleAccountDeletion };
}
