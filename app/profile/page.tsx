"use client";

import { useState } from "react";
import ProtectedRoute, { useAuth, AuthGuard } from "@/components/auth/ProtectedRoute";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
	User, 
	Mail, 
	Calendar, 
	MapPin, 
	Settings, 
	Shield, 
	Trophy,
	Clock,
	Save,
	Camera
} from "lucide-react";

function ProfileContent() {
	const { user, role, isAdmin } = useAuth();
	const [isEditing, setIsEditing] = useState(false);
	const [formData, setFormData] = useState({
		fullName: user?.name || "",
		email: user?.email || "",
		bio: "",
		location: "",
		timezone: "UTC",
	});

	const handleSave = async () => {
		// TODO: Implement profile update API call
		console.log("Saving profile:", formData);
		setIsEditing(false);
	};

	const getInitials = (name: string) => {
		return name
			.split(" ")
			.map((n) => n[0])
			.join("")
			.toUpperCase();
	};

	return (
		<div className="container mx-auto py-8 px-4 max-w-4xl">
			<div className="space-y-6">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold">Profile</h1>
						<p className="text-muted-foreground">
							Manage your account settings and preferences
						</p>
					</div>
					<Button
						onClick={() => setIsEditing(!isEditing)}
						variant={isEditing ? "outline" : "default"}
					>
						<Settings className="mr-2 h-4 w-4" />
						{isEditing ? "Cancel" : "Edit Profile"}
					</Button>
				</div>

				{/* Profile Overview */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<User className="h-5 w-5" />
							Profile Information
						</CardTitle>
						<CardDescription>
							Your personal information and account details
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						{/* Avatar Section */}
						<div className="flex items-center space-x-4">
							<div className="relative">
								<Avatar className="h-20 w-20">
									<AvatarImage src={user?.image || ""} alt={user?.name || ""} />
									<AvatarFallback className="text-lg">
										{getInitials(user?.name || "User")}
									</AvatarFallback>
								</Avatar>
								{isEditing && (
									<Button
										size="sm"
										variant="outline"
										className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
									>
										<Camera className="h-4 w-4" />
									</Button>
								)}
							</div>
							<div className="space-y-1">
								<h3 className="text-lg font-semibold">{user?.name}</h3>
								<p className="text-sm text-muted-foreground flex items-center gap-1">
									<Mail className="h-4 w-4" />
									{user?.email}
								</p>
								<div className="flex items-center gap-2">
									<Badge variant={isAdmin ? "destructive" : "secondary"}>
										<Shield className="mr-1 h-3 w-3" />
										{role}
									</Badge>
									<Badge variant="outline">
										<Clock className="mr-1 h-3 w-3" />
										Active
									</Badge>
								</div>
							</div>
						</div>

						<Separator />

						{/* Form Fields */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="fullName">Full Name</Label>
								<Input
									id="fullName"
									value={formData.fullName}
									onChange={(e) =>
										setFormData({ ...formData, fullName: e.target.value })
									}
									disabled={!isEditing}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="email">Email Address</Label>
								<Input
									id="email"
									type="email"
									value={formData.email}
									onChange={(e) =>
										setFormData({ ...formData, email: e.target.value })
									}
									disabled={!isEditing}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="location">Location</Label>
								<Input
									id="location"
									value={formData.location}
									onChange={(e) =>
										setFormData({ ...formData, location: e.target.value })
									}
									disabled={!isEditing}
									placeholder="City, Country"
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="timezone">Timezone</Label>
								<Input
									id="timezone"
									value={formData.timezone}
									onChange={(e) =>
										setFormData({ ...formData, timezone: e.target.value })
									}
									disabled={!isEditing}
								/>
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="bio">Bio</Label>
							<Textarea
								id="bio"
								value={formData.bio}
								onChange={(e) =>
									setFormData({ ...formData, bio: e.target.value })
								}
								disabled={!isEditing}
								placeholder="Tell us about yourself..."
								rows={3}
							/>
						</div>

						{isEditing && (
							<div className="flex justify-end space-x-2">
								<Button variant="outline" onClick={() => setIsEditing(false)}>
									Cancel
								</Button>
								<Button onClick={handleSave}>
									<Save className="mr-2 h-4 w-4" />
									Save Changes
								</Button>
							</div>
						)}
					</CardContent>
				</Card>

				{/* Stats Section */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<Card>
						<CardContent className="pt-6">
							<div className="flex items-center space-x-2">
								<Trophy className="h-8 w-8 text-yellow-500" />
								<div>
									<p className="text-2xl font-bold">0</p>
									<p className="text-sm text-muted-foreground">Achievements</p>
								</div>
							</div>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="pt-6">
							<div className="flex items-center space-x-2">
								<Calendar className="h-8 w-8 text-blue-500" />
								<div>
									<p className="text-2xl font-bold">0</p>
									<p className="text-sm text-muted-foreground">Days Active</p>
								</div>
							</div>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="pt-6">
							<div className="flex items-center space-x-2">
								<MapPin className="h-8 w-8 text-green-500" />
								<div>
									<p className="text-2xl font-bold">0</p>
									<p className="text-sm text-muted-foreground">Quizzes Completed</p>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Admin Section */}
				<AuthGuard requireRole="admin">
					<Card className="border-red-200">
						<CardHeader>
							<CardTitle className="flex items-center gap-2 text-red-600">
								<Shield className="h-5 w-5" />
								Admin Panel
							</CardTitle>
							<CardDescription>
								Administrative tools and settings (Admin only)
							</CardDescription>
						</CardHeader>
						<CardContent>
							<Alert>
								<Shield className="h-4 w-4" />
								<AlertDescription>
									You have administrator privileges. Use these tools responsibly.
								</AlertDescription>
							</Alert>
							<div className="mt-4 space-x-2">
								<Button variant="outline" size="sm">
									User Management
								</Button>
								<Button variant="outline" size="sm">
									System Settings
								</Button>
								<Button variant="outline" size="sm">
									Analytics
								</Button>
							</div>
						</CardContent>
					</Card>
				</AuthGuard>
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
