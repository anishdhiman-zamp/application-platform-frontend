'use client';

import { type RefObject, useEffect, useState } from 'react';

/**
 * Observes an element's inline size via ResizeObserver and returns `true`
 * when the width drops below `thresholdPx`. Used to toggle compact layout
 * (e.g. swapping the file icon for a close button on narrow tabs).
 */
export const useIsCompact = (ref: RefObject<HTMLElement | null>, thresholdPx: number): boolean => {
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    const el = ref.current;

    if (!el) return;

    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;
      const boxSize = Array.isArray(entry.contentBoxSize) ? entry.contentBoxSize[0] : entry.contentBoxSize;

      setIsCompact(boxSize.inlineSize < thresholdPx);
    });

    observer.observe(el);

    return () => observer.disconnect();
  }, [ref, thresholdPx]);

  return isCompact;
};
