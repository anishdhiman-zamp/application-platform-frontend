# Multi-Zones Architecture

This repository implements Next.js [Multi-Zones](https://nextjs.org/docs/app/guides/multi-zones) to split the application into separate, independently deployable zones.

## Overview

Multi-Zones allow you to separate a large application into smaller Next.js applications that each serve a set of paths. This provides:

- **Independent deployments**: Each zone can be built and deployed separately
- **Reduced build times**: Changes to one zone don't require rebuilding others
- **Code isolation**: Teams can work on different zones without conflicts
- **Framework flexibility**: Different zones can use different configurations

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Domain (e.g., zamp.ai)                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────┐    ┌─────────────────────┐        │
│  │  application-dash   │    │    ops-dashboard    │        │
│  │     (Port 2000)     │    │     (Port 2001)     │        │
│  │                     │    │                     │        │
│  │  Routes: /*         │    │  Routes: /ops/*     │        │
│  │  (default zone)     │    │  (ops zone)         │        │
│  │                     │    │                     │        │
│  │  Assets: /_next/*   │    │  Assets:            │        │
│  │                     │    │  /ops-static/_next/*│        │
│  └─────────────────────┘    └─────────────────────┘        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Zones

### 1. Application Dashboard (Default Zone)

- **Path**: `apps/application-dashboard`
- **Port**: 2000
- **Routes**: `/*` (all routes except /ops)
- **Purpose**: Main application dashboard

### 2. Ops Dashboard

- **Path**: `apps/ops-dashboard`
- **Port**: 2001
- **Base Path**: `/ops`
- **Asset Prefix**: `/ops-static`
- **Routes**: `/ops/*`
- **Purpose**: Operations dashboard for internal tools

## Development

### Running All Zones

```bash
# Run both zones in parallel
npm run dev
```

This starts:

- Application Dashboard at http://localhost:2000
- Ops Dashboard at http://localhost:2001

### Running Individual Zones

```bash
# Run only application-dashboard
cd apps/application-dashboard && npm run dev

# Run only ops-dashboard
cd apps/ops-dashboard && npm run dev
```

### Accessing the Zones

During development, when both zones are running:

- Main app: http://localhost:2000
- Ops dashboard: http://localhost:2000/ops (proxied through main app)
- Ops dashboard direct: http://localhost:2001/ops

## Configuration

### Application Dashboard (next.config.js)

The main app routes requests to the ops zone using rewrites:

```javascript
async rewrites() {
  const opsDashboardDomain = process.env.OPS_DASHBOARD_DOMAIN || 'http://localhost:2001';
  return {
    beforeFiles: [
      // Static assets for ops zone
      {
        source: '/ops-static/_next/:path*',
        destination: `${opsDashboardDomain}/ops-static/_next/:path*`,
      },
    ],
    afterFiles: [
      // Route /ops to ops-dashboard
      {
        source: '/ops',
        destination: `${opsDashboardDomain}/ops`,
      },
      {
        source: '/ops/:path*',
        destination: `${opsDashboardDomain}/ops/:path*`,
      },
    ],
  };
}
```

### Ops Dashboard (next.config.js)

The ops zone uses `assetPrefix` and `basePath` to avoid conflicts:

```javascript
const nextConfig = {
  assetPrefix: '/ops-static',
  basePath: '/ops',
  // ...
};
```

## Navigation Between Zones

### Within the Same Zone (Soft Navigation)

Use Next.js `<Link>` component for navigation within the same zone:

```tsx
import Link from 'next/link';

// Inside ops-dashboard
<Link href='/ops/settings'>Settings</Link>;
```

### Between Different Zones (Hard Navigation)

Use regular `<a>` tags for cross-zone navigation:

```tsx
// From ops-dashboard to main app
<a href="/">Back to Main App</a>

// From main app to ops-dashboard
<a href="/ops">Go to Ops Dashboard</a>
```

**Important**: Using `<Link>` for cross-zone navigation will not work correctly as Next.js will try to prefetch and soft-navigate, which doesn't work across zones.

## Environment Variables

### Application Dashboard

```env
# Domain of the ops-dashboard zone (for rewrites)
OPS_DASHBOARD_DOMAIN=http://localhost:2001

# Main domain for Server Actions CORS
NEXT_PUBLIC_MAIN_DOMAIN=local.zamp.ai:2000
```

### Ops Dashboard

```env
# Asset prefix for this zone
NEXT_PUBLIC_OPS_ASSET_PREFIX=/ops-static

# Main domain for Server Actions CORS
NEXT_PUBLIC_MAIN_DOMAIN=local.zamp.ai:2000
```

## Production Deployment

### Option 1: Using a Proxy/Load Balancer

Deploy each zone separately and use a reverse proxy (nginx, AWS ALB, etc.) to route requests:

```nginx
# nginx configuration example
location /ops {
    proxy_pass http://ops-dashboard:3000;
}

location /ops-static {
    proxy_pass http://ops-dashboard:3000;
}

location / {
    proxy_pass http://application-dashboard:3000;
}
```

### Option 2: Using Next.js Rewrites (Current Setup)

The main app rewrites requests to the ops zone. Set the production domain:

```env
OPS_DASHBOARD_DOMAIN=https://ops.internal.zamp.ai
```

### Server Actions

When using Server Actions with multi-zones, ensure the allowed origins are configured:

```javascript
experimental: {
  serverActions: {
    allowedOrigins: ['your-production-domain.com'],
  },
}
```

## Adding a New Zone

1. Create a new app in `apps/` directory
2. Configure `next.config.js` with unique `assetPrefix` and `basePath`
3. Add rewrites in the main app's `next.config.js`
4. Update environment variables
5. Update the proxy/load balancer configuration for production

## Shared Code

All zones share code through the `packages/` directory:

- `@zamp-platform/ui` - Shared UI components
- `@zamp-platform/api` - API utilities
- `@zamp-platform/utils` - Common utilities
- `@zamp-platform/config` - Shared configuration

## Troubleshooting

### Assets Not Loading in Ops Zone

Ensure the `assetPrefix` in ops-dashboard matches the rewrite pattern in the main app.

### Server Actions Failing

Check that `allowedOrigins` includes all domains where the zones are hosted.

### 404 on /ops Routes

Ensure:

1. Ops-dashboard is running
2. `OPS_DASHBOARD_DOMAIN` is correctly set
3. Rewrites are configured in main app's `next.config.js`

### Styles Not Applied

Ensure the tailwind config includes paths to shared packages:

```javascript
content: ['./src/**/*.{ts,tsx}', '../../packages/ui/src/**/*.{ts,tsx}'];
```
