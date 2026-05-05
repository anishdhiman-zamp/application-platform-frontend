# Frontend State Management and Performance Audit

Date: 2026-05-04

Scope: static audit of `apps/application-dashboard`, `packages/chat`, and `packages/conversation-stream`, focused on frontend state flow, render pressure, streaming performance, data fetching, and bundle risk.

## Executive Summary

The app has a solid durable-state foundation with Redux Toolkit and RTK Query, plus a more specialized external store for streaming chat state. The highest-impact risks are concentrated in PACE/chat: broad context provider values, high-frequency streaming updates, full-array scans during message/task updates, and a few selectors that subscribe more broadly than needed.

The first fixes should be small and low risk:

1. Remove the full Redux-store subscription in `useTriggerSelector`.
2. Route global streaming content deltas through the existing RAF-buffered `streamingStateStore.bufferDelta()` path.
3. Split broad PACE/chat contexts into narrower state and action contexts.
4. Review RTK Query refetch defaults and make freshness explicit per endpoint.

## Current State Architecture

### Durable App State

- Redux store is configured in `apps/application-dashboard/src/store/index.tsx`.
- RTK Query APIs are mounted through `baseApi` and `chatApi`.
- App-level providers are mounted through `apps/application-dashboard/src/app/_providers/providers.tsx` and `layout-providers.tsx`.

### PACE State

`apps/application-dashboard/src/modules/pace/pace.context.tsx` owns a broad set of UI and workflow state:

- Chat sidebar state.
- Active conversation id.
- Pending file references and mention inserts.
- Shared file references.
- Active agent info.
- Sidebar, files panel, and tree column widths.
- Resize flags.
- Panel expansion flags.
- Word wrap state.
- Selected model.
- Navigation sidebar expansion.
- Route reconciliation callbacks.

This makes `PaceContext` a central coordination layer, but also a render hotspot.

### Chat and Streaming State

`packages/chat/src/stores/streamingStateStore.ts` provides a global external store keyed by conversation id. It already supports:

- `useSyncExternalStore` subscriptions through `useStreamingState`.
- Conversation-keyed listeners.
- A RAF-buffered `bufferDelta()` path for high-frequency content deltas.

`packages/conversation-stream` already uses the buffered path for per-conversation streaming events, while `apps/application-dashboard/src/app/_providers/sse-provider.tsx` still handles global stream deltas with direct `update()` calls.

## Findings

### 1. Broad PACE Context Value Causes Render Fan-Out

File: `apps/application-dashboard/src/modules/pace/pace.context.tsx`

`PaceProvider` exposes one large object containing many independent state domains and callbacks. Any change to one field creates a new context value and rerenders every consumer of `usePaceContext()`.

Likely impact:

- Sidebar resize can rerender components that only need chat actions.
- Active tab changes can rerender components that only need pending file references.
- Model selection or word-wrap changes can rerender unrelated layout pieces.

Recommendation:

- Split into smaller contexts such as `PaceLayoutContext`, `PaceConversationContext`, `PaceChatIntentContext`, and `PaceActionsContext`.
- Keep action-only context stable where possible.
- Consider selector-style external stores for very hot UI state such as resizing.

### 2. Full Redux Store Subscription in `useTriggerSelector`

File: `apps/application-dashboard/src/modules/process/knowledge-base-creation/hooks/useTriggerSelector.ts`

The hook uses:

```ts
const getState = useAppSelector((state: RootState) => state);
```

This subscribes the component to the entire Redux tree, so it rerenders on every Redux update.

Recommendation:

- Use `useStore()` or the app-level `store.getState()` inside the callback.
- Keep the RTK Query cache lookup behavior, but avoid subscribing to all state.

### 3. Global Streaming Deltas Bypass RAF Batching

File: `apps/application-dashboard/src/app/_providers/sse-provider.tsx`

The global `CONTENT_BLOCK_DELTA` path uses `streamingStateStore.update()`, which clones and notifies for each delta. The store already has `bufferDelta()` for high-frequency updates.

Recommendation:

- Move high-frequency delta mutations to `streamingStateStore.bufferDelta()`.
- Keep `TOOL_USE_BLOCK_UPDATE_DELTA` synchronous if display-name/title updates must render immediately, matching `packages/conversation-stream/src/handlers/streamingBlockHandler.ts`.

### 4. Message and Task Updates Scan Full Arrays

File: `packages/conversation-stream/src/provider/ConversationProvider.tsx`

Task updates map all messages and all blocks to find a matching `task_id`. History merge also reformats and filters complete history on each `conversationHistory` update.

Likely impact:

- Fine for short chats.
- Degrades for long conversations with many task/tool blocks.

Recommendation:

- Add an index of task block locations by `task_id`.
- Normalize messages by id for mutation-heavy flows, deriving ordered arrays only for render.
- Keep current array shape at component boundaries to avoid a large migration.

### 5. Context Values Are Not Selector-Friendly

Files:

- `apps/application-dashboard/src/modules/pace/pace.context.tsx`
- `apps/application-dashboard/src/contexts/ProcessesContext.tsx`
- `apps/application-dashboard/src/contexts/VoiceChatContext.tsx`
- `apps/application-dashboard/src/context/pendingDataset.context.tsx`
- `packages/conversation-stream/src/provider/ConversationProvider.tsx`

These contexts expose whole objects. Consumers cannot subscribe to just one field.

Recommendation:

- Split state and actions contexts first.
- For hot state, use external-store selectors.
- For small contexts, at least memoize provider values consistently.

### 6. RTK Query Refetch Default Is Aggressive

File: `packages/api/baseQuery.ts`

The shared API provider sets:

```ts
refetchOnMountOrArgChange: true;
```

Many call sites opt out, but the default can cause avoidable network churn during nested route transitions.

Recommendation:

- Consider defaulting to cache reuse and opting into freshness per endpoint.
- If global freshness is required, document it and use endpoint-level `keepUnusedDataFor`, invalidation, and polling deliberately.

### 7. Dynamic Tabs Persist Full State Often

File: `apps/application-dashboard/src/store/slices/dynamic-tabs.slice.ts`

The listener middleware serializes the full `byConversation` tab state to session storage after many tab and panel actions.

Recommendation:

- Debounce persistence.
- Persist only the changed conversation bucket where possible.
- Avoid persisting ephemeral resize state during active dragging.

### 8. Bundle Boundaries Need Ongoing Attention

Files:

- `packages/chat/index.ts`
- `apps/application-dashboard/next.config.js`

`@zamp-platform/chat` has a broad barrel export. The app also depends on heavy UI/runtime packages such as AG Grid, Milkdown, Monaco, `react-markdown`, `xlsx`, PDF/PPT viewers, `motion`, and `framer-motion`.

Positive notes:

- Several heavy viewers are already dynamically imported.
- `next.config.js` uses `optimizePackageImports`.

Recommendation:

- Run bundle analysis by route.
- Avoid importing the broad chat barrel from lightweight surfaces when a deep import is practical.
- Keep artifact viewers, editors, spreadsheet parsing, and PDF/PPT renderers route- or interaction-loaded.

## Priority Implementation Plan

### Phase 1: Low-Risk Fixes

1. Replace the full Redux subscription in `useTriggerSelector`.
2. Update global SSE delta handling to use `bufferDelta()` for high-frequency deltas.
3. Add focused tests for streaming delta handling if an existing test harness exists.

### Phase 2: PACE Context Split

1. Identify `usePaceContext()` consumers and group them by fields used.
2. Create narrower contexts for layout state, chat workflow state, and actions.
3. Move resize state into the layout context first, because it is a high-frequency UI path.
4. Keep legacy `usePaceContext()` temporarily if migration needs to be incremental.

### Phase 3: Conversation State Selectors

1. Split `ConversationActionsContext` and `ConversationStateContext` further if needed.
2. Add selector hooks for message list, queued messages, streaming flags, input-required state, and browser-streaming state.
3. Normalize task updates if profiling shows large render cost.

### Phase 4: Fetching and Bundle Review

1. Audit endpoints still relying on global `refetchOnMountOrArgChange: true`.
2. Decide endpoint freshness policies by domain.
3. Run production bundle analysis for chat, dataset, artifacts, and integrations routes.
4. Convert broad imports to narrower imports where bundle output proves a win.

## Verification Ideas

- Use React Profiler around PACE chat route while:
  - Streaming a long assistant response.
  - Resizing the sidebar and files panel.
  - Switching dynamic tabs.
  - Updating task block statuses.
- Compare render counts before and after context splitting.
- Compare streaming smoothness and main-thread time before and after `bufferDelta()` adoption.
- Run a production build bundle analysis before changing import boundaries.
