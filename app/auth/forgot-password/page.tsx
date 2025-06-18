"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
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
import { Loader2, ArrowLeft, Mail, CheckCircle } from "lucide-react";

export default function ForgotPasswordPage() {
	const searchParams = useSearchParams();
	const [email, setEmail] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [message, setMessage] = useState("");
	const [error, setError] = useState("");
	const [isSuccess, setIsSuccess] = useState(false);

	useEffect(() => {
		// Pre-fill email if provided in URL params
		const emailParam = searchParams.get("email");
		if (emailParam) {
			setEmail(emailParam);
		}
	}, [searchParams]);

	const validateEmail = (email: string): boolean => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!email.trim()) {
			setError("Email is required");
			return;
		}

		if (!validateEmail(email)) {
			setError("Please enter a valid email address");
			return;
		}

		setIsLoading(true);
		setError("");
		setMessage("");

		try {
			const response = await fetch("/api/auth/forgot-password", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ email: email.toLowerCase().trim() }),
			});

			const data = await response.json();

			if (response.ok) {
				setMessage(data.message);
				setIsSuccess(true);
				setEmail(""); // Clear the form
			} else {
				if (data.code === "RATE_LIMITED") {
					setError(
						"Too many password reset requests. Please wait 15 minutes before trying again."
					);
				} else {
					setError(data.error || "Failed to send reset email");
				}
			}
		} catch (error) {
			console.error("Forgot password error:", error);
			if (error instanceof TypeError && error.message.includes("fetch")) {
				setError("Network error. Please check your connection and try again.");
			} else {
				setError("An unexpected error occurred. Please try again.");
			}
		} finally {
			setIsLoading(false);
		}
	};

	if (isSuccess) {
		return (
			<div className="min-h-screen flex items-center justify-center p-4">
				<Card className="w-full max-w-md">
					<CardContent className="pt-6">
						<div className="flex flex-col items-center space-y-4 text-center">
							<CheckCircle className="h-16 w-16 text-green-500" />
							<h2 className="text-2xl font-bold">Check Your Email</h2>
							<p className="text-muted-foreground">{message}</p>
							<p className="text-sm text-muted-foreground">
								Didn&apos;t receive the email? Check your spam folder or try
								again in a few minutes.
							</p>
							<div className="flex flex-col space-y-2 w-full">
								<Button
									onClick={() => {
										setIsSuccess(false);
										setMessage("");
									}}
									variant="outline"
									className="w-full"
								>
									Try Different Email
								</Button>
								<Link href="/auth/signin">
									<Button className="w-full">Back to Sign In</Button>
								</Link>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="min-h-screen flex items-center justify-center p-4">
			<Card className="w-full max-w-md">
				<CardHeader className="space-y-1">
					<CardTitle className="text-2xl font-bold text-center">
						Reset Password
					</CardTitle>
					<CardDescription className="text-center">
						Enter your email address and we&apos;ll send you a link to reset your
						password
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{error && (
						<Alert variant="destructive">
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					)}

					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="email">Email Address</Label>
							<div className="relative">
								<Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
								<Input
									id="email"
									name="email"
									type="email"
									placeholder="Enter your email address"
									value={email}
									onChange={(e) => {
										setEmail(e.target.value);
										if (error) setError("");
									}}
									className={`pl-10 ${error ? "border-red-500" : ""}`}
									disabled={isLoading}
									autoComplete="email"
									required
								/>
							</div>
						</div>

						<Button type="submit" className="w-full" disabled={isLoading}>
							{isLoading ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Sending Reset Link...
								</>
							) : (
								"Send Reset Link"
							)}
						</Button>
					</form>

					<div className="text-center text-sm text-muted-foreground">
						<p>Reset links expire after 1 hour for security reasons.</p>
					</div>
				</CardContent>
				<CardFooter className="flex flex-col space-y-4">
					<Link
						href="/auth/signin"
						className="flex items-center text-sm text-muted-foreground hover:text-primary"
					>
						<ArrowLeft className="mr-2 h-4 w-4" />
						Back to Sign In
					</Link>
					<p className="text-center text-sm text-muted-foreground">
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
