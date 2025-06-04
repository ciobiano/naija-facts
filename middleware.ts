import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define protected routes and their access levels
const protectedRoutes = {
	// Admin routes - require admin role
	admin: ["/admin", "/api/admin"],
	// User routes - require authentication
	user: ["/profile", "/dashboard", "/quiz", "/api/profile", "/api/quiz"],
	// Auth routes - redirect if already authenticated
	auth: ["/auth/signin", "/auth/signup", "/auth/forgot-password"],
	// Public routes - always accessible
	public: [
		"/",
		"/docs",
		"/blog",
		"/api/auth",
		"/auth/verify-email",
		"/auth/reset-password",
	],
};

// Rate limiting for sensitive routes
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function isRateLimited(
	ip: string,
	route: string,
	maxRequests: number = 10,
	windowMs: number = 60000
): boolean {
	const key = `${ip}:${route}`;
	const now = Date.now();
	const rateLimit = rateLimitMap.get(key);

	if (rateLimit) {
		if (now < rateLimit.resetTime) {
			if (rateLimit.count >= maxRequests) {
				return true;
			}
			rateLimit.count++;
		} else {
			rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
		}
	} else {
		rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
	}

	return false;
}

function getRouteType(pathname: string): "admin" | "user" | "auth" | "public" {
	// Check admin routes first (most restrictive)
	if (protectedRoutes.admin.some((route) => pathname.startsWith(route))) {
		return "admin";
	}

	// Check user routes
	if (protectedRoutes.user.some((route) => pathname.startsWith(route))) {
		return "user";
	}

	// Check auth routes
	if (protectedRoutes.auth.some((route) => pathname.startsWith(route))) {
		return "auth";
	}

	// Default to public
	return "public";
}

export default withAuth(
	function middleware(req: NextRequest & { nextauth: { token: any } }) {
		const { pathname } = req.nextUrl;
		const token = req.nextauth.token;
		const ip =
			req.headers.get("x-forwarded-for") ||
			req.headers.get("x-real-ip") ||
			"unknown";

		// Rate limiting for sensitive routes
		if (pathname.startsWith("/api/auth") || pathname.startsWith("/auth")) {
			if (isRateLimited(ip, pathname, 5, 60000)) {
				// 5 requests per minute
				return new NextResponse(
					JSON.stringify({
						error: "Too many requests. Please try again later.",
					}),
					{
						status: 429,
						headers: {
							"Content-Type": "application/json",
							"Retry-After": "60",
						},
					}
				);
			}
		}

		const routeType = getRouteType(pathname);

		// Handle different route types
		switch (routeType) {
			case "admin":
				// Admin routes require admin role
				if (!token) {
					const signInUrl = new URL("/auth/signin", req.url);
					signInUrl.searchParams.set("callbackUrl", pathname);
					signInUrl.searchParams.set("error", "AdminAccessRequired");
					return NextResponse.redirect(signInUrl);
				}

				// Check for admin role (you'll need to add this to your token)
				if (token.role !== "admin") {
					return new NextResponse(
						JSON.stringify({
							error: "Insufficient permissions. Admin access required.",
						}),
						{
							status: 403,
							headers: { "Content-Type": "application/json" },
						}
					);
				}
				break;

			case "user":
				// User routes require authentication
				if (!token) {
					const signInUrl = new URL("/auth/signin", req.url);
					signInUrl.searchParams.set("callbackUrl", pathname);
					return NextResponse.redirect(signInUrl);
				}
				break;

			case "auth":
				// Auth routes redirect if already authenticated
				if (token) {
					const callbackUrl = req.nextUrl.searchParams.get("callbackUrl");
					const redirectUrl =
						callbackUrl && callbackUrl.startsWith("/")
							? callbackUrl
							: "/dashboard";
					return NextResponse.redirect(new URL(redirectUrl, req.url));
				}
				break;

			case "public":
				// Public routes are always accessible
				break;
		}

		// Add security headers
		const response = NextResponse.next();

		// Security headers
		response.headers.set("X-Frame-Options", "DENY");
		response.headers.set("X-Content-Type-Options", "nosniff");
		response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
		response.headers.set(
			"Permissions-Policy",
			"camera=(), microphone=(), geolocation=()"
		);

		// CSP header for enhanced security
		const cspHeader = [
			"default-src 'self'",
			"script-src 'self' 'unsafe-eval' 'unsafe-inline'",
			"style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://fonts.googleapis.com",
			"img-src 'self' blob: data: https:",
			"font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net",
			"connect-src 'self'",
			"object-src 'none'",
			"base-uri 'self'",
			"form-action 'self'",
			"frame-ancestors 'none'",
			"upgrade-insecure-requests",
		].join("; ");

		response.headers.set("Content-Security-Policy", cspHeader);

		return response;
	},
	{
		callbacks: {
			authorized: ({ token, req }) => {
				const { pathname } = req.nextUrl;
				const routeType = getRouteType(pathname);

				// Allow public routes and auth routes without token
				if (routeType === "public" || routeType === "auth") {
					return true;
				}

				// Require token for protected routes
				return !!token;
			},
		},
		pages: {
			signIn: "/auth/signin",
			error: "/auth/signin",
		},
	}
);

// Configure which routes the middleware should run on
export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 * - public folder files
		 */
		"/((?!_next/static|_next/image|favicon.ico|public/).*)",
	],
};
