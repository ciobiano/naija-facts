import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	/* config options here */
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "img.freepik.com/**",
			},
		],
	},
	webpack: (config, { isServer }) => {
		if (!isServer) {
			config.module.rules.push({
				test: /\.node$/,
				use: "node-loader",
			});
		}
		return config;
	},
};

export default nextConfig;
