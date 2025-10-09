import { useCallback, useEffect, useMemo } from 'react';

interface ScrollPosition {
  scrollTop: number;
  scrollLeft: number;
}

interface UseScrollPositionPreservationProps {
  key: string;
  tableContainerRef: React.RefObject<HTMLDivElement | null>;
  isDataLoaded: boolean;
  totalRowCount: number;
  isVirtualizationReady: boolean;
  saveScrollPosition?: (key: string, position: ScrollPosition) => void;
  getScrollPosition?: (key: string) => ScrollPosition | null;
  hasScrollPositionToRestore?: (key: string) => boolean;
}

interface UseScrollPositionPreservationReturn {
  saveScrollPosition: () => void;
  restoreScrollPosition: () => void;
  hasScrollPositionToRestore: boolean;
}

export const useScrollPositionPreservation = ({
  key,
  tableContainerRef,
  isDataLoaded,
  totalRowCount,
  isVirtualizationReady,
  saveScrollPosition: saveScrollPositionProp,
  getScrollPosition: getScrollPositionProp,
  hasScrollPositionToRestore: hasScrollPositionToRestoreProp,
}: UseScrollPositionPreservationProps): UseScrollPositionPreservationReturn => {
  const saveScrollPosition = useCallback(() => {
    if (tableContainerRef.current && saveScrollPositionProp) {
      const scrollPosition: ScrollPosition = {
        scrollTop: tableContainerRef.current.scrollTop,
        scrollLeft: tableContainerRef.current.scrollLeft,
      };
      saveScrollPositionProp(key, scrollPosition);
    }
  }, [key, tableContainerRef, saveScrollPositionProp]);

  const hasScrollPositionToRestore = useMemo(() => {
    return hasScrollPositionToRestoreProp ? hasScrollPositionToRestoreProp(key) : false;
  }, [key, hasScrollPositionToRestoreProp]);

  const restoreScrollPosition = useCallback(() => {
    if (
      tableContainerRef.current &&
      isDataLoaded &&
      totalRowCount > 0 &&
      isVirtualizationReady &&
      getScrollPositionProp
    ) {
      const position = getScrollPositionProp(key);
      if (position) {
        tableContainerRef.current.scrollTo({
          top: position.scrollTop,
          left: position.scrollLeft,
          behavior: 'instant',
        });
      }
    }
  }, [key, tableContainerRef, isDataLoaded, totalRowCount, isVirtualizationReady, getScrollPositionProp]);

  useEffect(() => {
    if (isDataLoaded && totalRowCount > 0 && isVirtualizationReady) {
      requestAnimationFrame(() => {
        restoreScrollPosition();
      });
    }
  }, [isDataLoaded, totalRowCount, isVirtualizationReady, restoreScrollPosition]);

  return {
    saveScrollPosition,
    restoreScrollPosition,
    hasScrollPositionToRestore,
  };
};
