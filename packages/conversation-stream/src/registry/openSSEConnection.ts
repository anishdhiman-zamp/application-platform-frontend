import { fetchEventSource } from '@microsoft/fetch-event-source';
import { captureException, withScope } from '@sentry/browser';
import { API_DOMAIN } from '@zamp-platform/api';

const CONNECTION_TIMEOUT_MS = 10_000;

/**
 * Opens a single SSE connection for a conversation.
 * Throws in onerror/onclose to prevent fetchEventSource's built-in retry;
 * reconnect decisions are delegated to the caller (registry or hook).
 * `onDead` is called when the connection dies so the registry can mark it stale.
 */
export function openSSEConnection(
  conversationId: string,
  organizationId: string | undefined,
  isNewConversation: boolean,
  streamingMessageId: string | null | undefined,
  signal: AbortSignal,
  onEvent: (event: Record<string, unknown> & { type: string }, eventId: string) => void,
  onOpen: (() => void) | undefined,
  onDead: (error?: unknown) => void,
  lastEventId?: string | null,
): void {
  let url = `${API_DOMAIN}/v4/conversations/${conversationId}/events`;
  if (streamingMessageId) url += `?message_id=${streamingMessageId}`;

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

  // Abort hanging fetch if onopen hasn't fired within the timeout.
  // Without this, a network-down retry can hang indefinitely waiting for
  // the browser's TCP timeout (30-60s+), preventing further retry attempts.
  const timeoutId = setTimeout(() => {
    if (!signal.aborted) {
      markDead(new Error('SSE connection timeout'));
    }
  }, CONNECTION_TIMEOUT_MS);

  fetchEventSource(url, {
    signal,
    credentials: 'include',
    headers,
    openWhenHidden: true, // lifecycle managed externally

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
        onEvent(data, event.id);
      } catch (error) {
        withScope((scope) => {
          scope.setTag('operation', 'sse_parse_message');
          scope.setContext('sse', { conversationId, rawData: event.data?.slice(0, 200) });
          captureException(error instanceof Error ? error : new Error(String(error)));
        });
      }
    },

    onerror: (error) => {
      clearTimeout(timeoutId);
      if (signal.aborted) return;
      withScope((scope) => {
        scope.setTag('operation', 'sse_connection_error');
        scope.setContext('sse', { conversationId, url });
        captureException(error instanceof Error ? error : new Error(String(error)));
      });
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
