/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // This is necessary for client-side resolving of .node files
      config.resolve.fallback = {
        fs: false,
        path: false,
        crypto: false,
      };
    }

    // Exclude .node files from webpack processing
    config.module.rules.push({
      test: /\.node$/,
      use: 'node-loader',
    });

    return config;
  },
};

module.exports = nextConfig;

