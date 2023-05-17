/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  webpack(config) {
    config.experiments = { ...config.experiments, topLevelAwait: true };
    return config;
  },
  serverless: {
    // Increase function timeout to 30 seconds
    timeout: 30,
  },
};

export default nextConfig;
