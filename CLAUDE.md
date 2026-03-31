# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Zamp Application Platform Frontend — a Next.js 16 monorepo using npm workspaces and Turborepo. Single app (`application-dashboard`) with 10 internal packages.

## Common Commands

### Development

```bash
make dev              # Build then start on port 2000 (0.0.0.0 for Coder)
make dev-hot          # Start with Turbopack hot reload on port 2000
make dev-stop         # Stop all services
make dev-restart      # Restart services
make dev-logs         # View service logs
make dev-tail         # Tail logs in real-time
make health           # Health check all services
```

### Build, Lint, Test

```bash
npm run build         # Build all packages (turbo)
npm run lint          # ESLint all packages
npm run typecheck     # TypeScript type checking
npm run test          # Jest tests (all packages)
npm run test:watch    # Jest watch mode
npm run test:coverage # Coverage reports
npm run prettier      # Format with Prettier

# App-level (run from apps/application-dashboard/)
npm run test -- --testPathPattern="path/to/test"  # Run a single test file
npm run test:e2e      # Playwright e2e tests
npm run test:e2e:ui   # Playwright UI mode
```

### Setup

```bash
make install          # Install deps + sync secrets from vault
make sync-secrets     # Sync secrets only
make sync-from-main   # Stash changes, checkout main, pull, sync secrets, install
```

## Architecture

### Monorepo Structure

- **`apps/application-dashboard/`** — Main Next.js 16 app (App Router, port 2000/3000)
- **`packages/ui/`** — Shared UI component library (Radix UI, shadcn/ui, Tailwind)
- **`packages/api/`** — RTK Query base API, base query provider, async-mutex
- **`packages/utils/`** — Shared utility functions and hooks
- **`packages/battalion/`** — TanStack React Query v5 wrapper with IndexedDB caching
- **`packages/chat/`** — Chat components (Tiptap editor, ElevenLabs, markdown)
- **`packages/form-builder/`** — React Hook Form + Zod validation
- **`packages/tanstack-table/`** — TanStack Table v8 wrapper with virtualization
- **`packages/dataset-create-edit/`** — Dataset management with @dnd-kit
- **`packages/svg-loader/`** — SVG loader utility
- **`packages/config/`** — Shared ESLint, TypeScript, Jest configs

### State Management (multi-layer)

1. **Redux Toolkit + RTK Query** — Global state & API caching (`src/store/`, `src/apis/`)
2. **TanStack React Query** — Server state via `@zamp-platform/battalion`
3. **React Context** — Shared UI state (filters, themes)

### App Organization (`apps/application-dashboard/src/`)

- **`app/`** — Next.js App Router routes. Authenticated routes grouped under `(authenticated)/`
- **`modules/`** — Feature modules (pace, process, widgets, sheets, datasets, etc.) with colocated components/hooks/types
- **`apis/`** — RTK Query endpoint definitions using `injectEndpoints()`. Constants in `apiEndpoint.constants.ts`
- **`store/`** — Redux store config with slices: user, layoutConfig, sheetFilters, tableState, dynamicTabs, feedbacks
- **`types/`** — Shared type definitions, API types in subdirectories

### Key Route Segments

- `/chat` — Main chat interface (PACE module)
- `/processes` / `/processes/[processId]` — Process management
- `/datasets` / `/datasets/[datasetId]` — Dataset views with drill-down
- `/settings` — User and org settings

## Framework & Conventions

### Next.js 16 Specifics

- **React 19.2** with React Compiler enabled (auto-memoization, `reactCompiler: true` in next.config)
- **Turbopack** is default for dev; webpack for production builds (`npm run build` uses `--webpack`)
- **Output: standalone** for Docker containerization
- **Async params/searchParams** — In server components, `params` and `searchParams` must be awaited (Next.js 16 breaking change). All request APIs are async: `await cookies()`, `await headers()`, `await draftMode()`
- **No middleware.ts** — Deprecated in Next.js 16; use `proxy.ts` pattern instead
- **`'use client'`** — Only when necessary; prefer Server Components
- **Removed features** — AMP support, `next lint` (use ESLint directly), `serverRuntimeConfig`/`publicRuntimeConfig`, `next/legacy/image`
- **Caching** — `use cache` directive with `cacheTag()`, `updateTag()`, `revalidateTag()`, `refresh()` (stable, no `unstable_` prefix)

### TypeScript

- Strict mode required, no `any` types
- `interface` over `type` for object shapes; `type` for unions/intersections
- Path alias: `@/*` maps to `src/*`
- Naming: PascalCase components, camelCase functions, SCREAMING_SNAKE_CASE constants/enums
- Suffix type definitions with `Type` (e.g., `WidgetDataType`), props interfaces with `Props`
- Use discriminated unions for widget types and API responses
- Prefix event handlers with `handle` (e.g., `handleClick`, `handleSubmit`)
- Prefix boolean variables with auxiliary verbs (`isLoading`, `hasError`)

### Component Internal Structure

Follow this order within React components:

1. **State** — `useState`, `useRef`
2. **Derived State** — `useMemo`, computed values, context
3. **Hooks** — Custom hooks
4. **Handlers** — `useCallback` wrapped event handlers
5. **Render** — Early returns, JSX

### useEffect Convention

When a `useEffect` has more than a single statement, extract the logic into a named `useCallback` function and call it from the effect. Single-statement effects are fine inline.

### Styling

- Tailwind CSS v4 with `cva` (class variance authority) for component variants
- Use semantic color tokens (kebab-case: `bg-gray-400`)
- Prettier plugin sorts Tailwind classes (print width 120, single quotes)
- Animations: use `motion` (framer-motion v12+), docs at motion.dev

### Component Placement

- Generic/shared components → `packages/ui/`
- Feature-specific components → `src/modules/<feature>/components/`
- Custom hooks → `packages/utils/hooks/` (shared) or module-level `hooks/`

### API Pattern

All API endpoints use RTK Query's `injectEndpoints()` with cache tags and `transformResponse` for normalization. Endpoint constants centralized in `apiEndpoint.constants.ts`. Use template variables (`{{organizationId}}`, `{{widgetId}}`) with `formRequestUrlWithParams`.

### Git & PR Workflow

- Conventional Commits: `feat:`, `fix:`, `docs:`, `chore:`, `perf:`, `refactor:`
- Use `/pr-workflow` skill for commits and PRs
- CI runs on push to main and PRs: tests with coverage upload

### Environment

- Node.js >=20.9.0, npm 10.5.0
- Dev memory: `NODE_OPTIONS='--max-old-space-size=8192'`
- Secrets managed via `sync-secrets.sh` (vault-based)
- Feature flags via LaunchDarkly
- Monitoring: Sentry, PostHog, Vercel Speed Insights
