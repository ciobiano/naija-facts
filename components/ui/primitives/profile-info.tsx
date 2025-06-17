"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSession } from "next-auth/react";
import { Loader2, Edit, Save, X } from "lucide-react";

export function ProfileInfo() {
	const { data: session, update } = useSession();
	const [isEditing, setIsEditing] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [fullName, setFullName] = useState(session?.user?.name || "");

	const handleSave = async () => {
		setIsLoading(true);
		try {
			const response = await fetch("/api/profile", {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					full_name: fullName,
				}),
			});

			if (response.ok) {
				// Update the session
				await update({
					...session,
					user: {
						...session?.user,
						name: fullName,
					},
				});
				setIsEditing(false);
			} else {
				throw new Error("Failed to update profile");
			}
		} catch (error) {
			console.error("Error updating profile:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleCancel = () => {
		setFullName(session?.user?.name || "");
		setIsEditing(false);
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Profile Information</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="space-y-2">
					<Label htmlFor="email">Email</Label>
					<Input
						id="email"
						value={session?.user?.email || ""}
						disabled
						className="bg-gray-50 dark:bg-gray-900"
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="fullName">Full Name</Label>
					{isEditing ? (
						<Input
							id="fullName"
							value={fullName}
							onChange={(e) => setFullName(e.target.value)}
							placeholder="Enter your full name"
						/>
					) : (
						<Input
							id="fullName"
							value={session?.user?.name || "Not set"}
							disabled
							className="bg-gray-50 dark:bg-gray-900"
						/>
					)}
				</div>

				<div className="flex gap-2">
					{isEditing ? (
						<>
							<Button
								onClick={handleSave}
								disabled={isLoading}
								className="flex items-center gap-2"
							>
								{isLoading ? (
									<Loader2 className="h-4 w-4 animate-spin" />
								) : (
									<Save className="h-4 w-4" />
								)}
								Save
							</Button>
							<Button
								variant="outline"
								onClick={handleCancel}
								disabled={isLoading}
								className="flex items-center gap-2"
							>
								<X className="h-4 w-4" />
								Cancel
							</Button>
						</>
					) : (
						<Button
							onClick={() => setIsEditing(true)}
							variant="outline"
							className="flex items-center gap-2"
						>
							<Edit className="h-4 w-4" />
							Edit Profile
						</Button>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
