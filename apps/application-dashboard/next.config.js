const { withSentryConfig } = require('@sentry/nextjs');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  assetPrefix: process.env.NEXT_PUBLIC_ASSET_PREFIX || '',
  // Skip type checking and linting ONLY in CI (they run separately there)
  // Enable them for local development for immediate feedback
  typescript: {
    ignoreBuildErrors: process.env.CI === 'true',
  },
  eslint: {
    ignoreDuringBuilds: process.env.CI === 'true',
  },
  experimental: {
    serverActions: {},
    // Optimize memory usage during builds
    optimizePackageImports: ['lucide-react', '@zamp-platform/ui'],
  },
  env: {
    NEXT_PUBLIC_ASSET_PREFIX: process.env.NEXT_PUBLIC_ASSET_PREFIX || '',
    NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || '',
  },
  webpack: (config, { isServer }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };

    // Optimize build performance and memory usage
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        moduleIds: 'deterministic',
      };
    }

    return config;
  },
  transpilePackages: ['@zamp-platform/ui', '@zamp-platform/form-builder', '@zamp-platform/chat'],
  productionBrowserSourceMaps: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: process.env.NEXT_PUBLIC_VERCEL_BLOB_BASE_URL?.replace('https://', '') || '',
        pathname: '/**',
      },
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
      {
        protocol: 'https',
        hostname: 'd1spwmgn2nexj7.cloudfront.net',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'd2hx62c6x4ihoz.cloudfront.net',
        pathname: '/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
    ];
  },
};

module.exports = withSentryConfig(nextConfig, {
  org: 'varni-labs-pte-ltd',
  project: 'application-platform-dashboard',
  silent: !process.env.CI,
  widenClientFileUpload: true,
  urlPrefix: '~/_next/static/chunks/pages',
  rewrite: true,
  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,
  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: '/monitoring',

  // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
  // See the following for more information:
  // https://docs.sentry.io/product/crons/
  // https://vercel.com/docs/cron-jobs
  automaticVercelMonitors: true,
});
