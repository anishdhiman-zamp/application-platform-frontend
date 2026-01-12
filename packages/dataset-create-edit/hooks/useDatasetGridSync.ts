import { ColumnMovedEvent } from 'ag-grid-community';
import { useCallback } from 'react';

import { UI_COLUMN_MOVED } from '../constants';
import { useDatasetColumnContext } from '../context/DatasetColumnContext';

/**
 * Hook to sync AG Grid column changes with the unified DatasetColumnContext
 * This hook handles:
 * - Column reordering via drag-drop
 * - Column visibility changes
 * - Column width changes
 */
export const useDatasetGridSync = () => {
  const {
    handleColumnMoved: contextHandleColumnMoved,
    handleColumnVisibilityChange,
    handleColumnWidthChange,
    getPreviewColumnConfig,
  } = useDatasetColumnContext();

  /**
   * Handle column moved event from AG Grid
   * Updates the context with new column order
   */
  const handleColumnMoved = useCallback(
    (event: ColumnMovedEvent) => {
      const { column, toIndex, finished, source } = event;

      // Only process finished events (not during drag)
      if (!finished) return;

      // Only process user-initiated moves, skip API-triggered moves to prevent infinite loops
      if (source !== UI_COLUMN_MOVED) return;

      if (!column || toIndex === undefined) return;

      const fromId = column.getColId();

      // Pass the column ID and target index to context
      contextHandleColumnMoved(fromId, toIndex);
    },
    [contextHandleColumnMoved],
  );

  /**
   * Handle column visibility toggle from AG Grid
   */
  const handleVisibilityChange = useCallback(
    (columnId: string, isVisible: boolean) => {
      handleColumnVisibilityChange(columnId, isVisible);
    },
    [handleColumnVisibilityChange],
  );

  /**
   * Handle column width change from AG Grid
   */
  const handleWidthChange = useCallback(
    (columnId: string, width: number) => {
      handleColumnWidthChange(columnId, width);
    },
    [handleColumnWidthChange],
  );

  /**
   * Get column configuration for AG Grid
   * Returns ordering and visibility config from context
   */
  const getColumnConfig = useCallback(() => {
    return getPreviewColumnConfig();
  }, [getPreviewColumnConfig]);

  return {
    handleColumnMoved,
    handleVisibilityChange,
    handleWidthChange,
    getColumnConfig,
  };
};
