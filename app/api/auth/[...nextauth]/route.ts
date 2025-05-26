import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
	adapter: PrismaAdapter(prisma),
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
					// Find user in database
					const user = await prisma.profile.findUnique({
						where: { email: credentials.email },
					});

					if (!user || !user.password_hash) {
						return null;
					}

					// Verify password
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
						data: { last_login: new Date() },
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
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID!,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
		}),
		GitHubProvider({
			clientId: process.env.GITHUB_ID!,
			clientSecret: process.env.GITHUB_SECRET!,
		}),
	],

	session: {
		strategy: "jwt",
		maxAge: 30 * 24 * 60 * 60, // 30 days
	},
	callbacks: {
		async jwt({ token, user, account }) {
			if (user) {
				token.id = user.id;
			}
			return token;
		},
		async session({ session, token }) {
			if (token && session.user) {
				session.user.id = token.id as string;

				// Fetch additional user data from database
				const dbUser = await prisma.profile.findUnique({
					where: { id: token.id as string },
					select: {
						id: true,
						email: true,
						full_name: true,
						avatar_url: true,
						preferred_language: true,
						timezone: true,
						is_active: true,
					},
				});

				if (dbUser) {
					session.user.name = dbUser.full_name;
					session.user.image = dbUser.avatar_url;
					// session.user.preferredLanguage = dbUser.preferred_language;
					// session.user.timezone = dbUser.timezone;
					// session.user.isActive = dbUser.is_active;
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
							},
						});
					} else {
						// Update last login for existing user
						await prisma.profile.update({
							where: { id: existingUser.id },
							data: { last_login: new Date() },
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
	events: {
		async signIn({ user, account, isNewUser }) {
			if (isNewUser) {
				// Initialize user progress for new users
				const categories = await prisma.category.findMany({
					where: { is_active: true },
				});

				for (const category of categories) {
					await prisma.userProgress.create({
						data: {
							user_id: user.id,
							category_id: category.id,
						},
					});
				}
			}
		},
	},
	debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
