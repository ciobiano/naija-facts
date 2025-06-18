"use client";

import { motion } from "framer-motion";
import { ChevronLeft, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSignupForm } from "@/hooks/useSignupForm";
import { SignupForm } from "@/components/ui/sections/auth/signup-form";
import { SocialAuth } from "@/components/ui/sections/auth/social-auth";

export default function SignUpPage() {
	const router = useRouter();
	const {
		formData,
		errors,
		isLoading,
		showPassword,
		showConfirmPassword,
		handleInputChange,
		handleSubmit,
		handleOAuthSignIn,
		setShowPassword,
		setShowConfirmPassword,
	} = useSignupForm();

	return (
		<div className="min-h-screen ">
			<div className="grid lg:grid-cols-2 min-h-screen">
				{/* Left Column - Welcome Section */}
				<div className="hidden lg:flex flex-col justify-center items-center p-12 ">
					<motion.div
						initial={{ opacity: 0, x: -50 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.8 }}
						className="max-w-md text-center"
					>
						<div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-600 to-blue-600 rounded-3xl shadow-lg mb-8">
							<User className="h-10 w-10 text-white" />
						</div>
						<h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
							Join Naija Facts
						</h1>
						<p className="text-lg text-gray-600 dark:text-gray-300 mb-8 text-start">
							Discover fascinating facts about Nigeria&apos;s rich culture, history,
							and heritage. Start your learning journey today.
						</p>
						<div className="space-y-4 text-left">
							<div className="flex items-center space-x-3">
								<div className="w-2 h-2 bg-green-500 rounded-full"></div>
								<span className="text-gray-700 dark:text-gray-300">
									Access thousands of Nigerian facts
								</span>
							</div>
							<div className="flex items-center space-x-3">
								<div className="w-2 h-2 bg-blue-500 rounded-full"></div>
								<span className="text-gray-700 dark:text-gray-300">
									Interactive learning experience
								</span>
							</div>
							<div className="flex items-center space-x-3">
								<div className="w-2 h-2 bg-green-500 rounded-full"></div>
								<span className="text-gray-700 dark:text-gray-300">
									Connect with fellow learners
								</span>
							</div>
						</div>
					</motion.div>
				</div>

				{/* Right Column - Signup Form */}
				<div className="flex flex-col justify-center items-center p-8 lg:p-12">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6 }}
						className="w-full max-w-md"
					>
						{/* Back button */}
						<motion.div
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: 0.2 }}
							className="mb-6"
						>
							<Button
								variant="ghost"
								className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
								onClick={() => router.back()}
							>
								<ChevronLeft className="h-4 w-4 mr-2" />
								Back
							</Button>
						</motion.div>

						{/* Signup Card */}
						<Card className="w-full">
							<CardHeader className="space-y-1">
								<CardTitle className="text-2xl font-bold text-center">
									Create Account
								</CardTitle>
								<CardDescription className="text-center">
									Join Naija Facts and start your learning journey
								</CardDescription>
							</CardHeader>

							<CardContent className="space-y-4">
								{/* Error message */}
								{errors.general && (
									<Alert variant="destructive">
										<AlertDescription>{errors.general}</AlertDescription>
									</Alert>
								)}

								{/* Signup Form */}
								<SignupForm
									formData={formData}
									errors={errors}
									isLoading={isLoading}
									showPassword={showPassword}
									showConfirmPassword={showConfirmPassword}
									onInputChange={handleInputChange}
									onSubmit={handleSubmit}
									onTogglePassword={() => setShowPassword(!showPassword)}
									onToggleConfirmPassword={() =>
										setShowConfirmPassword(!showConfirmPassword)
									}
								/>

								{/* Social Auth */}
								<SocialAuth
									isLoading={isLoading}
									onOAuthSignIn={handleOAuthSignIn}
								/>
							</CardContent>

							<CardFooter>
								<p className="text-center text-sm text-muted-foreground w-full">
									Already have an account?{" "}
									<Link
										href="/auth/signin"
										className="underline underline-offset-4 hover:text-primary"
									>
										Sign in
									</Link>
								</p>
							</CardFooter>
						</Card>
					</motion.div>
				</div>
			</div>
		</div>
	);
}
