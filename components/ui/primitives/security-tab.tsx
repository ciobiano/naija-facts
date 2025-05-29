"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FormInput } from "@/components/ui/form-input";
import { Lock, Mail, Shield, Eye, EyeOff } from "lucide-react";
import { PasswordFormData, EmailFormData, FormErrors } from "@/types";
import { useState } from "react";

interface SecurityTabProps {
	passwordForm: PasswordFormData;
	emailForm: EmailFormData;
	onPasswordChange: (updates: Partial<PasswordFormData>) => void;
	onEmailChange: (updates: Partial<EmailFormData>) => void;
	errors: FormErrors;
	isLoading: boolean;
	onPasswordSubmit: () => void;
	onEmailSubmit: () => void;
}

export function SecurityTab({
	passwordForm,
	emailForm,
	onPasswordChange,
	onEmailChange,
	errors,
	isLoading,
	onPasswordSubmit,
	onEmailSubmit,
}: SecurityTabProps) {
	const [showPasswords, setShowPasswords] = useState({
		current: false,
		new: false,
		confirm: false,
	});

	const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
		setShowPasswords((prev) => ({
			...prev,
			[field]: !prev[field],
		}));
	};

	return (
		<div className="space-y-6">
			{/* Password Change Section */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Lock className="h-5 w-5" />
						Change Password
					</CardTitle>
					<CardDescription>
						Update your password to keep your account secure
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="space-y-4">
						<div className="relative">
							<FormInput
								label="Current Password"
								name="currentPassword"
								type={showPasswords.current ? "text" : "password"}
								value={passwordForm.currentPassword}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
									onPasswordChange({ currentPassword: e.target.value })
								}
								error={errors.currentPassword}
								required
							/>
							<Button
								type="button"
								variant="ghost"
								size="sm"
								className="absolute right-2 top-8 h-8 w-8 p-0"
								onClick={() => togglePasswordVisibility("current")}
							>
								{showPasswords.current ? (
									<EyeOff className="h-4 w-4" />
								) : (
									<Eye className="h-4 w-4" />
								)}
							</Button>
						</div>

						<div className="relative">
							<FormInput
								label="New Password"
								name="newPassword"
								type={showPasswords.new ? "text" : "password"}
								value={passwordForm.newPassword}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
									onPasswordChange({ newPassword: e.target.value })
								}
								error={errors.newPassword}
								required
							/>
							<Button
								type="button"
								variant="ghost"
								size="sm"
								className="absolute right-2 top-8 h-8 w-8 p-0"
								onClick={() => togglePasswordVisibility("new")}
							>
								{showPasswords.new ? (
									<EyeOff className="h-4 w-4" />
								) : (
									<Eye className="h-4 w-4" />
								)}
							</Button>
						</div>

						<div className="relative">
							<FormInput
								label="Confirm New Password"
								name="confirmNewPassword"
								type={showPasswords.confirm ? "text" : "password"}
								value={passwordForm.confirmNewPassword}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
									onPasswordChange({ confirmNewPassword: e.target.value })
								}
								error={errors.confirmNewPassword}
								required
							/>
							<Button
								type="button"
								variant="ghost"
								size="sm"
								className="absolute right-2 top-8 h-8 w-8 p-0"
								onClick={() => togglePasswordVisibility("confirm")}
							>
								{showPasswords.confirm ? (
									<EyeOff className="h-4 w-4" />
								) : (
									<Eye className="h-4 w-4" />
								)}
							</Button>
						</div>
					</div>

					<div className="bg-muted/50 p-4 rounded-lg">
						<p className="font-medium text-sm mb-2">Password requirements:</p>
						<ul className="space-y-1 text-xs text-muted-foreground">
							<li>• At least 8 characters long</li>
							<li>• Contains uppercase and lowercase letters</li>
							<li>• Contains at least one number</li>
							<li>• Contains at least one special character</li>
						</ul>
					</div>

					<Button
						onClick={onPasswordSubmit}
						disabled={isLoading}
						className="w-full sm:w-auto"
					>
						<Shield className="mr-2 h-4 w-4" />
						{isLoading ? "Updating..." : "Update Password"}
					</Button>
				</CardContent>
			</Card>

			{/* Email Change Section */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Mail className="h-5 w-5" />
						Change Email Address
					</CardTitle>
					<CardDescription>
						Update your email address. A verification email will be sent to the
						new address.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="space-y-4">
						<FormInput
							label="New Email Address"
							name="newEmail"
							type="email"
							value={emailForm.newEmail}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
								onEmailChange({ newEmail: e.target.value })
							}
							error={errors.newEmail}
							placeholder="Enter your new email address"
							required
						/>

						<FormInput
							label="Current Password"
							name="password"
							type="password"
							value={emailForm.password}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
								onEmailChange({ password: e.target.value })
							}
							error={errors.password}
							placeholder="Confirm with your current password"
							required
						/>
					</div>

					<Button
						onClick={onEmailSubmit}
						disabled={isLoading}
						className="w-full sm:w-auto"
					>
						<Mail className="mr-2 h-4 w-4" />
						{isLoading ? "Updating..." : "Update Email"}
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}
