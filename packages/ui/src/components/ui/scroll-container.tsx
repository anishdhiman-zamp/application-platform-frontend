'use client';

import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { cn } from '@zamp-platform/ui/utils';

import { ArrowDownIcon } from './arrow-down';
import { Button } from './button';

export interface ScrollContainerRef {
  scrollToBottom: (behavior?: ScrollBehavior) => void;
  scrollToTop: (behavior?: ScrollBehavior) => void;
  isAtBottom: (threshold?: number) => boolean;
  getScrollElement: () => HTMLDivElement | null;
}

interface ScrollContainerProps {
  children: React.ReactNode;
  className?: string;
  scrollClassName?: string;
  showFadeOverlay?: boolean;
  disableFadeOverlay?: boolean;
  fadeHeight?: string;
  showScrollToBottom?: boolean;
  /** Scroll to bottom when this value changes (e.g. messagesLength) */
  scrollTrigger?: number;
  /** Auto-follow content growth (e.g. streaming). Stops on any user scroll. */
  autoScrollToBottom?: boolean;
  bottomThreshold?: number;
  scrollToBottomClassName?: string;
  scrollbarStyle?: 'thin' | 'none';
}

const SNAP_BOTTOM_THRESHOLD = 2;

const ScrollContainer = forwardRef<ScrollContainerRef, ScrollContainerProps>(
  (
    {
      children,
      className,
      scrollClassName,
      showFadeOverlay = true,
      disableFadeOverlay = false,
      fadeHeight = 'h-6',
      showScrollToBottom = false,
      scrollTrigger,
      autoScrollToBottom = false,
      bottomThreshold = 100,
      scrollToBottomClassName,
      scrollbarStyle = 'thin',
    },
    ref,
  ) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollTop, setCanScrollTop] = useState(false);
    const [canScrollBottom, setCanScrollBottom] = useState(false);
    const [showButton, setShowButton] = useState(false);
    const isInitialScrollRef = useRef(true);
    const isProgrammaticScrollRef = useRef(false);
    const isAutoScrollActiveRef = useRef(true);

    const updateScrollState = useCallback(() => {
      const el = scrollRef.current;

      if (!el) return;
      const { scrollTop, scrollHeight, clientHeight } = el;

      setCanScrollTop(scrollTop > 0);
      setCanScrollBottom(scrollHeight - scrollTop - clientHeight > 1);
    }, []);

    const checkIfAtBottom = useCallback(
      (threshold?: number) => {
        const el = scrollRef.current;

        if (!el) return true;
        const { scrollTop, scrollHeight, clientHeight } = el;

        return scrollHeight - scrollTop - clientHeight < (threshold ?? bottomThreshold);
      },
      [bottomThreshold],
    );

    const handleScroll = useCallback(() => {
      if (isProgrammaticScrollRef.current) {
        updateScrollState();

        return;
      }

      const el = scrollRef.current;

      if (el) {
        const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;

        if (distFromBottom <= SNAP_BOTTOM_THRESHOLD) {
          isAutoScrollActiveRef.current = true;
        } else {
          isAutoScrollActiveRef.current = false;
        }
      }

      const isAtBottom = checkIfAtBottom();

      if (isInitialScrollRef.current) {
        if (isAtBottom) {
          isInitialScrollRef.current = false;
        }
        updateScrollState();

        return;
      }

      setShowButton(!isAtBottom);
      updateScrollState();
    }, [checkIfAtBottom, updateScrollState]);

    const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
      const el = scrollRef.current;

      if (!el) return;
      el.scrollTo({ top: el.scrollHeight, behavior });
    }, []);

    const scrollToTop = useCallback((behavior: ScrollBehavior = 'smooth') => {
      const el = scrollRef.current;

      if (!el) return;
      el.scrollTo({ top: 0, behavior });
    }, []);

    useImperativeHandle(
      ref,
      () => ({
        scrollToBottom,
        scrollToTop,
        isAtBottom: (threshold?: number) => checkIfAtBottom(threshold),
        getScrollElement: () => scrollRef.current,
      }),
      [scrollToBottom, scrollToTop, checkIfAtBottom],
    );

    useEffect(() => {
      if (scrollTrigger === undefined) return;

      const el = scrollRef.current;

      if (!el) return;

      const behavior: ScrollBehavior = isInitialScrollRef.current ? 'instant' : 'smooth';

      isAutoScrollActiveRef.current = true;
      isProgrammaticScrollRef.current = true;
      requestAnimationFrame(() => {
        if (el.scrollHeight > el.clientHeight) {
          el.scrollTo({ top: el.scrollHeight, behavior });
          isInitialScrollRef.current = false;
        }
        isProgrammaticScrollRef.current = false;
      });
    }, [scrollTrigger]);

    useEffect(() => {
      if (!autoScrollToBottom) return;

      const el = scrollRef.current;

      if (!el) return;

      let rafId: number | null = null;

      const checkAndScroll = () => {
        rafId = null;

        if (!isAutoScrollActiveRef.current) return;

        isProgrammaticScrollRef.current = true;
        el.scrollTo({ top: el.scrollHeight, behavior: 'instant' });
        isProgrammaticScrollRef.current = false;
      };

      const observer = new MutationObserver(() => {
        if (rafId === null) {
          rafId = requestAnimationFrame(checkAndScroll);
        }
      });

      observer.observe(el, {
        childList: true,
        subtree: true,
        characterData: true,
      });

      return () => {
        observer.disconnect();
        if (rafId !== null) cancelAnimationFrame(rafId);
      };
    }, [autoScrollToBottom]);

    const handleScrollToBottomClick = useCallback(() => {
      isAutoScrollActiveRef.current = true;
      scrollToBottom('smooth');
    }, [scrollToBottom]);

    const showOverlays = showFadeOverlay && !disableFadeOverlay;

    return (
      <div className={cn('relative flex min-h-0 flex-1 flex-col overflow-hidden', className)}>
        {showOverlays && (
          <>
            <div
              aria-hidden
              className={cn(
                'pointer-events-none absolute inset-x-0 top-0 z-20',
                fadeHeight,
                'transition-opacity duration-200',
                canScrollTop ? 'opacity-100' : 'opacity-0',
              )}
              style={{
                background: 'linear-gradient(180deg, var(--BG_WHITE) 0%, transparent 100%)',
              }}
            />
            <div
              aria-hidden
              className={cn(
                'pointer-events-none absolute inset-x-0 bottom-0 z-20',
                fadeHeight,
                'transition-opacity duration-200',
                canScrollBottom ? 'opacity-100' : 'opacity-0',
              )}
              style={{
                background: 'linear-gradient(0deg, var(--BG_WHITE) 0%, transparent 100%)',
              }}
            />
          </>
        )}

        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className={cn(
            'flex min-h-0 w-full flex-1 flex-col overflow-x-hidden overflow-y-auto',
            scrollbarStyle === 'thin' ? '[scrollbar-width:thin]' : '[scrollbar-width:none]',
            scrollClassName,
          )}
        >
          {children}
        </div>

        {showScrollToBottom && (
          <Button
            onClick={handleScrollToBottomClick}
            variant='ghost'
            className={cn(
              'bg-GRAY_1000 hover:bg-GRAY_950 absolute bottom-2 left-1/2 z-20 h-6 w-6 -translate-x-1/2 rounded-full p-3',
              'transition-all duration-200 ease-out',
              showButton ? '-translate-y-2 opacity-100' : 'pointer-events-none translate-y-2 opacity-0',
              scrollToBottomClassName,
            )}
            aria-label='Scroll to bottom'
          >
            <ArrowDownIcon size={14} className='text-BG_WHITE p-[2px]' />
          </Button>
        )}
      </div>
    );
  },
);

ScrollContainer.displayName = 'ScrollContainer';

export { ScrollContainer };
export type { ScrollContainerProps };
