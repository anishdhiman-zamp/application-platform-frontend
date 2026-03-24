'use client';

import React, {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { cn } from '@zamp-platform/ui/utils';

import { ArrowDownIcon } from './arrow-down';
import { Button } from './button';

/**
 * Provides the scroll container's DOM element to descendants (e.g. Message)
 * so they can listen for the `chatScrollEnd` custom event and sequence
 * their entrance animation after the anchor scroll completes.
 */
export const ScrollRefContext = createContext<React.RefObject<HTMLDivElement | null>>({ current: null });

export const useScrollRef = () => useContext(ScrollRefContext);

export interface ScrollContainerRef {
  scrollToBottom: (behavior?: ScrollBehavior) => void;
  scrollToTop: (behavior?: ScrollBehavior) => void;
  isAtBottom: (threshold?: number) => boolean;
  getScrollElement: () => HTMLDivElement | null;
}

const enum SenderType {
  USER = 'USER',
  ASSISTANT = 'ASSISTANT',
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
  /** Enable user-message-to-top scroll anchoring with dynamic spacer */
  enableAnchorScroll?: boolean;
  /** Sender type of the last message — drives anchor scroll vs spacer update */
  lastMessageSenderType?: string;
  /** Whether conversation data is loading — resets anchor state on conversation switch */
  isLoading?: boolean;
  /** Streaming state — triggers spacer recalculation as response grows */
  streamingState?: unknown;
}

const SNAP_BOTTOM_THRESHOLD = 2;
/** Visual padding (px) above the user message when anchored to top */
const USER_MESSAGE_TOP_PADDING = 100;

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
      bottomThreshold = 600,
      scrollToBottomClassName,
      scrollbarStyle = 'thin',
      enableAnchorScroll = false,
      lastMessageSenderType,
      isLoading = false,
      streamingState,
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

    // Anchor mode refs
    const spacerRef = useRef<HTMLDivElement>(null);
    const contentWrapperRef = useRef<HTMLDivElement>(null);
    const previousIsLoadingRef = useRef(false);
    const lastUserScrollLengthRef = useRef<number | null>(null);
    const resizeObserverRef = useRef<ResizeObserver | null>(null);
    const userMsgAnchorRef = useRef<number | null>(null);
    // When true, updateSpacerHeight is a no-op. Set after a new user message
    // anchors the spacer at full clientHeight; cleared when the AI response
    // starts arriving so the spacer can shrink progressively.
    const spacerLockedRef = useRef(false);

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

    // --- Anchor mode functions ---

    const updateSpacerHeight = useCallback(() => {
      if (spacerLockedRef.current) return;

      const container = scrollRef.current;
      const spacer = spacerRef.current;
      const anchorTop = userMsgAnchorRef.current;

      if (!container || !spacer || anchorTop === null) return;

      const spacerCurrentHeight = spacer.offsetHeight;
      const contentHeight = container.scrollHeight - spacerCurrentHeight;
      const contentFromAnchor = Math.max(0, contentHeight - anchorTop);
      const newSpacerHeight = Math.max(0, container.clientHeight - contentFromAnchor - USER_MESSAGE_TOP_PADDING);

      spacer.style.height = `${newSpacerHeight}px`;
    }, []);

    const resetSpacer = useCallback(() => {
      const spacer = spacerRef.current;

      if (!spacer) return;
      spacer.style.height = '';
      spacer.style.minHeight = '';
    }, []);

    // Timer ref for the chatScrollEnd fallback (cleared when scrollend fires first)
    const scrollEndTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const dispatchScrollEnd = useCallback(() => {
      if (scrollEndTimerRef.current) {
        clearTimeout(scrollEndTimerRef.current);
        scrollEndTimerRef.current = null;
      }
      scrollRef.current?.dispatchEvent(new CustomEvent('chatScrollEnd', { bubbles: false }));
    }, []);

    const scrollToLastUserMessage = useCallback(
      (isInitial = false) => {
        const container = scrollRef.current;
        const spacer = spacerRef.current;

        if (!container) return;

        if (spacer) {
          spacer.style.minHeight = '0px';
          spacer.style.height = `${container.clientHeight}px`;
        }

        const userMessages = container.querySelectorAll<HTMLElement>('[data-sender-type="USER"]');
        const lastUserMessage = userMessages[userMessages.length - 1];

        if (!lastUserMessage) {
          userMsgAnchorRef.current = null;
          container.scrollTo({ top: container.scrollHeight, behavior: isInitial ? 'instant' : 'smooth' });
        } else {
          const containerRect = container.getBoundingClientRect();
          const msgRect = lastUserMessage.getBoundingClientRect();
          const anchorTop = msgRect.top - containerRect.top + container.scrollTop;

          userMsgAnchorRef.current = anchorTop;
          container.scrollTo({
            top: anchorTop - USER_MESSAGE_TOP_PADDING,
            behavior: isInitial ? 'instant' : 'smooth',
          });
        }

        if (isInitial) {
          updateSpacerHeight();
        } else {
          // Lock the spacer at full clientHeight for new user messages
          spacerLockedRef.current = true;
        }

        // Notify Message components when the scroll finishes so they can
        // start their entrance animation.
        if (isInitial) {
          requestAnimationFrame(dispatchScrollEnd);
        } else {
          requestAnimationFrame(() => {
            const handleScrollEnd = () => {
              container.removeEventListener('scrollend', handleScrollEnd);
              dispatchScrollEnd();
            };
            container.addEventListener('scrollend', handleScrollEnd, { once: true });
            scrollEndTimerRef.current = setTimeout(() => {
              container.removeEventListener('scrollend', handleScrollEnd);
              dispatchScrollEnd();
            }, 1500);
          });
        }
      },
      [updateSpacerHeight, dispatchScrollEnd],
    );

    // --- Common functions ---

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

    // --- Scroll trigger effect (handles both anchor and default modes) ---
    useEffect(() => {
      if (scrollTrigger === undefined) return;

      const el = scrollRef.current;

      if (!el) return;

      if (enableAnchorScroll && !isLoading && scrollTrigger > 0) {
        const isInitial = isInitialScrollRef.current;

        if (isInitial) {
          isInitialScrollRef.current = false;
          requestAnimationFrame(() => {
            scrollToLastUserMessage(true);
            updateScrollState();
          });

          return;
        }

        if (lastMessageSenderType === SenderType.USER) {
          if (lastUserScrollLengthRef.current !== scrollTrigger) {
            lastUserScrollLengthRef.current = scrollTrigger;
            requestAnimationFrame(() => {
              scrollToLastUserMessage();
              updateScrollState();
            });
          }
        } else {
          spacerLockedRef.current = false;
          lastUserScrollLengthRef.current = 0;
          requestAnimationFrame(() => {
            updateSpacerHeight();
            updateScrollState();
          });
        }

        return;
      }

      // Default mode: scroll to bottom
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
    }, [
      scrollTrigger,
      enableAnchorScroll,
      isLoading,
      lastMessageSenderType,
      scrollToLastUserMessage,
      updateSpacerHeight,
      updateScrollState,
    ]);

    // --- Loading reset (anchor mode) ---
    useEffect(() => {
      if (!enableAnchorScroll) return;

      if (isLoading && !previousIsLoadingRef.current) {
        isInitialScrollRef.current = true;
        lastUserScrollLengthRef.current = 0;
        userMsgAnchorRef.current = null;
        spacerLockedRef.current = false;
        resetSpacer();
      }
      previousIsLoadingRef.current = isLoading;
    }, [isLoading, enableAnchorScroll, resetSpacer]);

    // --- Streaming spacer update (anchor mode) ---
    useEffect(() => {
      if (!enableAnchorScroll) return;

      if (!isInitialScrollRef.current) {
        const isAtBottom = checkIfAtBottom();

        setShowButton(!isAtBottom);
        updateSpacerHeight();
      }

      updateScrollState();
    }, [streamingState, enableAnchorScroll, checkIfAtBottom, updateScrollState, updateSpacerHeight]);

    // --- Auto scroll to bottom (default mode) ---
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

    // --- ResizeObserver for container size changes (anchor mode) ---
    useEffect(() => {
      if (!enableAnchorScroll) return;

      const el = scrollRef.current;

      if (!el) return;

      const observer = new ResizeObserver(() => {
        if (!isInitialScrollRef.current) {
          updateSpacerHeight();
        }
      });

      observer.observe(el);

      return () => observer.disconnect();
    }, [enableAnchorScroll, updateSpacerHeight]);

    // --- ResizeObserver for content changes (anchor mode) ---
    useEffect(() => {
      if (!enableAnchorScroll) return;

      const node = contentWrapperRef.current;

      if (!node) return;

      const observer = new ResizeObserver(() => {
        if (!isInitialScrollRef.current) {
          updateSpacerHeight();
        }
      });

      observer.observe(node);
      resizeObserverRef.current = observer;

      return () => {
        observer.disconnect();
        resizeObserverRef.current = null;
      };
    }, [enableAnchorScroll, updateSpacerHeight]);

    const handleScrollToBottomClick = useCallback(() => {
      if (enableAnchorScroll) {
        userMsgAnchorRef.current = null;
      }
      isAutoScrollActiveRef.current = true;
      scrollToBottom('smooth');
    }, [scrollToBottom, enableAnchorScroll]);

    const showOverlays = showFadeOverlay && !disableFadeOverlay;

    return (
      <ScrollRefContext.Provider value={scrollRef}>
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
              'flex min-h-0 w-full flex-1 flex-col overflow-x-hidden overflow-y-auto [overflow-anchor:none]',
              scrollbarStyle === 'thin' ? '[scrollbar-width:thin]' : '[scrollbar-width:none]',
              scrollClassName,
            )}
          >
            {enableAnchorScroll ? (
              <>
                <div ref={contentWrapperRef} className='flex w-full flex-1 flex-col'>
                  {children}
                </div>
                <div ref={spacerRef} className='w-full shrink-0' />
              </>
            ) : (
              children
            )}
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
      </ScrollRefContext.Provider>
    );
  },
);

ScrollContainer.displayName = 'ScrollContainer';

export { ScrollContainer };
export type { ScrollContainerProps };
