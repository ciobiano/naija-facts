"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, Shield, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ProtectedRouteProps {
	children: React.ReactNode;
	requireAuth?: boolean;
	requireRole?: "admin" | "user";
	fallbackUrl?: string;
	loadingComponent?: React.ReactNode;
	unauthorizedComponent?: React.ReactNode;
}

export default function ProtectedRoute({
	children,
	requireAuth = true,
	requireRole,
	fallbackUrl = "/auth/signin",
	loadingComponent,
	unauthorizedComponent,
}: ProtectedRouteProps) {
	const { data: session, status } = useSession();
	const router = useRouter();
	const [isAuthorized, setIsAuthorized] = useState(false);

	useEffect(() => {
		if (status === "loading") return; 

		if (!requireAuth) {
			setIsAuthorized(true);
			return;
		}

		// If authentication is required but user is not authenticated
		if (!session) {
			const currentUrl = window.location.pathname + window.location.search;
			const signInUrl = `${fallbackUrl}?callbackUrl=${encodeURIComponent(
				currentUrl
			)}`;
			router.push(signInUrl);
			return;
		}

		// If specific role is required
		if (requireRole) {
			const userRole = (session.user as any)?.role || "user";
			if (userRole !== requireRole && requireRole === "admin") {
				setIsAuthorized(false);
				return;
			}
		}

		setIsAuthorized(true);
	}, [session, status, requireAuth, requireRole, router, fallbackUrl]);

	// Show loading state
	if (status === "loading") {
		return (
			loadingComponent || (
				<div className="min-h-screen flex items-center justify-center">
					<Card className="w-full max-w-md">
						<CardContent className="pt-6">
							<div className="flex flex-col items-center space-y-4 text-center">
								<Loader2 className="h-8 w-8 animate-spin text-primary" />
								<h3 className="text-lg font-semibold">Loading...</h3>
								<p className="text-sm text-muted-foreground">
									Verifying your authentication status
								</p>
							</div>
						</CardContent>
					</Card>
				</div>
			)
		);
	}

	// Show unauthorized state
	if (requireAuth && !isAuthorized) {
		return (
			unauthorizedComponent || (
				<div className="min-h-screen flex items-center justify-center">
					<Card className="w-full max-w-md">
						<CardContent className="pt-6">
							<div className="flex flex-col items-center space-y-4 text-center">
								<div className="rounded-full bg-red-100 p-3">
									<AlertTriangle className="h-8 w-8 text-red-600" />
								</div>
								<h3 className="text-lg font-semibold">Access Denied</h3>
								<p className="text-sm text-muted-foreground">
									{requireRole === "admin"
										? "You need administrator privileges to access this page."
										: "You need to be signed in to access this page."}
								</p>
								<div className="flex flex-col space-y-2 w-full">
									<Button
										onClick={() => router.push(fallbackUrl)}
										className="w-full"
									>
										{session ? "Go Back" : "Sign In"}
									</Button>
									{session && (
										<Button
											variant="outline"
											onClick={() => router.back()}
											className="w-full"
										>
											Go Back
										</Button>
									)}
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			)
		);
	}

	// Render children if authorized
	return <>{children}</>;
}

// Higher-order component for easier usage
export function withAuth<P extends object>(
	Component: React.ComponentType<P>,
	options?: Omit<ProtectedRouteProps, "children">
) {
	return function AuthenticatedComponent(props: P) {
		return (
			<ProtectedRoute {...options}>
				<Component {...props} />
			</ProtectedRoute>
		);
	};
}

// Hook for checking authentication status
export function useAuth() {
	const { data: session, status } = useSession();

	return {
		user: session?.user,
		isAuthenticated: !!session,
		isLoading: status === "loading",
		role: (session?.user as any)?.role || "user",
		isAdmin: (session?.user as any)?.role === "admin",
	};
}

// Component for protecting specific sections within a page
export function AuthGuard({
	children,
	fallback,
	requireRole,
}: {
	children: React.ReactNode;
	fallback?: React.ReactNode;
	requireRole?: "admin" | "user";
}) {
	const { isAuthenticated, role, isLoading } = useAuth();

	if (isLoading) {
		return (
			<div className="flex items-center justify-center p-4">
				<Loader2 className="h-4 w-4 animate-spin" />
			</div>
		);
	}

	if (!isAuthenticated) {
		return (
			fallback || (
				<div className="text-center p-4">
					<Shield className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
					<p className="text-sm text-muted-foreground">
						Sign in to view this content
					</p>
				</div>
			)
		);
	}

	if (requireRole && role !== requireRole) {
		return (
			fallback || (
				<div className="text-center p-4">
					<AlertTriangle className="h-8 w-8 mx-auto mb-2 text-red-500" />
					<p className="text-sm text-muted-foreground">
						Insufficient permissions to view this content
					</p>
				</div>
			)
		);
	}

	return <>{children}</>;
}
