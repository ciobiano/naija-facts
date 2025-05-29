import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
// Temporarily removing PrismaAdapter due to session retrieval issues
// import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
	providers: [
		CredentialsProvider({
			name: "credentials",
			credentials: {
				email: { label: "Email", type: "email" },
				password: { label: "Password", type: "password" },
			},
			async authorize(credentials) {
				if (!credentials?.email || !credentials?.password) {
					return null;
				}

				try {
					const user = await prisma.profile.findUnique({
						where: { email: credentials.email },
					});

					if (!user || !user.password_hash) {
						return null;
					}

					const isPasswordValid = await bcrypt.compare(
						credentials.password,
						user.password_hash
					);

					if (!isPasswordValid) {
						return null;
					}

					await prisma.profile.update({
						where: { id: user.id },
						data: {
							last_login: new Date(),
							updated_at: new Date(),
						},
					});

					return {
						id: user.id,
						email: user.email,
						name: user.full_name,
						image: user.avatar_url,
					};
				} catch (error) {
					console.error("Authentication error:", error);
					return null;
				}
			},
		}),
		// Only include OAuth providers if credentials are available
		// Temporarily disabled Google OAuth due to incomplete client secret
		// ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
		// 	? [
		// 			GoogleProvider({
		// 				clientId: process.env.GOOGLE_CLIENT_ID,
		// 				clientSecret: process.env.GOOGLE_CLIENT_SECRET,
		// 			}),
		// 	  ]
		// 	: []),
		...(process.env.GITHUB_ID && process.env.GITHUB_SECRET
			? [
					GitHubProvider({
						clientId: process.env.GITHUB_ID,
						clientSecret: process.env.GITHUB_SECRET,
					}),
			  ]
			: []),
	],

	// Explicitly using JWT strategy for reliability
	session: {
		strategy: "jwt",
		maxAge: 30 * 24 * 60 * 60, // 30 days
	},

	pages: {
		signIn: "/auth/signin",
		error: "/auth/signin",
	},

	callbacks: {
		async jwt({ token, user, account, trigger, session }) {
			// Initial sign in
			if (user && user.id) {
				token.id = user.id;
				token.email = user.email;
				token.name = user.name;

				// Add session start time for security
				token.sessionStart = Date.now();

				// Fetch additional user data
				try {
					const dbUser = await prisma.profile.findUnique({
						where: { id: user.id },
						select: {
							id: true,
							preferred_language: true,
							timezone: true,
							is_active: true,
						},
					});

					if (dbUser) {
						token.preferredLanguage = dbUser.preferred_language;
						token.timezone = dbUser.timezone;
						token.isActive = dbUser.is_active;
					}
				} catch (error) {
					console.error("JWT callback error:", error);
				}
			}

			// Handle session updates
			if (trigger === "update" && session) {
				token.name = session.name || token.name;
				token.email = session.email || token.email;
			}

			// Session timeout check - clear token instead of returning null
			const sessionTimeout = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
			if (
				token.sessionStart &&
				Date.now() - (token.sessionStart as number) > sessionTimeout
			) {
				// Clear the token data to force re-authentication
				return {};
			}

			return token;
		},
		async session({ session, token }) {
			// Add null checks to prevent the JWT session error
			if (!session?.user || !token) {
				console.warn("Session callback: Invalid session or token");
				return session;
			}

			// Only proceed if token has user ID
			if (token.id) {
				session.user.id = token.id as string;

				// Verify user is still active (with error handling)
				try {
					const dbUser = await prisma.profile.findUnique({
						where: { id: token.id as string },
						select: {
							is_active: true,
							email_verified: true,
						},
					});

					if (!dbUser?.is_active) {
						// Return empty session to force sign out if user is not active
						return { ...session, user: { email: session.user.email } };
					}

					// Only check email verification for new sign-ups, not existing users
					// Allow existing users without email verification to continue using the app
					
				} catch (error) {
					console.error("Session callback error:", error);
					// Continue with session even if database check fails
				}
			}

			return session;
		},
		async signIn({ user, account, profile }) {
			if (account?.provider === "google" || account?.provider === "github") {
				try {
					// Check if user exists
					const existingUser = await prisma.profile.findUnique({
						where: { email: user.email! },
					});

					if (!existingUser) {
						// Create new user for OAuth providers
						await prisma.profile.create({
							data: {
								email: user.email!,
								full_name: user.name || "",
								avatar_url: user.image || "",
								is_active: true,
								last_login: new Date(),
								created_at: new Date(),
								updated_at: new Date(),
							},
						});
					} else {
						await prisma.profile.update({
							where: { id: existingUser.id },
							data: {
								last_login: new Date(),
								updated_at: new Date(),
							},
						});
					}
				} catch (error) {
					console.error("OAuth sign in error:", error);
					return false;
				}
			}
			return true;
		},
	},
	debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
