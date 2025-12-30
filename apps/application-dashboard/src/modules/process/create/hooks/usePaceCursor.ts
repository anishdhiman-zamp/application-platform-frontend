import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type CursorPosition = {
  x: number;
  y: number;
};

type ClickEvent = {
  x: number;
  y: number;
  timestamp: number;
};

/**
 * Custom hook to manage the pace cursor movement and interactions
 * @param containerRef - Reference to the container element
 * @param contentContainerRef - Reference to the content container element
 * @returns An object containing the cursor position, click event, and handleContainerClick function
 */

export const usePaceCursor = (
  containerRef: React.RefObject<HTMLDivElement | null>,
  contentContainerRef?: React.RefObject<HTMLDivElement | null>,
) => {
  const [clickEvent, setClickEvent] = useState<ClickEvent | null>(null);
  const [cursorPos, setCursorPos] = useState<CursorPosition | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const randomMoveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Check if cursor position is within content container bounds
  const isWithinContentContainer = useCallback(
    (pos: CursorPosition): boolean => {
      if (!contentContainerRef?.current || !containerRef.current) return false;

      const contentRect = contentContainerRef.current.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();

      // Convert cursor position to absolute coordinates relative to container
      const absoluteX = pos.x;
      const absoluteY = pos.y;

      // Check if position is within content container bounds (relative to container)
      const contentX = contentRect.left - containerRect.left;
      const contentY = contentRect.top - containerRect.top;
      const contentWidth = contentRect.width;
      const contentHeight = contentRect.height;

      return (
        absoluteX >= contentX &&
        absoluteX <= contentX + contentWidth &&
        absoluteY >= contentY &&
        absoluteY <= contentY + contentHeight
      );
    },
    [contentContainerRef, containerRef],
  );

  // Generate random position within container bounds, avoiding content container
  const getRandomPosition = useCallback((): CursorPosition | null => {
    if (!containerRef.current) return null;

    const rect = containerRef.current.getBoundingClientRect();
    const padding = 100; // Keep cursor away from edges

    // Try to find a position outside content container
    for (let i = 0; i < 50; i++) {
      const pos: CursorPosition = {
        x: Math.random() * (rect.width - padding * 2) + padding,
        y: Math.random() * (rect.height - padding * 2) + padding,
      };

      if (!isWithinContentContainer(pos)) {
        return pos;
      }
    }

    // Fallback: return a position anyway if we can't find one outside
    return {
      x: Math.random() * (rect.width - padding * 2) + padding,
      y: Math.random() * (rect.height - padding * 2) + padding,
    };
  }, [containerRef, isWithinContentContainer]);

  // Initialize cursor with random position
  useEffect(() => {
    if (cursorPos === null) {
      const randomPos = getRandomPosition();

      if (randomPos) {
        setCursorPos(randomPos);
      }
    }
  }, [cursorPos, getRandomPosition]);

  // Random movement timer - move cursor to random position periodically
  useEffect(() => {
    const moveToRandomPosition = () => {
      const randomPos = getRandomPosition();

      if (randomPos) {
        setCursorPos(randomPos);
      }
    };

    // Move to random position every 5-10 seconds
    const scheduleNextMove = () => {
      const delay = 5000 + Math.random() * 5000; // 5-10 seconds

      randomMoveTimerRef.current = setTimeout(() => {
        moveToRandomPosition();
        scheduleNextMove();
      }, delay);
    };

    scheduleNextMove();

    return () => {
      if (randomMoveTimerRef.current) {
        clearTimeout(randomMoveTimerRef.current);
      }
    };
  }, [getRandomPosition]);

  const startRevertTimer = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      const randomPos = getRandomPosition();

      if (randomPos) {
        setCursorPos(randomPos);
      }
    }, 3000);
  }, [getRandomPosition]);

  const handleContainerClick = useCallback(
    (e: React.MouseEvent) => {
      const target = e.target as HTMLElement;

      // Don't trigger cursor movement if clicking on interactive elements
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'BUTTON' ||
        target.closest('button') ||
        target.closest('input') ||
        target.closest('[role="button"]') ||
        target.closest('[role="combobox"]') ||
        target.closest('[role="listbox"]')
      ) {
        if (target.tagName === 'INPUT') {
          startRevertTimer();
        }

        return;
      }

      const rect = containerRef.current?.getBoundingClientRect();

      if (rect) {
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const pos: CursorPosition = { x, y };

        // Don't set cursor position if it's within content container bounds
        if (isWithinContentContainer(pos)) {
          return;
        }

        setClickEvent({ x, y, timestamp: Date.now() });
        setCursorPos(pos);
        startRevertTimer();
      }
    },
    [startRevertTimer, containerRef, isWithinContentContainer],
  );

  // Filter cursor position to ensure it's not within content container
  const filteredCursorPos = useMemo(() => {
    if (!cursorPos) return null;

    return isWithinContentContainer(cursorPos) ? null : cursorPos;
  }, [cursorPos, isWithinContentContainer]);

  return {
    cursorPos: filteredCursorPos,
    clickEvent,
    handleContainerClick,
  };
};
