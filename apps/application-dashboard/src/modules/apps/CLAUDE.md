# Apps Module (Frontend)

Displays and manages user-created applications. Each app has a unique slug used for subdomain-based URL routing.

## Architecture

```
/chat/apps (page.tsx)
  └── AppsListingPage
        ├── SearchInput             — search by name/description
        ├── Filter tabs             — All / My apps
        ├── Accordion               — collapsible app list (@zamp-platform/ui)
        │     └── AccordionItem[]
        │           ├── AppRow      — app name, slug, visibility, service count, share
        │           └── ServiceCard[] — service grid (name, type, URL link)
        ├── AppEmptyState           — empty state with "New App" CTA
        ├── CreateAppModal          — chat-based app creation via agent
        └── ShareAppPopup           — share via FRAP (ResourceType.APP)
```

## What's Implemented

### App List (Accordion)
- Each app rendered as an `AccordionItem` with expand/collapse
- `AppRow` displays app name, slug, deterministic icon theme, visibility (globe/lock), service count via `formatPlural`
- `ServiceCard` shows service name, type badge, and URL as a Next.js `Link` (opens in new tab)
- `ShareAppPopup` triggers `ShareResourcePopup` for FRAP audience management

### Create App Modal
- Chat-based creation: user provides a name and prompt, which is sent to the agent
- Uses `ConnectedChatInput` from `@zamp-platform/chat` with intercepted `createConversationV2`
- Random placeholder prompts sourced from `APP_PLACEHOLDER_PROMPTS`

### API Integration (RTK Query)
Endpoints defined in `src/apis/apps.ts`:
- `useGetAppsQuery()` — `GET /apps` (cache tag: `GET_APPS`, `keepUnusedDataFor: 300`). Prefetched at the chat-shell layer in `useDataPrefetch` so navigation to `/chat/apps` renders directly from cache without a loader.

### Types
`AppType` includes: `id`, `slug`, `organization_id`, `name`, `description`, `status`, `visibility` (`'public' | 'private'`), `metadata`, `services` (`ServiceSummaryType[]`), `created_by`, timestamps.

## Key Files

| File | Purpose |
|------|---------|
| `AppsListingPage.tsx` | Main page — fetches apps, filters, Accordion list |
| `components/AppRow.tsx` | App row with visibility icon + service count |
| `components/ServiceCard.tsx` | Service card with type badge + URL link |
| `components/CreateAppModal.tsx` | Chat-based app creation modal |
| `components/AppEmptyState.tsx` | Empty state with "New App" CTA |
| `components/ShareAppPopup.tsx` | Share via FRAP |
| `apps.types.ts` | TypeScript interfaces and constants |
| `apps.constants.ts` | Placeholder prompts |
| `utils/appUtils.ts` | `getRandomPrompt` helper |
| `utils/iconTheme.ts` | Deterministic icon theming |
| `src/apis/apps.ts` | RTK Query endpoints |
