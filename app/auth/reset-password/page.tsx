"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Eye, EyeOff, CheckCircle } from "lucide-react";

function ResetPasswordForm() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [formData, setFormData] = useState({
		password: "",
		confirmPassword: "",
	});
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [isLoading, setIsLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [token, setToken] = useState("");
	const [isSuccess, setIsSuccess] = useState(false);

	useEffect(() => {
		const resetToken = searchParams.get("token");
		if (!resetToken) {
			router.push("/auth/forgot-password");
			return;
		}
		setToken(resetToken);
	}, [searchParams, router]);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
		// Clear error when user starts typing
		if (errors[name]) {
			setErrors((prev) => ({ ...prev, [name]: "" }));
		}
	};

	const validateForm = () => {
		const newErrors: Record<string, string> = {};

		if (!formData.password) {
			newErrors.password = "Password is required";
		} else if (formData.password.length < 8) {
			newErrors.password = "Password must be at least 8 characters";
		}

		if (!formData.confirmPassword) {
			newErrors.confirmPassword = "Please confirm your password";
		} else if (formData.password !== formData.confirmPassword) {
			newErrors.confirmPassword = "Passwords don't match";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) {
			return;
		}

		setIsLoading(true);
		setErrors({});

		try {
			const response = await fetch("/api/auth/reset-password", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					token,
					password: formData.password,
					confirmPassword: formData.confirmPassword,
				}),
			});

			const data = await response.json();

			if (response.ok) {
				setIsSuccess(true);
				// Redirect to sign in after 3 seconds
				setTimeout(() => {
					router.push(
						"/auth/signin?message=Password reset successfully. Please sign in with your new password."
					);
				}, 3000);
			} else {
				if (data.details) {
					// Handle Zod validation errors
					const newErrors: Record<string, string> = {};
					data.details.forEach((error: { path: string[]; message: string }) => {
						if (error.path.length > 0) {
							newErrors[error.path[0]] = error.message;
						}
					});
					setErrors(newErrors);
				} else {
					setErrors({ general: data.error || "Failed to reset password" });
				}
			}
		} catch (error) {
			console.error("Reset password error:", error);
			setErrors({ general: "An unexpected error occurred. Please try again." });
		} finally {
			setIsLoading(false);
		}
	};

	if (isSuccess) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4">
				<Card className="w-full max-w-md">
					<CardContent className="pt-6">
						<div className="flex flex-col items-center space-y-4 text-center">
							<CheckCircle className="h-16 w-16 text-green-500" />
							<h2 className="text-2xl font-bold">Password Reset Successful!</h2>
							<p className="text-muted-foreground">
								Your password has been successfully reset. You will be
								redirected to the sign-in page shortly.
							</p>
							<Button
								onClick={() => router.push("/auth/signin")}
								className="w-full"
							>
								Continue to Sign In
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4">
			<Card className="w-full max-w-md">
				<CardHeader className="space-y-1">
					<CardTitle className="text-2xl font-bold text-center">
						Set New Password
					</CardTitle>
					<CardDescription className="text-center">
						Enter your new password below
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{errors.general && (
						<Alert variant="destructive">
							<AlertDescription>{errors.general}</AlertDescription>
						</Alert>
					)}

					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="password">New Password</Label>
							<div className="relative">
								<Input
									id="password"
									name="password"
									type={showPassword ? "text" : "password"}
									placeholder="Enter your new password"
									value={formData.password}
									onChange={handleInputChange}
									className={errors.password ? "border-red-500" : ""}
									disabled={isLoading}
								/>
								<Button
									type="button"
									variant="ghost"
									size="sm"
									className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
									onClick={() => setShowPassword(!showPassword)}
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

						<div className="space-y-2">
							<Label htmlFor="confirmPassword">Confirm New Password</Label>
							<div className="relative">
								<Input
									id="confirmPassword"
									name="confirmPassword"
									type={showConfirmPassword ? "text" : "password"}
									placeholder="Confirm your new password"
									value={formData.confirmPassword}
									onChange={handleInputChange}
									className={errors.confirmPassword ? "border-red-500" : ""}
									disabled={isLoading}
								/>
								<Button
									type="button"
									variant="ghost"
									size="sm"
									className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
									onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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

						<Button type="submit" className="w-full" disabled={isLoading}>
							{isLoading ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Resetting Password...
								</>
							) : (
								"Reset Password"
							)}
						</Button>
					</form>
				</CardContent>
				<CardFooter>
					<p className="text-center text-sm text-muted-foreground w-full">
						Remember your password?{" "}
						<Link
							href="/auth/signin"
							className="underline underline-offset-4 hover:text-primary"
						>
							Sign in
						</Link>
					</p>
				</CardFooter>
			</Card>
		</div>
	);
}

export default function ResetPasswordPage() {
	return (
		<Suspense
			fallback={
				<div className="min-h-screen flex items-center justify-center">
					<Loader2 className="h-8 w-8 animate-spin" />
				</div>
			}
		>
			<ResetPasswordForm />
		</Suspense>
	);
}
