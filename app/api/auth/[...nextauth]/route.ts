import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";
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

					// Update last login
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
		// GitHub OAuth provider
		...(process.env.GITHUB_ID && process.env.GITHUB_SECRET
			? [
					GitHubProvider({
						clientId: process.env.GITHUB_ID,
						clientSecret: process.env.GITHUB_SECRET,
					}),
			  ]
			: []),
	],

	// Use JWT strategy
	session: {
		strategy: "jwt",
		maxAge: 30 * 24 * 60 * 60, // 30 days
	},

	pages: {
		signIn: "/auth/signin",
		error: "/auth/signin",
	},

	callbacks: {
		async jwt({ token, user, trigger }) {
			// Initial sign in - add user data to token
			if (user) {
				token.sub = user.id;
				token.email = user.email;
				token.name = user.name;
				token.picture = user.image;
			}

			// Handle OAuth providers - get or create user profile
			if (user && !token.sub) {
				try {
					// For OAuth providers, check if user exists in our database
					let profile = await prisma.profile.findUnique({
						where: { email: user.email! },
					});

					if (!profile) {
						// Create new profile for OAuth user
						profile = await prisma.profile.create({
							data: {
								email: user.email!,
								full_name: user.name || "",
								avatar_url: user.image,
								preferred_language: "en",
								timezone: "UTC",
								is_active: true,
								last_login: new Date(),
							},
						});
					} else {
						// Update existing profile
						await prisma.profile.update({
							where: { id: profile.id },
							data: {
								last_login: new Date(),
								avatar_url: user.image || profile.avatar_url,
								updated_at: new Date(),
							},
						});
					}

					token.sub = profile.id;
				} catch (error) {
					console.error("Error handling OAuth user:", error);
					return token;
				}
			}

			return token;
		},

		async session({ session, token }) {
			if (token?.sub) {
				session.user.id = token.sub;
				session.user.email = token.email;
				session.user.name = token.name;
				session.user.image = token.picture;
			}
			return session;
		},

		async signIn({ user, account }) {
			
			if (account?.provider === "credentials") {
			
				return true;
			}

			if (account?.provider === "github") {
				
				return true;
			}

			return false;
		},
	},

	events: {
		async signIn(message) {
			console.log("User signed in:", {
				user: message.user.email,
				provider: message.account?.provider,
			});
		},
		async signOut(message) {
			console.log("User signed out:", {
				token: message.token?.email,
			});
		},
	},

	// Enable debug messages in development
	debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
