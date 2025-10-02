import { getFromSessionStorage, SESSION_STORAGE_KEYS, setToSessionStorage } from '@zamp-platform/utils';
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
}: UseScrollPositionPreservationProps): UseScrollPositionPreservationReturn => {
  const saveScrollPosition = useCallback(() => {
    if (tableContainerRef.current) {
      const scrollPosition: ScrollPosition = {
        scrollTop: tableContainerRef.current.scrollTop,
        scrollLeft: tableContainerRef.current.scrollLeft,
      };

      try {
        const existingData = getFromSessionStorage(SESSION_STORAGE_KEYS.TABLE_SCROLL_POSITION);
        const allPositions = existingData ? JSON.parse(existingData) : {};
        allPositions[key] = scrollPosition;

        setToSessionStorage(SESSION_STORAGE_KEYS.TABLE_SCROLL_POSITION, JSON.stringify(allPositions));
      } catch (error) {
        console.warn('Failed to save scroll position:', error);
      }
    }
  }, [key, tableContainerRef]);

  const hasScrollPositionToRestore = useMemo(() => {
    try {
      const storedData = getFromSessionStorage(SESSION_STORAGE_KEYS.TABLE_SCROLL_POSITION);
      if (storedData) {
        const allPositions = JSON.parse(storedData);
        const position: ScrollPosition = allPositions[key];
        return !!position;
      }
    } catch (error) {
      console.warn('Failed to check scroll position:', error);
    }
    return false;
  }, [key]);

  const restoreScrollPosition = useCallback(() => {
    if (tableContainerRef.current && isDataLoaded && totalRowCount > 0 && isVirtualizationReady) {
      try {
        const storedData = getFromSessionStorage(SESSION_STORAGE_KEYS.TABLE_SCROLL_POSITION);
        if (storedData) {
          const allPositions = JSON.parse(storedData);
          const position: ScrollPosition = allPositions[key];
          if (position) {
            tableContainerRef.current.scrollTo({
              top: position.scrollTop,
              left: position.scrollLeft,
              behavior: 'instant',
            });
          }
        }
      } catch (error) {
        console.warn('Failed to restore scroll position:', error);
      }
    }
  }, [key, tableContainerRef, isDataLoaded, totalRowCount, isVirtualizationReady]);

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
