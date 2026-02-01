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
  const isInitialScrollRef = useRef(true);

  const checkIfScrolledToBottom = useCallback(() => {
    if (scrollContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

      return distanceFromBottom < bottomThreshold;
    }

    return true;
  }, [bottomThreshold]);

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

        return;
      }

      setShowScrollButton(!isAtBottom);
    }
  }, [checkIfScrolledToBottom]);

  const handleScrollToBottomClick = useCallback(() => {
    scrollToBottom('smooth');
  }, [scrollToBottom]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesLength > 0 && !isLoading) {
      // Use instant scroll on first load, smooth scroll for subsequent updates
      const behavior = isInitialScrollRef.current ? 'instant' : 'smooth';

      // Small delay to ensure DOM has updated
      requestAnimationFrame(() => {
        scrollToBottom(behavior);
      });
    }
  }, [messagesLength, isLoading, scrollToBottom]);

  // Check for scroll button visibility when streaming state changes
  useEffect(() => {
    if (!isInitialScrollRef.current) {
      const isAtBottom = checkIfScrolledToBottom();

      setShowScrollButton(!isAtBottom);
    }
  }, [streamingState, checkIfScrolledToBottom]);

  return {
    scrollContainerRef,
    showScrollButton,
    handleScroll,
    handleScrollToBottomClick,
    scrollToBottom,
  };
};
