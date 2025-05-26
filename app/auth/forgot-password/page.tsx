"use client";

import { useState } from "react";
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
import { Loader2, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
	const [email, setEmail] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [message, setMessage] = useState("");
	const [error, setError] = useState("");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!email.trim()) {
			setError("Email is required");
			return;
		}

		if (!/\S+@\S+\.\S+/.test(email)) {
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
				body: JSON.stringify({ email }),
			});

			const data = await response.json();

			if (response.ok) {
				setMessage(data.message);
				setEmail(""); // Clear the form
			} else {
				setError(data.error || "Failed to send reset email");
			}
		} catch (error) {
			console.error("Forgot password error:", error);
			setError("An unexpected error occurred. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4">
			<Card className="w-full max-w-md">
				<CardHeader className="space-y-1">
					<CardTitle className="text-2xl font-bold text-center">
						Reset Password
					</CardTitle>
					<CardDescription className="text-center">
						Enter your email address and we'll send you a link to reset your
						password
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
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

					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="email">Email Address</Label>
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
								className={error ? "border-red-500" : ""}
								disabled={isLoading}
								required
							/>
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
						Don't have an account?{" "}
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
