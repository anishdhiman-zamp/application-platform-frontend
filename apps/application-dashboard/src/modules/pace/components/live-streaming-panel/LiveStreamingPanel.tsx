'use client';

import { FC, useCallback, useEffect, useState } from 'react';
import { useLazyGetBrowserLiveViewNovncQuery } from '@zamp-platform/chat';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { FILES_PANEL_ENTER_TRANSITION, FILES_PANEL_EXIT_TRANSITION } from '@/modules/pace/pace.animations';
import { usePaceContext } from '@/modules/pace/pace.context';

const LIVE_STREAMING_PANEL_WIDTH = 480;
const A2A_TASK_CONVERSATION_ID_PREFIX = 'a2a-task-';

function expectedChromeSessionIdForConversation(conversationId: string): string {
  const pathKey = conversationId.startsWith(A2A_TASK_CONVERSATION_ID_PREFIX)
    ? conversationId.slice(A2A_TASK_CONVERSATION_ID_PREFIX.length)
    : conversationId;

  return `chrome-${pathKey}`;
}

function coerceIframeSrcForSecurePage(url: string): string {
  if (typeof window === 'undefined' || window.location.protocol !== 'https:') {
    return url;
  }
  if (url.startsWith('http://')) {
    return `https://${url.slice('http://'.length)}`;
  }

  return url;
}

const PANEL_ANIMATION = {
  initial: { x: LIVE_STREAMING_PANEL_WIDTH, opacity: 0 },
  animate: {
    x: 0,
    opacity: 1,
    transition: FILES_PANEL_ENTER_TRANSITION,
  },
  exit: {
    x: LIVE_STREAMING_PANEL_WIDTH,
    opacity: 0,
    transition: FILES_PANEL_EXIT_TRANSITION,
  },
} as const;

const LiveStreamingPanel: FC = () => {
  const { liveStreamingPanel, closeLiveStreamingPanel } = usePaceContext();
  const [fetchNovnc, { isFetching }] = useLazyGetBrowserLiveViewNovncQuery();
  const [iframeSrc, setIframeSrc] = useState<string | null>(null);
  const [directNovncUrl, setDirectNovncUrl] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);

  const conversationId = liveStreamingPanel?.conversationId;

  const fetchStream = useCallback(async () => {
    if (!conversationId) return;

    try {
      setHasError(false);
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
      setHasError(true);
      setDirectNovncUrl(null);
      setIframeSrc(null);
    }
  }, [conversationId, fetchNovnc]);

  useEffect(() => {
    if (liveStreamingPanel) {
      fetchStream();
    } else {
      setIframeSrc(null);
      setDirectNovncUrl(null);
      setHasError(false);
    }
  }, [liveStreamingPanel, fetchStream]);

  return (
    <AnimatePresence>
      {liveStreamingPanel && (
        <motion.div
          initial={PANEL_ANIMATION.initial}
          animate={PANEL_ANIMATION.animate}
          exit={PANEL_ANIMATION.exit}
          style={{ width: LIVE_STREAMING_PANEL_WIDTH }}
          className='border-GRAY_400 bg-BG_WHITE absolute top-[42px] right-2 bottom-0 z-50 flex flex-col overflow-hidden rounded-t-xl border'
        >
          <div className='border-GRAY_400 flex items-center justify-between border-b px-3 py-2.5'>
            <div className='flex items-center gap-2'>
              <div className='bg-RED_500 h-2 w-2 animate-pulse rounded-full' />
              <span className='f-12-550 text-GRAY_1000'>Live Browser</span>
            </div>
            <div className='flex items-center gap-2'>
              {directNovncUrl && (
                <a
                  href={directNovncUrl}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='f-11-500 text-BLUE_700 hover:underline'
                >
                  Open in new tab
                </a>
              )}
              <button
                onClick={closeLiveStreamingPanel}
                className='text-GRAY_700 hover:text-GRAY_1000 hover:bg-GRAY_50 rounded-md p-1 transition-colors'
              >
                <X size={14} />
              </button>
            </div>
          </div>

          <div className='flex flex-1 flex-col overflow-hidden'>
            {isFetching && (
              <div className='flex flex-1 items-center justify-center'>
                <div className='text-center'>
                  <div className='bg-GRAY_100 mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full'>
                    <svg
                      width='16'
                      height='16'
                      viewBox='0 0 16 16'
                      fill='none'
                      xmlns='http://www.w3.org/2000/svg'
                      className='animate-pulse'
                    >
                      <path
                        d='M2 3.5C2 2.67157 2.67157 2 3.5 2H12.5C13.3284 2 14 2.67157 14 3.5V10.5C14 11.3284 13.3284 12 12.5 12H3.5C2.67157 12 2 11.3284 2 10.5V3.5Z'
                        stroke='#8f8f8f'
                        strokeWidth='1.2'
                      />
                      <path d='M5 14H11' stroke='#8f8f8f' strokeWidth='1.2' strokeLinecap='round' />
                      <path d='M8 12V14' stroke='#8f8f8f' strokeWidth='1.2' />
                    </svg>
                  </div>
                  <p className='f-12-450 text-GRAY_700'>Connecting to browser...</p>
                </div>
              </div>
            )}

            {hasError && !isFetching && (
              <div className='flex flex-1 items-center justify-center'>
                <div className='text-center'>
                  <p className='f-12-450 text-GRAY_700'>Failed to connect to browser stream</p>
                  <button onClick={fetchStream} className='f-12-500 text-BLUE_700 mt-2 hover:underline'>
                    Retry
                  </button>
                </div>
              </div>
            )}

            {iframeSrc && !isFetching && (
              <iframe
                src={iframeSrc}
                className='h-full w-full bg-white'
                title='Browser live view'
                referrerPolicy='no-referrer-when-downgrade'
              />
            )}

            {!iframeSrc && !isFetching && !hasError && (
              <div className='flex flex-1 items-center justify-center'>
                <div className='text-center'>
                  <div className='bg-GRAY_100 mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full'>
                    <svg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'>
                      <path
                        d='M2 3.5C2 2.67157 2.67157 2 3.5 2H12.5C13.3284 2 14 2.67157 14 3.5V10.5C14 11.3284 13.3284 12 12.5 12H3.5C2.67157 12 2 11.3284 2 10.5V3.5Z'
                        stroke='#8f8f8f'
                        strokeWidth='1.2'
                      />
                      <path d='M5 14H11' stroke='#8f8f8f' strokeWidth='1.2' strokeLinecap='round' />
                      <path d='M8 12V14' stroke='#8f8f8f' strokeWidth='1.2' />
                    </svg>
                  </div>
                  <p className='f-12-450 text-GRAY_700'>Waiting for browser stream...</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LiveStreamingPanel;
