import { RefObject, useEffect, useRef } from 'react';
import type { EnhancedColumnDataType } from '@zamp-platform/dataset-create-edit';
import { ColDef } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { getColumnOrderingVisibilityForCurrentDataset } from '@/modules/data/data.utils';
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
   * This handles the case where user reorders/hides/resizes columns while grid is hidden
   */
  useEffect(() => {
    // Detect switch TO preview tab
    const switchedToPreview = prevTabRef.current !== 'preview' && selectedTab === 'preview';

    prevTabRef.current = selectedTab;

    if (!switchedToPreview || !gridReady || contextColumnOrder.length === 0) {
      return;
    }

    const api = tableRef.current?.api;

    if (!api) return;

    // Force sync visibility immediately when switching to Preview
    Object.entries(contextColumnVisibility).forEach(([colId, isVisible]) => {
      api.setColumnsVisible([colId], isVisible);
    });

    const currentColumns = api.getColumns();

    if (!currentColumns || currentColumns.length === 0) return;

    // Read widths from localStorage (source of truth for user resizes)
    const storedConfig = getColumnOrderingVisibilityForCurrentDataset(id);
    const localStorageWidthMap = new Map(storedConfig?.map((c) => [c.colId, c.width]) || []);

    // Check if we need to sync widths (even if order is the same)
    const needsWidthSync = storedConfig?.some((stored) => {
      const col = currentColumns.find((c) => c.getColId() === stored.colId);

      return col && stored.width > 0 && col.getActualWidth() !== stored.width;
    });

    const currentGridOrder = currentColumns.map((col) => col.getColId()).join(',');
    const targetOrder = contextColumnOrder.join(',');
    const needsOrderSync = currentGridOrder !== targetOrder;

    // Always sync if widths or order need updating
    if (!needsWidthSync && !needsOrderSync) {
      lastAppliedOrderRef.current = targetOrder;

      return;
    }

    // Get column names from context to ensure headerName is always correct
    const columnNamesMap = getColumnNamesMap();

    // Force sync by updating columnDefs with correct order, visibility, AND widths from localStorage
    const allColumns = api.getAllGridColumns() || [];
    const colDefMap = new Map<string, ColDef>();

    allColumns.forEach((col) => {
      const colDef = col.getColDef();
      const colId = col.getColId();
      const actualWidth = col.getActualWidth(); // Get the current rendered width from AG Grid

      // Apply context visibility and localStorage width to the colDef
      const isVisible = contextColumnVisibility[colId];
      const localStorageWidth = localStorageWidthMap.get(colId);
      // Prioritize localStorage width (from user resizes), then current actual width, then default
      const width = localStorageWidth && localStorageWidth > 0 ? localStorageWidth : actualWidth || 200;

      // Get the correct header name from context (column_name), fallback to existing headerName
      const headerName = colId in columnNamesMap ? columnNamesMap[colId] : colDef.headerName;

      const colDefWithVisibility = {
        ...colDef,
        width,
        flex: 0, // Disable flex to use fixed width
        hide: isVisible !== undefined ? !isVisible : colDef.hide,
        headerName, // Always apply the correct header name from context
      };

      colDefMap.set(colId, colDefWithVisibility);
    });

    // Create reordered columnDefs array
    const reorderedColDefs = contextColumnOrder
      .map((colId) => colDefMap.get(colId))
      .filter((colDef): colDef is ColDef => colDef !== undefined);

    if (reorderedColDefs.length > 0) {
      api.setGridOption('columnDefs', reorderedColDefs);
      lastAppliedOrderRef.current = targetOrder;
    }
  }, [selectedTab, gridReady, contextColumnOrder, contextColumnVisibility, id, tableRef, getColumnNamesMap]);

  /**
   * Sync context column order to AG Grid
   * Also syncs widths from localStorage to ensure resized columns persist
   */
  useEffect(() => {
    if (!gridReady || contextColumnOrder.length === 0 || columns.length === 0) return;

    const api = tableRef.current?.api;

    if (!api) return;

    // Create a string representation of the new order for comparison
    const newOrderKey = contextColumnOrder.join(',');

    // Get current AG Grid order BEFORE checking lastAppliedOrderRef
    // This ensures we sync when order changes from BluePrintDataset (context) even if lastAppliedOrderRef matches
    const currentColumns = api.getColumns();

    if (!currentColumns || currentColumns.length === 0) return;
    const currentGridOrder = currentColumns.map((col) => col.getColId()).join(',');

    // Check if order changed from context (BluePrintDataset reordering)
    // This is the key check - if order changed from context, we MUST sync regardless of other flags
    const orderChangedFromContext = lastAppliedOrderRef.current !== newOrderKey;

    // If order changed from context, force sync (BluePrintDataset reordered)
    // Reset all flags to ensure sync happens
    if (orderChangedFromContext) {
      moveInProgressRef.current = false;
      // Don't return - proceed to sync
    } else {
      // Order hasn't changed from context
      // Skip if we already applied this order AND ag-grid already has this order (prevents infinite loop)
      if (lastAppliedOrderRef.current === newOrderKey && currentGridOrder === newOrderKey) {
        moveInProgressRef.current = false;

        return;
      }

      // If AG Grid already has this order, just update ref and return
      if (currentGridOrder === newOrderKey) {
        lastAppliedOrderRef.current = newOrderKey;
        moveInProgressRef.current = false;

        return;
      }

      // Skip if a move is already in progress (only if order hasn't changed from context)
      if (moveInProgressRef.current) {
        return;
      }
    }

    // Mark move as in progress
    moveInProgressRef.current = true;

    // Read widths from localStorage (source of truth for user resizes)
    const storedConfig = getColumnOrderingVisibilityForCurrentDataset(id);
    const localStorageWidthMap = new Map(storedConfig?.map((c) => [c.colId, c.width]) || []);

    // Get column names from context to ensure headerName is always correct
    const columnNamesMap = getColumnNamesMap();

    // Build columnDefs map with proper widths from localStorage
    const allColumns = api.getAllGridColumns() || [];
    const colDefMap = new Map<string, ColDef>();

    allColumns.forEach((col) => {
      const colDef = col.getColDef();
      const colId = col.getColId();
      const actualWidth = col.getActualWidth(); // Get the current rendered width from AG Grid

      // Apply context visibility and localStorage width to the colDef
      const isVisible = contextColumnVisibility[colId];
      const localStorageWidth = localStorageWidthMap.get(colId);
      // Prioritize localStorage width (from user resizes), then current actual width, then default
      const width = localStorageWidth && localStorageWidth > 0 ? localStorageWidth : actualWidth || 200;

      // Get the correct header name from context (column_name), fallback to existing headerName
      const headerName = colId in columnNamesMap ? columnNamesMap[colId] : colDef.headerName;

      const colDefWithVisibility = {
        ...colDef,
        width,
        flex: 0, // Disable flex to use fixed width
        hide: isVisible !== undefined ? !isVisible : colDef.hide,
        headerName, // Always apply the correct header name from context
      };

      colDefMap.set(colId, colDefWithVisibility);
    });

    // Get columns in the new order from ag-grid (not columnDefs)
    // We need to use moveColumns API to actually reorder columns in ag-grid
    const reorderedColumns = contextColumnOrder
      .map((colId) => {
        const col = allColumns.find((c) => c.getColId() === colId);

        return col;
      })
      .filter((col): col is NonNullable<typeof col> => col !== undefined);

    if (reorderedColumns.length > 0) {
      // Use moveColumns to actually reorder columns in ag-grid
      // This is more reliable than setGridOption for reordering
      api.moveColumns(reorderedColumns, 0);

      // Also update columnDefs to ensure visibility, width, and headerName are correct
      const reorderedColDefs = contextColumnOrder
        .map((colId) => colDefMap.get(colId))
        .filter((colDef): colDef is ColDef => colDef !== undefined);

      if (reorderedColDefs.length > 0) {
        api.setGridOption('columnDefs', reorderedColDefs);
      }

      lastAppliedOrderRef.current = newOrderKey;
    }

    moveInProgressRef.current = false;
  }, [
    contextColumnOrder,
    contextColumns,
    contextColumnVisibility,
    gridReady,
    columns.length,
    tableRef,
    id,
    getColumnNamesMap,
  ]);

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

    // Read widths from localStorage (source of truth for user resizes)
    const storedConfig = getColumnOrderingVisibilityForCurrentDataset(id);
    const localStorageWidthMap = new Map(storedConfig?.map((c) => [c.colId, c.width]) || []);

    let hasChanges = false;
    const updatedColumnDefs = allColumns.map((column) => {
      const colDef = column.getColDef();
      const colId = column.getColId();
      const actualWidth = column.getActualWidth(); // Get the current rendered width from AG Grid
      const contextName = colId in columnNamesMap ? columnNamesMap[colId] : undefined;
      const localStorageWidth = localStorageWidthMap.get(colId);
      // Prioritize localStorage width (from user resizes), then current actual width, then default
      const width = localStorageWidth && localStorageWidth > 0 ? localStorageWidth : actualWidth || 200;

      // Only update if the header name actually changed
      if (contextName !== undefined && colDef.headerName !== contextName) {
        hasChanges = true;

        // IMPORTANT: Preserve context visibility when rebuilding columnDefs
        const isVisible = contextColumnVisibility[colId];

        return {
          ...colDef,
          width,
          flex: 0, // Disable flex to use fixed width
          headerName: contextName,
          hide: isVisible !== undefined ? !isVisible : colDef.hide,
        };
      }

      // Even for unchanged columns, ensure visibility is correct
      const isVisible = contextColumnVisibility[colId];

      return {
        ...colDef,
        width,
        flex: 0, // Disable flex to use fixed width
        hide: isVisible !== undefined ? !isVisible : colDef.hide,
      };
    });

    // Update all column definitions if there were changes
    if (hasChanges) {
      api.setGridOption('columnDefs', updatedColumnDefs);
    }
  }, [gridReady, contextColumns, contextColumnVisibility, getColumnNamesMap, id, tableRef]);

  /**
   * Sync context column visibility to AG Grid
   * IMPORTANT: Also update the columns state to prevent React re-renders from resetting visibility
   */
  useEffect(() => {
    if (!gridReady) return;

    const api = tableRef.current?.api;

    if (!api) return;

    // Apply visibility changes to AG Grid API
    Object.entries(contextColumnVisibility).forEach(([colId, isVisible]) => {
      api.setColumnsVisible([colId], isVisible);
    });

    // Get column names map to ensure headerName is always correct
    const columnNamesMap = getColumnNamesMap();

    // CRITICAL: Also update the columns state to prevent React re-renders from resetting visibility
    // When React re-renders, it passes the columns prop to AG Grid again.
    // If the columns prop has stale hide values, AG Grid will reset to those values.
    const hasChanges = columns.some((col) => {
      const colId = col.field || '';
      const contextVisible = contextColumnVisibility[colId];
      const contextName = colId in columnNamesMap ? columnNamesMap[colId] : undefined;

      if (contextVisible === undefined && contextName === undefined) return false;

      const visibilityChanged = contextVisible !== undefined && col.hide !== !contextVisible;
      const nameChanged = contextName !== undefined && col.headerName !== contextName;

      return visibilityChanged || nameChanged;
    });

    if (hasChanges) {
      const updatedColumns = columns.map((col) => {
        const colId = col.field || '';
        const isVisible = contextColumnVisibility[colId];
        const contextName = colId in columnNamesMap ? columnNamesMap[colId] : undefined;

        // Apply visibility and headerName updates
        return {
          ...col,
          hide: isVisible !== undefined ? !isVisible : col.hide,
          headerName: contextName !== undefined ? contextName : col.headerName, // Update headerName from context
        };
      });

      setColumns(updatedColumns);
    }
  }, [gridReady, contextColumnVisibility, tableRef, setColumns, getColumnNamesMap, columns]);

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

      // Read widths from localStorage (source of truth for user resizes)
      const storedConfig = getColumnOrderingVisibilityForCurrentDataset(id);
      const localStorageWidthMap = new Map(storedConfig?.map((c) => [c.colId, c.width]) || []);

      // Build a map of current AG Grid widths for fallback
      const agGridWidthMap = new Map(currentAgGridCols.map((col) => [col.getColId(), col.getActualWidth()]));

      // Get column names from context to ensure headerName is always correct
      const columnNamesMap = getColumnNamesMap();

      // Rebuild columnDefs based on context columns
      const existingColDefs = columns
        .filter((colDef) => contextColIds.includes(colDef.field || '') && !addedColIds.includes(colDef.field || ''))
        .map((colDef) => {
          // Apply context visibility and localStorage width to existing columns
          const colId = colDef.field || '';
          const contextVisibility = contextColumnVisibility[colId];
          const localStorageWidth = localStorageWidthMap.get(colId);
          const actualWidth = agGridWidthMap.get(colId); // Get current rendered width from AG Grid
          // Prioritize localStorage width (from user resizes), then current actual width, then default
          const width = localStorageWidth && localStorageWidth > 0 ? localStorageWidth : actualWidth || 200;

          // Get the correct header name from context (column_name), fallback to existing headerName
          const headerName = colId in columnNamesMap ? columnNamesMap[colId] : colDef.headerName;

          return {
            ...colDef,
            width,
            flex: 0, // Disable flex to use fixed width
            hide: contextVisibility !== undefined ? !contextVisibility : colDef.hide,
            headerName, // Always apply the correct header name from context
          };
        });

      // Create ColDefs for new columns
      const newColDefs = addedColIds
        .map((colId) => {
          const contextCol = contextColumns.find((col) => col.id === colId);

          if (!contextCol) return null;

          // Check localStorage for width first (for new datasets where columns might have been resized)
          const localStorageWidth = localStorageWidthMap.get(colId);
          const width = localStorageWidth && localStorageWidth > 0 ? localStorageWidth : 200;

          return {
            field: colId,
            headerName: contextCol.column_name || colId,
            editable: true,
            hide: !contextCol.isVisible,
            // Set explicit width and disable flex for fixed column sizes
            width,
            minWidth: 100,
            flex: 0, // Disable flex to use fixed width
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
  }, [gridReady, contextColumns, contextColumnVisibility, columns, id, handleSuccessfulUpdate, tableRef, setColumns]);
};
