"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, XCircle, Mail, RefreshCw } from "lucide-react";
import Link from "next/link";

type VerificationState =
	| "loading"
	| "success"
	| "error"
	| "expired"
	| "already_verified";

export default function VerifyEmailPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [state, setState] = useState<VerificationState>("loading");
	const [message, setMessage] = useState("");
	const [isResending, setIsResending] = useState(false);
	const [email, setEmail] = useState("");

	useEffect(() => {
		const token = searchParams.get("token");
		const emailParam = searchParams.get("email");

		if (emailParam) {
			setEmail(emailParam);
		}

		if (!token) {
			setState("error");
			setMessage("No verification token provided");
			return;
		}

		verifyEmail(token);
	}, [searchParams]);

	const verifyEmail = async (token: string) => {
		try {
			const response = await fetch("/api/auth/verify-email", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ token }),
			});

			const data = await response.json();

			if (response.ok) {
				if (data.code === "ALREADY_VERIFIED") {
					setState("already_verified");
					setMessage("Your email is already verified");
				} else {
					setState("success");
					setMessage(data.message || "Email verified successfully!");
				}
			} else {
				if (data.code === "TOKEN_INVALID_OR_EXPIRED") {
					setState("expired");
					setMessage("Verification link has expired or is invalid");
				} else {
					setState("error");
					setMessage(data.error || "Verification failed");
				}
			}
		} catch (error) {
			console.error("Verification error:", error);
			setState("error");
			setMessage("Network error. Please check your connection and try again.");
		}
	};

	const handleResendVerification = async () => {
		if (!email) {
			setMessage("Email address is required to resend verification");
			return;
		}

		setIsResending(true);
		try {
			const response = await fetch("/api/auth/verify-email", {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ email }),
			});

			const data = await response.json();

			if (response.ok) {
				setMessage("Verification email sent! Please check your inbox.");
			} else {
				if (data.code === "RATE_LIMITED") {
					setMessage(
						"Too many requests. Please wait before requesting another verification email."
					);
				} else {
					setMessage(data.error || "Failed to resend verification email");
				}
			}
		} catch (error) {
			console.error("Resend error:", error);
			setMessage("Failed to resend verification email. Please try again.");
		} finally {
			setIsResending(false);
		}
	};

	const renderContent = () => {
		switch (state) {
			case "loading":
				return (
					<div className="text-center space-y-4">
						<Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
						<p className="text-muted-foreground">Verifying your email...</p>
					</div>
				);

			case "success":
				return (
					<div className="text-center space-y-4">
						<CheckCircle className="h-12 w-12 mx-auto text-green-500" />
						<div className="space-y-2">
							<h3 className="text-lg font-semibold text-green-700">
								Email Verified!
							</h3>
							<p className="text-muted-foreground">{message}</p>
						</div>
						<div className="space-y-2">
							<Button asChild className="w-full">
								<Link href="/auth/signin">Sign In to Your Account</Link>
							</Button>
							<Button variant="outline" asChild className="w-full">
								<Link href="/">Go to Homepage</Link>
							</Button>
						</div>
					</div>
				);

			case "already_verified":
				return (
					<div className="text-center space-y-4">
						<CheckCircle className="h-12 w-12 mx-auto text-blue-500" />
						<div className="space-y-2">
							<h3 className="text-lg font-semibold text-blue-700">
								Already Verified
							</h3>
							<p className="text-muted-foreground">{message}</p>
						</div>
						<div className="space-y-2">
							<Button asChild className="w-full">
								<Link href="/auth/signin">Sign In to Your Account</Link>
							</Button>
							<Button variant="outline" asChild className="w-full">
								<Link href="/">Go to Homepage</Link>
							</Button>
						</div>
					</div>
				);

			case "expired":
			case "error":
				return (
					<div className="text-center space-y-4">
						<XCircle className="h-12 w-12 mx-auto text-red-500" />
						<div className="space-y-2">
							<h3 className="text-lg font-semibold text-red-700">
								{state === "expired" ? "Link Expired" : "Verification Failed"}
							</h3>
							<p className="text-muted-foreground">{message}</p>
						</div>

						{state === "expired" && (
							<div className="space-y-3">
								<div className="space-y-2">
									<label htmlFor="email" className="text-sm font-medium">
										Email Address
									</label>
									<input
										id="email"
										type="email"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										placeholder="Enter your email address"
										className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
									/>
								</div>
								<Button
									onClick={handleResendVerification}
									disabled={isResending || !email}
									className="w-full"
								>
									{isResending ? (
										<>
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											Sending...
										</>
									) : (
										<>
											<RefreshCw className="mr-2 h-4 w-4" />
											Resend Verification Email
										</>
									)}
								</Button>
							</div>
						)}

						<div className="space-y-2">
							<Button variant="outline" asChild className="w-full">
								<Link href="/auth/signup">Create New Account</Link>
							</Button>
							<Button variant="ghost" asChild className="w-full">
								<Link href="/">Go to Homepage</Link>
							</Button>
						</div>
					</div>
				);

			default:
				return null;
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center p-4">
			<Card className="w-full max-w-md">
				<CardHeader className="text-center">
					<div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
						<Mail className="h-6 w-6 text-primary" />
					</div>
					<CardTitle className="text-2xl font-bold">
						Email Verification
					</CardTitle>
					<CardDescription>
						Verify your email address to complete your account setup
					</CardDescription>
				</CardHeader>
				<CardContent>
					{message && state !== "loading" && (
						<Alert className="mb-4">
							<AlertDescription>{message}</AlertDescription>
						</Alert>
					)}
					{renderContent()}
				</CardContent>
			</Card>
		</div>
	);
}
