import { fetchEventSource } from '@microsoft/fetch-event-source';
import { addBreadcrumb, captureException } from '@sentry/browser';
import { API_DOMAIN } from '@zamp-platform/api';

import type { SSESourceType } from '../types/sse.types';
export { SSE_CONNECTION_TIMEOUT_MS, SSE_SOURCE_TYPE, type SSESourceType } from '../types/sse.types';
import { SSE_CONNECTION_TIMEOUT_MS } from '../types/sse.types';

/**
 * Opens a single SSE connection for a conversation or task.
 * Throws in onerror/onclose to prevent fetchEventSource's built-in retry;
 * reconnect decisions are delegated to the caller (registry or hook).
 * `onDead` is called when the connection dies so the registry can mark it stale.
 */
export function openSSEConnection(
  sourceType: SSESourceType,
  sourceId: string,
  organizationId: string | undefined,
  isNewConversation: boolean,
  streamingMessageId: string | null | undefined,
  signal: AbortSignal,
  onEvent: (event: Record<string, unknown> & { type: string }, eventId: string) => void,
  onOpen: (() => void) | undefined,
  onDead: (error?: unknown) => void,
  lastEventId?: string | null,
): void {
  let url = `${API_DOMAIN}/streaming?source_type=${sourceType}&source_id=${sourceId}`;
  if (streamingMessageId) url += `&message_id=${streamingMessageId}`;

  const headers: Record<string, string> = {};
  if (lastEventId) {
    headers['Last-Event-Id'] = lastEventId;
  } else if (isNewConversation) {
    headers['Last-Event-Id'] = '0';
  }
  if (organizationId) headers['X-Zamp-Organization-Id'] = organizationId;

  // Guard against double onDead calls (e.g. timeout fires, then abort triggers onerror).
  let dead = false;
  const markDead = (error?: unknown) => {
    if (dead) return;
    dead = true;
    clearTimeout(timeoutId);
    onDead(error);
  };

  const timeoutId = setTimeout(() => {
    if (!signal.aborted) {
      markDead(new Error('SSE connection timeout'));
    }
  }, SSE_CONNECTION_TIMEOUT_MS);

  fetchEventSource(url, {
    signal,
    credentials: 'include',
    headers,
    openWhenHidden: true,

    onopen: async (response) => {
      clearTimeout(timeoutId);
      if (response.ok) {
        dead = false; // reset for future disconnects on this connection
        onOpen?.();
      } else {
        const error = new Error(`SSE connection failed: ${response.status} ${response.statusText}`);
        markDead(error);
        throw error;
      }
    },

    onmessage: (event) => {
      if (!event.data) return;
      try {
        const data = JSON.parse(event.data) as Record<string, unknown> & { type: string };
        // The TS cast doesn't enforce `type` at runtime; fall back to a sentinel so the
        // breadcrumb stays readable in Sentry even if BE ships a payload without `type`.
        const eventType = (data.type as string | undefined) ?? '<no-type>';
        addBreadcrumb({
          category: 'sse',
          message: eventType,
          level: 'info',
          data: {
            sourceType,
            sourceId,
            eventId: event.id,
            eventType,
            subType: data.event_type as string | undefined,
          },
        });
        onEvent(data, event.id);
      } catch (error) {
        captureException(error instanceof Error ? error : new Error(String(error)), {
          tags: { area: 'sse', failure: 'parse' },
          extra: {
            rawData: typeof event.data === 'string' ? event.data.slice(0, 500) : String(event.data),
            eventId: event.id,
            sourceType,
            sourceId,
          },
        });
      }
    },

    onerror: (error) => {
      clearTimeout(timeoutId);
      if (signal.aborted) return;
      // Network blips and server-closed connections are expected and handled by the
      // registry's retry/backoff logic — don't capture those as Sentry errors.
      // Only capture unexpected errors (e.g. non-TypeError thrown by fetchEventSource itself).
      const isNetworkError =
        error instanceof TypeError ||
        (error instanceof Error && (error.message.includes('network') || error.message.includes('fetch')));
      if (!isNetworkError) {
        captureException(error instanceof Error ? error : new Error(String(error)));
      }
      markDead(error);
      throw error; // stops fetchEventSource's internal retry
    },

    onclose: () => {
      clearTimeout(timeoutId);
      markDead();
      throw new Error('SSE closed by server'); // prevents auto-reconnect
    },
  }).catch(() => {
    // intentional — onerror/onclose throw to stop retries
  });
}
