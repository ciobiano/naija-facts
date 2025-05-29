"use client";

import { useState } from "react";
import ProtectedRoute, { useAuth } from "@/components/auth/ProtectedRoute";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Lock, Settings, AlertTriangle } from "lucide-react";
import { useProfile, useProfileForm } from "@/hooks/useProfile";

import { useEmailForm } from "@/hooks/useEmailForm";
import { useAccountDeletion } from "@/hooks/useAccountDeletion";

import { ProfileHeader } from "@/components/ui/primitives/profile-header";
import { MessageAlert } from "@/components/ui/primitives/message-alert";
import { ProfileInfoTab } from "@/components/ui/primitives/profile-info";
import { SecurityTab } from "@/components/ui/primitives/security-tab";
import { PreferencesTab } from "@/components/ui/primitives/preferences-tab";
import { DangerZoneTab } from "@/components/ui/primitives/danger-zone";
import { ProgressOverview } from "@/components/ui/primitives/progress-overview";
import { TabValue } from "@/types";
import { usePasswordForm } from "@/hooks/usePasswordForm";

function ProfileContent() {
	const { user, role, isAdmin } = useAuth();
	const [activeTab, setActiveTab] = useState<TabValue>("profile");

	const {
		profileData,
		setProfileData,
		isLoading,
		setIsLoading,
		message,
		setMessage,
		errors,
		setErrors,
	} = useProfile();

	const profileForm = useProfileForm({
		profileData,
		setProfileData,
		setIsLoading,
		setMessage,
		setErrors,
	});

	const passwordForm = usePasswordForm({
		setIsLoading,
		setMessage,
		setErrors,
	});

	const emailForm = useEmailForm({
		setIsLoading,
		setMessage,
		setErrors,
	});

	const { handleAccountDeletion } = useAccountDeletion({
		setIsLoading,
		setMessage,
	});

	return (
		<div className="container mx-auto py-6 px-4 max-w-6xl">
			<div className="space-y-6">
				<ProfileHeader role={role} isAdmin={isAdmin} />
				<MessageAlert message={message} />

				<Tabs
					value={activeTab}
					onValueChange={(value) => setActiveTab(value as TabValue)}
					className="w-full"
				>
					<TabsList className="w-full">
						<TabsTrigger value="profile" className="flex-1">
							<User className="h-4 w-4 mr-2" />
							Profile
						</TabsTrigger>
						<TabsTrigger value="security" className="flex-1">
							<Lock className="h-4 w-4 mr-2" />
							Security
						</TabsTrigger>
						<TabsTrigger value="preferences" className="flex-1">
							<Settings className="h-4 w-4 mr-2" />
							Preferences
						</TabsTrigger>
						<TabsTrigger value="danger" className="flex-1">
							<AlertTriangle className="h-4 w-4 mr-2" />
							Account
						</TabsTrigger>
					</TabsList>

					<TabsContent value="profile">
						<ProfileInfoTab
							profileData={profileData}
							formData={profileForm.formData}
							onFormChange={profileForm.updateFormData}
							errors={errors}
							isEditing={profileForm.isEditing}
							isLoading={isLoading}
							onEditToggle={() => profileForm.setIsEditing(true)}
							onSave={profileForm.handleSubmit}
							onCancel={() => {
								profileForm.setIsEditing(false);
								profileForm.resetForm();
							}}
						/>
					</TabsContent>

					<TabsContent value="security">
						<SecurityTab
							passwordForm={passwordForm.formData}
							emailForm={emailForm.formData}
							onPasswordChange={passwordForm.updateFormData}
							onEmailChange={emailForm.updateFormData}
							errors={errors}
							isLoading={isLoading}
							onPasswordSubmit={passwordForm.handleSubmit}
							onEmailSubmit={emailForm.handleSubmit}
						/>
					</TabsContent>

					<TabsContent value="preferences">
						<PreferencesTab
							formData={profileForm.formData}
							onFormChange={profileForm.updateFormData}
							errors={errors}
						/>
					</TabsContent>

					<TabsContent value="danger">
						<DangerZoneTab
							isLoading={isLoading}
							onAccountDeletion={handleAccountDeletion}
						/>
					</TabsContent>
				</Tabs>

				<ProgressOverview profileData={profileData} />
			</div>
		</div>
	);
}

export default function ProfilePage() {
	return (
		<ProtectedRoute requireAuth={true}>
			<ProfileContent />
		</ProtectedRoute>
	);
}
