"use client";

import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SignupFormProps } from "@/types/auth";

export function SignupForm({
	formData,
	errors,
	isLoading,
	showPassword,
	showConfirmPassword,
	onInputChange,
	onSubmit,
	onTogglePassword,
	onToggleConfirmPassword,
}: SignupFormProps) {
	return (
		<form onSubmit={onSubmit} className="space-y-4">
			{/* Full Name */}
			<div className="space-y-2">
				<Label htmlFor="fullName">Full Name</Label>
				<Input
					id="fullName"
					name="fullName"
					type="text"
					placeholder="Enter your full name"
					value={formData.fullName}
					onChange={onInputChange}
					className={errors.fullName ? "border-red-500" : ""}
					disabled={isLoading}
				/>
				{errors.fullName && (
					<p className="text-sm text-red-500">{errors.fullName}</p>
				)}
			</div>

			{/* Email */}
			<div className="space-y-2">
				<Label htmlFor="email">Email</Label>
				<Input
					id="email"
					name="email"
					type="email"
					placeholder="Enter your email"
					value={formData.email}
					onChange={onInputChange}
					className={errors.email ? "border-red-500" : ""}
					disabled={isLoading}
				/>
				{errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
			</div>

			{/* Password */}
			<div className="space-y-2">
				<Label htmlFor="password">Password</Label>
				<div className="relative">
					<Input
						id="password"
						name="password"
						type={showPassword ? "text" : "password"}
						placeholder="Enter your password"
						value={formData.password}
						onChange={onInputChange}
						className={errors.password ? "border-red-500" : ""}
						disabled={isLoading}
					/>
					<Button
						type="button"
						variant="ghost"
						size="sm"
						className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
						onClick={onTogglePassword}
						disabled={isLoading}
					>
						{showPassword ? (
							<EyeOff className="h-4 w-4" />
						) : (
							<Eye className="h-4 w-4" />
						)}
					</Button>
				</div>
				{errors.password && (
					<p className="text-sm text-red-500">{errors.password}</p>
				)}
			</div>

			{/* Confirm Password */}
			<div className="space-y-2">
				<Label htmlFor="confirmPassword">Confirm Password</Label>
				<div className="relative">
					<Input
						id="confirmPassword"
						name="confirmPassword"
						type={showConfirmPassword ? "text" : "password"}
						placeholder="Confirm your password"
						value={formData.confirmPassword}
						onChange={onInputChange}
						className={errors.confirmPassword ? "border-red-500" : ""}
						disabled={isLoading}
					/>
					<Button
						type="button"
						variant="ghost"
						size="sm"
						className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
						onClick={onToggleConfirmPassword}
						disabled={isLoading}
					>
						{showConfirmPassword ? (
							<EyeOff className="h-4 w-4" />
						) : (
							<Eye className="h-4 w-4" />
						)}
					</Button>
				</div>
				{errors.confirmPassword && (
					<p className="text-sm text-red-500">{errors.confirmPassword}</p>
				)}
			</div>

			{/* Submit Button */}
			<Button type="submit" className="w-full" disabled={isLoading}>
				{isLoading ? (
					<>
						<Loader2 className="mr-2 h-4 w-4 animate-spin" />
						Creating Account...
					</>
				) : (
					"Create Account"
				)}
			</Button>
		</form>
	);
}
