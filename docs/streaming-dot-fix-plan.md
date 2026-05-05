# Streaming Dot Fix Plan

The chat history sidebar shows a coloured dot per conversation:

| State        | Colour | Meaning                                      |
| ------------ | ------ | -------------------------------------------- |
| `needsInput` | orange | The chat is waiting on the user              |
| `streaming`  | blue   | The model is generating a response right now |
| `unread`     | green  | New activity since the user last viewed      |
| `read`       | grey   | Idle                                         |

This document is about the **streaming (blue, animated) dot** specifically.

## The problem

The dot is sourced from `streamingStateStore` in `packages/chat/src/stores/streamingStateStore.ts`. The store is purely in-memory and is populated only by SSE events the **current browser tab** receives — primarily:

- `MESSAGE_START` SSE → `streamingStateStore.set(id, { ..., is_active: true })`
- `MESSAGE_STOP` SSE → flips `is_active: false`, then a 5s timer deletes the entry

There is no boot-time fetch of "which conversations are currently streaming". This produces several real-world bugs where the dot is **wrong** (grey when it should be blue):

1. **Stream started before this tab connected.** Open the app while a chat from another tab/device is mid-stream — this tab never received `MESSAGE_START`, so no entry, no dot.
2. **Hard reload mid-stream.** Refreshing wipes the in-memory store; the SSE channel reconnects but does not replay `MESSAGE_START`.
3. **Initial paint race.** History list paints before SSE is connected, so even streams started in _this_ tab can briefly show grey.
4. **Premature local cleanup.** `useChat` deletes the streaming entry when the user navigates away from a chat (`useChat.ts:246`). The chat-history dot loses its source of truth even though the stream is still active.
5. `MESSAGE_STOP` fires before the stream actually ends (backend-side bug) → false grey.
6. Cleanup-on-history-merge in `useChat.ts:484–488` is only triggered when `is_active === false`, so it's harmless but worth confirming there's no race with concurrent `MESSAGE_STOP`.

### Layman summary

Imagine the dot is a security guard who only logs people walking through _their_ door. If a stream started through another door — another tab, another device, a refresh — this guard has no idea and shows grey. The fix is to stop relying on the local guard alone and ask the server, which actually knows.

## The plan

Four phases, ordered by risk and coverage. Each phase is independently shippable.

### Phase 1 — Frontend cleanup (no backend changes)

**Goal:** stop the frontend from throwing away streaming state we already have.

- **`packages/chat/src/hooks/useChat.ts:246`** — remove the `streamingStateStore.delete(conversationIdRef.current)` call that runs when `_conversationId` changes. The store is shared with the chat-history sidebar, and deleting on navigation drops the dot for a still-streaming conversation. Deletion should be owned by `MESSAGE_STOP` + the existing 5s deferred cleanup in `sse-provider.tsx:487`.
- **`useChat.ts:298–322`** — audit the cleanup loop for similar over-eager deletes; remove or scope tighter as needed.
- **`useChat.ts:484–488`** — confirm the `is_active === false` guard is sufficient; no change expected.

**Risk:** low. The store entries are small and the existing `MESSAGE_STOP` + deferred-delete path already handles cleanup.

**Coverage:** fixes issue #4 (and tightens #6).

### Phase 2 — Seed the store from the conversation list

**Goal:** make the store authoritative on app load and after every list refetch.

1. **Backend** — add `streaming_status: 'active' | 'idle'` (or `is_streaming: boolean`) to each item in `GET /conversations`. The server already knows which conversations are mid-stream.
2. **Frontend `ChatHistory.tsx`** — after `handleMergeFetchedPage`, for every conversation flagged active that has no entry in `streamingStateStore`, seed a stub:
   ```ts
   streamingStateStore.set(id, {
     ...minimalShape,
     is_active: true,
     is_stub: true,
   });
   ```
3. **Reconciliation rules**:
   - A real `MESSAGE_START` overwrites the stub (already the case, since `set()` replaces).
   - `MESSAGE_STOP` flips `is_active = false` and the existing 5s deferred delete cleans up.
   - List refetch reseeds — idempotent.
4. **Add `is_stub: true`** flag to `StreamingState`. Consumers that render _content_ (the chat body, `TaskBlock`) skip stubs to avoid showing empty bubbles. `useActiveStreamingIds` keeps counting them.

**Risk:** low. Requires a single backend field and ~30 LOC of frontend wiring.

**Coverage:** fixes issues #1, #2 (mostly), #3.

### Phase 3 — Reconnect snapshot (optional)

**Goal:** ironclad correctness for mid-stream reloads on flaky networks.

- On SSE (re)connect, server emits a `STREAM_SNAPSHOT` event listing all currently-streaming conversations the user has access to.
- Frontend treats each entry as an implicit `MESSAGE_START` (with `is_stub: true`) so live `content_block_delta` events flow into it normally.

**Risk:** medium — new SSE event type, server-side coordination.

**Coverage:** tightens issue #2's edge case where the stream completes between list fetch and reconnect.

### Phase 4 — Stale-stub safety net

**Goal:** self-heal stubs that get stuck `is_active: true` (e.g. user logged out and back in mid-stream, never saw `MESSAGE_STOP`).

- Timestamp every stub at seed time.
- While any stub exists, refetch the conversation list every 30–60s (`pollingInterval` on the RTK Query subscription).
- Drop stubs whose timestamp predates the latest list response and aren't in the response's `streaming` set.

**Risk:** low. Frontend-only.

**Coverage:** belt-and-braces for any remaining drift.

## Sequencing & risk summary

| Phase | Backend? | Risk   | Coverage gain                               |
| ----- | -------- | ------ | ------------------------------------------- |
| 1     | No       | Low    | Fixes flicker on chat switch                |
| 2     | Yes      | Low    | Fixes ~all cross-tab/reload cases           |
| 3     | Yes      | Medium | Tightens reload edge case on flaky networks |
| 4     | No       | Low    | Self-heals stale stubs                      |

Recommended sequencing: ship Phase 1 immediately. Ship Phase 2 + 4 together once the backend field lands. Defer Phase 3 unless QA still flags reload bugs.

## Open questions

1. Does `GET /conversations` (the endpoint behind `useGetConversationHistoryQuery`) already expose any "is currently streaming" hint, or do we need a fresh backend field?
2. Other consumers of `streamingStateStore` beyond the sidebar dot, `useChat`, and `TaskBlock`? Each call site needs to tolerate or filter `is_stub` entries.
3. How common is the multi-tab/multi-device case among real users? If rare, Phases 1 + 2 may be sufficient and Phase 3 is over-engineering.
