'use client';

import { cn } from '@zamp-platform/ui/utils';
import { safeJsonParse } from '@zamp-platform/utils';
import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import React, { FC, useEffect, useMemo, useRef, useState } from 'react';

import type { ToolResultContentBlock } from '../../types/block.types';

interface LiveStreamingViewProps {
  isOpen: boolean;
  onClose: () => void;
  toolResult?: ToolResultContentBlock;
  screenshotUrl?: string;
  isComplete?: boolean;
}

interface ToolResultScreenshot {
  screenshot_url?: string;
  live_url?: string;
  url?: string;
  screenshot?: string;
  base64_image?: string;
}

const POLLING_INTERVAL_MS = 2000;

export const LiveStreamingView: FC<LiveStreamingViewProps> = ({
  isOpen,
  onClose,
  toolResult,
  screenshotUrl: externalScreenshotUrl,
  isComplete = false,
}) => {
  const [currentScreenshotUrl, setCurrentScreenshotUrl] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const resolvedUrl = useMemo(() => {
    if (externalScreenshotUrl) return externalScreenshotUrl;

    if (toolResult?.payload?.content) {
      const parsed = safeJsonParse<ToolResultScreenshot>(toolResult.payload.content);
      return parsed?.screenshot_url || parsed?.live_url || parsed?.url || parsed?.screenshot || null;
    }
    return null;
  }, [externalScreenshotUrl, toolResult]);

  const base64Image = useMemo(() => {
    if (toolResult?.payload?.content) {
      const parsed = safeJsonParse<ToolResultScreenshot>(toolResult.payload.content);
      return parsed?.base64_image || null;
    }
    return null;
  }, [toolResult]);

  useEffect(() => {
    if (resolvedUrl) {
      setCurrentScreenshotUrl(resolvedUrl);
      setHasError(false);
    } else if (base64Image) {
      setCurrentScreenshotUrl(`data:image/png;base64,${base64Image}`);
      setHasError(false);
    }
  }, [resolvedUrl, base64Image]);

  useEffect(() => {
    if (!isOpen || isComplete || !resolvedUrl) {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
      return;
    }

    pollingRef.current = setInterval(() => {
      const cacheBustedUrl = `${resolvedUrl}${resolvedUrl.includes('?') ? '&' : '?'}t=${Date.now()}`;
      setCurrentScreenshotUrl(cacheBustedUrl);
    }, POLLING_INTERVAL_MS);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [isOpen, isComplete, resolvedUrl]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          className='overflow-hidden'
        >
          <div className='border-GRAY_400 bg-BG_GRAY_2 relative mt-2 overflow-hidden rounded-lg border'>
            <div className='flex items-center justify-between px-3 py-2'>
              <div className='flex items-center gap-2'>
                <div className='bg-RED_500 h-2 w-2 animate-pulse rounded-full' />
                <span className='f-11-500 text-GRAY_700'>{isComplete ? 'Recording ended' : 'Live'}</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className='text-GRAY_700 hover:text-GRAY_1000 rounded-md p-0.5 transition-colors'
              >
                <X size={12} />
              </button>
            </div>

            <div className='bg-GRAY_1000 relative aspect-video w-full overflow-hidden'>
              {currentScreenshotUrl && !hasError ? (
                <img
                  src={currentScreenshotUrl}
                  alt='Browser live stream'
                  className={cn('h-full w-full object-contain', !isComplete && 'transition-opacity duration-300')}
                  onError={() => setHasError(true)}
                />
              ) : (
                <div className='flex h-full w-full items-center justify-center'>
                  <div className='text-center'>
                    <div className='bg-GRAY_800 mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full'>
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
                    <p className='f-12-450 text-GRAY_700'>
                      {hasError ? 'Failed to load stream' : 'Waiting for browser stream...'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
