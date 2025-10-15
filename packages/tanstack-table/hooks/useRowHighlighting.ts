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
  setHighlightedRowIndex?: (key: string, rowIndex: number) => void;
  getHighlightedRowIndex?: (key: string) => number | null;
  clearHighlightedRowIndex?: (key: string) => void;
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
  setHighlightedRowIndex: setHighlightedRowIndexProp,
  getHighlightedRowIndex: getHighlightedRowIndexProp,
  clearHighlightedRowIndex: clearHighlightedRowIndexProp,
}: UseRowHighlightingProps): UseRowHighlightingReturn => {
  const searchParams = useSearchParams();
  const [highlightedRowIndex, setHighlightedRowIndexState] = useState<number | null>(null);

  const setHighlightedRowIndex = useCallback(
    (index: number | null) => {
      setHighlightedRowIndexState(index);

      if (index !== null && setHighlightedRowIndexProp) {
        setHighlightedRowIndexProp(key, index);
      } else if (index === null && clearHighlightedRowIndexProp) {
        clearHighlightedRowIndexProp(key);
      }
    },
    [key, setHighlightedRowIndexProp, clearHighlightedRowIndexProp],
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

      if (getHighlightedRowIndexProp) {
        const storedIndex = getHighlightedRowIndexProp(key);
        if (typeof storedIndex === 'number') {
          setHighlightedRowIndexState(storedIndex);

          if (rowVirtualizer && !hasScrollPositionToRestore) {
            requestAnimationFrame(() => {
              rowVirtualizer.scrollToIndex(storedIndex, { align: 'center' });
            });
          }
        }
      }
    }
  }, [
    isDataLoaded,
    isVirtualizationReady,
    key,
    searchParams,
    setHighlightedRowIndex,
    rowVirtualizer,
    getHighlightedRowIndexProp,
    hasScrollPositionToRestore,
  ]);

  return {
    highlightedRowIndex,
    setHighlightedRowIndex,
    clearHighlightedRow,
  };
};
