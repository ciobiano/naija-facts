import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "@/components/contexts/theme-provider";
import { Navbar } from "@/components/ui/sections/nav";
import { Space_Mono, Space_Grotesk } from "next/font/google";
import { Footer } from "@/components/ui/sections/footer";
import "@/styles/globals.css";
import { AuthProvider } from "@/components/contexts/auth-provider";

const sansFont = Space_Grotesk({
	subsets: ["latin"],
	variable: "--font-geist-sans",
	display: "swap",
	weight: ["300", "400", "500", "600", "700"],
	fallback: [
		"system-ui",
		"-apple-system",
		"BlinkMacSystemFont",
		"Segoe UI",
		"Roboto",
		"sans-serif",
	],
});

const monoFont = Space_Mono({
	subsets: ["latin"],
	variable: "--font-geist-mono",
	display: "swap",
	weight: ["400", "700"],
	fallback: [
		"ui-monospace",
		"SFMono-Regular",
		"Monaco",
		"Consolas",
		"monospace",
	],
});

export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1,
	maximumScale: 5,
	themeColor: [
		{ media: "(prefers-color-scheme: light)", color: "#22c55e" },
		{ media: "(prefers-color-scheme: dark)", color: "#16a34a" },
	],
};

export const metadata: Metadata = {
	title: {
		default: "Naija Facts - Learn Nigerian Culture & History",
		template: "%s | Naija Facts",
	},
	description:
		"Discover Nigeria's rich culture, history, and constitution through interactive quizzes and educational content. Learn about Nigerian heritage with our mobile-friendly platform.",
	metadataBase: new URL("https://naija-facts.vercel.app/"),
	keywords: [
		"Nigeria",
		"culture",
		"history",
		"constitution",
		"quiz",
		"education",
		"African heritage",
	],
	authors: [{ name: "Naija Facts Team" }],
	creator: "Naija Facts",
	openGraph: {
		type: "website",
		locale: "en_NG",
		url: "https://naija-facts.vercel.app/",
		title: "Naija Facts - Learn Nigerian Culture & History",
		description:
			"Discover Nigeria's rich culture, history, and constitution through interactive quizzes and educational content.",
		siteName: "Naija Facts",
	},
	twitter: {
		card: "summary_large_image",
		title: "Naija Facts - Learn Nigerian Culture & History",
		description:
			"Discover Nigeria's rich culture, history, and constitution through interactive quizzes and educational content.",
		creator: "@naijafacts",
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			"max-video-preview": -1,
			"max-image-preview": "large",
			"max-snippet": -1,
		},
	},
	manifest: "/manifest.json",
	appleWebApp: {
		capable: true,
		statusBarStyle: "default",
		title: "Naija Facts",
	},
	formatDetection: {
		telephone: false,
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<link
					rel="stylesheet"
					type="text/css"
					href="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/devicon.min.css"
				/>
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link
					rel="preconnect"
					href="https://fonts.gstatic.com"
					crossOrigin=""
				/>

				{/* PWA and mobile optimization */}
				<link rel="manifest" href="/manifest.json" />
				<meta name="color-scheme" content="light dark" />
				<meta name="mobile-web-app-capable" content="yes" />
				<meta name="apple-mobile-web-app-capable" content="yes" />
				<meta name="apple-mobile-web-app-status-bar-style" content="default" />
				<meta name="apple-mobile-web-app-title" content="Naija Facts" />
				<meta name="msapplication-TileColor" content="#22c55e" />
				<meta name="msapplication-config" content="/browserconfig.xml" />

				{/* Apple touch icons */}
				<link
					rel="apple-touch-icon"
					sizes="180x180"
					href="/icons/apple-touch-icon.png"
				/>
				<link
					rel="icon"
					type="image/png"
					sizes="32x32"
					href="/icons/favicon-32x32.png"
				/>
				<link
					rel="icon"
					type="image/png"
					sizes="16x16"
					href="/icons/favicon-16x16.png"
				/>
				<link
					rel="mask-icon"
					href="/icons/safari-pinned-tab.svg"
					color="#22c55e"
				/>
			</head>
			<body
				className={`${sansFont.variable} ${monoFont.variable} font-regular antialiased tracking-wide min-h-screen flex flex-col`}
				suppressHydrationWarning
			>
				{/* Skip to main content link for accessibility */}
				<a
					href="#main-content"
					className="skip-link focus:not-sr-only"
					aria-label="Skip to main content"
				>
					Skip to main content
				</a>

				<AuthProvider>
					<ThemeProvider
						attribute="class"
						defaultTheme="system"
						enableSystem
						disableTransitionOnChange
					>
						{/* Header */}
						<header role="banner">
							<Navbar />
						</header>

						{/* Main content area with improved mobile-first layout */}
						<main
							id="main-content"
							role="main"
							className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8"
							tabIndex={-1}
						>
							<div className="w-full h-auto scroll-smooth">{children}</div>
						</main>

						{/* Footer */}
						<footer role="contentinfo">
							<Footer />
						</footer>
					</ThemeProvider>
				</AuthProvider>
			</body>
		</html>
	);
}
