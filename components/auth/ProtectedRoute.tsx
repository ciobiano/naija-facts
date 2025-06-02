"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LoadingState, UnauthorizedState } from "@/components/ui/states";

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
				<LoadingState
					title="Verifying Authentication"
					description="Checking your authentication status..."
					size="sm"
				/>
			)
		);
	}

	// Show unauthorized state
	if (requireAuth && !isAuthorized) {
		return (
			unauthorizedComponent || (
				<UnauthorizedState
					title={
						requireRole === "admin"
							? "Admin Access Required"
							: "Authentication Required"
					}
					description={
						requireRole === "admin"
							? "You need administrator privileges to access this page."
							: "You need to be signed in to access this page."
					}
					showSignInButton={!session}
					showSignUpButton={!session}
				/>
			)
		);
	}

	// Render children if authorized
	return <>{children}</>;
}

// Custom hook for authentication state
export function useAuth() {
	const { data: session, status } = useSession();

	return {
		user: session?.user || null,
		session,
		isAuthenticated: !!session?.user,
		role: (session?.user as any)?.role || "user",
		isLoading: status === "loading",
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
		return <LoadingState variant="minimal" title="Loading..." size="sm" />;
	}

	if (!isAuthenticated) {
		return (
			fallback || (
				<UnauthorizedState
					variant="inline"
					title="Sign in required"
					description="Sign in to view this content"
				/>
			)
		);
	}

	if (requireRole && role !== requireRole) {
		return (
			fallback || (
				<UnauthorizedState
					variant="inline"
					title="Insufficient permissions"
					description="You don't have permission to view this content"
					showSignInButton={false}
					showSignUpButton={false}
				/>
			)
		);
	}

	return <>{children}</>;
}
