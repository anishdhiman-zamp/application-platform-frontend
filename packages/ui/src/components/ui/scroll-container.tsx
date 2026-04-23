'use client';

import React, {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
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
  conversationKey?: string | number | null;
  lastUserMessageKey?: string | number | null;
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
      conversationKey,
      lastUserMessageKey,
    },
    ref,
  ) => {
    // refs
    const isInitialScrollRef = useRef(true);
    const isAutoScrollActiveRef = useRef(true);
    const previousIsLoadingRef = useRef(false);
    const isProgrammaticScrollRef = useRef(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const spacerRef = useRef<HTMLDivElement>(null);
    const userMsgAnchorRef = useRef<number | null>(null);
    const contentWrapperRef = useRef<HTMLDivElement>(null);
    const previousConversationKeyRef = useRef(conversationKey);
    const lastUserScrollLengthRef = useRef<number | null>(null);
    const previousLastUserMessageKeyRef = useRef(lastUserMessageKey);

    // state
    const [canScrollTop, setCanScrollTop] = useState(false);
    const [canScrollBottom, setCanScrollBottom] = useState(false);
    const [showButton, setShowButton] = useState(false);

    const showOverlays = showFadeOverlay && !disableFadeOverlay;

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

    const updateSpacerHeight = useCallback(() => {
      const container = scrollRef.current;
      const spacer = spacerRef.current;

      if (!container || !spacer || userMsgAnchorRef.current === null) return;

      // Re-measure live: content above the anchor (thinking blocks, images, streaming markdown)
      // can grow after the anchor was first captured, making the cached offsetTop stale.
      const userMessages = container.querySelectorAll<HTMLElement>('[data-sender-type="USER"]');
      const lastUserMessage = userMessages[userMessages.length - 1];

      if (!lastUserMessage) return;

      let anchorTop = 0;
      let el: HTMLElement | null = lastUserMessage;

      while (el && el !== container) {
        anchorTop += el.offsetTop;
        el = el.offsetParent as HTMLElement | null;
      }

      if (el !== container) return;

      userMsgAnchorRef.current = anchorTop;

      const spacerCurrentHeight = spacer.offsetHeight;
      const contentHeight = container.scrollHeight - spacerCurrentHeight;
      const contentFromAnchor = Math.max(0, contentHeight - anchorTop);
      const newSpacerHeight = Math.max(0, container.clientHeight - contentFromAnchor - USER_MESSAGE_TOP_PADDING);

      // Sub-pixel changes cause jitter during streaming (each chunk toggles the value by <1px).
      // Only write when the change is user-perceptible.
      if (Math.abs(newSpacerHeight - spacerCurrentHeight) < 1) return;

      spacer.style.height = `${newSpacerHeight}px`;

      // Clamp scrollTop if it now exceeds the scrollable range (spacer shrunk).
      // Reading container.scrollHeight after the style write forces layout and reflects
      // the new spacer height, so no delta arithmetic is needed.
      const maxScrollTop = Math.max(0, container.scrollHeight - container.clientHeight);

      if (container.scrollTop > maxScrollTop) {
        container.scrollTop = maxScrollTop;
      }
    }, []);

    const resetSpacer = useCallback(() => {
      const spacer = spacerRef.current;

      if (!spacer) return;
      spacer.style.height = '';
      spacer.style.minHeight = '';
    }, []);

    const dispatchScrollEnd = useCallback(() => {
      scrollRef.current?.dispatchEvent(new CustomEvent('chatScrollEnd', { bubbles: false }));
    }, []);

    const scrollToLastUserMessage = useCallback(
      (isInitial = false) => {
        const container = scrollRef.current;
        const spacer = spacerRef.current;

        if (!container) return;

        // Message positions are unaffected by spacer height (spacer is after
        // content in the DOM), so we can query positions with any spacer value.
        const userMessages = container.querySelectorAll<HTMLElement>('[data-sender-type="USER"]');
        const lastUserMessage = userMessages[userMessages.length - 1];

        if (!lastUserMessage) {
          userMsgAnchorRef.current = null;

          if (spacer) {
            spacer.style.minHeight = '0px';
            spacer.style.height = '0px';
          }
          container.scrollTo({ top: container.scrollHeight, behavior: isInitial ? 'instant' : 'smooth' });
        } else {
          // offsetTop chain over getBoundingClientRect: CSS transforms on entrance animations
          // would otherwise skew the anchor position.
          let anchorTop = 0;
          let el: HTMLElement | null = lastUserMessage;

          while (el && el !== container) {
            anchorTop += el.offsetTop;
            el = el.offsetParent as HTMLElement | null;
          }

          if (el !== container) anchorTop = 0;

          userMsgAnchorRef.current = anchorTop;

          const spacerCurrentHeight = spacer?.offsetHeight ?? 0;
          const contentHeight = container.scrollHeight - spacerCurrentHeight;
          const contentFromAnchor = Math.max(0, contentHeight - anchorTop);
          const newSpacerHeight = Math.max(0, container.clientHeight - contentFromAnchor - USER_MESSAGE_TOP_PADDING);

          if (spacer) {
            spacer.style.minHeight = '0px';
            spacer.style.height = `${newSpacerHeight}px`;
          }

          container.scrollTo({
            top: anchorTop - USER_MESSAGE_TOP_PADDING,
            behavior: isInitial ? 'instant' : 'smooth',
          });
        }

        // Message components wait for chatScrollEnd before starting their entrance animation.
        requestAnimationFrame(dispatchScrollEnd);
      },
      [dispatchScrollEnd],
    );

    const handleScroll = useCallback(() => {
      if (isProgrammaticScrollRef.current) {
        updateScrollState();

        return;
      }

      const el = scrollRef.current;

      if (el) {
        const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;

        isAutoScrollActiveRef.current = distFromBottom <= SNAP_BOTTOM_THRESHOLD;
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

    const handleScrollToBottomClick = useCallback(() => {
      if (enableAnchorScroll) {
        userMsgAnchorRef.current = null;
      }
      isAutoScrollActiveRef.current = true;
      scrollToBottom('smooth');
    }, [scrollToBottom, enableAnchorScroll]);

    useEffect(() => {
      if (scrollTrigger === undefined) return;

      const el = scrollRef.current;

      if (!el) return;

      if (enableAnchorScroll) {
        if (isLoading || scrollTrigger <= 0) {
          return;
        }

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
            // Mark the current key as handled so the lastUserMessageKey effect doesn't
            // schedule a duplicate scrollToLastUserMessage on the same commit.
            previousLastUserMessageKeyRef.current = lastUserMessageKey;
            requestAnimationFrame(() => {
              scrollToLastUserMessage();
              updateScrollState();
            });
          }
        } else {
          lastUserScrollLengthRef.current = 0;
          requestAnimationFrame(() => {
            updateSpacerHeight();
            updateScrollState();
          });
        }

        return;
      }

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
      conversationKey,
      lastUserMessageKey,
      scrollToLastUserMessage,
      updateSpacerHeight,
      updateScrollState,
    ]);

    useEffect(() => {
      if (!enableAnchorScroll) return;

      if (isLoading && !previousIsLoadingRef.current) {
        isInitialScrollRef.current = true;
        lastUserScrollLengthRef.current = 0;
        userMsgAnchorRef.current = null;
        resetSpacer();
      }
      previousIsLoadingRef.current = isLoading;
    }, [isLoading, enableAnchorScroll, resetSpacer]);

    // Reset synchronously during render: the scroll-trigger effect runs in declaration order
    // and would otherwise read a stale `isInitialScrollRef` on the same commit the switch happens.
    if (enableAnchorScroll && previousConversationKeyRef.current !== conversationKey) {
      previousConversationKeyRef.current = conversationKey;
      isInitialScrollRef.current = true;
      lastUserScrollLengthRef.current = 0;
      userMsgAnchorRef.current = null;
      previousLastUserMessageKeyRef.current = null;
    }

    // Re-anchor when the latest user message's identity changes.
    useEffect(() => {
      if (!enableAnchorScroll) return;
      if (lastUserMessageKey === null || lastUserMessageKey === undefined) return;
      if (previousLastUserMessageKeyRef.current === lastUserMessageKey) return;

      const wasFirstAnchor =
        previousLastUserMessageKeyRef.current === null || previousLastUserMessageKeyRef.current === undefined;

      previousLastUserMessageKeyRef.current = lastUserMessageKey;

      if (isInitialScrollRef.current) return;

      requestAnimationFrame(() => {
        scrollToLastUserMessage(wasFirstAnchor);
      });
    }, [lastUserMessageKey, enableAnchorScroll, scrollToLastUserMessage]);

    useEffect(() => {
      if (!enableAnchorScroll) return;

      // Spacer recompute is handled by the content-wrapper ResizeObserver. Here we only
      // refresh the scroll-to-bottom button visibility and the overlay state.
      if (!isInitialScrollRef.current) {
        setShowButton(!checkIfAtBottom());
      }

      updateScrollState();
    }, [streamingState, enableAnchorScroll, checkIfAtBottom, updateScrollState]);

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

    useEffect(() => {
      if (!enableAnchorScroll) return;

      const el = scrollRef.current;

      if (!el) return;

      // Preserve the user's visual position across container width changes (sidebar ↔ expanded):
      // reflow shifts every element's offsetTop, so restore scroll relative to the top-most message.
      let previousWidth = el.clientWidth;
      let anchorElement: HTMLElement | null = null;
      let anchorOffset = 0;

      const observer = new ResizeObserver(() => {
        if (isInitialScrollRef.current) {
          previousWidth = el.clientWidth;
          anchorElement = null;
          return;
        }

        const widthChanged = Math.abs(el.clientWidth - previousWidth) > 0.5;

        previousWidth = el.clientWidth;

        updateSpacerHeight();
        setShowButton(!checkIfAtBottom());

        // Restore the user's visual position using the pre-resize
        // anchor. This runs AFTER updateSpacerHeight so spacer is correct for the new width
        if (widthChanged && anchorElement && el.contains(anchorElement)) {
          const newRect = anchorElement.getBoundingClientRect();
          const newContainerTop = el.getBoundingClientRect().top;
          const delta = newRect.top - newContainerTop - anchorOffset;

          if (Math.abs(delta) > 0.5) el.scrollTop += delta;
        }
      });

      observer.observe(el);

      // Refresh the anchor element lazily on scroll so the resize handler has a fresh target.
      // rAF-throttled to avoid running a querySelectorAll on every scroll event.
      const updateAnchor = () => {
        const candidates = el.querySelectorAll<HTMLElement>('[data-sender-type]');
        const containerTop = el.getBoundingClientRect().top;

        for (const candidate of candidates) {
          const rect = candidate.getBoundingClientRect();

          if (rect.bottom > containerTop) {
            anchorElement = candidate;
            anchorOffset = rect.top - containerTop;
            return;
          }
        }

        anchorElement = null;
      };

      let anchorRafId: number | null = null;
      const scheduleUpdateAnchor = () => {
        if (anchorRafId !== null) return;
        anchorRafId = requestAnimationFrame(() => {
          anchorRafId = null;
          updateAnchor();
        });
      };

      updateAnchor();
      el.addEventListener('scroll', scheduleUpdateAnchor, { passive: true });

      return () => {
        observer.disconnect();
        el.removeEventListener('scroll', scheduleUpdateAnchor);
        if (anchorRafId !== null) cancelAnimationFrame(anchorRafId);
      };
    }, [enableAnchorScroll, updateSpacerHeight, checkIfAtBottom]);

    useEffect(() => {
      if (!enableAnchorScroll) return;

      const node = contentWrapperRef.current;

      if (!node) return;

      // rAF-throttled: streaming fires ResizeObserver per chunk; running updateSpacerHeight
      // synchronously each time causes layout thrash that shows up as scroll jitter.
      let rafId: number | null = null;
      const observer = new ResizeObserver(() => {
        if (isInitialScrollRef.current || rafId !== null) return;
        rafId = requestAnimationFrame(() => {
          rafId = null;
          updateSpacerHeight();
        });
      });

      observer.observe(node);

      return () => {
        observer.disconnect();
        if (rafId !== null) cancelAnimationFrame(rafId);
      };
    }, [enableAnchorScroll, updateSpacerHeight]);

    /** Fade overlays read `canScrollTop` / `canScrollBottom`; sync on mount and when content/size changes (not only after `scroll`). */
    useLayoutEffect(() => {
      if (!showOverlays) return;

      const el = scrollRef.current;

      if (!el) return;

      let rafId: number | null = null;

      const scheduleSync = () => {
        if (rafId !== null) return;
        rafId = requestAnimationFrame(() => {
          rafId = null;
          updateScrollState();
        });
      };

      scheduleSync();

      const resizeObserver = new ResizeObserver(scheduleSync);

      resizeObserver.observe(el);

      const mutationObserver = new MutationObserver(scheduleSync);

      mutationObserver.observe(el, {
        childList: true,
        subtree: true,
        characterData: true,
      });

      return () => {
        if (rafId !== null) cancelAnimationFrame(rafId);
        resizeObserver.disconnect();
        mutationObserver.disconnect();
      };
    }, [showOverlays, updateScrollState]);

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
              'relative flex min-h-0 w-full flex-1 flex-col overflow-x-hidden overflow-y-auto [overflow-anchor:none]',
              scrollbarStyle === 'thin'
                ? '[scrollbar-width:thin]'
                : '[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
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
                'bg-GRAY_1000 hover:bg-GRAY_950 absolute bottom-2 left-1/2 z-10 h-6 w-6 -translate-x-1/2 rounded-full p-3',
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
