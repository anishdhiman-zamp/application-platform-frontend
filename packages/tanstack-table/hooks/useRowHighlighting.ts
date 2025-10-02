import { getFromSessionStorage, SESSION_STORAGE_KEYS, setToSessionStorage } from '@zamp-platform/utils';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

interface UseRowHighlightingProps {
  key: string;
  isDataLoaded: boolean;
  isVirtualizationReady: boolean;
  hasScrollPositionToRestore: boolean;
  rowVirtualizer?: {
    scrollToIndex: (index: number, options?: { align?: 'start' | 'center' | 'end' | 'auto' }) => void;
  };
}

interface UseRowHighlightingReturn {
  highlightedRowIndex: number | null;
  setHighlightedRowIndex: (index: number | null) => void;
  clearHighlightedRow: () => void;
}

export const useRowHighlighting = ({
  key,
  isDataLoaded,
  isVirtualizationReady,
  hasScrollPositionToRestore,
  rowVirtualizer,
}: UseRowHighlightingProps): UseRowHighlightingReturn => {
  const searchParams = useSearchParams();
  const [highlightedRowIndex, setHighlightedRowIndexState] = useState<number | null>(null);

  const setHighlightedRowIndex = useCallback(
    (index: number | null) => {
      setHighlightedRowIndexState(index);

      if (index !== null) {
        try {
          const existingData = getFromSessionStorage(SESSION_STORAGE_KEYS.TABLE_HIGHLIGHTED_ROW);
          const allHighlightedRows = existingData ? JSON.parse(existingData) : {};
          allHighlightedRows[key] = index;

          setToSessionStorage(SESSION_STORAGE_KEYS.TABLE_HIGHLIGHTED_ROW, JSON.stringify(allHighlightedRows));
        } catch (error) {
          console.warn('Failed to save highlighted row index:', error);
        }
      } else {
        try {
          const existingData = getFromSessionStorage(SESSION_STORAGE_KEYS.TABLE_HIGHLIGHTED_ROW);
          if (existingData) {
            const allHighlightedRows = JSON.parse(existingData);
            delete allHighlightedRows[key];
            setToSessionStorage(SESSION_STORAGE_KEYS.TABLE_HIGHLIGHTED_ROW, JSON.stringify(allHighlightedRows));
          }
        } catch (error) {
          console.warn('Failed to clear highlighted row index:', error);
        }
      }
    },
    [key],
  );

  const clearHighlightedRow = useCallback(() => {
    setHighlightedRowIndex(null);
  }, [setHighlightedRowIndex]);

  useEffect(() => {
    if (isDataLoaded && isVirtualizationReady) {
      const currentIndexFromUrl = searchParams?.get('currentIndex');

      if (currentIndexFromUrl && currentIndexFromUrl !== '-1') {
        const rowIndex = parseInt(currentIndexFromUrl, 10);
        if (!isNaN(rowIndex)) {
          setHighlightedRowIndex(rowIndex);

          if (rowVirtualizer && !hasScrollPositionToRestore) {
            requestAnimationFrame(() => {
              rowVirtualizer.scrollToIndex(rowIndex, { align: 'center' });
            });
          }
          return;
        }
      }

      try {
        const storedData = getFromSessionStorage(SESSION_STORAGE_KEYS.TABLE_HIGHLIGHTED_ROW);
        if (storedData) {
          const allHighlightedRows = JSON.parse(storedData);
          const storedIndex = allHighlightedRows[key];
          if (typeof storedIndex === 'number') {
            setHighlightedRowIndexState(storedIndex);

            if (rowVirtualizer && !hasScrollPositionToRestore) {
              requestAnimationFrame(() => {
                rowVirtualizer.scrollToIndex(storedIndex, { align: 'center' });
              });
            }
          }
        }
      } catch (error) {
        console.warn('Failed to restore highlighted row index:', error);
      }
    }
  }, [isDataLoaded, isVirtualizationReady, key, searchParams, setHighlightedRowIndex, rowVirtualizer]);

  return {
    highlightedRowIndex,
    setHighlightedRowIndex,
    clearHighlightedRow,
  };
};
