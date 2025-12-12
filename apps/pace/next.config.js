/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  // Asset prefix to avoid conflicts with other zones
  // All static assets will be served under /chat-static/_next/...
  assetPrefix: '/pace-static',
  // Base path for this zone - all routes will be prefixed with /chat
  basePath: '/pace',
  // Skip type checking and linting ONLY in CI (they run separately there)
  typescript: {
    ignoreBuildErrors: process.env.CI === 'true',
  },
  eslint: {
    ignoreDuringBuilds: process.env.CI === 'true',
  },
  experimental: {
    serverActions: {
      // Allow requests from the main domain
      allowedOrigins: [
        'localhost:2000',
        'localhost:2001',
        process.env.NEXT_PUBLIC_MAIN_DOMAIN || 'local.zamp.ai:2000',
      ].filter(Boolean),
    },
    optimizePackageImports: ['lucide-react', '@zamp-platform/ui'],
  },
  env: {
    NEXT_PUBLIC_CHAT_ASSET_PREFIX: process.env.NEXT_PUBLIC_CHAT_ASSET_PREFIX || '/chat-static',
  },
  webpack: (config, { isServer }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };

    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        moduleIds: 'deterministic',
      };
    }

    return config;
  },
  transpilePackages: ['@zamp-platform/ui', '@zamp-platform/api', '@zamp-platform/utils'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ik.imagekit.io',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'd2zmqfd18ltqnx.cloudfront.net',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'd2v2rvx5m3g178.cloudfront.net',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;
