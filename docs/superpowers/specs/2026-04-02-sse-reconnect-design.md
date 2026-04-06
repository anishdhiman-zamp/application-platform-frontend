# SSE Reconnection with Exponential Backoff

## Problem

When a network blip kills an SSE connection in `ConversationSSERegistry`, the `onDead` callback sets `isAlive = false` but never attempts reconnection. If a `ConversationProvider` is still mounted, the user is stuck with a dead connection until they navigate away and back.

## Solution

Add automatic reconnection with exponential backoff directly in `ConversationSSERegistry`. No changes to `openSSEConnection` (stays a stateless pipe), `conversationEventHandler`, or `streamingStateStore`.

## Design

### New State on `RegistryEntry`

```typescript
interface RegistryEntry {
  controller: AbortController;
  callbacks: Set<ConversationEventCallbacks>;
  organizationId: string | undefined;
  isAlive: boolean;
  // New fields:
  retryCount: number; // current retry attempt (0-based)
  retryTimer: ReturnType<typeof setTimeout> | null;
  lastEventId: string | null; // last SSE event ID for resumption
}
```

### New Callback on `ConversationEventCallbacks`

```typescript
interface ConversationEventCallbacks {
  onTitleUpdated: (title: string) => void;
  onMessageStop: (message: ChatMessage | null, conversationId: string) => void;
  onDisconnected?: () => void; // invoked after all retries exhausted
}
```

### Retry Strategy

- **Max retries:** 3
- **Backoff:** `Math.min(1000 * 2^retryCount, 4000) + random(0, 500)ms`
  - Attempt 1: ~1.0-1.5s
  - Attempt 2: ~2.0-2.5s
  - Attempt 3: ~4.0-4.5s
- **Total window:** ~7-8.5s of retry before giving up
- **Reset:** `retryCount` resets to 0 on successful connection (`onopen` with `response.ok`)

### Last-Event-Id Tracking

The registry's `onEvent` wrapper in `register()` already intercepts all SSE events. We capture the event ID from the raw `fetchEventSource` `onmessage` callback by threading it through:

- In the `onEvent` wrapper inside `register()`, we store `event.id` (the SSE spec's `lastEventId` field) on the entry's `lastEventId`.
- On reconnect, pass `lastEventId` as the `Last-Event-Id` header so the server resumes from where we left off.
- `openSSEConnection` already accepts headers for `Last-Event-Id` via the `isNewConversation` path. We add a new `lastEventId` parameter to `openSSEConnection` to set this header directly.

**Correction:** We do need a small change to `openSSEConnection` — add an optional `lastEventId` parameter that sets the `Last-Event-Id` header, so the registry can pass it on reconnect without the `isNewConversation` flag.

### Reconnection Flow

```
onDead fires
  -> if callbacks.size === 0 (no provider): clean up, no retry
  -> if retryCount >= MAX_RETRIES: invoke onDisconnected on all callbacks, clean up
  -> else:
     1. Abort old controller
     2. Increment retryCount
     3. Schedule timer with backoff delay
     4. On timer fire:
        a. Create new AbortController
        b. Call openSSEConnection with lastEventId
        c. On success (onOpen): reset retryCount to 0, set isAlive = true
        d. On failure: onDead fires again, loop back
```

### Edge Cases

| Scenario                                | Behavior                                                 |
| --------------------------------------- | -------------------------------------------------------- |
| Deregister during pending retry         | Cancel timer, don't reconnect                            |
| Register while retry pending            | Cancel timer, use fresh register() connection            |
| Multiple providers mounted              | All get onDisconnected if retries exhaust                |
| Tab hidden                              | Retries still fire (openWhenHidden: true)                |
| Server returns non-OK on retry          | Counts as a failed attempt, triggers next retry          |
| Connection dies during active streaming | Retry — streaming state preserved in streamingStateStore |

### Files Changed

1. **`packages/conversation-stream/src/registry/conversationSSERegistry.ts`** — retry logic, lastEventId tracking, onDisconnected dispatch
2. **`packages/conversation-stream/src/registry/openSSEConnection.ts`** — add optional `lastEventId` parameter for reconnect header
3. **`packages/conversation-stream/src/handlers/conversationEventHandler.ts`** — add `onDisconnected` to `ConversationEventCallbacks` type

### Files NOT Changed

- `streamingStateStore.ts` — streaming state persists across reconnects naturally
- Consumer components — `onDisconnected` is optional, existing consumers unaffected

### Testing

- Unit test retry scheduling: verify delays match backoff formula
- Unit test max retry cap: verify onDisconnected fires after 3 failures
- Unit test reset on success: verify retryCount returns to 0
- Unit test cancel on deregister: verify timer cleared, no reconnect
- Unit test cancel on re-register: verify fresh connection takes over
- Unit test lastEventId: verify header sent on reconnect
