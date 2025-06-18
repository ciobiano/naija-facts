"use client";

import { useState, useEffect, Suspense } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Eye, EyeOff, Mail, Lock } from "lucide-react";

interface SignInFormData {
	email: string;
	password: string;
	rememberMe: boolean;
}

interface SignInErrors {
	email?: string;
	password?: string;
	general?: string;
}

function SignInForm() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [formData, setFormData] = useState<SignInFormData>({
		email: "",
		password: "",
		rememberMe: false,
	});
	const [errors, setErrors] = useState<SignInErrors>({});
	const [isLoading, setIsLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [message, setMessage] = useState("");
	const [attemptCount, setAttemptCount] = useState(0);

	useEffect(() => {
		// Check for messages from URL params
		const urlMessage = searchParams.get("message");
		const error = searchParams.get("error");
		const verified = searchParams.get("verified");

		if (urlMessage) {
			setMessage(urlMessage);
		}

		if (verified === "true") {
			setMessage("Email verified successfully! You can now sign in.");
		}

		if (error) {
			if (error === "CredentialsSignin") {
				setErrors({ general: "Invalid email or password. Please try again." });
			} else if (error === "OAuthAccountNotLinked") {
				setErrors({
					general:
						"This email is already registered with a different sign-in method.",
				});
			} else {
				setErrors({ general: "Authentication failed. Please try again." });
			}
		}

		// Check if user is already signed in
		getSession().then((session) => {
			if (session) {
				const callbackUrl = searchParams.get("callbackUrl") || "/";
				router.push(callbackUrl);
			}
		});

		// Load remember me preference from localStorage
		const savedEmail = localStorage.getItem("naija-facts-remember-email");
		if (savedEmail) {
			setFormData((prev) => ({ ...prev, email: savedEmail, rememberMe: true }));
		}
	}, [searchParams, router]);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value, type, checked } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: type === "checkbox" ? checked : value,
		}));

		// Clear error when user starts typing
		if (errors[name as keyof SignInErrors]) {
			setErrors((prev) => ({ ...prev, [name]: "" }));
		}

		// Clear general error when any field changes
		if (errors.general) {
			setErrors((prev) => ({ ...prev, general: "" }));
		}
	};

	const validateForm = () => {
		const newErrors: SignInErrors = {};

		if (!formData.email.trim()) {
			newErrors.email = "Email is required";
		} else if (!/\S+@\S+\.\S+/.test(formData.email)) {
			newErrors.email = "Please enter a valid email address";
		}

		if (!formData.password) {
			newErrors.password = "Password is required";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) {
			return;
		}

		// Rate limiting check
		if (attemptCount >= 5) {
			setErrors({
				general: "Too many failed attempts. Please wait before trying again.",
			});
			return;
		}

		setIsLoading(true);
		setErrors({});

		try {
			const result = await signIn("credentials", {
				email: formData.email.toLowerCase().trim(),
				password: formData.password,
				redirect: false,
			});

			if (result?.error) {
				setAttemptCount((prev) => prev + 1);

				if (result.error === "CredentialsSignin") {
					setErrors({
						general:
							"Invalid email or password. Please check your credentials and try again.",
					});
				} else {
					setErrors({ general: "Sign in failed. Please try again." });
				}
			} else if (result?.ok) {
				// Handle remember me functionality
				if (formData.rememberMe) {
					localStorage.setItem("naija-facts-remember-email", formData.email);
				} else {
					localStorage.removeItem("naija-facts-remember-email");
				}

				// Reset attempt count on successful login
				setAttemptCount(0);

				const callbackUrl = searchParams.get("callbackUrl") || "/";
				router.push(callbackUrl);
			}
		} catch (error) {
			console.error("Sign in error:", error);
			setErrors({ general: "An unexpected error occurred. Please try again." });
		} finally {
			setIsLoading(false);
		}
	};

	const handleOAuthSignIn = async (provider: string) => {
		if (isLoading) return;

		setIsLoading(true);
		setErrors({});

		try {
			const callbackUrl = searchParams.get("callbackUrl") || "/";
			await signIn(provider, { callbackUrl });
		} catch (error) {
			console.error(`${provider} sign in error:`, error);
			setErrors({
				general: `Failed to sign in with ${provider}. Please try again.`,
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleForgotPassword = () => {
		router.push(
			"/auth/forgot-password" +
				(formData.email ? `?email=${encodeURIComponent(formData.email)}` : "")
		);
	};

	return (
		<div className="min-h-screen flex items-center justify-center p-4">
			<Card className="w-full max-w-md">
				<CardHeader className="space-y-1">
					<CardTitle className="text-2xl font-bold text-center">
						Welcome Back
					</CardTitle>
					<CardDescription className="text-center">
						Sign in to your Naija Facts account
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{message && (
						<Alert>
							<AlertDescription>{message}</AlertDescription>
						</Alert>
					)}

					{errors.general && (
						<Alert variant="destructive">
							<AlertDescription>{errors.general}</AlertDescription>
						</Alert>
					)}

					{attemptCount >= 3 && attemptCount < 5 && (
						<Alert variant="destructive">
							<AlertDescription>
								Multiple failed attempts detected. {5 - attemptCount} attempts
								remaining.
							</AlertDescription>
						</Alert>
					)}

					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<div className="relative">
								<Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
								<Input
									id="email"
									name="email"
									type="email"
									placeholder="Enter your email"
									value={formData.email}
									onChange={handleInputChange}
									className={`pl-10 ${errors.email ? "border-red-500" : ""}`}
									disabled={isLoading}
									autoComplete="email"
								/>
							</div>
							{errors.email && (
								<p className="text-sm text-red-500">{errors.email}</p>
							)}
						</div>

						<div className="space-y-2">
							<Label htmlFor="password">Password</Label>
							<div className="relative">
								<Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
								<Input
									id="password"
									name="password"
									type={showPassword ? "text" : "password"}
									placeholder="Enter your password"
									value={formData.password}
									onChange={handleInputChange}
									className={`pl-10 pr-10 ${
										errors.password ? "border-red-500" : ""
									}`}
									disabled={isLoading}
									autoComplete="current-password"
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

						<div className="flex items-center justify-between">
							<div className="flex items-center space-x-2">
								<Checkbox
									id="rememberMe"
									name="rememberMe"
									checked={formData.rememberMe}
									onCheckedChange={(checked) =>
										setFormData((prev) => ({
											...prev,
											rememberMe: checked as boolean,
										}))
									}
									disabled={isLoading}
								/>
								<Label htmlFor="rememberMe" className="text-sm">
									Remember me
								</Label>
							</div>
							<Button
								type="button"
								variant="link"
								className="px-0 text-sm"
								onClick={handleForgotPassword}
								disabled={isLoading}
							>
								Forgot password?
							</Button>
						</div>

						<Button
							type="submit"
							className="w-full"
							disabled={isLoading || attemptCount >= 5}
						>
							{isLoading ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Signing in...
								</>
							) : (
								"Sign In"
							)}
						</Button>
					</form>

					<div className="relative">
						<div className="absolute inset-0 flex items-center">
							<span className="w-full border-t" />
						</div>
						<div className="relative flex justify-center text-xs uppercase">
							<span className="bg-background px-2 text-muted-foreground">
								Or continue with
							</span>
						</div>
					</div>

					<div className="grid grid-cols-2 gap-3">
						<Button
							variant="outline"
							onClick={() => handleOAuthSignIn("google")}
							disabled={isLoading}
						>
							<svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
								<path
									fill="currentColor"
									d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
								/>
								<path
									fill="currentColor"
									d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
								/>
								<path
									fill="currentColor"
									d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
								/>
								<path
									fill="currentColor"
									d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
								/>
							</svg>
							Google
						</Button>
						<Button
							variant="outline"
							onClick={() => handleOAuthSignIn("github")}
							disabled={isLoading}
						>
							<svg
								className="mr-2 h-4 w-4"
								fill="currentColor"
								viewBox="0 0 24 24"
							>
								<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
							</svg>
							GitHub
						</Button>
					</div>
				</CardContent>
				<CardFooter>
					<p className="text-center text-sm text-muted-foreground w-full">
						Don&apos;t have an account?{" "}
						<Link
							href="/auth/signup"
							className="underline underline-offset-4 hover:text-primary"
						>
							Sign up
						</Link>
					</p>
				</CardFooter>
			</Card>
		</div>
	);
}

export default function SignInPage() {
	return (
		<Suspense
			fallback={
				<div className="min-h-screen flex items-center justify-center">
					<Loader2 className="h-8 w-8 animate-spin" />
				</div>
			}
		>
			<SignInForm />
		</Suspense>
	);
}
