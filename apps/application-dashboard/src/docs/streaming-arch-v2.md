# Streaming Architecture Migration — Design Document

**Date:** March 31, 2026
**Status:** Ready for implementation
**Scope:** PACE chat frontend — per-conversation SSE + component decoupling

---

## Problem Statement

The PACE chat frontend has three critical architectural issues:

### 1. Single Global SSE — No Conversation Isolation

A single `GET /events` SSE connection multiplexes ALL events (conversations, tasks, activity logs, datasets). The frontend filters events client-side using `source_id` and `streaming_id`. This means:

- Switching conversations loses streaming context
- No way to show which conversations are actively streaming in the sidebar
- Page refresh during streaming loses all in-flight state

### 2. Massive Re-render Cascade

`useChat` returns a new object on every `content_block_delta` (dozens per second), triggering a cascade:

```
content_block_delta arrives
  → streamingStateStore.update() creates new object (spread operator)
    → useSyncExternalStore triggers re-render
      → useChat re-renders (new streamingState reference)
        → ChatConversationContent re-renders
          → useEffect fires onChatStateChange(chat)  ← chat is new object every render
            → ChatSidebarInner re-renders via setChatState
              → ConnectedChatInput re-renders
                → useChatInput re-renders
                  → ChatComposer re-renders
```

This causes "Maximum update depth exceeded" errors, especially with multiple concurrent streams.

### 3. Tight Coupling

- `useChatInput` takes `ReturnType<typeof useChat>` — the entire 20+ field object
- `ConnectedChatInput` depends on the full `chat` prop
- Any state change in `useChat` re-renders the entire input pipeline

### 4. Laggy Streaming & Layout Shift

- Text appears in chunky bursts because multiple `content_block_delta` events per frame each trigger separate React re-renders
- On `message_stop`, a history refetch causes the streaming message to unmount and re-mount with DB data, creating a visible layout shift

---

## Backend Changes (Already Shipped)

The backend has shipped per-conversation SSE on branch `sai/message-lifecycle-changes`:

| What                    | Old                                                                           | New                                                                 |
| ----------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| **Conversation events** | `GET /events` (all events on one user stream)                                 | `GET /v4/conversations/{conversation_id}/events` (per-conversation) |
| **Event format**        | Wrapped in `conversation_v2`/`agent_streams` with `source_id`, `streaming_id` | **Flat** — event type at root level, no wrapper                     |
| **History replay**      | `include_history` query param                                                 | `Last-Event-Id: 0` header                                           |
| **User-level events**   | Same `GET /events` endpoint                                                   | **Unchanged** — still on `GET /events` (tasks, activity logs, etc.) |

**Dual-published events:** `conversation_created` and `conversation_title_updated` are published to BOTH the conversation channel and the user channel, enabling sidebar list updates without subscribing to every conversation.

---

## Key Design Decisions

| Decision                            | Choice                                                                                      | Rationale                                                                                                                            |
| ----------------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| **SSE client library**              | `@microsoft/fetch-event-source`                                                             | Native `EventSource` cannot set custom headers; we need `Last-Event-Id: 0` on initial connection                                     |
| **Connection lifecycle**            | Conversation-scoped — connect when conversation is visible, disconnect on switch/unmount    | SSE lives for the conversation lifetime. No connect/disconnect per message. `Last-Event-Id: 0` only for newly created conversations. |
| **State architecture**              | Context-based split (actions / state / streaming)                                           | Eliminates re-render cascade by isolating render boundaries                                                                          |
| **History refetch on message_stop** | Removed                                                                                     | Streaming state already has the complete message. Refetch only on page refresh or conversation switch. Eliminates layout shift.      |
| **Streaming render strategy**       | RAF double-buffer                                                                           | Mutable draft for SSE writes, `requestAnimationFrame` flushes once per frame. Smooth 60fps text instead of chunky bursts.            |
| **Reconnection strategy**           | `useRef` for lastEventId (network blip), server `state: "STREAMING"` field for page refresh | No sessionStorage needed. History API provides the streaming message ID for replay.                                                  |

---

## Architecture Overview

### Before: Single User Channel

```
┌─────────────┐     GET /events      ┌──────────────────────────────────┐
│   Frontend   │ ──────────────────── │  user_events:{user_id}           │
│              │                      │  (ALL events multiplexed here)   │
└─────────────┘                      └──────────────────────────────────┘
```

### After: Per-Conversation + User Channel

```
┌─────────────┐
│   Frontend   │
│              │
│  Conv View   │──── GET /v4/conversations/{conv_id}/events ──── conversation_events:{conv_id}
│              │       (messages, streaming, title updates)
│              │
│  Global      │──── GET /events ──────────────────────────────── user_events:{user_id}
│              │       (task delegation, activity logs, etc.)
└─────────────┘
```

### Component Hierarchy: Before vs After

**Before (re-render cascade):**

```
ChatSidebarInner
  └→ ChatConversationContent
       └→ useChat() ← creates full chat object
       └→ useEffect: onChatStateChange({ chat, ... }) ← fires on EVERY delta
  └→ setChatState(state) ← parent re-renders
  └→ ConnectedChatInput receives chatState.chat ← re-renders on every delta
       └→ useChatInput({ chat: ReturnType<typeof useChat> })
```

**After (isolated render boundaries):**

```
ChatSidebarInner
  └→ ConversationProvider (wraps both content and input, owns all state + SSE)
       │
       ├→ ConversationActionsContext (stable refs — NEVER re-renders consumers)
       │   { sendMessage, createConversationV2, stopConversation, clearMessages }
       │
       ├→ ConversationStateContext (updates on message events, NOT on every delta)
       │   { messages, conversationId, isStreaming, isStopping, loading/error states }
       │
       ├→ ChatConversationContent
       │    └→ useConversationState() for messages, loading, errors
       │    └→ useStreamingState(conversationId) for streaming blocks (isolated to MessageContainer)
       │    └→ useConversationActions() for createConversationV2
       │
       └→ ConnectedChatInput
            └→ useConversationActions() for sendMessage, stopConversation
            └→ useConversationState() for isStreaming, isStopping only
            └→ useChatInput({ chatActions: ChatInputActions }) ← SLIM interface
```

**Key insight:** `content_block_delta` events (dozens/sec) write to the external `streamingStateStore`. Only `MessageContainer` subscribes to it via `useStreamingState`. The contexts, input, sidebar, and topbar are completely isolated from streaming deltas.

---

## SSE Connection Lifecycle (Conversation-Scoped)

SSE is tied to the **conversation lifecycle**, not the message lifecycle.
One connection per visible conversation. Stays open until the user switches away or unmounts.

### When SSE connects

- **New conversation created** — `conversationId` set after POST → SSE connects with `Last-Event-Id: 0`
- **Switch to existing conversation** — provider mounts with `conversationId` → SSE connects (no `Last-Event-Id`)
- **Page refresh with STREAMING message** — provider mounts → SSE connects with `?message_id={id}`

### When SSE disconnects

- **Provider unmounts** (conversation switch, navigation away) → cleanup aborts connection

### Scenario: User creates a new conversation

```
1. User sends message → POST /v4/conversations → { conversation_id: "abc-123" }
2. conversationId set → SSE connects: GET /v4/conversations/abc-123/events
   Header: Last-Event-Id: 0 (catch events between POST and SSE connect)
3. Events flow: init-stream → conversation_created → message_start → content_block_* → message_stop
4. SSE stays open — ready for next message
5. User sends follow-up → already connected, events flow immediately
```

### Scenario: User switches to an existing conversation (not streaming)

```
1. ConversationProvider mounts for "abc-123"
2. SSE connects (no Last-Event-Id, no replay)
3. History API fetches conversation → messages render from history
4. SSE stays open — ready for new messages
5. User sends message → events flow immediately on existing SSE connection
```

### Scenario: User switches away during active streaming

```
1. User viewing "abc-123" (streaming) → clicks "xyz-789"
2. ConversationProvider for "abc-123" unmounts (key={chatKey} changes)
3. SSE connection aborted via cleanup
4. Streaming continues on backend, no one listening
5. When user comes back: see "User switches back" scenario below
```

### Scenario: User switches back to conversation

```
If streaming finished while away:
  → SSE connects (no Last-Event-Id) → ready for new messages
  → History API returns all messages with state: "DONE" → render from history

If streaming still in progress:
  → History API returns message with state: "STREAMING" (empty content)
  → STREAMING message filtered from history display
  → SSE connects with ?message_id={streamingMessageId} → server replays from that message
  → Streaming UI resumes seamlessly
```

### Scenario: Page refresh during streaming

```
1. REST API fetches conversation → returns messages including in-progress message (state: "STREAMING")
2. getStreamingMessageId() extracts the message ID
3. SSE connects with ?message_id={messageId} → server replays from that message
4. Streaming UI resumes seamlessly
5. SSE stays open for subsequent messages
```

### Scenario: Network blip

```
1. fetchEventSource detects connection drop (onerror)
2. onclose throws to prevent fetchEventSource's immediate auto-retry
3. Connection will re-establish when user navigates back or refreshes
```

### Issues found during implementation (lessons learned)

1. **sessionStorage race condition** — Old approach stored messageId in sessionStorage. Replaced with
   server-side message `state` field ("STREAMING"/"DONE") on conversation history API response.
2. **Last-Event-Id: 0 replaying old messages** — Sending `Last-Event-Id: 0` on every SSE connect
   caused the backend to replay all events, including completed messages. Fixed by only sending
   `Last-Event-Id: 0` for newly created conversations.
3. **Multiple SSE connections** — `connect` callback in useEffect deps recreated on every prop change,
   re-triggering the effect. Fixed by using a single effect with `paramsRef` pattern — connection
   params read from a synchronously-updated ref, only `enabled` + `conversationId` in effect deps.
4. **fetchEventSource auto-reconnect loop** — `fetchEventSource` auto-reconnects on server close unless
   `onclose` throws. Added throw in onclose with our own backoff-based reconnection timer.
5. **Two SSE streams on refresh** — First approach tried connecting immediately then reconnecting when
   streamingMessageId arrived. Fixed by gating SSE on `sseRequested` which only becomes true when
   history reveals a STREAMING message or user sends a message.

---

## Streaming Render Improvements

### Problem: Chunky text rendering

Current flow per `content_block_delta`:

```
SSE delta → streamingStateStore.update() → new object (spread) → microtask notify → React re-render → DOM
```

Multiple deltas per frame = multiple re-renders = text appears in bursts.

### Solution: RAF double-buffer

```
SSE delta → bufferDelta() → mutate draft in-place (no spread, no notification)
                ↓
            requestAnimationFrame (once per frame, ~16ms)
                ↓
            snapshot draft → publish to store → ONE React notification → DOM
```

- `content_block_delta` uses `bufferDelta()` — mutable draft, RAF-batched
- `content_block_start/stop`, `message_start/stop` use synchronous `set()`/`update()` — immediate notification (infrequent events)
- Result: smooth 60fps text rendering

### Problem: Layout shift on message_stop

Current flow:

```
message_stop → streaming → final message → delete streaming state → refetch history
  → REST API returns → replace message with DB version → layout shift (unmount/remount)
```

### Solution: No refetch on message_stop

```
message_stop → streaming → final message → delete streaming state → DONE
  (history refetch only on page refresh, conversation switch, or manual retry)
```

The streaming state already contains the complete message. The final `ChatMessage` has identical elements. No visual change to the user.

### Solution: Character-by-character typewriter effect

Even with RAF batching, text can still appear in uneven word-sized chunks depending on SSE timing. Adding a typewriter layer in the display component smooths this out:

```
Store (full text via RAF):  "Hello world, how are you"
Display (typewriter):        "Hello wor" → "Hello worl" → "Hello world" → ...
```

**Implementation** — `useTypewriter` hook in `StreamingTextBlock` component:

- Speed: **~5ms per character** (~200 chars/sec, matches ChatGPT's feel)
- No cursor or blinking indicator — just smooth character reveal
- Store has full text at all times; display layer controls reveal pace
- On `message_stop`: remaining text reveals instantly (catch-up, no lingering animation)
- Only applies to text blocks during active streaming — historical messages render full text immediately

---

## Code Structure

### New package: `packages/conversation-stream`

All new architecture lives in a separate package. Old `packages/chat` is untouched for backward compatibility.

```
packages/conversation-stream/
├── src/
│   ├── provider/
│   │   ├── ConversationProvider.tsx        ← orchestration (replaces useChat for PACE)
│   │   ├── ConversationActionsContext.tsx   ← stable action refs
│   │   └── ConversationStateContext.tsx     ← message-level state
│   │
│   ├── hooks/
│   │   ├── useConversationSSE.ts           ← per-conversation SSE (fetch-event-source)
│   │   ├── useConversationActions.ts       ← consume actions context
│   │   ├── useConversationState.ts         ← consume state context
│   │   ├── useTypewriter.ts               ← character-by-character display
│   │   └── useChatInput.ts                ← slim ChatInputActions interface
│   │
│   ├── components/
│   │   ├── ConnectedChatInput.tsx          ← context-based (no chat prop)
│   │   └── StreamingTextBlock.tsx          ← typewriter-enabled text rendering
│   │
│   ├── handlers/
│   │   ├── conversationEventHandler.ts     ← flat event → streamingStateStore
│   │   └── streamingBlockHandler.ts        ← shared block processing logic
│   │
│   ├── types/
│   │   └── conversation-sse.types.ts       ← flat event types
│   │
│   └── index.ts
├── package.json
└── tsconfig.json
```

**Imports from `packages/chat`** (shared, not duplicated): types, presentational components, API hooks, utilities, `streamingStateStore`.

**Only additive change to `packages/chat`**: `streamingStateStore.ts` gets `bufferDelta()` + RAF flush method.

### Consumer mapping

| Component                 | Package                              | Notes                         |
| ------------------------- | ------------------------------------ | ----------------------------- |
| `ChatSidebarInner`        | `@zamp-platform/conversation-stream` | Wraps in ConversationProvider |
| `ChatConversationContent` | `@zamp-platform/conversation-stream` | Contexts instead of useChat   |
| `ChatHomePage`            | `@zamp-platform/chat` (unchanged)    | Intercept only, no streaming  |
| `Chatbot.tsx`             | `@zamp-platform/chat` (unchanged)    | Old useChat                   |
| `KnowledgeBaseChat`       | `@zamp-platform/chat` (unchanged)    | Old useChat                   |
| `TaskContentInner`        | `@zamp-platform/chat` (unchanged)    | Old useChat                   |

---

## Implementation Phases

### Phase 0: Foundation — Package Setup & Types

- Create `packages/conversation-stream` package with deps (`@microsoft/fetch-event-source`, `@zamp-platform/chat`)
- Define flat event types in `packages/conversation-stream/src/types/`
- Add `bufferDelta()` + RAF flush to `packages/chat/src/stores/streamingStateStore.ts` (additive)

### Phase 1: Per-Conversation SSE Hook

- Create `useConversationSSE` hook in `packages/conversation-stream/src/hooks/`
- Uses `fetchEventSource`, `AbortController`, exponential backoff
- `Last-Event-Id: 0` on initial connect, `useRef` for network blip recovery
- `?message_id=` param from server-side `state: "STREAMING"` field for page refresh recovery (no sessionStorage)
- All props stored in refs for stable `connect` callback (prevents multiple connections)
- `onclose` throws to prevent fetchEventSource auto-reconnect; custom backoff timer instead

### Phase 2: Context-Based State Architecture

- Create `ConversationProvider`, `ConversationActionsContext`, `ConversationStateContext` in `packages/conversation-stream/src/provider/`
- Migrate logic from `useChat.ts` (560 lines) into provider
- Create `useConversationActions`, `useConversationState` hooks

### Phase 3: Refactor PACE Component Hierarchy

- Create new `ConnectedChatInput`, `useChatInput`, `StreamingTextBlock`, `useTypewriter` in `packages/conversation-stream/`
- `ChatSidebarInner` → wrap in `ConversationProvider`, remove middleman pattern
- `ChatConversationContent` → consume contexts, remove `onChatStateChange`
- Old `packages/chat` completely untouched

### Phase 4: Wire Per-Conversation SSE

- `ConversationProvider` uses `useConversationSSE` (behind feature flag)
- Create event handlers in `packages/conversation-stream/src/handlers/`
- SSE provider: skip conversations with their own SSE, add sidebar list updates for dual-published events

### Phase 5: Cleanup & Optimization

- Remove `CONVERSATION_V2` / `AGENT_STREAMS` subscription from global SSE for conversations
- Remove `conversationPayloadResolver`
- Deprecate old `useChat` hook

### Dependency Graph

```
Phase 0 (types + deps)
  ↓
Phase 1 (SSE hook) ─────────────────┐
  ↓                                  ↓
Phase 2 (Context architecture) → Phase 4 (Wire SSE into Provider)
  ↓                                  ↓
Phase 3 (Component refactor) ────→ Phase 5 (Cleanup)
```

Phase 1 and Phase 2 can be developed **in parallel**.
Phase 3 (re-render fix) can ship **before** Phase 4 (per-conversation SSE).

---

## Existing Features Preservation Checklist

| Feature                             | Preserved how                                                                                             |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Optimistic message display          | `sendMessage`/`createConversationV2` call `setMessages` before API, rollback on error                     |
| Scroll anchoring & scroll-to-bottom | `ScrollContainer` props unchanged, `chatScrollEnd` event sequencing preserved                             |
| Message entrance animations         | 300ms animation + "Analysing..." indicator timing via scroll events preserved                             |
| Pending conversation payload        | `ChatConversationContent` calls `createConversationV2` from actions context                               |
| File drag & drop                    | `fileDropHandlerRef`/`addFileReferenceRef` pattern unchanged                                              |
| Stop conversation                   | `stopConversation` in actions context, `isStopping` + 30s timeout in state context                        |
| Task status counts                  | `TaskStatusCounts` receives messages from state context, streamingState from external store               |
| Error handling & retry              | All error states in state context, `refetchConversationHistory` in actions context                        |
| INTERNAL_API button disable         | `useChatInput` checks last message for button blocks via slim `messages` prop                             |
| Voice recording / transcription     | Unchanged — `useTranscription` + `useChatAdapters` independent of chat state                              |
| Draft input persistence             | `useChatDraftInput` + external input value unchanged                                                      |
| Sidebar conversation list           | SSE-driven updates via dual-published `conversation_created`/`conversation_title_updated` on user channel |

---

## Critical Files

### New files (in `packages/conversation-stream`)

| File                                                              | Role                                         | Phase |
| ----------------------------------------------------------------- | -------------------------------------------- | ----- |
| `src/provider/ConversationProvider.tsx`                           | Orchestration — replaces useChat for PACE    | 2     |
| `src/hooks/useConversationSSE.ts`                                 | Per-conversation SSE with fetch-event-source | 1     |
| `src/hooks/useConversationActions.ts` + `useConversationState.ts` | Context consumer hooks                       | 2     |
| `src/hooks/useChatInput.ts`                                       | Slim ChatInputActions interface              | 3     |
| `src/hooks/useTypewriter.ts`                                      | Character-by-character display               | 3     |
| `src/components/ConnectedChatInput.tsx`                           | Context-based, no chat prop                  | 3     |
| `src/components/StreamingTextBlock.tsx`                           | Typewriter text rendering                    | 3     |
| `src/handlers/conversationEventHandler.ts`                        | Flat event → store writes                    | 4     |

### Modified files

| File                                              | What changes                                                  | Phase |
| ------------------------------------------------- | ------------------------------------------------------------- | ----- |
| `packages/chat/src/stores/streamingStateStore.ts` | Add `bufferDelta()` + RAF flush (additive only)               | 0     |
| `apps/.../ChatSidebarInner.tsx`                   | Wrap in ConversationProvider, remove middleman                | 3     |
| `apps/.../ChatConversationContent.tsx`            | Remove useChat/onChatStateChange, consume contexts            | 3     |
| `apps/.../sse-provider.tsx`                       | Add sidebar update handlers, skip per-conversation SSE convos | 4, 5  |

### Untouched files

| File                                                  | Reason                                           |
| ----------------------------------------------------- | ------------------------------------------------ |
| `packages/chat/src/hooks/useChat.ts`                  | Used by Chatbot, KnowledgeBase, TaskContentInner |
| `packages/chat/src/hooks/useChatInput.ts`             | Old interface for old consumers                  |
| `packages/chat/src/components/ConnectedChatInput.tsx` | Old version with chat prop                       |
| `apps/.../ChatHomePage.tsx`                           | Uses old useChat for intercept only              |

---

## Risk Mitigations

1. **Feature flag**: `usePerConversationSSE` prop on ConversationProvider. When `false`, entire system uses old global SSE. Instant rollback.
2. **Backward compatibility**: Old `useChat` hook never deleted. Non-PACE consumers (`Chatbot.tsx`, `KnowledgeBaseChat.tsx`, `ChatComponent.tsx`, `TaskContentInner.tsx`) untouched.
3. **Dual-publish dedup**: Per-conversation SSE registry prevents double-processing of `conversation_created` and `conversation_title_updated`.
4. **Connection leak prevention**: `AbortController` cleanup in `useConversationSSE`. Option C ensures idle connections close on `message_stop`.
5. **Incremental deployment**: Phase 3 (context refactor + re-render fix) ships before Phase 4 (per-conversation SSE), giving immediate improvements.
