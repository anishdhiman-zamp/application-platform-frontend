import { RefObject, useEffect, useRef } from 'react';
import type { EnhancedColumnDataType } from '@zamp-platform/dataset-create-edit';
import { ColDef } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { defaultFnType } from '@/types/commonTypes';

interface UseAgGridContextSyncProps {
  gridReady: boolean;
  contextColumnOrder: string[];
  contextColumns: EnhancedColumnDataType[];
  contextColumnVisibility: Record<string, boolean>;
  getColumnNamesMap: () => Record<string, string>;
  tableRef: RefObject<AgGridReact | null>;
  columns: ColDef[];
  setColumns: (cols: ColDef[]) => void;
  id: string;
  handleSuccessfulUpdate: defaultFnType;
  selectedTab?: string; // 'preview' or 'blueprint'
}

/**
 * Custom hook to sync AG Grid with DatasetColumnContext state
 * Handles column ordering, names, visibility, and dynamic addition/removal
 */
export const useAgGridContextSync = ({
  gridReady,
  contextColumnOrder,
  contextColumns,
  contextColumnVisibility,
  getColumnNamesMap,
  tableRef,
  columns,
  setColumns,
  id,
  handleSuccessfulUpdate,
  selectedTab,
}: UseAgGridContextSyncProps) => {
  const lastAppliedOrderRef = useRef<string>('');

  // Track if a move operation is in progress to prevent race conditions
  const moveInProgressRef = useRef(false);

  // Track if this is the first time grid becomes ready (to skip initial sync)
  const gridReadyInitializedRef = useRef(false);

  // Track previous tab to detect tab switches
  const prevTabRef = useRef<string | undefined>(selectedTab);

  /**
   * Force sync when switching TO Preview tab
   * This handles the case where user reorders in Blueprint while grid is hidden
   */
  useEffect(() => {
    // Detect switch TO preview tab
    const switchedToPreview = prevTabRef.current !== 'preview' && selectedTab === 'preview';

    prevTabRef.current = selectedTab;

    if (!switchedToPreview || !gridReady || contextColumnOrder.length === 0) return;

    const api = tableRef.current?.api;

    if (!api) return;

    // Check if grid order matches context order
    const currentColumns = api.getColumns();

    if (!currentColumns || currentColumns.length === 0) return;

    const currentGridOrder = currentColumns.map((col) => col.getColId()).join(',');
    const targetOrder = contextColumnOrder.join(',');

    if (currentGridOrder === targetOrder) {
      lastAppliedOrderRef.current = targetOrder;

      return;
    }

    // Force sync by updating columnDefs with correct order
    const allColumns = api.getAllGridColumns() || [];
    const colDefMap = new Map<string, ColDef>();

    allColumns.forEach((col) => {
      const colDef = col.getColDef();
      const colId = col.getColId();
      // Remove width to let AG Grid use cached widths
      const { width: _width, ...colDefWithoutWidth } = colDef;

      colDefMap.set(colId, colDefWithoutWidth);
    });

    // Create reordered columnDefs array
    const reorderedColDefs = contextColumnOrder
      .map((colId) => colDefMap.get(colId))
      .filter((colDef): colDef is ColDef => colDef !== undefined);

    if (reorderedColDefs.length > 0) {
      api.setGridOption('columnDefs', reorderedColDefs);
      lastAppliedOrderRef.current = targetOrder;
    }
  }, [selectedTab, gridReady, contextColumnOrder, tableRef]);

  /**
   * Sync context column order to AG Grid
   * NOTE: We don't sync widths here - AG Grid manages widths internally
   * and CustomHeader saves directly to localStorage
   */
  useEffect(() => {
    if (!gridReady || contextColumnOrder.length === 0 || columns.length === 0) return;

    // Skip if a move is already in progress
    if (moveInProgressRef.current) return;

    const api = tableRef.current?.api;

    if (!api) return;

    // Create a string representation of the new order for comparison
    const newOrderKey = contextColumnOrder.join(',');

    // Skip if we already applied this order (prevents infinite loop)
    if (lastAppliedOrderRef.current === newOrderKey) return;

    // Get current columns from AG Grid
    const currentColumns = api.getColumns();

    if (!currentColumns || currentColumns.length === 0) return;

    // Check current AG Grid order
    const currentGridOrder = currentColumns.map((col) => col.getColId()).join(',');

    // If AG Grid already has this order, just update ref and return
    if (currentGridOrder === newOrderKey) {
      lastAppliedOrderRef.current = newOrderKey;

      return;
    }

    // Reorder columns using AG Grid API directly
    const orderedColIds = contextColumnOrder.filter((colId) => {
      return currentColumns.some((col) => col.getColId() === colId);
    });

    if (orderedColIds.length > 0) {
      // Mark move as in progress
      moveInProgressRef.current = true;

      // Store the target order key for later verification
      const targetOrderKey = newOrderKey;

      // Move each column to its target position one by one
      // This is more reliable than applyColumnState for reordering
      orderedColIds.forEach((colId, targetIndex) => {
        const currentCols = api.getColumns() || [];
        const currentIndex = currentCols.findIndex((col) => col.getColId() === colId);

        if (currentIndex !== -1 && currentIndex !== targetIndex) {
          api.moveColumns([colId], targetIndex);
        }
      });

      // Use requestAnimationFrame to defer verification - AG Grid updates asynchronously
      // so getColumns() may return stale data immediately after moveColumns()
      requestAnimationFrame(() => {
        const gridApi = tableRef.current?.api;

        if (!gridApi) {
          moveInProgressRef.current = false;

          return;
        }

        // Verify the move was applied
        const finalGridOrder = gridApi.getColumns()?.map((col) => col.getColId()) || [];
        const moveApplied = orderedColIds.every((colId, index) => finalGridOrder[index] === colId);

        if (moveApplied) {
          lastAppliedOrderRef.current = targetOrderKey;
        }
        // If not applied, the tab switch effect will handle it when user switches to Preview

        moveInProgressRef.current = false;
      });
    } else {
      // No columns to move, just update ref
      lastAppliedOrderRef.current = newOrderKey;
    }
  }, [contextColumnOrder, contextColumns, gridReady, columns.length, tableRef]);

  /**
   * Sync context column names to AG Grid headers
   * SKIP on initial grid ready to preserve widths from localStorage
   */
  useEffect(() => {
    if (!gridReady || contextColumns.length === 0) return;

    // Skip the first time grid becomes ready to avoid overwriting widths
    if (!gridReadyInitializedRef.current) {
      gridReadyInitializedRef.current = true;

      return;
    }

    const api = tableRef.current?.api;

    if (!api) return;

    const columnNamesMap = getColumnNamesMap();

    // Update AG Grid column headers to match context column names
    const allColumns = api.getAllGridColumns();

    if (!allColumns || allColumns.length === 0) return;

    let hasChanges = false;
    const updatedColumnDefs = allColumns.map((column) => {
      const colDef = column.getColDef();
      const colId = column.getColId();
      const contextName = columnNamesMap[colId];

      // Only update if the header name actually changed
      if (contextName && colDef.headerName !== contextName) {
        hasChanges = true;

        // Don't set 'width' - let AG Grid manage widths internally
        // Setting 'width' causes AG Grid to reset widths on every re-render
        const { width: _width, ...colDefWithoutWidth } = colDef;

        return {
          ...colDefWithoutWidth,
          headerName: contextName,
        };
      }

      return colDef;
    });

    // Update all column definitions if there were changes
    if (hasChanges) {
      api.setGridOption('columnDefs', updatedColumnDefs);
    }
  }, [gridReady, contextColumns, getColumnNamesMap, tableRef]);

  /**
   * Sync context column visibility to AG Grid
   */
  useEffect(() => {
    if (!gridReady) return;

    const api = tableRef.current?.api;

    if (!api) return;

    // Apply visibility changes to AG Grid
    Object.entries(contextColumnVisibility).forEach(([colId, isVisible]) => {
      api.setColumnsVisible([colId], isVisible);
    });
  }, [gridReady, contextColumnVisibility, tableRef]);

  // Track the last synced context column IDs to prevent infinite loops
  const lastSyncedContextColIdsRef = useRef<string>('');

  /**
   * Sync context columns to AG Grid - Add/Remove columns dynamically
   * Only runs when columns are actually added or removed, not on initial load
   */
  useEffect(() => {
    if (!gridReady || contextColumns.length === 0) return;

    const api = tableRef.current?.api;

    if (!api) return;

    // Create a stable key from context column IDs to prevent infinite loops
    const contextColIdsKey = contextColumns.map((col) => col.id).join(',');

    // Skip if we already synced these context columns
    if (lastSyncedContextColIdsRef.current === contextColIdsKey) return;

    // Get current AG Grid column IDs
    const currentAgGridCols = api.getAllGridColumns() || [];
    const currentColIds = currentAgGridCols.map((col) => col.getColId());
    const contextColIds = contextColumns.map((col) => col.id);

    // Check if columns were added or removed
    const addedColIds = contextColIds.filter((colId) => !currentColIds.includes(colId));
    const removedColIds = currentColIds.filter((colId) => !contextColIds.includes(colId));

    if (addedColIds.length > 0 || removedColIds.length > 0) {
      // Mark as synced BEFORE calling setColumns to prevent loop
      lastSyncedContextColIdsRef.current = contextColIdsKey;

      // Rebuild columnDefs based on context columns
      // Don't set 'width' - let AG Grid manage widths internally to prevent resets
      const existingColDefs = columns
        .filter((colDef) => contextColIds.includes(colDef.field || '') && !addedColIds.includes(colDef.field || ''))
        .map((colDef) => {
          // Remove 'width' from colDef to prevent AG Grid from resetting widths
          const { width: _width, ...colDefWithoutWidth } = colDef;

          return colDefWithoutWidth;
        });

      // Create ColDefs for new columns
      const newColDefs = addedColIds
        .map((colId) => {
          const contextCol = contextColumns.find((col) => col.id === colId);

          if (!contextCol) return null;

          return {
            field: colId,
            headerName: contextCol.column_name || colId,
            editable: true,
            hide: !contextCol.isVisible,
            // Use initialWidth instead of width to prevent resets on re-render
            initialWidth: contextCol.width || 150,
            minWidth: 100,
            cellRenderer: undefined,
            filter: 'agTextColumnFilter',
            headerComponentParams: {
              metadata: {
                is_editable: true,
                is_hidden: false,
              },
              datasetId: id,
              options: [],
              handleSuccessfulUpdate,
              tableRef,
              filterType: 'text' as any,
              handleRulesListingSideDrawerOpen: () => {},
              isSelfServe: true,
            },
          } as ColDef;
        })
        .filter(Boolean) as ColDef[];

      // Merge existing and new columnDefs
      const updatedColDefs = [...existingColDefs, ...newColDefs];

      // Update AG Grid state
      setColumns(updatedColDefs);
    } else {
      lastSyncedContextColIdsRef.current = contextColIdsKey;
    }
  }, [gridReady, contextColumns, columns, id, handleSuccessfulUpdate, tableRef, setColumns]);
};
