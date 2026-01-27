import { toast } from '@zamp-platform/ui';
import React, { createContext, FC, ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react';

import type { ColumnDataType } from '../components/DatasetColumDetails';

/**
 * Column configuration that includes ordering, visibility, and width
 * This matches the format used in local storage
 */
export interface ColumnOrderingVisibilityType {
  colId: string;
  columnName: string; // Display-friendly name (Title Case)
  isVisible: boolean;
  width: number;
}

/**
 * Enhanced column data that includes all metadata needed for both Blueprint and Preview
 */
export interface EnhancedColumnDataType extends ColumnDataType {
  isVisible: boolean;
  width: number;
  order: number; // Position in the list
}

interface DatasetColumnContextType {
  // Core column data (includes type, name, required, etc.)
  columns: EnhancedColumnDataType[];

  // Column ordering (array of column IDs in order)
  columnOrder: string[];

  // Column visibility map
  columnVisibility: Record<string, boolean>;

  // Dataset ID for local storage key
  datasetId: string | null;

  // Actions for Blueprint
  handleColumnChange: (id: string, field: string, value: string | boolean) => void;
  handleDeleteColumn: (id: string) => void;
  handleAddColumn: (type: string, columnName?: string) => void;
  handleReorderColumns: (newOrder: ColumnDataType[]) => void;

  // Actions for Preview (AG Grid)
  handleColumnMoved: (fromId: string, toIndex: number) => void;
  handleColumnVisibilityChange: (columnId: string, isVisible: boolean) => void;
  handleColumnWidthChange: (columnId: string, width: number) => void;

  // Actions for Display Options
  updateColumnOrder: (order: string[]) => void;
  updateColumnVisibility: (visibility: Record<string, boolean>) => void;

  // Initialize/sync with external data
  initializeColumns: (initialColumns: ColumnDataType[], datasetId: string) => void;
  syncWithLocalStorage: () => void;

  // Get formatted data for different consumers
  getBlueprintColumns: () => ColumnDataType[];
  getPreviewColumnConfig: () => ColumnOrderingVisibilityType[];

  // Get column names map (colId -> columnName) for syncing with AG Grid headers
  getColumnNamesMap: () => Record<string, string>;
}

const DatasetColumnContext = createContext<DatasetColumnContextType | undefined>(undefined);

export const useDatasetColumnContext = () => {
  const context = useContext(DatasetColumnContext);

  if (!context) {
    throw new Error('useDatasetColumnContext must be used within DatasetColumnProvider');
  }

  return context;
};

/**
 * Optional version - returns undefined if context is not available
 * Use this when the component can work with or without the context
 */
export const useDatasetColumnContextOptional = () => {
  return useContext(DatasetColumnContext);
};

/**
 * Dependencies that must be provided by the consuming application
 */
export interface DatasetColumnDependencies {
  // Local storage utilities
  getFromLocalStorage: (key: string) => string | null;
  setToLocalStorage: (key: string, value: string) => void;
  LOCAL_STORAGE_KEYS: { COLUMN_ORDERING_VISIBILITY: string };

  // Prefix for new columns (e.g., 'new_col_')
  NEW_COLUMN_PREFIX: { COL_: string };

  // API hooks (optional - only needed if updating backend)
  // These use permissive types to support RTK Query and other data fetching libraries
  useGetDatasetDisplayConfigQuery?: (
    args: { datasetId: string },
    options: { skip: boolean; refetchOnMountOrArgChange: boolean },
  ) => { data?: { display_config?: DisplayConfigItem[] } | undefined };

  useUpdateDatasetMutation?: () => [
    (params: {
      datasetId: string;
      display_config: DisplayConfigItem[];
    }) => Promise<unknown> | { unwrap: () => Promise<unknown> },
    ...unknown[],
  ];

  // Error tracking (optional)
  captureException?: (error: unknown) => void;
}

/** Display config item structure from the API */
export interface DisplayConfigItem {
  column: string;
  alias: string;
  is_hidden: boolean;
}

interface DatasetColumnProviderProps {
  children: ReactNode;
  datasetId?: string; // Optional dataset ID for existing datasets
  dependencies: DatasetColumnDependencies;
}

export const DatasetColumnProvider: FC<DatasetColumnProviderProps> = ({
  children,
  datasetId: initialDatasetId,
  dependencies,
}) => {
  const [columns, setColumns] = useState<EnhancedColumnDataType[]>([]);
  const [datasetId, setDatasetId] = useState<string | null>(initialDatasetId || null);
  const isInitializedRef = useRef(false);

  // API mutation for updating dataset (optional)
  const [updateDataset] = dependencies.useUpdateDatasetMutation?.() || [null, null];

  // Get display config (needed for alias updates, optional)
  const displayConfigData = dependencies.useGetDatasetDisplayConfigQuery?.(
    { datasetId: datasetId || '' },
    {
      skip: !datasetId,
      refetchOnMountOrArgChange: false,
    },
  )?.data;

  /**
   * Load column configuration from local storage
   */
  const loadFromLocalStorage = useCallback(
    (dsId: string): ColumnOrderingVisibilityType[] | null => {
      try {
        const stored = dependencies.getFromLocalStorage(dependencies.LOCAL_STORAGE_KEYS.COLUMN_ORDERING_VISIBILITY);

        if (stored) {
          const parsed = JSON.parse(stored);

          return parsed[dsId] || null;
        }
      } catch (error) {
        console.error('Failed to load column config from localStorage:', error);
      }

      return null;
    },
    [dependencies],
  );

  /**
   * Save column configuration to local storage
   */
  const saveToLocalStorage = useCallback(
    (dsId: string, config: ColumnOrderingVisibilityType[]) => {
      try {
        const stored = dependencies.getFromLocalStorage(dependencies.LOCAL_STORAGE_KEYS.COLUMN_ORDERING_VISIBILITY);
        const parsed = stored ? JSON.parse(stored) : {};

        parsed[dsId] = config;
        dependencies.setToLocalStorage(
          dependencies.LOCAL_STORAGE_KEYS.COLUMN_ORDERING_VISIBILITY,
          JSON.stringify(parsed),
        );
      } catch (error) {
        console.error('Failed to save column config to localStorage:', error);
      }
    },
    [dependencies],
  );

  /**
   * Initialize columns with data (from API or default)
   */
  const initializeColumns = useCallback(
    (initialColumns: ColumnDataType[], dsId: string) => {
      setDatasetId(dsId);

      // Load ordering/visibility from local storage if available
      const storedConfig = loadFromLocalStorage(dsId);

      if (storedConfig && storedConfig.length > 0) {
        // Merge stored config with initial columns
        const enhancedColumns: EnhancedColumnDataType[] = storedConfig
          .map((stored, index) => {
            const columnDef = initialColumns.find((col) => col.id === stored.colId);

            if (columnDef) {
              return {
                ...columnDef,
                isVisible: stored.isVisible,
                width: stored.width,
                order: index,
              };
            }

            return null;
          })
          .filter(Boolean) as EnhancedColumnDataType[];

        // Add any new columns that aren't in stored config
        initialColumns.forEach((col, index) => {
          if (!enhancedColumns.find((ec) => ec.id === col.id)) {
            enhancedColumns.push({
              ...col,
              isVisible: true,
              width: 0,
              order: enhancedColumns.length + index,
            });
          }
        });

        setColumns(enhancedColumns);
      } else {
        // No stored config, use initial columns
        const enhancedColumns: EnhancedColumnDataType[] = initialColumns.map((col, index) => ({
          ...col,
          isVisible: true,
          width: 0,
          order: index,
        }));

        setColumns(enhancedColumns);
      }

      isInitializedRef.current = true;
    },
    [loadFromLocalStorage],
  );

  /**
   * Sync current state to local storage
   * For widths: Prioritize localStorage (user resizes save directly to localStorage)
   * For other properties: Use context state
   */
  const syncWithLocalStorage = useCallback(() => {
    if (!datasetId || columns.length === 0) return;

    // Load existing widths from localStorage - these are the source of truth for user resizes
    const existingConfig = loadFromLocalStorage(datasetId);
    const existingWidthsMap = new Map(existingConfig?.map((c) => [c.colId, c.width]) || []);

    const config: ColumnOrderingVisibilityType[] = columns
      .sort((a, b) => a.order - b.order)
      .map((col) => {
        // Prioritize localStorage width (user resizes save directly to localStorage)
        // Only use context width if localStorage doesn't have this column
        const localStorageWidth = existingWidthsMap.get(col.id);
        const width =
          localStorageWidth !== undefined && localStorageWidth > 0 ? localStorageWidth : col.width > 0 ? col.width : 0;

        return {
          colId: col.id,
          columnName: col.column_name,
          isVisible: col.isVisible,
          width,
        };
      });

    saveToLocalStorage(datasetId, config);
  }, [datasetId, columns, saveToLocalStorage, loadFromLocalStorage]);

  /**
   * Auto-sync to local storage whenever columns change
   */
  useEffect(() => {
    if (isInitializedRef.current) {
      syncWithLocalStorage();
    }
  }, [columns, syncWithLocalStorage]);

  /**
   * BLUEPRINT ACTIONS
   */

  const handleColumnChange = useCallback(
    (id: string, field: string, value: string | boolean) => {
      // Optimistic update: Update UI immediately
      setColumns((prev) => {
        return prev.map((col) => {
          if (col.id === id) {
            const updatedCol = { ...col, [field]: value };

            // For existing backend columns, update alias via API
            if (field === 'column_name' && typeof value === 'string' && updateDataset) {
              // Check if this is an existing backend column (not a new FE-only column)
              const isNewColumn = col.id.startsWith(dependencies.NEW_COLUMN_PREFIX.COL_);

              if (!isNewColumn && datasetId && displayConfigData?.display_config) {
                // For existing columns, fire API call in background (don't wait)
                const updatedDisplayConfig = displayConfigData.display_config.map((item) => {
                  if (item.column === col.id) {
                    return { ...item, alias: value };
                  }

                  return item;
                });

                // Fire and forget - update in background silently
                const result = updateDataset({ datasetId, display_config: updatedDisplayConfig });
                const promise = 'unwrap' in result ? result.unwrap() : result;

                promise.catch((err: unknown) => {
                  dependencies.captureException?.(err);
                  toast.error('Failed to save column name change');
                });
              }
            }

            return updatedCol;
          }

          return col;
        });
      });
    },
    [datasetId, displayConfigData, updateDataset, dependencies],
  );

  const handleDeleteColumn = useCallback((id: string) => {
    setColumns((prev) => {
      const filtered = prev.filter((col) => col.id !== id);

      // Reorder remaining columns
      return filtered.map((col, index) => ({ ...col, order: index }));
    });
  }, []);

  const handleAddColumn = useCallback(
    (type: string, columnName?: string) => {
      // Generate unique stable ID for new column
      const uniqueColId = `${dependencies.NEW_COLUMN_PREFIX.COL_}${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const newColumn: EnhancedColumnDataType = {
        id: uniqueColId, // Stable ID that never changes
        column_name: columnName || '',
        column_type: type,
        required: false,
        isVisible: true,
        width: 150,
        order: columns.length,
      };

      setColumns((prev) => [...prev, newColumn]);
    },
    [columns.length, dependencies.NEW_COLUMN_PREFIX],
  );

  const handleReorderColumns = useCallback((newOrder: ColumnDataType[]) => {
    setColumns((prev) => {
      // Create a map of existing columns for quick lookup
      const columnMap = new Map(prev.map((col) => [col.id, col]));

      // Create new ordered list
      return newOrder.map((orderedCol, index) => {
        const existingCol = columnMap.get(orderedCol.id);

        if (existingCol) {
          return {
            ...existingCol,
            ...orderedCol, // Update with any changes from drag-drop
            order: index,
          };
        }

        // Shouldn't happen, but handle gracefully
        return {
          ...orderedCol,
          isVisible: true,
          width: 0,
          order: index,
        } as EnhancedColumnDataType;
      });
    });
  }, []);

  /**
   * PREVIEW (AG GRID) ACTIONS
   */

  const handleColumnMoved = useCallback(
    (fromId: string, toIndex: number) => {
      setColumns((prev) => {
        // IMPORTANT: Sort by order property first to match AG Grid's visual order
        // AG Grid's toIndex is relative to the visual order, not the array order
        const sortedColumns = [...prev].sort((a, b) => a.order - b.order);

        const fromIndex = sortedColumns.findIndex((col) => col.id === fromId);

        if (fromIndex === -1 || toIndex < 0 || toIndex >= sortedColumns.length || fromIndex === toIndex) {
          return prev;
        }

        // Refresh widths from localStorage before reordering
        const existingConfig = loadFromLocalStorage(datasetId || '');
        const existingWidthsMap = new Map(existingConfig?.map((c) => [c.colId, c.width]) || []);

        // Update columns with latest widths from localStorage
        const columnsWithFreshWidths = sortedColumns.map((col) => {
          const localStorageWidth = existingWidthsMap.get(col.id);
          const freshWidth = localStorageWidth !== undefined ? localStorageWidth : col.width;

          return { ...col, width: freshWidth };
        });

        // Reorder using the sorted array
        const newColumns = [...columnsWithFreshWidths];
        const [movedColumn] = newColumns.splice(fromIndex, 1);

        newColumns.splice(toIndex, 0, movedColumn);

        // Update order property
        return newColumns.map((col, index) => ({ ...col, order: index }));
      });
    },
    [datasetId, loadFromLocalStorage],
  );

  const handleColumnVisibilityChange = useCallback((columnId: string, isVisible: boolean) => {
    setColumns((prev) => prev.map((col) => (col.id === columnId ? { ...col, isVisible } : col)));
  }, []);

  const handleColumnWidthChange = useCallback((columnId: string, width: number) => {
    setColumns((prev) => prev.map((col) => (col.id === columnId ? { ...col, width } : col)));
  }, []);

  /**
   * DISPLAY OPTIONS ACTIONS
   */

  const updateColumnOrder = useCallback(
    (order: string[]) => {
      setColumns((prev) => {
        // Read fresh widths from localStorage (user resizes save directly there)
        const existingConfig = loadFromLocalStorage(datasetId || '');
        const existingWidthsMap = new Map(existingConfig?.map((c) => [c.colId, c.width]) || []);

        // Update columns with fresh widths from localStorage
        const columnsWithFreshWidths = prev.map((col) => {
          const localStorageWidth = existingWidthsMap.get(col.id);
          const freshWidth = localStorageWidth !== undefined ? localStorageWidth : col.width;

          return { ...col, width: freshWidth };
        });

        const columnMap = new Map(columnsWithFreshWidths.map((col) => [col.id, col]));
        const reordered: EnhancedColumnDataType[] = [];

        order.forEach((colId, index) => {
          const col = columnMap.get(colId);

          if (col) {
            reordered.push({ ...col, order: index });
          }
        });

        // Add any columns not in the order array at the end
        columnsWithFreshWidths.forEach((col) => {
          if (!order.includes(col.id)) {
            reordered.push({ ...col, order: reordered.length });
          }
        });

        return reordered;
      });
    },
    [datasetId, loadFromLocalStorage],
  );

  const updateColumnVisibility = useCallback((visibility: Record<string, boolean>) => {
    setColumns((prev) =>
      prev.map((col) => ({
        ...col,
        isVisible: visibility[col.id] !== undefined ? visibility[col.id] : col.isVisible,
      })),
    );
  }, []);

  /**
   * GETTERS FOR DIFFERENT CONSUMERS
   */

  const getBlueprintColumns = useCallback((): ColumnDataType[] => {
    // Blueprint should ALWAYS show ALL columns regardless of visibility
    return columns
      .sort((a, b) => a.order - b.order)
      .map(({ id, column_name, column_type, required }) => ({
        id,
        column_name,
        column_type,
        required,
      }));
  }, [columns]);

  const getPreviewColumnConfig = useCallback((): ColumnOrderingVisibilityType[] => {
    return columns
      .sort((a, b) => a.order - b.order)
      .map((col) => ({
        colId: col.id,
        columnName: col.column_name, // Use actual column name
        isVisible: col.isVisible,
        width: col.width,
      }));
  }, [columns]);

  const getColumnNamesMap = useCallback((): Record<string, string> => {
    return columns.reduce(
      (acc, col) => {
        acc[col.id] = col.column_name;

        return acc;
      },
      {} as Record<string, string>,
    );
  }, [columns]);

  /**
   * Derive column order and visibility for easy access
   */
  const columnOrder = columns.sort((a, b) => a.order - b.order).map((col) => col.id);

  const columnVisibility = columns.reduce(
    (acc, col) => {
      acc[col.id] = col.isVisible;

      return acc;
    },
    {} as Record<string, boolean>,
  );

  const value: DatasetColumnContextType = {
    columns,
    columnOrder,
    columnVisibility,
    datasetId,
    handleColumnChange,
    handleDeleteColumn,
    handleAddColumn,
    handleReorderColumns,
    handleColumnMoved,
    handleColumnVisibilityChange,
    handleColumnWidthChange,
    updateColumnOrder,
    updateColumnVisibility,
    initializeColumns,
    syncWithLocalStorage,
    getBlueprintColumns,
    getPreviewColumnConfig,
    getColumnNamesMap,
  };

  return <DatasetColumnContext.Provider value={value}>{children}</DatasetColumnContext.Provider>;
};
