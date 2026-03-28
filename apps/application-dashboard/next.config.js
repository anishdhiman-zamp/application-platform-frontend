const { withSentryConfig } = require('@sentry/nextjs');
const webpack = require('webpack');

const COLOR_SCHEME_HEADER = 'Sec-CH-Prefers-Color-Scheme';
const isDev = process.env.NODE_ENV === 'development';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  reactCompiler: true,
  output: 'standalone',
  assetPrefix: process.env.NEXT_PUBLIC_ASSET_PREFIX || '',
  // Skip type checking ONLY in CI (they run separately there)
  // Enable them for local development for immediate feedback
  typescript: {
    ignoreBuildErrors: process.env.CI === 'true',
  },
  // Note: eslint configuration moved to next lint CLI options in Next.js 16
  webpack: (config) => {
    // Vue feature flags required by @milkdown/crepe
    config.plugins.push(
      new webpack.DefinePlugin({
        __VUE_OPTIONS_API__: JSON.stringify(true),
        __VUE_PROD_DEVTOOLS__: JSON.stringify(false),
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: JSON.stringify(false),
      }),
    );
    return config;
  },
  experimental: {
    // Cap static-generation workers to avoid OOM on CI.
    // Each worker inherits NODE_OPTIONS (--max-old-space-size=6144), so
    // main + N workers can consume up to (N+1)*6 GB.  Keep N=2 in CI
    // (total ≈18 GB, fits in a 30 GB runner) and N≤4 locally.
    cpus: process.env.CI === 'true' ? 2 : Math.max(1, Math.min(4, (require('os').cpus()?.length || 2) - 1)),
    webpackMemoryOptimizations: true,
    optimizePackageImports: [
      'lucide-react',
      '@zamp-platform/ui',
      '@reduxjs/toolkit',
      'react-redux',
      'date-fns',
      '@tiptap/core',
      '@tiptap/react',
      '@tiptap/starter-kit',
      '@dnd-kit/core',
      '@dnd-kit/sortable',
      'ag-grid-react',
      'ag-grid-community',
      'ag-grid-enterprise',
      'ag-charts-react',
      'ag-charts-community',
      'ag-charts-enterprise',
      'motion',
      'framer-motion',
      '@milkdown/crepe',
      '@milkdown/kit',
      '@milkdown/react',
      'monaco-editor',
      '@monaco-editor/react',
      'react-markdown',
      'xlsx',
      'zod',
    ],
  },
  env: {
    NEXT_PUBLIC_ASSET_PREFIX: process.env.NEXT_PUBLIC_ASSET_PREFIX || '',
    NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || '',
  },
  transpilePackages: ['@zamp-platform/ui', '@zamp-platform/form-builder', '@zamp-platform/chat'],
  // Source maps consume significant memory during build. Disable in CI to
  // prevent OOM; Sentry can upload them separately via its CLI/plugin.
  productionBrowserSourceMaps: !isDev && process.env.CI !== 'true',
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
      {
        protocol: 'https',
        hostname: 'zamp-dev-us-pantheon.s3.amazonaws.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'zamp-prd-us-pantheon.s3.amazonaws.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'zamp-prd-me-pantheon.s3.amazonaws.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'zamp-stg-us-pantheon.s3.amazonaws.com',
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
      {
        // Opt browsers into sending OS color scheme as a client hint so the
        // server can resolve "system" theme correctly on subsequent requests
        source: '/(.*)',
        headers: [
          {
            key: 'Accept-CH',
            value: COLOR_SCHEME_HEADER,
          },
        ],
      },
    ];
  },
};

// Skip Sentry wrapper in development for faster hot reload
module.exports = isDev
  ? nextConfig
  : withSentryConfig(nextConfig, {
      org: 'varni-labs-pte-ltd',
      project: 'application-platform-dashboard',
      silent: !process.env.CI,
      widenClientFileUpload: true,
      urlPrefix: '~/_next/static/chunks/pages',
      rewrite: true,
      // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
      // This can increase your server load as well as your hosting bill.
      // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
      // side errors will fail.
      tunnelRoute: '/monitoring',
    });
