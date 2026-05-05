# CLAUDE.md

Persistent context for the Zamp Application Platform Frontend. See `@package.json` for workspace layout and available scripts.

## Project Overview

Next.js 16 + Turborepo monorepo, npm workspaces. Single app: `apps/application-dashboard/` (port 2000). Shared packages live under `packages/`.

**Chat-first architecture.** The PACE sidebar is the global app shell. All authenticated routes nest under `/chat/*` (e.g. `/chat/history`, `/chat/task`, `/chat/apps`, `/chat/settings/...`). Top-level non-`/chat` routes are limited to `/invitations`, `/membership-pending`, and `/dev/*`. Do not assume legacy top-level `/processes`, `/datasets`, or `/settings` routes — they don't exist.

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
npm run test -- --testPathPattern="path/to/test"  # Single test file
npm run test:e2e      # Playwright e2e
npm run test:e2e:ui   # Playwright UI mode
```

### Setup

```bash
make install          # Install deps + sync secrets from vault
make sync-secrets     # Sync secrets only
make sync-from-main   # Stash, checkout main, pull, sync secrets, install
```

## Architecture

### State management (multi-layer)

1. **Redux Toolkit + RTK Query** — global state & API caching (`src/store/`, `src/apis/`). Slice files live in `src/store/slices/` with **kebab-case** filenames (e.g. `layout-configs.ts`, `dynamic-tabs.slice.ts`) — do not invent camelCase paths.
2. **TanStack React Query** — server state via `@zamp-platform/battalion` (IndexedDB-cached wrapper).
3. **React Context** — shared UI state (filters, themes).

### App layout

Feature modules live at `apps/application-dashboard/src/modules/<feature>/` with colocated `components/`, `hooks/`, `types/`, `utils/`, `skeletons/`, and `__tests__/`. The `__tests__` folder mirrors the module root (not the `utils/` subfolder).

### API pattern

All endpoints use RTK Query's `injectEndpoints()` with cache tags and `transformResponse` for normalization. Endpoint constants are centralized in `apiEndpoint.constants.ts`. Use template variables (`{{organizationId}}`, `{{widgetId}}`) with `formRequestUrlWithParams`.

## Framework specifics (project-relevant only)

- **React Compiler enabled** (`reactCompiler: true` in `next.config`) — auto-memoization makes most explicit `useCallback`/`useMemo` redundant. See component rules.
- **Turbopack for dev, webpack for production** (`npm run build` uses `--webpack`). Output: `standalone` for Docker.
- **No `middleware.ts`** — deprecated in Next.js 16; use the `proxy.ts` pattern.

## Conventions (project-specific)

- **Path alias** `@/*` → `apps/application-dashboard/src/*`.
- **Type suffix**: every exported type/interface ends with `Type` (e.g. `WidgetDataType`, `CredentialResponseType`). Exception: props interfaces still end with `Props` (e.g. `ButtonProps`) — do not double-suffix to `ButtonPropsType`.
- **`defaultFnType`** — use the shared alias from `@/types/commonTypes` for no-arg, no-return callback props instead of writing `() => void` inline. For callbacks with args/return values, write the signature explicitly.
- **`cn` utility** — import from `@zamp-platform/ui/utils` for any composed className. Never concatenate with template strings or `&&`-with-strings; it breaks Tailwind class dedup and the prettier-tailwind sort.
- **Component typing** — never use `React.FC` / `React.FunctionComponent`. Type props inline: `({ prop }: Props) => { ... }`.
- **Type co-location** — module-specific types in `src/modules/<feature>/types/<feature>.types.ts`; API shapes in `src/types/api/<domain>.types.ts`. Skeleton components are exempt and may declare props inline.
- **Pure functions live in `utils/`** — every pure transformer/validator/formatter goes in `src/modules/<feature>/utils/<feature>.utils.ts` with unit tests in `src/modules/<feature>/__tests__/<feature>.utils.test.ts`.
- **Hook return shape** — custom hooks return an object of state/handlers, never a bare function.
- **Async preference** — for single mutation + side effect, prefer `.then()/.catch()` over `try/catch`. Use `async/await + try/catch` only when coordinating multiple awaited steps inline.
- **Tailwind v4** with `cva` for variants, semantic kebab-case color tokens, prettier-plugin-tailwindcss sort, print width 120, single quotes. Animations use `motion` (framer-motion v12+).

For full React/component authoring rules (component internal structure order, `useEffect` placement, `useCallback` guidance, defensive programming, skeleton components, styling specifics), see `.claude/rules/react-components.md` — it loads automatically when working with `.ts`/`.tsx` files.

## Skills & workflows

- **End-to-end QA** — use the `zamp-dev-workflow` skill for all browser verification. Never mark a UI task done after only visual checks; the skill enforces the full interaction flow.
- **Commits & PRs** — use the `pr-workflow` skill. Conventional Commits required (`feat:`, `fix:`, `docs:`, `chore:`, `perf:`, `refactor:`).

## Environment

- Node.js ≥20.9.0, npm 10.5.0
- Dev memory: `NODE_OPTIONS='--max-old-space-size=8192'`
- Secrets via `sync-secrets.sh` (vault-based) — never hardcode
- Feature flags: LaunchDarkly
- Monitoring: Sentry, PostHog, Vercel Speed Insights
