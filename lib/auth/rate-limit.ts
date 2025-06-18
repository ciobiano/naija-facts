import { NextRequest } from "next/server";

interface RateLimitConfig {
	windowMs: number; // Time window in milliseconds
	maxRequests: number; // Maximum requests per window
}

// In-memory store for rate limiting (in production, use Redis or database)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Rate limit configurations for different endpoints
export const rateLimitConfigs: Record<string, RateLimitConfig> = {
	login: { windowMs: 15 * 60 * 1000, maxRequests: 5 }, // 5 attempts per 15 minutes
	register: { windowMs: 60 * 60 * 1000, maxRequests: 3 }, // 3 attempts per hour
	passwordReset: { windowMs: 60 * 60 * 1000, maxRequests: 3 }, // 3 attempts per hour
	passwordChange: { windowMs: 60 * 60 * 1000, maxRequests: 5 }, // 5 attempts per hour
	emailChange: { windowMs: 60 * 60 * 1000, maxRequests: 3 }, // 3 attempts per hour
	verifyEmail: { windowMs: 60 * 60 * 1000, maxRequests: 5 }, // 5 attempts per hour
};

export function getClientIp(request: NextRequest): string {
	// Try to get IP from various headers (for proxy/load balancer scenarios)
	const xForwardedFor = request.headers.get("x-forwarded-for");
	const xRealIp = request.headers.get("x-real-ip");
	const cfConnectingIp = request.headers.get("cf-connecting-ip");

	if (xForwardedFor) {
		return xForwardedFor.split(",")[0].trim();
	}

	if (xRealIp) {
		return xRealIp;
	}

	if (cfConnectingIp) {
		return cfConnectingIp;
	}

	// Fallback to localhost or unknown
	return "127.0.0.1";
}

export function checkRateLimit(
	identifier: string,
	config: RateLimitConfig
): { allowed: boolean; resetTime?: number; remainingRequests?: number } {
	const now = Date.now();
	const key = identifier;

	// Clean up expired entries periodically
	if (Math.random() < 0.01) {
		// 1% chance to clean up
		cleanupExpiredEntries();
	}

	const existing = rateLimitStore.get(key);

	if (!existing || now > existing.resetTime) {
		// First request or window has expired
		const resetTime = now + config.windowMs;
		rateLimitStore.set(key, { count: 1, resetTime });

		return {
			allowed: true,
			resetTime,
			remainingRequests: config.maxRequests - 1,
		};
	}

	if (existing.count >= config.maxRequests) {
		// Rate limit exceeded
		return {
			allowed: false,
			resetTime: existing.resetTime,
			remainingRequests: 0,
		};
	}

	// Increment counter
	existing.count++;
	rateLimitStore.set(key, existing);

	return {
		allowed: true,
		resetTime: existing.resetTime,
		remainingRequests: config.maxRequests - existing.count,
	};
}

export function createRateLimitKey(
	endpoint: string,
	identifier: string
): string {
	return `${endpoint}:${identifier}`;
}

export function rateLimitByIp(
	request: NextRequest,
	endpoint: keyof typeof rateLimitConfigs
): { allowed: boolean; resetTime?: number; remainingRequests?: number } {
	const ip = getClientIp(request);
	const config = rateLimitConfigs[endpoint];
	const key = createRateLimitKey(endpoint, ip);

	return checkRateLimit(key, config);
}

export function rateLimitByUser(
	userId: string,
	endpoint: keyof typeof rateLimitConfigs
): { allowed: boolean; resetTime?: number; remainingRequests?: number } {
	const config = rateLimitConfigs[endpoint];
	const key = createRateLimitKey(endpoint, `user:${userId}`);

	return checkRateLimit(key, config);
}

export function rateLimitByEmail(
	email: string,
	endpoint: keyof typeof rateLimitConfigs
): { allowed: boolean; resetTime?: number; remainingRequests?: number } {
	const config = rateLimitConfigs[endpoint];
	const key = createRateLimitKey(endpoint, `email:${email}`);

	return checkRateLimit(key, config);
}

function cleanupExpiredEntries(): void {
	const now = Date.now();

	for (const [key, value] of rateLimitStore.entries()) {
		if (now > value.resetTime) {
			rateLimitStore.delete(key);
		}
	}
}

// Helper to create rate limit response
export function createRateLimitResponse(
	resetTime: number,
	remainingRequests: number = 0
) {
	const resetTimeSeconds = Math.ceil((resetTime - Date.now()) / 1000);

	return new Response(
		JSON.stringify({
			error: "Too many requests",
			message: `Rate limit exceeded. Try again in ${resetTimeSeconds} seconds.`,
			retryAfter: resetTimeSeconds,
		}),
		{
			status: 429,
			headers: {
				"Content-Type": "application/json",
				"Retry-After": resetTimeSeconds.toString(),
				"X-RateLimit-Remaining": remainingRequests.toString(),
				"X-RateLimit-Reset": resetTime.toString(),
			},
		}
	);
}

// Account lockout functionality for repeated failed attempts
const accountLockoutStore = new Map<
	string,
	{ attempts: number; lockedUntil?: number }
>();

export function checkAccountLockout(
	identifier: string,
	maxAttempts: number = 5
): { locked: boolean; attemptsRemaining?: number; lockedUntil?: number } {
	const now = Date.now();
	const existing = accountLockoutStore.get(identifier);

	if (!existing) {
		return { locked: false, attemptsRemaining: maxAttempts };
	}

	// Check if lockout has expired
	if (existing.lockedUntil && now > existing.lockedUntil) {
		accountLockoutStore.delete(identifier);
		return { locked: false, attemptsRemaining: maxAttempts };
	}

	// Account is currently locked
	if (existing.lockedUntil && now <= existing.lockedUntil) {
		return { locked: true, lockedUntil: existing.lockedUntil };
	}

	// Not locked, return remaining attempts
	const remaining = maxAttempts - existing.attempts;
	return { locked: false, attemptsRemaining: Math.max(0, remaining) };
}

export function recordFailedAttempt(
	identifier: string,
	maxAttempts: number = 5,
	lockoutDurationMs: number = 30 * 60 * 1000
): { locked: boolean; attemptsRemaining: number; lockedUntil?: number } {
	const now = Date.now();
	const existing = accountLockoutStore.get(identifier) || { attempts: 0 };

	existing.attempts++;

	if (existing.attempts >= maxAttempts) {
		existing.lockedUntil = now + lockoutDurationMs;
		accountLockoutStore.set(identifier, existing);

		return {
			locked: true,
			attemptsRemaining: 0,
			lockedUntil: existing.lockedUntil,
		};
	}

	accountLockoutStore.set(identifier, existing);

	return {
		locked: false,
		attemptsRemaining: maxAttempts - existing.attempts,
	};
}

export function clearFailedAttempts(identifier: string): void {
	accountLockoutStore.delete(identifier);
}
