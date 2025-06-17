"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { ProfileHeader } from "@/components/ui/primitives/profile-header";
import { ProfileInfo } from "@/components/ui/primitives/profile-info";
import { SecurityTab } from "@/components/ui/primitives/security-tab";
import { PreferencesTab } from "@/components/ui/primitives/preferences-tab";
import { DangerZone } from "@/components/ui/primitives/danger-zone";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ProfilePage() {
	const { data: session, status } = useSession();

	if (status === "loading") {
		return <div>Loading...</div>;
	}

	if (!session) {
		redirect("/auth/signin");
	}

	return (
		<div className="container mx-auto px-4 py-8 max-w-4xl">
			<ProfileHeader />

			<Tabs defaultValue="profile" className="mt-8">
				<TabsList className="grid w-full grid-cols-4">
					<TabsTrigger value="profile">Profile</TabsTrigger>
					<TabsTrigger value="security">Security</TabsTrigger>
					<TabsTrigger value="preferences">Preferences</TabsTrigger>
					<TabsTrigger value="danger">Account</TabsTrigger>
				</TabsList>

				<TabsContent value="profile" className="mt-6">
					<ProfileInfo />
				</TabsContent>

				<TabsContent value="security" className="mt-6">
					<SecurityTab />
				</TabsContent>

				<TabsContent value="preferences" className="mt-6">
					<PreferencesTab />
				</TabsContent>

				<TabsContent value="danger" className="mt-6">
					<DangerZone />
				</TabsContent>
			</Tabs>
		</div>
	);
}
