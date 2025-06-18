"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

function VerifyEmailForm() {
	const searchParams = useSearchParams();
	const token = searchParams.get("token");

	const [status, setStatus] = useState<"loading" | "success" | "error">(
		"loading"
	);
	const [message, setMessage] = useState("");

	useEffect(() => {
		if (!token) {
			setStatus("error");
			setMessage("No verification token provided");
			return;
		}

		const verifyEmail = async () => {
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
					setStatus("success");
					setMessage(data.message || "Email verified successfully!");
				} else {
					setStatus("error");
					setMessage(data.error || "Email verification failed");
				}
			} catch {
				setStatus("error");
				setMessage("An error occurred during verification");
			}
		};

		verifyEmail();
	}, [token]);

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
			<Card className="w-full max-w-md">
				<CardHeader className="text-center">
					<CardTitle className="text-2xl font-bold">
						Email Verification
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="text-center">
						{status === "loading" && (
							<div className="flex flex-col items-center space-y-4">
								<Loader2 className="h-8 w-8 animate-spin text-naija-green-600" />
								<p className="text-gray-600 dark:text-gray-400">
									Verifying your email...
								</p>
							</div>
						)}

						{status === "success" && (
							<div className="flex flex-col items-center space-y-4">
								<CheckCircle className="h-8 w-8 text-green-600" />
								<p className="text-green-600 font-medium">{message}</p>
								<Button asChild className="w-full">
									<a href="/auth/signin">Continue to Sign In</a>
								</Button>
							</div>
						)}

						{status === "error" && (
							<div className="flex flex-col items-center space-y-4">
								<XCircle className="h-8 w-8 text-red-600" />
								<p className="text-red-600 font-medium">{message}</p>
								<Button asChild variant="outline" className="w-full">
									<a href="/auth/signin">Back to Sign In</a>
								</Button>
							</div>
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

export default function VerifyEmailPage() {
	return (
		<Suspense
			fallback={
				<div className="min-h-screen flex items-center justify-center">
					<Loader2 className="h-8 w-8 animate-spin" />
				</div>
			}
		>
			<VerifyEmailForm />
		</Suspense>
	);
}
