## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

## Architecture

This monorepo uses [Next.js Multi-Zones](https://nextjs.org/docs/app/guides/multi-zones) for micro-frontend architecture:

- **application-dashboard** (Port 2000): Main application serving `/*`
- **ops-dashboard** (Port 2001): Operations dashboard serving `/ops/*`

See [Multi-Zones Documentation](./readme/MULTI_ZONES_README.md) for detailed setup and configuration.
