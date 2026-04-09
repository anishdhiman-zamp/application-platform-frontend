# Tabs Architecture - Deep Dive

This document explains the complete tabs system in the PACE module, covering how tabs are opened, closed, routed, persisted, and navigated.

---

## Table of Contents

1. [Overview](#overview)
2. [Data Structures](#data-structures)
3. [State Management (Redux + localStorage)](#state-management)
4. [Tab Type Registry (URL <-> Tab Mapping)](#tab-type-registry)
5. [Routing Architecture](#routing-architecture)
6. [useTabRouter - URL Synchronization](#usetabrouter)
7. [useDynamicTabs - Tab Operations Hook](#usedynamictabs)
8. [Task Navigation & Pagination](#task-navigation--pagination)
9. [Tab UI Components](#tab-ui-components)
10. [Sidebar State & Layout](#sidebar-state--layout)
11. [localStorage Keys](#localstorage-keys)
12. [Complete Flow Examples](#complete-flow-examples)
13. [File Index](#file-index)
14. [Current Problem: Task Pagination Opens New Tabs](#current-problem)

---

## Overview

The tabs system works like a browser or VS Code tab bar. Each entity (file, task, agent, browser preview) gets its own tab. The system has three main pillars:

1. **Redux slice** (`dynamic-tabs.slice.ts`) — Source of truth for tab list + active tab
2. **Tab Type Registry** (`tab-type-registry.ts`) — Maps tab types to URL patterns (bidirectional)
3. **useTabRouter** (`useTabRouter.ts`) — Syncs Redux state with the browser URL (bidirectional)

---

## Data Structures

### DynamicTab (pace.types.ts)

```typescript
interface DynamicTab {
  stableKey: string; // UUID — stable identity for drag-drop (dnd-kit)
  id: string; // Entity identifier: file path, task ID, or agent ID
  name: string; // Display name shown in tab bar
  path: string; // Full URL path WITH query params (e.g., "/chat/task/abc?status=pending&currentIndex=1")
  type?: DynamicTabType; // 'file' | 'task' | 'agent' | 'browser'
  icon?: string; // Optional custom icon
  metadata?: Record<string, unknown>; // Extra data (e.g., agent avatarKey)
}
```

### Tab Types

```typescript
const TAB_TYPE = {
  FILE: 'file', // Source code files
  TASK: 'task', // Tasks (human/AI tasks)
  AGENT: 'agent', // Agent detail views
  BROWSER: 'browser', // Browser preview panels
} as const;
```

### Route Kinds

```typescript
const ROUTE_KIND = {
  QUERY: 'query', // Entity ID in query param (e.g., /chat?f=src/index.ts)
  DYNAMIC: 'dynamic', // Entity ID in URL path segment (e.g., /chat/task/abc-123)
} as const;
```

---

## State Management

### Redux Slice: `dynamic-tabs.slice.ts`

**Location**: `src/store/slices/dynamic-tabs.slice.ts`

**State shape**:

```typescript
interface DynamicTabsState {
  tabs: DynamicTab[]; // Ordered list of open tabs
  activeTabId: string | null; // Currently focused tab's ID
}
```

**Actions**:

| Action                       | What it does                                                               |
| ---------------------------- | -------------------------------------------------------------------------- |
| `openTab(tab)`               | Adds tab if not exists, sets it as active. Deduplication by `id + type`.   |
| `closeTab(id)`               | Removes tab. If it was active, sets `activeTabId = null`.                  |
| `setActiveTab(id)`           | Switches the active tab (no creation/removal).                             |
| `updateTab({oldId, newTab})` | Updates a tab in-place (e.g., rename, path change). Preserves `stableKey`. |
| `reorderTabs(newOrder)`      | Reorders tabs by ID array (drag-drop).                                     |
| `clearAllTabs()`             | Removes all tabs, sets active to null.                                     |

**Selectors**:

- `selectDynamicTabs` — all tabs
- `selectActiveTabId` — active tab's ID
- `selectActiveTab` — full active tab object
- `selectTabsByType(state, type)` — tabs filtered by type

### localStorage Persistence

A Redux listener middleware auto-persists after every tab mutation:

```
openTab / closeTab / updateTab / reorderTabs / clearAllTabs
  → listener fires
  → writes tabs[] to localStorage key: PACE_OPEN_DYNAMIC_TABS
```

On app load, `hydrateTabsFromStorage()` reads from localStorage and initializes `tabs[]`. The `activeTabId` is NOT persisted — it's re-derived from the URL on mount via `syncFromUrl()`.

---

## Tab Type Registry

**Location**: `src/modules/pace/components/dynamic-tabs/tab-type-registry.ts`

This is the **central mapping** between tab types and their URL representations. Each tab type registers:

```typescript
interface TabTypeDefinition {
  kind: 'query' | 'dynamic'; // How the ID appears in the URL
  basePath: string; // Base URL path
  paramName?: string; // Query param name (for 'query' kind)
  buildPath: (id: string) => string; // id → URL
  parseId: (pathname, search) => string; // URL → id
  getDefaultName: (id: string) => string;
}
```

### Tab Type → URL Mapping

| Tab Type    | Kind    | URL Pattern              | Example                     | ID extraction                      |
| ----------- | ------- | ------------------------ | --------------------------- | ---------------------------------- |
| **FILE**    | QUERY   | `/chat?f=<encoded_path>` | `/chat?f=src%2Findex.ts`    | `searchParams.get('f')`            |
| **TASK**    | DYNAMIC | `/chat/task/<taskId>`    | `/chat/task/task-abc-123`   | Path segment after `/chat/task/`   |
| **AGENT**   | DYNAMIC | `/chat/agents/<agentId>` | `/chat/agents/agent-456`    | Path segment after `/chat/agents/` |
| **BROWSER** | QUERY   | `/chat?b=<encoded_url>`  | `/chat?b=https%3A%2F%2F...` | `searchParams.get('b')`            |

### Key Functions

- **`buildTabRoute(id, type)`** — Constructs the canonical URL for a tab (without sidebar params)
- **`getActiveTabIdFromUrl(pathname, search, type?)`** — Extracts tab ID from current URL by trying all registered parsers
- **`getTabTypeFromUrl(pathname, search)`** — Determines which tab type matches the current URL
- **`isSameBasePath(targetPath)`** — Returns `true` if current URL and target are under the same tab type. This determines whether to use `history.pushState` (fast, no layout remount) vs `router.push` (full Next.js navigation)
- **`isOnAnyTabBasePath(pathname)`** — Checks if a URL corresponds to any dynamic tab

### Why This Matters for Tasks

Currently, **tasks use `ROUTE_KIND.DYNAMIC`**, meaning the task ID is a **URL path segment**: `/chat/task/<taskId>`. This means:

- Every time you paginate to a different task, the URL path changes
- Since the path contains a different task ID, the tab system sees it as a **different entity**
- This causes either a new tab to open, or forces `router.push()` (full navigation) instead of `history.pushState()`

---

## Routing Architecture

### Two Navigation Strategies

The system uses **two different navigation mechanisms** depending on context:

1. **`window.history.pushState()`** — Used when navigating between tabs of the **same base path**. No React/Next.js re-render of the layout. Fast. Used for: switching between two FILE tabs, or two TASK tabs.

2. **`router.push()` / `router.replace()`** — Used when navigating across **different tab types** (e.g., from a file tab to a task tab). Triggers a full Next.js navigation with layout transitions.

The decision is made by `isSameBasePath()`:

```
navigateTo(path) {
  saveCurrentTabPath();  // preserve current tab's query params
  if (isSameBasePath(path)) {
    window.history.pushState(path);  // fast, no remount
  } else {
    router.push(path);  // full Next.js transition
  }
}
```

### Sidebar Param (`s`)

All navigations preserve the `?s=<conversationId>` query param via `preserveSidebarParam()`. This keeps the chat sidebar context alive across tab switches.

### Next.js Route Structure for Tasks

```
src/app/(authenticated)/chat/task/
  ├── page.tsx               ← /chat/task (task listing)
  └── [taskId]/
      └── page.tsx           ← /chat/task/:taskId (task detail)
```

The `[taskId]/page.tsx` component:

```typescript
const ChatTaskPage = () => {
  const params = useParams();
  const urlTaskId = params?.taskId as string;
  const { activeTab } = useDynamicTabs({ type: TAB_TYPE.TASK });
  const taskId = activeTab?.id ?? urlTaskId;  // prefer Redux over URL
  return <TaskContentInner key={taskId} taskId={taskId} />;
};
```

---

## useTabRouter

**Location**: `src/modules/pace/hooks/useTabRouter.ts`

This hook is the **bridge between Redux tab state and the browser URL**. It handles bidirectional sync.

### Key Methods

| Method                                         | Purpose                                                                                                   |
| ---------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `navigateTo(path, method?, skipSidebarParam?)` | Navigate to a path. Auto-detects whether to use pushState or router.push. Saves current tab's path first. |
| `navigateToTab(tabId, tabType?)`               | Switch to an existing tab. Reads the tab's stored `path` from Redux (which includes query params).        |
| `syncFromUrl()`                                | Read the current URL, create/update the corresponding tab in Redux. Used on mount and popstate.           |

### Lifecycle

```
Component Mount:
  → saveCurrentTabPath()    // preserve outgoing tab's query params
  → syncFromUrl()           // create or activate tab based on URL

Browser Back/Forward:
  → popstate event
  → saveCurrentTabPath()
  → syncFromUrl()

Tab Click:
  → navigateToTab(id, type)
  → reads stored path from Redux (includes saved query params)
  → navigateTo(storedPath)
```

### Recently Closed Tracking

When a tab is closed, its ID is added to `recentlyClosedTabIds` (a `Set`) for 500ms. This prevents `syncFromUrl()` from accidentally re-creating the tab during async navigation transitions.

### saveCurrentTabPath()

Before navigating away from a tab, this function reads the **current URL** (including all query params like `status`, `currentIndex`, `parentTasks`, etc.) and writes it back to the tab's `path` in Redux. This means when you click back to that tab, it restores the exact URL you were on.

---

## useDynamicTabs

**Location**: `src/modules/pace/components/dynamic-tabs/useDynamicTabs.ts`

This is the **main hook** consumers use for tab operations. It wraps Redux dispatch + useTabRouter.

### Key Operations

| Method                              | What it does                                                              |
| ----------------------------------- | ------------------------------------------------------------------------- |
| `openTab(id, name, metadata?)`      | Creates a tab in Redux + navigates to it                                  |
| `closeTab(e, id)`                   | Closes tab, navigates to neighbor (browser-like: prefer right, then left) |
| `closeTabsForPath(path, isFolder)`  | Closes all tabs under a folder path                                       |
| `updateTab(oldId, newId, newName)`  | Renames/updates a tab (e.g., file rename)                                 |
| `updateTabsForFolderMove(old, new)` | Batch-updates all tabs when a folder is moved                             |
| `closeOtherTabs(id)`                | Keeps only the specified tab                                              |
| `closeTabsToRight(id)`              | Closes all tabs after the specified one                                   |
| `closeAllTabs()`                    | Clears everything, navigates to /chat                                     |
| `navigateToTab(tab)`                | Switches to an existing tab                                               |
| `reorderTabs(newOrder)`             | Updates tab order after drag-drop                                         |

### Tab Close Navigation Logic

When closing the active tab, the system uses `getNextNavigationTarget()` with `NAVIGATION_STRATEGY.BROWSER_LIKE`:

- Prefers the tab to the **right** of the closed tab
- Falls back to the tab to the **left**
- If no tabs remain, navigates to `/chat`

---

## Task Navigation & Pagination

**Location**: `src/modules/pace/hooks/useTaskNavigation.ts`

This is the most complex part. Task pagination uses **URL query params** to track position.

### Query Parameters Used for Tasks

| Param          | Purpose                                              | Example                                              |
| -------------- | ---------------------------------------------------- | ---------------------------------------------------- |
| `status`       | Current task status group                            | `pending`                                            |
| `currentIndex` | 1-based position within the status group             | `3` (means index 2)                                  |
| `totalRows`    | Total tasks in this status group                     | `15`                                                 |
| `title`        | Task title for display                               | `Review PR`                                          |
| `s`            | Sidebar conversation ID                              | `conv-abc`                                           |
| `parentTasks`  | JSON array of parent task breadcrumbs                | `[{"id":"t1","title":"Parent"}]`                     |
| `siblings`     | JSON array of sibling tasks (for subtask navigation) | `[{"id":"t2","title":"Sibling","status":"pending"}]` |

### Navigation Flow (Arrow Buttons)

```
User clicks "Next" arrow
  → navigateToTask('next')
  → Calculates targetIndex = currentIndex + 1
  → If same page: uses cached data
  → If different page: fetches via RTK Query
  → Gets targetTask from the page
  → Calls router.replace(getChatTaskRoute({...}))
    → URL changes to /chat/task/<NEW_TASK_ID>?status=...&currentIndex=...
    → This is a FULL URL PATH CHANGE (task ID in path!)
    → Next.js re-renders [taskId]/page.tsx with new params
```

### getChatTaskRoute (routeConfig.ts)

Constructs the full task URL:

```typescript
getChatTaskRoute({ taskId, conversationId, taskTitle, status, currentIndex, totalRows, parentTasks, siblings })
  → "/chat/task/<taskId>?s=conv-123&title=Review&status=pending&currentIndex=3&totalRows=15"
```

**The task ID is embedded in the URL PATH** (`/chat/task/<taskId>`), not as a query param.

### Bootstrap Logic

When a task page loads without pagination context (e.g., direct link), the hook:

1. Fetches task counts per status
2. Iterates through all status groups and pages
3. Finds the task's position
4. Calls `router.replace()` with the full pagination context

### Live Updates (SSE)

The hook subscribes to `TASK_UPDATE` SSE events. When the current task's status changes:

1. Fetches fresh counts
2. Searches for the task in its new status group
3. Updates the URL with `router.replace()`

### Two Navigation Modes

1. **Standard navigation**: Navigates through all tasks in all status groups (used when viewing from the main task list)
2. **Sibling navigation**: Navigates only through sibling subtasks (used when viewing subtasks of a parent task, with `siblings` param in URL)

---

## Tab UI Components

### DynamicTabsBar (`DynamicTabsBar.tsx`)

- Renders the tab bar with drag-and-drop via `@dnd-kit`
- Handles overflow with `OverflowTabsPopover` when tabs exceed available width
- Uses Framer Motion (`AnimatePresence`) for tab open/close animations
- Collapses sidebar when switching tabs from expanded state

### DynamicTabItem (`DynamicTabItem.tsx`)

- Renders individual tab with icon, name, and close button
- Icon is dynamic based on tab type (file extension icon, route icon, agent avatar, globe)
- Wraps in `DynamicTabContextMenu` for right-click actions

### DynamicTabContextMenu (`DynamicTabContextMenu.tsx`)

- Right-click context menu with: Close, Close Others, Close to Right, Close All
- Actions are filtered based on tab position and total count

### SortableDynamicTabItem (`SortableDynamicTabItem.tsx`)

- `@dnd-kit` wrapper around `DynamicTabItem` for drag reorder

---

## Sidebar State & Layout

### PaceContext (`pace.context.tsx`)

Manages layout state including:

- `chatSidebarState`: EXPANDED | COLLAPSED | SIDEBAR
- Sidebar and files panel widths (persisted to localStorage)
- Files panel open/pinned state

### State Transitions

- Clicking a tab while sidebar is EXPANDED → switches to SIDEBAR (pin beside content)
- Closing the last tab → may schedule sidebar collapse
- Route changes trigger reconciliation based on URL + sidebar param

---

## localStorage Keys

| Key                             | Content                                                   | Type                                       |
| ------------------------------- | --------------------------------------------------------- | ------------------------------------------ |
| `PACE_OPEN_DYNAMIC_TABS`        | Full tab list (id, name, path, type, stableKey, metadata) | JSON array                                 |
| `PACE_SIDEBAR_STATE`            | Chat sidebar state                                        | `'expanded'` / `'collapsed'` / `'sidebar'` |
| `PACE_SIDEBAR_WIDTH`            | Sidebar pixel width                                       | number                                     |
| `PACE_FILES_PANEL_WIDTH`        | Files panel pixel width                                   | number                                     |
| `PACE_FILES_PANEL_PINNED`       | Whether files panel is pinned                             | boolean                                    |
| `PACE_FILE_TREE_EXPANDED_PATHS` | Expanded folder paths in file tree                        | JSON set                                   |
| `PACE_SELECTED_MODEL`           | Last selected LLM model                                   | string                                     |

---

## Complete Flow Examples

### Example 1: User Double-Clicks a File in the File Tree

```
1. FileTreeNode.handleDoubleClick(filePath, fileName)
2. → useDynamicTabs.openTab('src/index.ts', 'index.ts')
3.   → dispatch(openTab({ id: 'src/index.ts', name: 'index.ts', path: '/chat?f=src%2Findex.ts', type: 'file' }))
4.   → Redux: tab added to tabs[], activeTabId = 'src/index.ts'
5.   → Listener: persists tabs[] to localStorage
6.   → navigateTo('/chat?f=src%2Findex.ts')
7.     → isSameBasePath() checks: is current URL also under /chat with ?f= ?
8.       → YES: window.history.pushState('/chat?f=src%2Findex.ts')  [fast]
9.       → NO:  router.push('/chat?f=src%2Findex.ts')  [full nav]
```

### Example 2: User Clicks a Task in the Task List

```
1. Task list item clicked → navigates to /chat/task/<taskId>?status=pending&currentIndex=1&totalRows=10
2. Next.js renders [taskId]/page.tsx
3. useTabRouter.syncFromUrl() fires on mount:
   → getActiveTabIdFromUrl() parses pathname → extracts taskId
   → Tab doesn't exist in Redux → dispatches openTab()
   → Tab bar shows new task tab
4. TaskContentInner renders with taskId
5. useTaskNavigation bootstraps: already has pagination context from URL params
```

### Example 3: User Clicks "Next" Arrow on a Task (THE PROBLEM)

```
1. User clicks → on task detail page
2. useTaskNavigation.goToNextTask() → navigateToTask('next')
3. Computes targetIndex, fetches target task data
4. router.replace('/chat/task/<DIFFERENT_TASK_ID>?status=pending&currentIndex=2&totalRows=10')
5. *** URL PATH changes from /chat/task/old-id → /chat/task/new-id ***
6. Next.js re-renders the [taskId] page
7. useTabRouter.syncFromUrl() detects new URL:
   → getActiveTabIdFromUrl() returns the NEW task ID
   → NEW task ID doesn't match any existing tab
   → Creates a NEW tab for the new task (if not prevented)
   OR
   → The page component re-renders with key={taskId} which changes
8. Result: Either a new tab opens, or the tab system gets confused
```

### Example 4: Switching Back to a Tab

```
1. User clicks a tab in the tab bar
2. DynamicTabsBar → navigateToTab(tab)
3. → useTabRouter.navigateToTab(tabId, tabType)
4.   → Reads tab.path from Redux (includes saved query params!)
5.   → e.g., '/chat/task/abc?status=pending&currentIndex=3&totalRows=10'
6.   → navigateTo(storedPath)
7. Tab's exact state is restored (pagination position, etc.)
```

---

## File Index

### Core Tab Infrastructure

| File                                                            | Purpose                                                        |
| --------------------------------------------------------------- | -------------------------------------------------------------- |
| `src/store/slices/dynamic-tabs.slice.ts`                        | Redux slice: tab state + localStorage persistence              |
| `src/modules/pace/pace.types.ts`                                | Type definitions: DynamicTab, TAB_TYPE, ROUTE_KIND, NAV_METHOD |
| `src/modules/pace/components/dynamic-tabs/tab-type-registry.ts` | URL ↔ tab type mapping registry                                |
| `src/modules/pace/hooks/useTabRouter.ts`                        | URL ↔ Redux bidirectional sync                                 |
| `src/modules/pace/components/dynamic-tabs/useDynamicTabs.ts`    | Main consumer hook for tab operations                          |

### Tab UI

| File                                                                  | Purpose                                     |
| --------------------------------------------------------------------- | ------------------------------------------- |
| `src/modules/pace/components/dynamic-tabs/DynamicTabsBar.tsx`         | Tab bar container with drag-drop + overflow |
| `src/modules/pace/components/dynamic-tabs/DynamicTabItem.tsx`         | Single tab rendering                        |
| `src/modules/pace/components/dynamic-tabs/SortableDynamicTabItem.tsx` | Drag-enabled tab wrapper                    |
| `src/modules/pace/components/dynamic-tabs/DynamicTabContextMenu.tsx`  | Right-click menu                            |
| `src/modules/pace/components/dynamic-tabs/OverflowTabsPopover.tsx`    | Overflow tabs popover                       |
| `src/modules/pace/components/dynamic-tabs/dynamic-tabs.utils.tsx`     | Icon + name helpers                         |

### Task Navigation

| File                                                  | Purpose                                                      |
| ----------------------------------------------------- | ------------------------------------------------------------ |
| `src/modules/pace/hooks/useTaskNavigation.ts`         | Task pagination, arrow navigation, SSE updates               |
| `src/constants/routeConfig.ts`                        | `getChatTaskRoute()` — builds task URLs; `TASK_QUERY_PARAMS` |
| `src/app/(authenticated)/chat/task/[taskId]/page.tsx` | Next.js page for task detail                                 |
| `src/app/(authenticated)/chat/task/page.tsx`          | Next.js page for task listing                                |

### Layout & Context

| File                                  | Purpose                                       |
| ------------------------------------- | --------------------------------------------- |
| `src/modules/pace/pace.context.tsx`   | Sidebar state, files panel, layout management |
| `src/modules/pace/pace.utils.ts`      | `preserveSidebarParam()` and URL utilities    |
| `src/modules/pace/pace.constants.tsx` | Constants                                     |

### Entry Points (What Opens Tabs)

| File                                                                 | How it opens tabs                                           |
| -------------------------------------------------------------------- | ----------------------------------------------------------- |
| `src/modules/pace/components/files/FileTreeNode.tsx`                 | Double-click → `openTab(filePath, fileName)`                |
| `src/modules/pace/components/agents/components/AgentListingPage.tsx` | Click agent → `openTab(agentId, agentName)`                 |
| `src/modules/pace/components/agents/components/AgentPill.tsx`        | Click agent pill → `openTab(agentId, agentName)`            |
| Task list components                                                 | Navigate to `/chat/task/<id>` → `syncFromUrl()` creates tab |

---

## Current Problem

### Task Pagination Opens New Tabs (or Causes Full Re-renders)

**Root cause**: Tasks use `ROUTE_KIND.DYNAMIC` — the task ID is in the **URL path segment** (`/chat/task/<taskId>`).

When you paginate (click next/previous arrow):

1. `useTaskNavigation` calls `router.replace('/chat/task/<NEW_ID>?...')`
2. The URL **path** changes (different task ID)
3. Next.js sees a different `[taskId]` param → re-renders the page
4. `syncFromUrl()` sees a new task ID → may create a new tab

### Proposed Solution: Move to Query-Param Based Task ID

Change tasks from `ROUTE_KIND.DYNAMIC` to `ROUTE_KIND.QUERY`:

**Before**: `/chat/task/<taskId>?status=pending&currentIndex=1`
**After**: `/chat/task?t=<taskId>&status=pending&currentIndex=1`

This means:

1. The **base path stays the same** (`/chat/task`) during pagination
2. Only **query params** change when navigating between tasks
3. `isSameBasePath()` returns `true` → uses `history.pushState()` (fast, no remount)
4. The tab's `id` would need to be the **tab instance** (not the task ID), or the tab would update in-place
5. The tab would stay the same; only its stored `path` (with query params) would update

### Key Files to Modify

1. **`tab-type-registry.ts`** — Change TASK entry from DYNAMIC to QUERY kind
2. **`routeConfig.ts`** — Update `getChatTaskRoute()` and `ROUTES_PATH.CHAT_TASK`
3. **`useTaskNavigation.ts`** — Change `router.replace()` calls to update query params
4. **`[taskId]/page.tsx`** — Move from `useParams()` to reading task ID from query params
5. **`useDynamicTabs.ts` / `useTabRouter.ts`** — May need adjustments for query-based task tabs
6. **Next.js route structure** — May collapse `[taskId]/page.tsx` into `task/page.tsx`
