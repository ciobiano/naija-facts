"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Loader2, User, Settings, Trophy, Calendar } from "lucide-react";

interface Profile {
	id: string;
	email: string;
	full_name: string | null;
	avatar_url: string | null;
	preferred_language: string;
	timezone: string | null;
	date_of_birth: string | null;
	location: string | null;
	learning_preferences: any;
	created_at: string;
	updated_at: string;
	last_login: string | null;
	is_active: boolean;
}

export default function ProfilePage() {
	const { data: session, status } = useSession();
	const router = useRouter();
	const [profile, setProfile] = useState<Profile | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [message, setMessage] = useState("");
	const [error, setError] = useState("");
	const [formData, setFormData] = useState({
		fullName: "",
		preferredLanguage: "en",
		timezone: "",
		dateOfBirth: "",
		location: "",
		avatarUrl: "",
	});

	useEffect(() => {
		if (status === "loading") return;

		if (!session) {
			router.push("/auth/signin");
			return;
		}

		fetchProfile();
	}, [session, status, router]);

	const fetchProfile = async () => {
		try {
			const response = await fetch("/api/profile");
			const data = await response.json();

			if (response.ok) {
				setProfile(data.profile);
				setFormData({
					fullName: data.profile.full_name || "",
					preferredLanguage: data.profile.preferred_language || "en",
					timezone: data.profile.timezone || "",
					dateOfBirth: data.profile.date_of_birth
						? data.profile.date_of_birth.split("T")[0]
						: "",
					location: data.profile.location || "",
					avatarUrl: data.profile.avatar_url || "",
				});
			} else {
				setError(data.error || "Failed to load profile");
			}
		} catch (error) {
			console.error("Profile fetch error:", error);
			setError("Failed to load profile");
		} finally {
			setIsLoading(false);
		}
	};

	const handleInputChange = (name: string, value: string) => {
		setFormData((prev) => ({ ...prev, [name]: value }));
		if (error) setError("");
		if (message) setMessage("");
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSaving(true);
		setError("");
		setMessage("");

		try {
			const response = await fetch("/api/profile", {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(formData),
			});

			const data = await response.json();

			if (response.ok) {
				setProfile(data.profile);
				setMessage("Profile updated successfully!");
			} else {
				setError(data.error || "Failed to update profile");
			}
		} catch (error) {
			console.error("Profile update error:", error);
			setError("Failed to update profile");
		} finally {
			setIsSaving(false);
		}
	};

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
			</div>
		);
	}

	if (!profile) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<Card className="w-full max-w-md">
					<CardContent className="pt-6">
						<div className="text-center">
							<h2 className="text-2xl font-bold mb-4">Profile Not Found</h2>
							<p className="text-muted-foreground mb-4">
								We couldn't load your profile information.
							</p>
							<Button onClick={() => router.push("/")} variant="outline">
								Go Home
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="container mx-auto px-4 py-8 max-w-4xl">
			<div className="mb-8">
				<h1 className="text-3xl font-bold mb-2">Profile Settings</h1>
				<p className="text-muted-foreground">
					Manage your account settings and preferences
				</p>
			</div>

			<Tabs defaultValue="profile" className="space-y-6">
				<TabsList className="grid w-full grid-cols-3">
					<TabsTrigger value="profile" className="flex items-center gap-2">
						<User className="h-4 w-4" />
						Profile
					</TabsTrigger>
					<TabsTrigger value="preferences" className="flex items-center gap-2">
						<Settings className="h-4 w-4" />
						Preferences
					</TabsTrigger>
					<TabsTrigger value="activity" className="flex items-center gap-2">
						<Trophy className="h-4 w-4" />
						Activity
					</TabsTrigger>
				</TabsList>

				<TabsContent value="profile" className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>Profile Information</CardTitle>
							<CardDescription>
								Update your personal information and profile picture
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-6">
							{message && (
								<Alert>
									<AlertDescription>{message}</AlertDescription>
								</Alert>
							)}

							{error && (
								<Alert variant="destructive">
									<AlertDescription>{error}</AlertDescription>
								</Alert>
							)}

							{/* Profile Picture Section */}
							<div className="flex items-center space-x-4">
								<Avatar className="h-20 w-20">
									<AvatarImage src={profile.avatar_url || ""} />
									<AvatarFallback className="text-lg">
										{profile.full_name?.charAt(0)?.toUpperCase() ||
											profile.email.charAt(0).toUpperCase()}
									</AvatarFallback>
								</Avatar>
								<div>
									<h3 className="text-lg font-semibold">
										{profile.full_name || "No name set"}
									</h3>
									<p className="text-muted-foreground">{profile.email}</p>
									<Badge variant="secondary" className="mt-1">
										{profile.is_active ? "Active" : "Inactive"}
									</Badge>
								</div>
							</div>

							<form onSubmit={handleSubmit} className="space-y-4">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="fullName">Full Name</Label>
										<Input
											id="fullName"
											value={formData.fullName}
											onChange={(e) =>
												handleInputChange("fullName", e.target.value)
											}
											placeholder="Enter your full name"
											disabled={isSaving}
										/>
									</div>

									<div className="space-y-2">
										<Label htmlFor="location">Location</Label>
										<Input
											id="location"
											value={formData.location}
											onChange={(e) =>
												handleInputChange("location", e.target.value)
											}
											placeholder="Enter your location"
											disabled={isSaving}
										/>
									</div>

									<div className="space-y-2">
										<Label htmlFor="dateOfBirth">Date of Birth</Label>
										<Input
											id="dateOfBirth"
											type="date"
											value={formData.dateOfBirth}
											onChange={(e) =>
												handleInputChange("dateOfBirth", e.target.value)
											}
											disabled={isSaving}
										/>
									</div>

									<div className="space-y-2">
										<Label htmlFor="avatarUrl">Avatar URL</Label>
										<Input
											id="avatarUrl"
											value={formData.avatarUrl}
											onChange={(e) =>
												handleInputChange("avatarUrl", e.target.value)
											}
											placeholder="Enter avatar image URL"
											disabled={isSaving}
										/>
									</div>
								</div>

								<Button type="submit" disabled={isSaving}>
									{isSaving ? (
										<>
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											Saving...
										</>
									) : (
										"Save Changes"
									)}
								</Button>
							</form>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="preferences" className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>Learning Preferences</CardTitle>
							<CardDescription>
								Customize your learning experience
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="preferredLanguage">Preferred Language</Label>
									<Select
										value={formData.preferredLanguage}
										onValueChange={(value) =>
											handleInputChange("preferredLanguage", value)
										}
										disabled={isSaving}
									>
										<SelectTrigger>
											<SelectValue placeholder="Select language" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="en">English</SelectItem>
											<SelectItem value="ha">Hausa</SelectItem>
											<SelectItem value="ig">Igbo</SelectItem>
											<SelectItem value="yo">Yoruba</SelectItem>
											<SelectItem value="fr">French</SelectItem>
											<SelectItem value="ar">Arabic</SelectItem>
										</SelectContent>
									</Select>
								</div>

								<div className="space-y-2">
									<Label htmlFor="timezone">Timezone</Label>
									<Select
										value={formData.timezone}
										onValueChange={(value) =>
											handleInputChange("timezone", value)
										}
										disabled={isSaving}
									>
										<SelectTrigger>
											<SelectValue placeholder="Select timezone" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="Africa/Lagos">
												Africa/Lagos (WAT)
											</SelectItem>
											<SelectItem value="UTC">UTC</SelectItem>
											<SelectItem value="America/New_York">
												America/New_York (EST)
											</SelectItem>
											<SelectItem value="Europe/London">
												Europe/London (GMT)
											</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>

							<Button onClick={handleSubmit} disabled={isSaving}>
								{isSaving ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Saving...
									</>
								) : (
									"Save Preferences"
								)}
							</Button>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="activity" className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>Account Activity</CardTitle>
							<CardDescription>
								View your account activity and statistics
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label className="flex items-center gap-2">
										<Calendar className="h-4 w-4" />
										Member Since
									</Label>
									<p className="text-sm text-muted-foreground">
										{new Date(profile.created_at).toLocaleDateString()}
									</p>
								</div>

								<div className="space-y-2">
									<Label className="flex items-center gap-2">
										<User className="h-4 w-4" />
										Last Login
									</Label>
									<p className="text-sm text-muted-foreground">
										{profile.last_login
											? new Date(profile.last_login).toLocaleDateString()
											: "Never"}
									</p>
								</div>
							</div>

							<div className="pt-4 border-t">
								<h4 className="font-semibold mb-2">Learning Statistics</h4>
								<p className="text-sm text-muted-foreground">
									Your learning progress and achievements will appear here as
									you use the platform.
								</p>
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
