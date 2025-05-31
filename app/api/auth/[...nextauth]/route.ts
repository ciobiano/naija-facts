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

					if (!user || !user.password_hash || !user.is_active) {
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
			if (user?.id) {
				token.sub = user.id; // This ensures user.id is available in session
				token.email = user.email;
				token.name = user.name;
				token.picture = user.image;
				token.sessionStart = Date.now();

				// Fetch additional user data from database
				try {
					const dbUser = await prisma.profile.findUnique({
						where: { id: user.id },
						select: {
							id: true,
							preferred_language: true,
							timezone: true,
							is_active: true,
							email_verified: true,
						},
					});

					if (dbUser) {
						token.preferredLanguage = dbUser.preferred_language;
						token.timezone = dbUser.timezone;
						token.isActive = dbUser.is_active;
						token.emailVerified = dbUser.email_verified;
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

			// Session timeout check
			const sessionTimeout = 24 * 60 * 60 * 1000; // 24 hours
			if (
				token.sessionStart &&
				Date.now() - (token.sessionStart as number) > sessionTimeout
			) {
				return {};
			}

			return token;
		},

		async session({ session, token }) {
			// Ensure user ID is properly mapped
			if (token?.sub && session?.user) {
				session.user.id = token.sub;
				session.user.name = token.name as string;
				session.user.email = token.email as string;
				session.user.image = token.picture as string;

				// Security check - verify user is still active
				try {
					const dbUser = await prisma.profile.findUnique({
						where: { id: token.sub as string },
						select: { is_active: true },
					});

					if (!dbUser?.is_active) {
						// User has been deactivated, return minimal session
						return {
							...session,
							user: { email: session.user.email },
						};
					}
				} catch (error) {
					console.error("Session verification error:", error);
				}
			}

			return session;
		},

		async signIn({ user, account, profile }) {
			if (account?.provider === "google" || account?.provider === "github") {
				try {
					const existingUser = await prisma.profile.findUnique({
						where: { email: user.email! },
					});

					if (!existingUser) {
						// Create new user for OAuth providers
						const newUser = await prisma.profile.create({
							data: {
								email: user.email!,
								full_name: user.name || "",
								avatar_url: user.image || "",
								is_active: true,
								last_login: new Date(),
								email_verified: new Date(), // OAuth users are considered verified
							},
						});

						// Update user object with the new ID
						user.id = newUser.id;
					} else {
						// Update existing user
						await prisma.profile.update({
							where: { id: existingUser.id },
							data: {
								last_login: new Date(),
								updated_at: new Date(),
								// Update avatar if changed
								...(user.image &&
									user.image !== existingUser.avatar_url && {
										avatar_url: user.image,
									}),
							},
						});

						// Ensure user.id is set for the session
						user.id = existingUser.id;
					}
				} catch (error) {
					console.error("OAuth sign in error:", error);
					return false;
				}
			}
			return true;
		},
	},

	events: {
		async signOut({ token }) {
			// Optional: Log sign out events
			console.log("User signed out:", token?.email);
		},
	},

	// Security settings
	useSecureCookies: process.env.NODE_ENV === "production",
	debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
