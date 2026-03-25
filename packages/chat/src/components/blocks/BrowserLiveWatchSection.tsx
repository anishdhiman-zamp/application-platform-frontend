'use client';

import { Button } from '@zamp-platform/ui';
import React, { FC, useCallback, useEffect, useState } from 'react';

import { useLazyGetBrowserLiveViewNovncQuery } from '../../api';
import { TOOL_NAMES } from '../chat.constants';

const A2A_TASK_CONVERSATION_ID_PREFIX = 'a2a-task-';

function expectedChromeSessionIdForConversation(conversationId: string): string {
  const pathKey = conversationId.startsWith(A2A_TASK_CONVERSATION_ID_PREFIX)
    ? conversationId.slice(A2A_TASK_CONVERSATION_ID_PREFIX.length)
    : conversationId;
  return `chrome-${pathKey}`;
}

/** Coerce http:// → https:// when the page is served over HTTPS (avoids mixed-content blocks). */
function coerceIframeSrcForSecurePage(url: string): string {
  if (typeof window === 'undefined' || window.location.protocol !== 'https:') {
    return url;
  }
  if (url.startsWith('http://')) {
    return `https://${url.slice('http://'.length)}`;
  }
  return url;
}

interface BrowserLiveWatchSectionProps {
  conversationId?: string;
  toolName?: string;
}

/**
 * Renders a "Watch" button inside a ToolCallBlock when the backend signals that a live
 * browser session is available for this conversation.
 *
 * Visibility is driven by two SSE events published by Pantheon:
 *   - browser_live_view_available   → show the button
 *   - browser_live_view_unavailable → hide the button (session ended / not started yet)
 *
 * Clicking "Watch" calls GET /v3/conversations/{id}/browser-live-view-novnc which returns
 * a same-origin proxy URL (proxy_iframe_url) that is embedded in an <iframe>.
 */
export const BrowserLiveWatchSection: FC<BrowserLiveWatchSectionProps> = ({ conversationId, toolName }) => {
  const [fetchNovnc, { isFetching }] = useLazyGetBrowserLiveViewNovncQuery();
  const [iframeSrc, setIframeSrc] = useState<string | null>(null);
  const [directNovncUrl, setDirectNovncUrl] = useState<string | null>(null);
  const [isAvailable, setIsAvailable] = useState(false);

  const handleBrowserLiveViewEvent = useCallback(
    (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        const eventConversationId: string | undefined = data?.payload?.conversation_id ?? data?.conversation_id;

        if (eventConversationId && eventConversationId !== conversationId) return;

        if (data?.type === 'browser_live_view_available') {
          setIsAvailable(true);
        } else if (data?.type === 'browser_live_view_unavailable') {
          setIsAvailable(false);
          setIframeSrc(null);
          setDirectNovncUrl(null);
        }
      } catch {
        // ignore malformed events
      }
    },
    [conversationId],
  );

  useEffect(() => {
    if (!conversationId) return;

    // Subscribe to the global SSE EventSource via the window-level custom event that
    // sse-provider publishes, or fall back to listening on the EventSource directly.
    // We use a CustomEvent bridge so this component stays decoupled from the provider.
    const handler = (e: Event) => handleBrowserLiveViewEvent(e as MessageEvent);
    window.addEventListener('sse:browser_live_view_available', handler);
    window.addEventListener('sse:browser_live_view_unavailable', handler);

    return () => {
      window.removeEventListener('sse:browser_live_view_available', handler);
      window.removeEventListener('sse:browser_live_view_unavailable', handler);
    };
  }, [conversationId, handleBrowserLiveViewEvent]);

  if (!conversationId || toolName !== TOOL_NAMES.EXECUTE_BROWSER_COMMAND) {
    return null;
  }

  if (!isAvailable && !iframeSrc) {
    return null;
  }

  const handleWatch = async () => {
    try {
      const res = await fetchNovnc({
        conversationId,
        sessionId: expectedChromeSessionIdForConversation(conversationId),
      }).unwrap();
      const direct = res?.novnc_url ?? null;
      const rawEmbedded = (res?.proxy_iframe_url?.trim() || direct) ?? null;
      const embedded = rawEmbedded ? coerceIframeSrcForSecurePage(rawEmbedded) : null;
      setDirectNovncUrl(direct);
      setIframeSrc(embedded);
    } catch {
      setDirectNovncUrl(null);
      setIframeSrc(null);
    }
  };

  return (
    <div className='space-y-2'>
      <div className='flex flex-wrap items-center gap-2'>
        <Button type='button' variant='secondary' size='small' onClick={handleWatch} disabled={isFetching}>
          {isFetching ? 'Loading…' : 'Watch'}
        </Button>
        {directNovncUrl ? (
          <a
            href={directNovncUrl}
            target='_blank'
            rel='noopener noreferrer'
            className='f-12-500 text-blue-700 underline'
          >
            Open in new tab
          </a>
        ) : null}
      </div>
      {iframeSrc ? (
        <p className='f-11-400 text-gray-600'>
          The preview loads through the app API when possible. Use <span className='font-medium'>Open in new tab</span>{' '}
          for the direct Modal viewer if needed.
        </p>
      ) : null}
      {iframeSrc ? (
        <iframe
          src={iframeSrc}
          className='h-[min(480px,70vh)] w-full rounded border border-gray-300 bg-white'
          title='Browser live view'
          referrerPolicy='no-referrer-when-downgrade'
        />
      ) : null}
    </div>
  );
};
