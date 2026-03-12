'use client';

import { type RefObject, useEffect, useState } from 'react';

const TAB_GAP_PX = 4;

const computeVisibleCount = (
  containerWidth: number,
  totalTabs: number,
  minTabWidthPx: number,
  overflowButtonWidthPx: number,
): number => {
  const perTab = minTabWidthPx + TAB_GAP_PX;
  const allFit = Math.floor(containerWidth / perTab) >= totalTabs;

  if (allFit) return totalTabs;

  const usableWidth = containerWidth - overflowButtonWidthPx - TAB_GAP_PX;

  return Math.max(1, Math.floor(usableWidth / perTab));
};

/**
 * Observes a container's width and returns the maximum number of tabs
 * that can fit such that every tab is at least `minTabWidthPx` wide.
 * Reserves space for an overflow indicator when not all tabs fit.
 */
export const useVisibleTabCount = (
  containerRef: RefObject<HTMLElement | null>,
  totalTabs: number,
  minTabWidthPx: number,
  overflowButtonWidthPx = 0,
): number => {
  const [maxVisible, setMaxVisible] = useState(totalTabs);

  useEffect(() => {
    const el = containerRef.current;

    if (!el) return;

    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;

      const boxSize = Array.isArray(entry.contentBoxSize) ? entry.contentBoxSize[0] : entry.contentBoxSize;
      const containerWidth = boxSize.inlineSize;

      setMaxVisible(computeVisibleCount(containerWidth, totalTabs, minTabWidthPx, overflowButtonWidthPx));
    });

    observer.observe(el);

    return () => observer.disconnect();
  }, [containerRef, minTabWidthPx, totalTabs, overflowButtonWidthPx]);

  return Math.min(maxVisible, totalTabs);
};
