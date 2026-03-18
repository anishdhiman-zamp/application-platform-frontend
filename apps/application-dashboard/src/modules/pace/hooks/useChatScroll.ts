'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface UseChatScrollOptions {
  /** Number of messages to trigger scroll behavior */
  messagesLength: number;
  /** Whether the conversation is still loading */
  isLoading: boolean;
  /** Streaming state to track for scroll button visibility */
  streamingState?: unknown;
  /** Distance from bottom (in px) to consider "at bottom" */
  bottomThreshold?: number;
  /** Sender type of the last message - when 'USER', scrolls so the new message appears at the top of the viewport */
  lastMessageSenderType?: string;
  /** Ref to the bottom spacer div - its height is controlled dynamically so response fills viewport from top */
  emptyDivRef?: React.RefObject<HTMLDivElement | null>;
}

interface UseChatScrollReturn {
  /** Ref to attach to the scrollable container */
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  /** Callback ref to attach to the messages content wrapper — fires ResizeObserver on mount/unmount */
  contentRef: React.RefCallback<HTMLDivElement>;
  /** Whether to show the scroll-to-bottom button */
  showScrollButton: boolean;
  /** Whether the container has scrollable content above the viewport */
  canScrollTop: boolean;
  /** Whether the container has scrollable content below the viewport */
  canScrollBottom: boolean;
  /** Handler for scroll events - attach to onScroll */
  handleScroll: () => void;
  /** Click handler for the scroll-to-bottom button */
  handleScrollToBottomClick: () => void;
  /** Manually scroll to bottom with optional behavior */
  scrollToBottom: (behavior?: ScrollBehavior) => void;
}

/** Visual padding (px) above the user message when scrolled to top */
const USER_MESSAGE_TOP_PADDING = 100;

export const useChatScroll = ({
  messagesLength,
  isLoading,
  streamingState,
  bottomThreshold = 100,
  lastMessageSenderType,
  emptyDivRef,
}: UseChatScrollOptions): UseChatScrollReturn => {
  const previousIsLoadingRef = useRef<boolean>(false);
  const isInitialScrollRef = useRef<boolean>(true);
  const lastUserScrollLengthRef = useRef<number | null>(null);
  /*  Holds the ResizeObserver instance that watches the MessageContainer wrapper div for height changes */
  const responseDivRef = useRef<ResizeObserver | null>(null);
  /** Content-absolute top position of the last user message — captured once in scrollToLastUserMessage */
  const userMsgAnchorRef = useRef<number | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [canScrollTop, setCanScrollTop] = useState(false);
  const [canScrollBottom, setCanScrollBottom] = useState(false);

  const checkIfScrolledToBottom = useCallback(() => {
    if (scrollContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;

      return scrollHeight - scrollTop - clientHeight < bottomThreshold;
    }

    return true;
  }, [bottomThreshold]);

  const updateScrollFadeState = useCallback(() => {
    const el = scrollContainerRef.current;

    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;

    setCanScrollTop(scrollTop > 0);
    setCanScrollBottom(scrollHeight - scrollTop - clientHeight > 1);
  }, []);

  /**
   * Computes and sets the spacer height using the anchor position stored in userMsgAnchorRef.
   *
   * The anchor is set once in scrollToLastUserMessage (the content-absolute top of the
   * last user message). Using a stored value avoids a DOM query on every streaming tick
   * and ResizeObserver callback.
   *
   * Formula:
   *   contentFromAnchor = contentHeight - anchorTop
   *   spacer            = max(0, clientHeight - contentFromAnchor - 20)
   *
   * This keeps scrollHeight = anchorTop + clientHeight - 20 (constant), so scrollTop
   * is never clamped and the user message stays pinned.
   */
  const updateSpacerHeight = useCallback(() => {
    const container = scrollContainerRef.current;
    const spacer = emptyDivRef?.current;
    const anchorTop = userMsgAnchorRef.current;

    if (!container || !spacer || anchorTop === null) return;

    const spacerCurrentHeight = spacer.offsetHeight;
    const contentHeight = container.scrollHeight - spacerCurrentHeight;
    const contentFromAnchor = Math.max(0, contentHeight - anchorTop);
    const newSpacerHeight = Math.max(0, container.clientHeight - contentFromAnchor - USER_MESSAGE_TOP_PADDING);

    spacer.style.height = `${newSpacerHeight}px`;
  }, [emptyDivRef]);

  const resetSpacer = useCallback(() => {
    const spacer = emptyDivRef?.current;

    if (!spacer) return;
    spacer.style.height = '';
    spacer.style.minHeight = '';
  }, [emptyDivRef]);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior,
      });
    }
  }, []);

  /**
   * Scrolls the last user message to the top of the viewport.
   * Uses direct scrollTop (not scrollIntoView) so it works with overflow-y:hidden.
   *
   * Sets the spacer to container.clientHeight first — this guarantees scrollHeight is
   * always large enough that scrollTop = userMessage.offsetTop is never clamped.
   * After scrolling, updateSpacerHeight shrinks the spacer to the exact correct size
   * while keeping scrollHeight constant (so no jump occurs).
   */
  const scrollToLastUserMessage = useCallback(
    (isInitial = false) => {
      const container = scrollContainerRef.current;
      const spacer = emptyDivRef?.current;

      if (!container) return;

      // Set spacer to full clientHeight so there is always enough scrollable room
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

      // Shrink spacer to exact size — scrollHeight stays constant so scrollTop won't clamp
      updateSpacerHeight();
    },
    [emptyDivRef, updateSpacerHeight],
  );

  const handleScroll = useCallback(() => {
    if (scrollContainerRef.current) {
      const isAtBottom = checkIfScrolledToBottom();

      if (isInitialScrollRef.current) {
        if (isAtBottom) {
          isInitialScrollRef.current = false;
        }

        updateScrollFadeState();

        return;
      }

      setShowScrollButton(!isAtBottom);
      updateScrollFadeState();
    }
  }, [checkIfScrolledToBottom, updateScrollFadeState]);

  const handleScrollToBottomClick = useCallback(() => {
    userMsgAnchorRef.current = null;
    scrollToBottom('smooth');
  }, [scrollToBottom]);

  // Reset state when a new conversation starts loading
  useEffect(() => {
    if (isLoading && !previousIsLoadingRef.current) {
      isInitialScrollRef.current = true;
      lastUserScrollLengthRef.current = 0;
      userMsgAnchorRef.current = null;
      resetSpacer();
    }
    previousIsLoadingRef.current = isLoading;
  }, [isLoading, resetSpacer]);

  useEffect(() => {
    if (messagesLength > 0 && !isLoading) {
      const isInitial = isInitialScrollRef.current;

      if (isInitial) {
        isInitialScrollRef.current = false;
        requestAnimationFrame(() => {
          scrollToLastUserMessage(true);
          updateScrollFadeState();
        });

        return;
      }

      if (lastMessageSenderType === 'USER') {
        if (lastUserScrollLengthRef.current !== messagesLength) {
          lastUserScrollLengthRef.current = messagesLength;
          requestAnimationFrame(() => {
            scrollToLastUserMessage();
            updateScrollFadeState();
          });
        }
      } else {
        lastUserScrollLengthRef.current = 0;
        requestAnimationFrame(() => {
          updateSpacerHeight();
          updateScrollFadeState();
        });
      }
    }
  }, [
    messagesLength,
    isLoading,
    scrollToLastUserMessage,
    updateScrollFadeState,
    lastMessageSenderType,
    updateSpacerHeight,
  ]);

  // During streaming: keep shrinking the spacer as response grows
  useEffect(() => {
    if (!isInitialScrollRef.current) {
      const isAtBottom = checkIfScrolledToBottom();

      setShowScrollButton(!isAtBottom);
      updateSpacerHeight();
    }

    updateScrollFadeState();
  }, [streamingState, checkIfScrolledToBottom, updateScrollFadeState, updateSpacerHeight]);

  // Callback ref: sets up (and tears down) the ResizeObserver the moment the
  // content element is actually attached to the DOM, not just on first render.
  // This avoids the stale-ref problem where useEffect ran before CommonWrapper
  // finished loading and the element was still null.
  const contentRef = useCallback<React.RefCallback<HTMLDivElement>>(
    (node) => {
      responseDivRef.current?.disconnect();
      responseDivRef.current = null;

      if (!node) return;

      const observer = new ResizeObserver(() => {
        if (!isInitialScrollRef.current) {
          updateSpacerHeight();
        }
      });

      observer.observe(node);
      responseDivRef.current = observer;
    },
    [updateSpacerHeight],
  );

  return {
    scrollContainerRef,
    contentRef,
    showScrollButton,
    canScrollTop,
    canScrollBottom,
    handleScroll,
    handleScrollToBottomClick,
    scrollToBottom,
  };
};
