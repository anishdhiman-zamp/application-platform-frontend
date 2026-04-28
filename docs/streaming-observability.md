# Chat Streaming Observability

How to diagnose "stuck on Analysing" stalls and other streaming issues using Sentry.

## The problem this solves

Users sometimes report that the chat shows "Analysing..." indefinitely even though the backend is sending streaming events. Before these changes, there was no way to tell from the outside whether:

- the backend never emitted the events,
- a proxy/network layer dropped them,
- the events arrived but the frontend silently ignored an unknown type,
- the events arrived but a handler bug failed to update UI state.

`console.log` is not viable because we cannot see end-user consoles. All instrumentation goes to Sentry (errors/warnings + breadcrumbs).

## What was added

Four small instrumentation points across two packages.

### 1. SSE breadcrumbs on every event

`packages/conversation-stream/src/registry/openSSEConnection.ts`

Every successfully-parsed SSE event drops a Sentry breadcrumb:

```ts
addBreadcrumb({
  category: 'sse',
  message: data.type,
  level: 'info',
  data: { sourceType, sourceId, eventId, eventType, subType },
});
```

Breadcrumbs are free until an exception or `captureMessage` fires, at which point Sentry attaches the last 100 to the event automatically. This gives us the full per-session event timeline with timestamps the moment any other instrumentation point captures.

The existing JSON parse-failure path was also enriched with the raw payload (first 500 chars), `eventId`, and `sourceType`/`sourceId` so parse failures are debuggable from the Sentry issue alone.

### 2. `captureMessage` on unknown event types

`packages/conversation-stream/src/handlers/conversationEventHandler.ts`

The `event.type` switch had no `default:` case — unknown events were silently dropped. Now:

```ts
default: {
  if (!reportedUnknownEventTypes.has(unknownType)) {
    reportedUnknownEventTypes.add(unknownType);
    captureMessage('chat.streaming.unknown_event_type', {
      level: 'warning',
      tags: { area: 'sse', eventType, conversationId },
      extra: { eventType, eventSubType, conversationId },
    });
  }
}
```

A module-level `Set` de-dupes per page load so a single contract drift doesn't spam Sentry — the first occurrence reports, subsequent ones in the same session are ignored.

### 3. `captureMessage` on unknown delta and block types

`packages/conversation-stream/src/handlers/streamingBlockHandler.ts`

Two places:

- The `content_block_delta` switch had no default — unknown delta types silently dropped. Now reports `chat.streaming.unknown_delta_type` once per type per session.
- The `content_block_start` block-type switch defaulted to `TOOL_USE`, which masks new block types BE may ship. Now reports `chat.streaming.unknown_block_type` once per unknown type, then continues with the existing `TOOL_USE` fallback so behavior doesn't regress.

### 4. Stall watchdog

`packages/chat/src/components/MessageContainer.tsx`

When `isAnalysing` is true and `streamingState.message_content.elements` stays empty for 10 seconds, fires:

```ts
captureMessage('chat.streaming.stalled', {
  level: 'warning',
  tags: { area: 'sse', conversationId, hasStreamingState },
  extra: {
    elapsedMs: 10000,
    streamingMessageId,
    lastUserMessageId,
    messagesCount,
    elementsCount: 0,
  },
});
```

De-duped per stall key (`streamingState.id` if present, otherwise `${conversationId}:${lastUserMessageId}`) so each stuck message reports at most once. Resets when content arrives or `isAnalysing` flips false.

The 10s threshold is a constant (`STALL_WATCHDOG_MS`) at the top of the file — tune up if slow LLMs cause false positives, down if real stalls are being missed.

## How to find these in Sentry

### Searching for stalls

In Sentry's issue search:

```
message:"chat.streaming.stalled"
```

Group by `tags[conversationId]` to see which conversations stalled, or group by `tags[hasStreamingState]` to split between:

- `hasStreamingState: false` — stalled before any `MESSAGE_START` arrived (likely BE or network)
- `hasStreamingState: true` — `MESSAGE_START` arrived but no content blocks (likely BE missed `CONTENT_BLOCK_START`, or FE handler bug)

### Searching for contract drift

```
message:"chat.streaming.unknown_event_type"
message:"chat.streaming.unknown_delta_type"
message:"chat.streaming.unknown_block_type"
```

Group by `tags[eventType]` / `tags[deltaType]` / `tags[blockType]` to see what new payloads BE has shipped that FE doesn't handle.

### Searching for parse failures

These come through as `captureException` (not `captureMessage`), with `tags[area]:sse` and `tags[failure]:parse`. The `extra.rawData` field contains the first 500 chars of the malformed payload.

```
tags[area]:sse tags[failure]:parse
```

## The diagnosis flow

When a user reports a stall:

1. Open Sentry. Filter by `chat.streaming.stalled`. Find the issue closest to the user's report time, or filter by `tags[conversationId]` if you have it.
2. Open the issue. Scroll to the **Breadcrumbs** section. Filter to `category:sse`.
3. Read the SSE event sequence backwards from the stall. The last event before the 10s gap tells you the diagnosis:

| Last breadcrumb before stall                       | Diagnosis                                                       | Next step                                                                                                 |
| -------------------------------------------------- | --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `init_stream` / `keepalive` only                   | Backend never emitted `MESSAGE_START` for this turn             | Escalate to BE with `conversationId`                                                                      |
| `message_start` (no `content_block_start` after)   | BE emitted message but no blocks, or proxy dropped them         | Escalate to BE; ask them to check their emit logs for the `conversationId`                                |
| `content_block_start` present, shimmer still stuck | Frontend handler bug — `streamingState.elements` not committing | FE — investigate `handleContentBlockEvent` / `streamingStateStore.update`                                 |
| No `sse` breadcrumbs at all                        | Connection never opened, or events never parsed                 | Check `onerror`/`onopen` paths; check for `tags[area]:sse tags[failure]:parse` exceptions in same session |
| Mixed with `unknown_event_type` warning            | Contract drift — BE shipped a new event type FE doesn't handle  | FE — add the new event type to the switch                                                                 |

### Telling BE vs FE

Once the breadcrumbs are visible, the question collapses to one rule:

> **If the FE breadcrumb trail shows the event was received, it's a FE issue. If the trail shows the event was never received, it's a BE/network issue.**

The breadcrumbs are FE's own log of what it parsed — they are authoritative for "did this event reach our code." If BE swears they sent `CONTENT_BLOCK_START` but no breadcrumb exists for it in a stall session, the next questions are: did BE actually emit it (check BE logs by `conversationId`)? Did a proxy strip it? Did it fail to parse (check for `tags[area]:sse tags[failure]:parse`)?

## Configuration

- **Stall threshold:** `STALL_WATCHDOG_MS` in `packages/chat/src/components/MessageContainer.tsx` (default 10000)
- **Sentry environment:** inherited from existing `@sentry/browser` setup; no new config needed
- **Sampling:** none — `captureMessage` is called on every stall and on the _first_ occurrence of each unknown type per session. Breadcrumbs are unsampled (free). If volume becomes a quota concern, the per-session `Set` de-dupes can be promoted to per-day via `localStorage` or replaced with `Sentry.beforeSend` filtering.

## Performance impact

- **Breadcrumbs:** ~one object allocation per SSE event. Negligible compared to the JSON parse and Redux update on the same path.
- **Watchdog:** one `setTimeout` per analysing-cycle, cleared the moment content arrives or analysing ends.
- **Capture calls:** only on stalls and unknown types — both rare in steady state, both de-duped.

## What's intentionally not in here

- **Auto-recovery from stalls** (re-requesting the stream). First we measure; if BE-side issues turn out to be common we can revisit.
- **User-facing error UI.** Same reason — we want to understand the failure mode before deciding what to show.
- **PostHog metric.** `MessageContainer` is in `packages/chat`, which can't import from the app where PostHog lives. If we want a stall-rate dashboard later, the cleanest path is to pass an `onStall` callback prop in from the app.
- **Backend-side event logging.** Out of scope for FE; that's a separate BE ticket. The FE Sentry events provide the `conversationId` BE engineers need to grep their logs.

## Files changed

- [packages/conversation-stream/src/registry/openSSEConnection.ts](../packages/conversation-stream/src/registry/openSSEConnection.ts) — breadcrumb + enriched parse error
- [packages/conversation-stream/src/handlers/conversationEventHandler.ts](../packages/conversation-stream/src/handlers/conversationEventHandler.ts) — unknown event type warning
- [packages/conversation-stream/src/handlers/streamingBlockHandler.ts](../packages/conversation-stream/src/handlers/streamingBlockHandler.ts) — unknown delta + unknown block type warnings
- [packages/chat/src/components/MessageContainer.tsx](../packages/chat/src/components/MessageContainer.tsx) — stall watchdog
