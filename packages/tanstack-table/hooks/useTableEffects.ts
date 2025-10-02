import { ColumnOrderState, OnChangeFn, SortingState, Table, VisibilityState } from '@tanstack/react-table';
import { Virtualizer } from '@tanstack/react-virtual';
import { useEffect } from 'react';

interface UseTableEffectsProps {
  // Table instance and state
  table: Table<unknown>;
  sorting: SortingState;
  columnOrder: ColumnOrderState;
  columnVisibility: VisibilityState;

  // External callbacks
  tableRef?: React.MutableRefObject<Table<unknown> | null>;
  onTableReady?: (table: Table<unknown>) => void;
  onColumnVisible?: (columnId: string, isVisible: boolean) => void;

  // Handlers and utilities
  handleSortingChange: OnChangeFn<SortingState>;
  fetchMoreOnBottomReached: (element?: HTMLDivElement | null) => void;
  tableContainerRef: React.RefObject<HTMLDivElement | null>;
  rowVirtualizer: Virtualizer<HTMLDivElement, Element>;

  // Refs for state tracking
  prevVisibilityRef: React.RefObject<Record<string, boolean>>;
  isDragOperationRef?: React.RefObject<boolean>;
}

export const useTableEffects = ({
  table,
  sorting,
  columnOrder,
  columnVisibility,
  tableRef,
  onTableReady,
  onColumnVisible,
  handleSortingChange,
  fetchMoreOnBottomReached,
  tableContainerRef,
  rowVirtualizer,
  prevVisibilityRef,
  isDragOperationRef,
}: UseTableEffectsProps): void => {
  /**
   * Initialize table instance and expose it via ref/callback
   * Runs when table instance is created or callback changes
   */
  useEffect(() => {
    if (tableRef) {
      tableRef.current = table;
    }
    if (onTableReady) {
      onTableReady(table);
    }
  }, [table, tableRef, onTableReady]);

  /**
   * Update table options with latest sorting handler
   * Ensures table always has current sorting callback
   */
  useEffect(() => {
    table.setOptions((prev) => ({
      ...prev,
      onSortingChange: handleSortingChange,
    }));
  }, [table, handleSortingChange]);

  /**
   * Force recompute of header groups and rows when visibility/order changes
   * Ensures immediate UI updates when column state changes
   */
  useEffect(() => {
    table.setOptions((prev) => ({
      ...prev,
      state: {
        ...prev.state,
        columnOrder,
        columnVisibility,
        sorting,
      },
    }));
  }, [columnVisibility, columnOrder, sorting, table]);

  /**
   * Auto-scroll to top when sorting changes
   * Improves UX by showing newly sorted data from the beginning
   */
  useEffect(() => {
    if (table.getRowModel().rows.length > 0) {
      rowVirtualizer.scrollToIndex?.(0);
    }
  }, [sorting, table, rowVirtualizer]);

  /**
   * Trigger infinite loading check on mount and when fetch logic updates
   * Ensures data loading when component mounts or fetch logic updates
   */
  useEffect(() => {
    fetchMoreOnBottomReached(tableContainerRef.current);
  }, [fetchMoreOnBottomReached, tableContainerRef]);

  /**
   * Reset drag operation flag after column order state updates
   * Uses requestAnimationFrame to ensure state updates are processed
   */
  useEffect(() => {
    if (!isDragOperationRef?.current) return;

    const resetDragFlag = () => {
      if (isDragOperationRef) {
        isDragOperationRef.current = false;
      }
    };

    // Use requestAnimationFrame to ensure the state update has been processed
    const rafId = requestAnimationFrame(resetDragFlag);

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [columnOrder, isDragOperationRef]);

  /**
   * Detect and report column visibility changes to parent
   * Compares previous and current visibility states to identify changes
   */
  useEffect(() => {
    if (!onColumnVisible) return;

    const currentVisibility = { ...columnVisibility };
    const previousVisibility = prevVisibilityRef.current;
    const allColumnIds = new Set([...Object.keys(previousVisibility), ...Object.keys(currentVisibility)]);

    // Check each column for visibility changes
    allColumnIds.forEach((columnId) => {
      const wasVisible = previousVisibility[columnId];
      const isVisible = currentVisibility[columnId] !== false;

      if (wasVisible !== isVisible) {
        onColumnVisible(columnId, isVisible);
      }
    });

    // Update reference for next comparison
    prevVisibilityRef.current = currentVisibility;
  }, [columnVisibility, onColumnVisible, prevVisibilityRef]);
};
