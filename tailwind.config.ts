import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";
import animate from "tailwindcss-animate";

const config: Config = {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./components/**/*.{js,ts,jsx,tsx,mdx}",
		"./app/**/*.{js,ts,jsx,tsx,mdx}",
		"./contents/**/*.{js,ts,jsx,tsx,mdx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: {
				DEFAULT: "1rem",
				sm: "1.5rem",
				lg: "2rem",
				xl: "2.5rem",
				"2xl": "3rem",
			},
		
		},
		screens: {
			xs: "475px",
			sm: "640px",
			md: "768px",
			lg: "1024px",
			xl: "1280px",
			"2xl": "1536px",
		},
		extend: {
			colors: {
				border: "hsl(var(--border))",
				input: "hsl(var(--input))",
				ring: "hsl(var(--ring))",
				background: "hsl(var(--background))",
				foreground: "hsl(var(--foreground))",
				primary: {
					DEFAULT: "hsl(var(--primary))",
					foreground: "hsl(var(--primary-foreground))",
				},
				secondary: {
					DEFAULT: "hsl(var(--secondary))",
					foreground: "hsl(var(--secondary-foreground))",
				},
				destructive: {
					DEFAULT: "hsl(var(--destructive))",
					foreground: "hsl(var(--destructive-foreground))",
				},
				muted: {
					DEFAULT: "hsl(var(--muted))",
					foreground: "hsl(var(--muted-foreground))",
				},
				accent: {
					DEFAULT: "hsl(var(--accent))",
					foreground: "hsl(var(--accent-foreground))",
				},
				popover: {
					DEFAULT: "hsl(var(--popover))",
					foreground: "hsl(var(--popover-foreground))",
				},
				card: {
					DEFAULT: "hsl(var(--card))",
					foreground: "hsl(var(--card-foreground))",
				},
				"naija-green": {
					50: "#f0fdf4",
					100: "#dcfce7",
					200: "#bbf7d0",
					300: "#86efac",
					400: "#4ade80",
					500: "#22c55e",
					600: "#16a34a",
					700: "#15803d",
					800: "#166534",
					900: "#14532d",
					950: "#052e16",
				},
				cultural: {
					bronze: "#cd7f32",
					terracotta: "#e2725b",
					indigo: "#4338ca",
					gold: "#fbbf24",
					earth: "#8b4513",
					ivory: "#fffff0",
				},
				chart: {
					"1": "hsl(var(--chart-1))",
					"2": "hsl(var(--chart-2))",
					"3": "hsl(var(--chart-3))",
					"4": "hsl(var(--chart-4))",
					"5": "hsl(var(--chart-5))",
				},
			},
			borderRadius: {
				lg: "var(--radius)",
				md: "calc(var(--radius) - 2px)",
				sm: "calc(var(--radius) - 4px)",
				xl: "1rem",
				"2xl": "1.5rem",
				"3xl": "2rem",
			},
			fontFamily: {
				code: [
					"var(--font-geist-mono)",
					"ui-monospace",
					"SFMono-Regular",
					"Monaco",
					"Consolas",
					"monospace",
				],
				regular: [
					"var(--font-geist-sans)",
					"system-ui",
					"-apple-system",
					"BlinkMacSystemFont",
					"Segoe UI",
					"Roboto",
					"sans-serif",
				],
				heading: ["var(--font-geist-sans)", "Inter", "system-ui", "sans-serif"],
				body: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
				mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
			},
			fontSize: {
				xs: ["0.75rem", { lineHeight: "1rem" }],
				sm: ["0.875rem", { lineHeight: "1.25rem" }],
				base: ["1rem", { lineHeight: "1.5rem" }],
				lg: ["1.125rem", { lineHeight: "1.75rem" }],
				xl: ["1.25rem", { lineHeight: "1.75rem" }],
				"2xl": ["1.5rem", { lineHeight: "2rem" }],
				"3xl": ["1.875rem", { lineHeight: "2.25rem" }],
				"4xl": ["2.25rem", { lineHeight: "2.5rem" }],
				"5xl": ["3rem", { lineHeight: "1" }],
				"6xl": ["3.75rem", { lineHeight: "1" }],
				"7xl": ["4.5rem", { lineHeight: "1" }],
				"8xl": ["6rem", { lineHeight: "1" }],
				"9xl": ["8rem", { lineHeight: "1" }],
			},
			spacing: {
				18: "4.5rem",
				88: "22rem",
				128: "32rem",
			},
			minHeight: {
				touch: "44px",
			},
			keyframes: {
				fadeIn: {
					"0%": { opacity: "0", transform: "translateY(10px)" },
					"100%": { opacity: "1", transform: "translateY(0)" },
				},
				slideUp: {
					"0%": { opacity: "0", transform: "translateY(20px)" },
					"100%": { opacity: "1", transform: "translateY(0)" },
				},
				slideDown: {
					"0%": { opacity: "0", transform: "translateY(-10px)" },
					"100%": { opacity: "1", transform: "translateY(0)" },
				},
				scaleIn: {
					"0%": { opacity: "0", transform: "scale(0.95)" },
					"100%": { opacity: "1", transform: "scale(1)" },
				},
				bounceGentle: {
					"0%, 100%": { transform: "translateY(0)" },
					"50%": { transform: "translateY(-10px)" },
				},
				gradientShift: {
					"0%, 100%": { backgroundPosition: "0% 50%" },
					"50%": { backgroundPosition: "100% 50%" },
				},
			},
			animation: {
				"fade-in": "fadeIn 0.5s ease-in-out",
				"slide-up": "slideUp 0.5s ease-out",
				"slide-down": "slideDown 0.3s ease-out",
				"scale-in": "scaleIn 0.2s ease-out",
				"bounce-gentle": "bounceGentle 2s ease-in-out infinite",
				"pulse-slow": "pulse 3s ease-in-out infinite",
				"gradient-shift": "gradientShift 6s ease-in-out infinite",
			},
			backdropBlur: {
				xs: "2px",
			},
			boxShadow: {
				soft: "0 2px 8px 0 rgb(0 0 0 / 0.08)",
				medium: "0 4px 12px 0 rgb(0 0 0 / 0.10)",
				strong: "0 8px 24px 0 rgb(0 0 0 / 0.12)",
				cultural: "0 4px 12px 0 rgb(21 128 61 / 0.15)",
			},
		},
	},
	plugins: [
		animate,
		typography,
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		function ({ addUtilities }: any) {
			const newUtilities = {
				".touch-target": {
					minHeight: "44px",
					minWidth: "44px",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
				},
				".focus-ring": {
					"&:focus": {
						outline: "1px solid #15803d",
						outlineOffset: "1px",
						borderRadius: "0.375rem",
					},
				},
				".skip-link": {
					position: "absolute",
					top: "-40px",
					left: "6px",
					background: "#15803d",
					color: "white",
					padding: "8px",
					textDecoration: "none",
					borderRadius: "0 0 4px 4px",
					zIndex: 1000,
					"&:focus": {
						top: "6px",
					},
				},
				".gradient-nigeria": {
					background: "linear-gradient(135deg, #15803d 0%, #22c55e 100%)",
				},
				".gradient-cultural": {
					background:
						"linear-gradient(135deg, #15803d 0%, #cd7f32 50%, #fbbf24 100%)",
					backgroundSize: "200% 200%",
					animation: "gradientShift 6s ease-in-out infinite",
				},
				".gradient-subtle": {
					background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
				},
				".glass": {
					backgroundColor: "rgba(255, 255, 255, 0.1)",
					backdropFilter: "blur(12px)",
					border: "1px solid rgba(255, 255, 255, 0.2)",
				},
				".content-narrow": {
					maxWidth: "65ch",
				},
				".content-wide": {
					maxWidth: "85ch",
				},
			};
			addUtilities(newUtilities);
		},
	],
} satisfies Config;

export default config;
