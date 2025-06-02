"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Eye, EyeOff, Link } from "lucide-react";
import { AuthErrors, SignupFormData } from "@/types/auth";

interface SignupFormProps {
	formData: SignupFormData;
	errors: AuthErrors;
	isLoading: boolean;
	showPassword: boolean;
	showConfirmPassword: boolean;
	handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	handleSubmit: (e: React.FormEvent) => void;
	setShowPassword: (value: boolean) => void;
	setShowConfirmPassword: (value: boolean) => void;
}

interface SocialAuthProps {
	errors: AuthErrors;
	isLoading: boolean;
	handleOAuthSignIn: (provider: string) => void;
}

export function SignupForm({
	formData,
	errors,
	isLoading,
	showPassword,
	showConfirmPassword,
	handleInputChange,
	handleSubmit,
	setShowPassword,
	setShowConfirmPassword,
}: SignupFormProps) {
	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			{/* Form fields */}
			<div className="space-y-2">
				<Label htmlFor="fullName">Full Name</Label>
				<Input
					id="fullName"
					name="fullName"
					type="text"
					placeholder="John Doe"
					value={formData.fullName}
					onChange={handleInputChange}
					className={errors.fullName ? "border-red-500" : ""}
					disabled={isLoading}
				/>
				{errors.fullName && (
					<p className="text-sm text-red-500">{errors.fullName}</p>
				)}
			</div>
			<div className="space-y-2">
				<Label htmlFor="email">Email</Label>
				<Input
					required
					id="email"
					name="email"
					type="email"
					placeholder="john.doe@example.com"
					value={formData.email}
					onChange={handleInputChange}
					className={errors.email ? "border-red-500" : ""}
					disabled={isLoading}
				/>
				{errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
			</div>
			<div className="space-y-2">
				<Label htmlFor="password">Password</Label>
				<Input
					required
					id="password"
					name="password"
					type="password"
					placeholder="********"
					value={formData.password}
					onChange={handleInputChange}
					className={errors.password ? "border-red-500" : ""}
					disabled={isLoading}
				/>
				<div className="flex items-center gap-2">
					<Button
						type="button"
						variant="ghost"
						size="icon"
						onClick={() => setShowPassword(!showPassword)}
					>
						{showPassword ? <EyeOff /> : <Eye />}
					</Button>
				</div>
				{errors.password && (
					<p className="text-sm text-red-500">{errors.password}</p>
				)}
			</div>
			<div className="space-y-2">
				<Label htmlFor="confirmPassword">Confirm Password</Label>
				<Input
					required
					id="confirmPassword"
					name="confirmPassword"
					type="password"
					placeholder="********"
					value={formData.confirmPassword}
					onChange={handleInputChange}
					className={errors.confirmPassword ? "border-red-500" : ""}
					disabled={isLoading}
				/>
				<div className="flex items-center gap-2">
					<Button
						type="button"
						variant="ghost"
						size="icon"
						onClick={() => setShowConfirmPassword(!showConfirmPassword)}
					>
						{showConfirmPassword ? <EyeOff /> : <Eye />}
					</Button>
				</div>
				{errors.confirmPassword && (
					<p className="text-sm text-red-500">{errors.confirmPassword}</p>
				)}
			</div>
		</form>
	);
}

// app/auth/components/SocialAuth.tsx

export function SocialAuth({
	errors,
	isLoading,
	handleOAuthSignIn,
}: SocialAuthProps) {
	return (
		<>
			{errors.general && (
				<div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
					{errors.general}
				</div>
			)}
			<div className="grid grid-cols-2 gap-3">
				<Button
					variant="outline"
					onClick={() => handleOAuthSignIn("google")}
					disabled={isLoading}
				>
					Google
				</Button>
			</div>
		</>
	);
}
