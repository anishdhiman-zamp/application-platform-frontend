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

### Component Typing

- Do not use `React.FC` or `React.FunctionComponent` to type components; type props inline via the props interface (e.g. `({ prop }: Props) => { ... }`)

### Component Internal Structure

Follow this order within React components and custom hooks:

1. **State** — `useState`, `useRef`
2. **Derived State** — `useMemo`, computed values, context
3. **Hooks** — Custom hooks, RTK Query hooks, mutations
4. **Handlers** — `useCallback` wrapped event handlers (and any `useCallback` wrappers used by effects)
5. **Effects** — `useEffect`, `useLayoutEffect`. Always placed at the bottom, just before render.
6. **Render** — Early returns, JSX

If Derived State depends on the output of a Hook (e.g. `useMemo` over `data` from `useGetXQuery`), the Hooks block may come before Derived State — keep all hooks of the same kind grouped, and keep Effects last regardless.

### useEffect Convention

When a `useEffect` has more than a single statement, extract the logic into a named `useCallback` function (in the Handlers block) and call it from the effect. Single-statement effects are fine inline.

The `useEffect` block always lives at the bottom of the component/hook body, after Handlers and immediately before render — never interleaved with handlers or hooks.

### Function Prop Types

Never write `() => void` inline for callback props. Use the shared `defaultFnType` alias from `@/types/commonTypes` (`type defaultFnType = () => void`) for all no-arg, no-return callbacks. This keeps prop signatures consistent across the codebase and makes intent obvious.

```ts
// ❌ Bad
interface Props {
  onClose: () => void;
}

// ✅ Good
import type { defaultFnType } from '@/types/commonTypes';
interface Props {
  onClose: defaultFnType;
}
```

For callbacks that take arguments or return a value, write the signature explicitly (no shared alias).

### Defensive Programming

- **Always early-return on null / undefined inputs.** Any function that accepts a value which could be `null` / `undefined` (props, hook returns, API responses, route params) must guard with an early return at the top of the function. Do not let `undefined` flow through downstream logic.
- **Add null/optional-chain guards across the codebase.** Use `?.`, `??`, and explicit `if (!x) return ...` checks even when the type system says the value is non-nullable — runtime data from APIs, query params, and async sources can still be `undefined` in practice. Defensive guards have no cost and prevent runtime crashes.
- **Hook return values must be plain data/handlers, never a wrapper function.** Custom hooks should return an object of constants (state, derived values, callbacks). Do not return a function as the hook's whole return value (e.g. `return () => doSomething`). Consumers expect a stable shape they can destructure, and a function-only return forces every consumer to invoke before using.

```ts
// ❌ Bad — no guard, hook returns a function
const useFoo = (id: string) => {
  return () => {
    api.fetch(id).then(...);
  };
};

// ✅ Good — early return, hook returns named handlers/state
const useFoo = (id: string | null) => {
  if (!id) return { isReady: false, handleFetch: noop };

  const handleFetch = useCallback(() => api.fetch(id), [id]);
  return { isReady: true, handleFetch };
};
```

### Don't Reach for `useCallback` By Default

Don't wrap every handler in `useCallback`. With React Compiler enabled (`reactCompiler: true` in `next.config`), inline handlers are auto-memoized — explicit `useCallback` adds noise without benefit in most cases.

Only use `useCallback` when:

1. The function is a **dependency of another hook** (`useEffect`, `useMemo`, another `useCallback`) — without it, the dependent hook re-runs every render.
2. The function is passed to a **deeply-memoized child** (`React.memo`, `forwardRef` + `memo`) where referential stability actually changes behavior.
3. The function is **returned from a custom hook** as part of its public API — consumers depend on a stable identity.

For plain inline `onClick` / `onChange` handlers on an unmemoized component, write a regular function:

```tsx
// ❌ Avoid — useCallback adds noise without doing anything useful
const handleClick = useCallback(() => setOpen(true), []);
return <Button onClick={handleClick}>Open</Button>;

// ✅ Prefer
const handleClick = () => setOpen(true);
return <Button onClick={handleClick}>Open</Button>;

// ✅ Also fine — direct inline when handler is one liner
return <Button onClick={() => setOpen(true)}>Open</Button>;
```

Same principle applies to `useMemo`: don't wrap a 2-op derivation; only memoize when the computation is genuinely expensive or the reference is consumed by another hook's deps.

### Async Flow: Prefer `.then()/.catch()` Over `try/catch`

For promise-returning calls (RTK Query mutations, `fetch`, any API call), prefer the `.then().catch()` chain over `async/await` wrapped in `try/catch`. The chain reads as a linear flow of success vs. failure handlers, plays nicely with `.unwrap()` from RTK Query, and avoids needing to remember to `await` inside guarded blocks.

```ts
// ❌ Avoid
const handleSave = async () => {
  try {
    await updateCredential(payload).unwrap();
    toast.success('Saved');
    onClose();
  } catch {
    toast.error('Failed to save');
  }
};

// ✅ Prefer
const handleSave = () => {
  updateCredential(payload)
    .unwrap()
    .then(() => {
      toast.success('Saved');
      onClose();
    })
    .catch(() => {
      toast.error('Failed to save');
    });
};
```

`async/await` + `try/catch` is still acceptable when you need to coordinate multiple awaited steps inline (e.g. read a file, then upload, then patch metadata) — but the default for a single mutation + side effect is the chain form.

### Pure Functions Live in `utils`

- **Move every pure function out of components/hooks into the module's `utils` file.** A function is "pure" if it has no side effects — no `useState`/`setState`, no API calls, no `toast`, no DOM access, no `crypto.randomUUID()` reads of external clocks/randomness _that the caller cares about_. If it just transforms inputs into outputs, it belongs in `src/modules/<feature>/utils/<feature>.utils.ts` (or a shared util file).
- This includes single-arg helpers, multi-arg transformers, factories, mappers, validators, formatters, and reducers — anything that doesn't touch React state or external I/O.
- Closures over component state that are extracted into `useCallback` are **not** pure (they read the closure) — leave those as inline handlers.
- **Every pure function in `utils` must have unit tests.** Tests live at `src/modules/<feature>/__tests__/<feature>.utils.test.ts`. The `__tests__` folder mirrors the module root, not the `utils` subfolder. Cover the happy path + edge cases (empty input, null/undefined, boundary values).

```ts
// ✅ Good — pure transformer in utils, fully tested
// src/modules/credentials-vault/utils/credentials-vault.utils.ts
export const credentialKeysToBody = (keys: CredentialKeyType[]): Record<string, string> => /* ... */;

// src/modules/credentials-vault/__tests__/credentials-vault.utils.test.ts
describe('credentialKeysToBody', () => {
  it('skips empty rows', () => { /* ... */ });
  it('trims keys and values', () => { /* ... */ });
});
```

### Type / Interface Naming & Placement

- **Always end type and interface names with the `Type` suffix** (e.g. `CredentialResponseType`, `CredentialDialogPropsType`, `WidgetDataType`). Do not use bare names like `Credential` or `User` for types — keeps types visually distinct from values/components throughout the codebase.
- **Co-locate types in a module's `types/` folder.** Module-specific types live in `src/modules/<feature>/types/<feature>.types.ts`. API shapes live in `src/types/api/<domain>.types.ts`. Avoid declaring exported types inline at the top of component files; only purely-private inline interfaces (used in a single component file) may stay inline.
- **Props interfaces** still end with `Props` per existing convention (e.g. `ButtonProps`) — `Props` is itself the type-suffix for that case, so don't double up to `ButtonPropsType`. Apply `Type` suffix only where `Props` is not already there.

### Skeleton Components

- **Each module owns its skeleton components in a dedicated `skeletons/` folder** under the module: `src/modules/<feature>/skeletons/<Name>Skeleton.tsx`. Do not declare skeleton components inline at the top of feature components.
- **Skeletons are reusable presentational components** — extract any inline `<div>` cluster of `<Skeleton />` blocks into a named component the moment it's used.
- **Repeated rows take a `rowCount` prop** so callers can size the skeleton to the expected data length. Default the prop to a reasonable number (e.g. `3`).
- Skeleton component names end with `Skeleton` (e.g. `CredentialDialogSkeleton`, `DatasetTableSkeleton`).
- **Skeleton prop types are exempt from the "co-locate types in `types/`" rule.** Declare the skeleton's props interface inline in the skeleton file itself (still with the `Type` suffix). Skeletons are leaf presentational components and their props are rarely shared.

```tsx
// ✅ Good — src/modules/credentials-vault/skeletons/CredentialDialogSkeleton.tsx
interface CredentialDialogSkeletonPropsType {
  rowCount?: number;
}

const CredentialDialogSkeleton = ({ rowCount = 2 }: CredentialDialogSkeletonPropsType) => (
  <div className='flex flex-col gap-6'>
    {Array.from({ length: rowCount }).map((_, idx) => (
      <Skeleton key={idx} className='h-10 w-full' />
    ))}
  </div>
);
```

### Styling

- **Always use `cn` for dynamic classNames.** Any time a className is composed from a base + a conditional, an array, or a prop-driven variant, wrap it in `cn(...)` from `@zamp-platform/ui/utils`. Never concatenate with template strings, ternaries returning `'foo bar'`, or `&& 'class-name'` — these don't dedupe Tailwind classes and break the prettier-plugin-tailwindcss class sort.

```tsx
// ❌ Bad
<div className={`flex items-center ${isActive ? 'bg-blue-500' : 'bg-gray-100'}`} />
<div className={'flex' + (disabled && ' opacity-50')} />

// ✅ Good
<div className={cn('flex items-center', isActive ? 'bg-blue-500' : 'bg-gray-100')} />
<div className={cn('flex', disabled && 'opacity-50')} />
```

Static-only classNames may stay as plain string literals.

### Styling (Tailwind / motion)

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

### End-to-End QA with browser-use

After building any user-facing feature, **always** run a full end-to-end integration test using the `browser-use` CLI skill before marking the work as done. This is not optional — visual inspection alone is insufficient.

**Setup:**

```bash
pip install --break-system-packages browser-use playwright
playwright install chromium
playwright install-deps chromium
```

**Coder workspace URL:** Construct from environment variables:

```
https://3000--${CODER_WORKSPACE_AGENT_NAME}--${CODER_WORKSPACE_NAME}--${CODER_WORKSPACE_OWNER_NAME}.${CODER_DOMAIN}
```

> **If the port-forwarded URL (port 3000) is not accessible**, ask the user to configure it in their Coder workspace settings. This is a manual step that only the user can perform — you cannot set up port forwarding.

**Login flow (must complete before testing authenticated pages):**

```bash
browser-use open "<coder-url>/login"
browser-use state                          # Find email input index
browser-use input <idx> "admin@zamp.ai"
browser-use eval "document.querySelector('button[type=submit]').click(); 'ok'"
# Wait for method selection, click "Sign in with Password"
browser-use click <password-btn-idx>
# Fill email + password, click submit
browser-use input <email-idx> "admin@zamp.ai"
browser-use input <pwd-idx> 'Zamp@123Zamp@!@#'
browser-use eval "document.querySelector('button[type=submit]').click(); 'ok'"
# Wait 8s for redirect, then navigate to target page
```

**QA checklist — test ALL of these for every feature:**

1. **Page renders** — `browser-use screenshot` + verify title, key elements via `browser-use state`
2. **All interactive elements present** — buttons, inputs, dropdowns, tabs all appear in `browser-use state`
3. **Full interaction flow** — don't just verify elements exist, actually interact:
   - Fill every input field (`browser-use input <idx> "value"`)
   - Click every button (`browser-use click <idx>`)
   - Verify the result (screenshot + state check)
4. **Form submission** — fill form → submit → verify success (dialog closes, list updates, toast appears)
5. **Dark mode** — toggle via `browser-use eval "document.documentElement.classList.add('dark'); document.body.classList.add('dark-mode')"` and screenshot
6. **Error states** — test with invalid input, verify error messages appear
7. **Empty states** — verify empty state messaging when no data exists
8. **API integration** — verify API calls succeed by checking that data appears after creation

**Critical rule:** Never mark QA as "done" after only visual checks. The #1 failure mode is verifying a modal opens but not testing the full submit flow.

**browser-use commands reference:**

```bash
browser-use open <url>              # Navigate
browser-use state                   # Get interactive elements with indices
browser-use click <index>           # Click element
browser-use input <index> "text"    # Fill input
browser-use type "text"             # Type into focused element
browser-use keys "Enter"            # Press key
browser-use screenshot [path.png]   # Take screenshot
browser-use eval "js code"          # Execute JavaScript
browser-use get title               # Page title
browser-use close                   # Close browser
```

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
