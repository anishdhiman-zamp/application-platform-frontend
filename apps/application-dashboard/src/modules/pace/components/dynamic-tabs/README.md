# Dynamic Tabs

A registry-driven tab system for the Pace module. Each tab type (file, task, etc.) is declared once in a central registry, and all URL building, parsing, navigation, and state management flows from that single definition.

## Architecture

```
tab-type-registry.ts   — Declarative registry mapping tab types ↔ URLs
useTabRouter.ts        — Low-level navigation hook (history vs router)
useDynamicTabs.ts      — High-level hook exposing open/close/update/reorder
dynamic-tabs.slice.ts  — Redux slice + localStorage persistence
```

### Data flow

1. **Registry** (`tab-type-registry.ts`) defines how each tab type maps to a URL pattern.
2. **Redux slice** (`dynamic-tabs.slice.ts`) holds the list of open tabs and the active tab id. A listener middleware auto-persists tabs to localStorage on every mutation.
3. **`useTabRouter`** decides _how_ to navigate — `history.pushState` for same-layout transitions (fast, no React re-render) or `router.push` for cross-layout transitions.
4. **`useDynamicTabs`** composes the slice and router into a single API that components consume.

## Tab Type Registry

Every tab type is registered in `TAB_TYPE_REGISTRY` inside `tab-type-registry.ts`. A registration is a `TabTypeDefinition` object:

```typescript
interface TabTypeDefinition {
  kind: 'query' | 'dynamic';
  basePath: string;
  paramName?: string;
  buildPath: (id: string) => string;
  parseId: (pathname: string, search: string) => string | null;
  getDefaultName: (id: string) => string;
}
```

| Field | Purpose |
|---|---|
| `kind` | `'query'` for `?param=id` URLs, `'dynamic'` for `/base/:id` URLs |
| `basePath` | The pathname prefix this type lives under |
| `paramName` | For query-based types, the search param key (e.g. `'f'`) |
| `buildPath` | Produces a full URL path from a tab id |
| `parseId` | Extracts a tab id from a URL, or returns `null` if no match |
| `getDefaultName` | Derives a display name from a raw id |

### Built-in types

| Type | Kind | Example URL |
|---|---|---|
| `file` | query | `/chat?f=docs/readme.md` |
| `task` | dynamic | `/chat/task/abc-123` |

## Adding a New Tab Type

### 1. Register the type constant

In `pace.types.ts`, add a new entry to `TAB_TYPE`:

```typescript
export const TAB_TYPE = {
  FILE: 'file',
  TASK: 'task',
  REPORT: 'report', // new
} as const;
```

### 2. Add a registry entry

In `tab-type-registry.ts`, add the definition to `TAB_TYPE_REGISTRY`:

```typescript
[TAB_TYPE.REPORT]: {
  kind: ROUTE_KIND.DYNAMIC,
  basePath: `${ROUTES_PATH.CHAT}/report`,
  buildPath: (id) => `${ROUTES_PATH.CHAT}/report/${encodeURIComponent(id)}`,
  parseId: (pathname) => {
    const base = `${ROUTES_PATH.CHAT}/report`;
    if (!pathname.startsWith(base + '/')) return null;
    const segments = pathname.split('/').filter(Boolean);
    const baseSegments = base.split('/').filter(Boolean);
    return segments.length > baseSegments.length
      ? decodeURIComponent(segments[baseSegments.length])
      : null;
  },
  getDefaultName: (id) => `Report ${id}`,
},
```

### 3. Create the route page (if dynamic)

For dynamic-kind tabs, create a Next.js page at the matching path:

```
app/(authenticated)/chat/report/[id]/page.tsx
```

For query-kind tabs, the existing `/chat` page handles them — just read the param.

### 4. Open tabs from your feature

```typescript
const { openTab } = useDynamicTabs({ type: TAB_TYPE.REPORT });

openTab('quarterly-q1', 'Q1 Report');
```

That's it. The registry handles URL generation, the slice handles state, and the router handles navigation.

## Hook API

### `useDynamicTabs(config?)`

The primary hook for components. Accepts an optional `config`:

| Option | Type | Description |
|---|---|---|
| `type` | `DynamicTabType` | Filters tabs to a specific type. Omit to get all tabs. |
| `onTabClose` | `(id: string) => void` | Callback when a tab is closed |
| `onTabUpdate` | `(oldId: string, newId: string) => void` | Callback when a tab id changes |
| `onFolderMove` | `(oldPath: string, newPath: string) => void` | Callback when a folder rename affects tabs |

Returns:

| Property | Description |
|---|---|
| `tabs` | Array of open `DynamicTab` objects (filtered by type if provided) |
| `activeTab` | The currently active tab, or `null` |
| `openTab(id, name, metadata?)` | Opens a tab and navigates to it |
| `closeTab(e, id)` | Closes a tab with browser-like neighbour selection |
| `closeTabsForPath(path, isFolder)` | Closes all tabs matching a file/folder path |
| `updateTab(oldId, newId, newName)` | Renames a tab (e.g. after a file rename) |
| `updateTabsForFolderMove(oldPath, newPath)` | Batch-renames tabs under a moved folder |
| `closeOtherTabs(id)` | Closes all tabs except the given one |
| `closeTabsToRight(id)` | Closes all tabs to the right of the given one |
| `closeAllTabs()` | Closes every tab and navigates to `/chat` |
| `navigateToTab(tab)` | Navigates to an already-open tab |
| `reorderTabs(newOrder)` | Reorders tabs by an array of ids |
| `isTabActive(tab)` | Returns `true` if the tab is currently active |
| `getTabById(id)` | Looks up a tab by id |
| `getTabIndex(id)` | Returns the index of a tab |
| `hasOpenTabs()` | Returns `true` if any tabs are open |
| `isOnAnyDynamicTab()` | Returns `true` if the active tab exists in the tab list |

### `useTabRouter(config?)`

Low-level navigation hook used internally by `useDynamicTabs`. You typically don't need this directly.

| Method | Description |
|---|---|
| `navigateTo(path, method?)` | Smart navigation — uses `history.pushState` for same-layout, `router.push` for cross-layout |
| `navigateToTab(tabId, tabType?)` | Sets the active tab in Redux and navigates |
| `syncFromUrl()` | Reads the current URL and syncs tab state (called on mount and `popstate`) |

## Redux Slice

The `dynamicTabs` slice in `store/slices/dynamic-tabs.slice.ts` manages:

- `tabs: DynamicTab[]` — ordered list of open tabs
- `activeTabId: string | null` — the currently focused tab

A `createListenerMiddleware` automatically persists the tab list to localStorage whenever tabs are opened, closed, updated, reordered, or cleared. Tabs are rehydrated from localStorage on app startup.

### Selectors

| Selector | Returns |
|---|---|
| `selectDynamicTabs` | All open tabs |
| `selectActiveTabId` | The active tab id |
| `selectActiveTab` | The full active tab object |
| `selectTabsByType(state, type)` | Tabs filtered by type |
