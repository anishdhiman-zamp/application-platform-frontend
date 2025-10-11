import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from 'store';
import {
  clearHighlightedRow,
  clearScrollPosition,
  setHighlightedRow,
  setScrollPosition,
} from 'store/slices/table-state';

interface ScrollPosition {
  scrollTop: number;
  scrollLeft: number;
}

interface UseTableStateReduxReturn {
  saveScrollPosition: (key: string, position: ScrollPosition) => void;
  getScrollPosition: (key: string) => ScrollPosition | null;
  clearScrollPosition: (key: string) => void;
  hasScrollPositionToRestore: (key: string) => boolean;
  setHighlightedRowIndex: (key: string, rowIndex: number) => void;
  getHighlightedRowIndex: (key: string) => number | null;
  clearHighlightedRowIndex: (key: string) => void;
}

export const useTableStateRedux = (): UseTableStateReduxReturn => {
  const dispatch = useDispatch<AppDispatch>();
  const { scrollPositions, highlightedRows } = useSelector((state: RootState) => state.tableState);

  const saveScrollPosition = useCallback(
    (key: string, position: ScrollPosition) => {
      dispatch(setScrollPosition({ key, position }));
    },
    [dispatch],
  );

  const getScrollPosition = useCallback(
    (key: string) => {
      return scrollPositions[key] || null;
    },
    [scrollPositions],
  );

  const clearScrollPositionAction = useCallback(
    (key: string) => {
      dispatch(clearScrollPosition(key));
    },
    [dispatch],
  );

  const hasScrollPositionToRestore = useCallback(
    (key: string) => {
      return !!scrollPositions[key];
    },
    [scrollPositions],
  );

  const setHighlightedRowIndex = useCallback(
    (key: string, rowIndex: number) => {
      dispatch(setHighlightedRow({ key, rowIndex }));
    },
    [dispatch],
  );

  const getHighlightedRowIndex = useCallback(
    (key: string) => {
      return highlightedRows[key] ?? null;
    },
    [highlightedRows],
  );

  const clearHighlightedRowIndex = useCallback(
    (key: string) => {
      dispatch(clearHighlightedRow(key));
    },
    [dispatch],
  );

  return {
    saveScrollPosition,
    getScrollPosition,
    clearScrollPosition: clearScrollPositionAction,
    hasScrollPositionToRestore,
    setHighlightedRowIndex,
    getHighlightedRowIndex,
    clearHighlightedRowIndex,
  };
};
