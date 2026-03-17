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
}

interface UseChatScrollReturn {
  /** Ref to attach to the scrollable container */
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
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

export const useChatScroll = ({
  messagesLength,
  isLoading,
  streamingState,
  bottomThreshold = 100,
}: UseChatScrollOptions): UseChatScrollReturn => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [canScrollTop, setCanScrollTop] = useState(false);
  const [canScrollBottom, setCanScrollBottom] = useState(false);
  const isInitialScrollRef = useRef(true);

  const checkIfScrolledToBottom = useCallback(() => {
    if (scrollContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

      return distanceFromBottom < bottomThreshold;
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

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior,
      });
    }
  }, []);

  const handleScroll = useCallback(() => {
    if (scrollContainerRef.current) {
      const isAtBottom = checkIfScrolledToBottom();

      // Don't show button during initial scroll on page load
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
    scrollToBottom('smooth');
  }, [scrollToBottom]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesLength > 0 && !isLoading) {
      const behavior = isInitialScrollRef.current ? 'instant' : 'smooth';

      requestAnimationFrame(() => {
        scrollToBottom(behavior);
        updateScrollFadeState();
      });
    }
  }, [messagesLength, isLoading, scrollToBottom, updateScrollFadeState]);

  // Check for scroll button visibility when streaming state changes
  useEffect(() => {
    if (!isInitialScrollRef.current) {
      const isAtBottom = checkIfScrolledToBottom();

      setShowScrollButton(!isAtBottom);
    }
    updateScrollFadeState();
  }, [streamingState, checkIfScrolledToBottom, updateScrollFadeState]);

  return {
    scrollContainerRef,
    showScrollButton,
    canScrollTop,
    canScrollBottom,
    handleScroll,
    handleScrollToBottomClick,
    scrollToBottom,
  };
};
