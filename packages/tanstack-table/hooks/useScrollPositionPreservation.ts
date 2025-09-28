import { useCallback, useEffect } from 'react';

import {
  getFromSessionStorage,
  SESSION_STORAGE_KEYS,
  setToSessionStorage,
} from '../../../apps/application-dashboard/src/utils/sessionstorage';

interface ScrollPosition {
  scrollTop: number;
  scrollLeft: number;
}

interface UseScrollPositionPreservationProps {
  key: string;
  tableContainerRef: React.RefObject<HTMLDivElement | null>;
  isDataLoaded: boolean;
  totalRowCount: number;
}

interface UseScrollPositionPreservationReturn {
  saveScrollPosition: () => void;
  restoreScrollPosition: () => void;
}

export const useScrollPositionPreservation = ({
  key,
  tableContainerRef,
  isDataLoaded,
  totalRowCount,
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

  const restoreScrollPosition = useCallback(() => {
    if (tableContainerRef.current && isDataLoaded && totalRowCount > 0) {
      try {
        const storedData = getFromSessionStorage(SESSION_STORAGE_KEYS.TABLE_SCROLL_POSITION);
        if (storedData) {
          const allPositions = JSON.parse(storedData);
          const position: ScrollPosition = allPositions[key];
          if (position) {
            requestAnimationFrame(() => {
              if (tableContainerRef.current) {
                tableContainerRef.current.scrollTop = position.scrollTop;
                tableContainerRef.current.scrollLeft = position.scrollLeft;
              }
            });
          }
        }
      } catch (error) {
        console.warn('Failed to restore scroll position:', error);
      }
    }
  }, [key, tableContainerRef, isDataLoaded, totalRowCount]);

  useEffect(() => {
    if (isDataLoaded && totalRowCount > 0) {
      const timeoutId = setTimeout(restoreScrollPosition, 150);
      return () => clearTimeout(timeoutId);
    }
  }, [isDataLoaded, totalRowCount, restoreScrollPosition]);

  return {
    saveScrollPosition,
    restoreScrollPosition,
  };
};
