import React, {
  createContext,
  FC,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import type { ColumnDataType } from '../components/DatasetColumDetails';
import { DatasetColumnTypes } from '../constants';
import {
  mapSchemaTypeToColumnType,
  normalizeTypeForComparison,
  snakeCaseToDisplayName,
} from '../utils/columnConversion';

/**
 * Column configuration that includes ordering, visibility, and width
 * This matches the format used in local storage
 */
export interface ColumnOrderingVisibilityType {
  colId: string; // column id
  columnName: string; // column alias
  columnType?: string; // column type
  isVisible: boolean; // visibility
  width: number; // width
  isRequired?: boolean; // required
  defaultValue?: string | boolean | null; // default value
}

/**
 * Enhanced column data that includes all metadata needed for both Blueprint and Preview
 */
export interface EnhancedColumnDataType extends ColumnDataType {
  isVisible: boolean;
  width: number;
  order: number; // Position in the list
  uniqueId?: string; // Unique ID that never changes, used for React keys to prevent re-animation when backend ID changes
}

/**
 * Column change types for update transaction payload
 */
export interface ColumnChanges {
  add_columns: Array<{
    name: string;
    type: string;
    nullable: boolean;
    default?: string | null;
  }>;
  drop_columns: string[];
  alter_columns: Array<{
    name: string;
    type?: string;
    default?: string | null;
    nullable?: boolean;
  }>;
  display_config: Array<{
    column: string;
    alias?: string | null;
    is_hidden?: boolean;
    is_editable?: boolean;
    type?: string;
  }>;
}

interface DatasetColumnContextType {
  // Core column data (includes type, name, required, etc.)
  columns: EnhancedColumnDataType[];

  // Original columns (for tracking changes)
  originalColumns: EnhancedColumnDataType[];

  // Column ordering (array of column IDs in order)
  columnOrder: string[];

  // Column visibility map
  columnVisibility: Record<string, boolean>;

  // Dataset ID for local storage key
  datasetId: string | null;

  // Actions for Blueprint
  handleColumnChange: (id: string, field: string, value: string | boolean | null) => void;
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

  // Get column changes for update transaction
  getColumnChanges: () => ColumnChanges;

  // Check if there are any changes from original
  hasChanges: () => boolean;

  // Reset original columns after successful save
  resetOriginalColumns: () => void;

  // Update column IDs and names from BE after successful transaction (SSE event)
  updateColumnIdsFromBE: (beColumns: Array<{ id: string; name?: string }>) => void;
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

  // Org-scoped column config helpers
  getColumnConfigForDataset: (datasetId: string) => Record<string, unknown> | null;
  setColumnConfigForDataset: (datasetId: string, data: unknown) => void;
  deleteColumnConfigForDataset: (datasetId: string) => void;

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
  const [originalColumns, setOriginalColumns] = useState<EnhancedColumnDataType[]>([]);
  const [datasetId, setDatasetId] = useState<string | null>(initialDatasetId || null);
  const isInitializedRef = useRef(false);

  // API mutation for updating dataset (optional) - kept for potential future use
  // const [updateDataset] = dependencies.useUpdateDatasetMutation?.() || [null, null];

  // Get display config (needed for alias updates, optional)
  // refetchOnMountOrArgChange: true ensures fresh display_config on remount.
  const displayConfigData = dependencies.useGetDatasetDisplayConfigQuery?.(
    { datasetId: datasetId || '' },
    {
      skip: !datasetId,
      refetchOnMountOrArgChange: true,
    },
  )?.data;

  /**
   * Load column configuration from local storage
   * Handles both old format (array) and new format (object with dataset_name and columns)
   */
  const loadFromLocalStorage = useCallback(
    (dsId: string): ColumnOrderingVisibilityType[] | null => {
      try {
        const datasetData = dependencies.getColumnConfigForDataset(dsId);

        if (!datasetData) {
          return null;
        }

        // New format: object with dataset_name and columns
        if (typeof datasetData === 'object' && 'columns' in datasetData) {
          return (datasetData as { columns: ColumnOrderingVisibilityType[] }).columns || null;
        }

        // Old format: direct array
        if (Array.isArray(datasetData)) {
          return datasetData;
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
   * Saves in new format with dataset_name and columns
   * Preserves existing dataset_name if already set
   */
  const saveToLocalStorage = useCallback(
    (dsId: string, config: ColumnOrderingVisibilityType[]) => {
      try {
        const existingData = dependencies.getColumnConfigForDataset(dsId);

        // Get existing dataset_name if available, otherwise use dsId as fallback
        let datasetName = dsId;
        if (existingData && typeof existingData === 'object' && 'dataset_name' in existingData) {
          datasetName = (existingData as { dataset_name?: string }).dataset_name || dsId;
        }

        // Preserve existing dataset_unique_key_name
        const existingUniqueKeyName =
          (existingData as { dataset_unique_key_name?: string })?.dataset_unique_key_name || '';

        // Save in new format (org-scoped), preserving all existing fields
        dependencies.setColumnConfigForDataset(dsId, {
          dataset_name: datasetName,
          dataset_unique_key_name: existingUniqueKeyName,
          columns: config,
        });
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

      // Build alias map from displayConfigData for case-insensitive matching
      // This fixes issues where schema has "col_6" but display_config has "Col_6"
      const aliasMap = new Map<string, string>();
      if (displayConfigData?.display_config) {
        displayConfigData.display_config.forEach((item) => {
          if (item?.alias) {
            aliasMap.set(item?.column?.toLowerCase(), item?.alias);
          }
        });
      }

      // Apply aliases to initial columns (case-insensitive lookup)
      // If no alias, ensure column_name is properly formatted (not raw column ID with underscores)
      const columnsWithAliases = initialColumns.map((col, index) => {
        const alias = aliasMap.get(col?.id?.toLowerCase());
        if (alias && alias !== col?.column_name) {
          return { ...col, column_name: alias };
        }
        // If column_name is empty or whitespace-only, generate a fallback name
        if (!col?.column_name?.trim()) {
          return { ...col, column_name: `Column ${index + 1}` };
        }
        // If column_name equals the raw column ID (e.g., filter-config API returned alias = column name),
        // convert to a user-friendly display name instead of using generic "Column N" fallback.
        // This handles cases like alias="embeddings" where col.column_name === col.id === "embeddings"
        if (col?.column_name === col?.id) {
          return { ...col, column_name: snakeCaseToDisplayName(col?.id) };
        }
        return col;
      });

      // Load ordering/visibility from local storage if available
      // For new datasets, if dsId is empty, also check PREVIEW_DATASET_ID
      let storedConfig = loadFromLocalStorage(dsId);
      if ((!storedConfig || storedConfig.length === 0) && (!dsId || dsId.trim() === '')) {
        // Try loading from PREVIEW_DATASET_ID for new datasets
        const PREVIEW_DATASET_ID = 'preview-dataset';
        storedConfig = loadFromLocalStorage(PREVIEW_DATASET_ID);
      }

      if (storedConfig && storedConfig.length > 0) {
        // Filter out stale FE-generated temp column IDs (col_<timestamp>_<random>)
        // These are temporary IDs used during creation and should be replaced by BE IDs
        // BUT: For new datasets (when initialColumns is empty), keep all FE temp columns
        const FE_TEMP_ID_PATTERN = /^col_\d+_/;
        const isNewDataset = columnsWithAliases.length === 0;
        const validStoredConfig = storedConfig.filter((stored) => {
          // Keep if it matches an initialColumn by ID (case-insensitive)
          if (columnsWithAliases.some((col) => col?.id?.toLowerCase() === stored?.colId?.toLowerCase())) return true;
          // For new datasets, keep all columns (including FE temp columns)
          if (isNewDataset) return true;
          // For existing datasets, keep FE temp IDs - these are newly added columns that haven't been saved yet
          // They will be created from stored config in the mapping step below
          if (FE_TEMP_ID_PATTERN.test(stored.colId)) return true;
          // Keep other entries (might be valid columns not yet in initialColumns)
          return true;
        });

        // Build a map of FE temp column settings by column name for transfer to BE columns
        // This preserves user settings (width, visibility, type, isRequired, defaultValue) from creation flow after reload
        const feSettingsByName = new Map<
          string,
          {
            width: number;
            isVisible: boolean;
            columnType?: string;
            isRequired?: boolean;
            defaultValue?: string | boolean | null;
          }
        >();
        storedConfig
          .filter((stored) => FE_TEMP_ID_PATTERN.test(stored?.colId) && stored?.columnName)
          .forEach((stored) => {
            const normalizedName = stored.columnName?.toLowerCase().trim();
            if (normalizedName) {
              feSettingsByName.set(normalizedName, {
                width: stored?.width,
                isVisible: stored?.isVisible,
                columnType: stored?.columnType,
                isRequired: stored?.isRequired,
                defaultValue: stored?.defaultValue,
              });
            }
          });

        // Build a map of stored column info by colId for existing columns
        // Use lowercase for matching (case-insensitive)
        const storedInfoByColId = new Map<
          string,
          { columnType?: string; isRequired?: boolean; defaultValue?: string | boolean | null }
        >();
        storedConfig.forEach((stored) => {
          // Store with lowercase key for case-insensitive matching
          storedInfoByColId.set(stored?.colId?.toLowerCase(), {
            columnType: stored?.columnType,
            isRequired: stored?.isRequired,
            defaultValue: stored?.defaultValue,
          });
        });

        // Merge stored config with initial columns (using aliases from displayConfigData)
        // IMPORTANT: Prioritize localStorage data over backend data for user changes
        const enhancedColumns: EnhancedColumnDataType[] = validStoredConfig
          .map((stored, index) => {
            // Case-insensitive matching for column IDs
            const columnDef = columnsWithAliases.find((col) => col?.id?.toLowerCase() === stored?.colId?.toLowerCase());

            if (columnDef) {
              // Use stored column info if available, otherwise use API column info
              // Use lowercase for case-insensitive matching
              const storedInfo =
                storedInfoByColId.get(stored?.colId?.toLowerCase()) ||
                storedInfoByColId.get(columnDef?.id?.toLowerCase());
              // Generate uniqueId if it doesn't exist (for existing columns)
              const uniqueId = (columnDef as EnhancedColumnDataType).uniqueId || `unique_${columnDef.id}_${index}`;

              // Get stored columnType directly from stored object (not from storedInfo map)
              // This ensures we get the value even if it's not in the map
              let storedColumnType = stored?.columnType || storedInfo?.columnType;

              // Convert stored columnType to proper enum value using mapSchemaTypeToColumnType
              // This ensures it matches DatasetColumnTypes enum (e.g., "TEXT", "INTEGER", etc.)
              // localStorage stores uppercase "TEXT", but we need to ensure it's the correct enum value
              if (storedColumnType) {
                // Use mapSchemaTypeToColumnType to convert to proper enum value
                // This handles both uppercase "TEXT" and lowercase "text" correctly
                storedColumnType = mapSchemaTypeToColumnType(storedColumnType);
              }

              // Use default width from header constants if width is 0 or not set
              // This ensures columns don't expand to full width when opening existing datasets
              // Default widths match DATASET_COLUMN_HEADERS_LIST: COLUMN_NAME=380, COLUMN_TYPE=200
              const defaultWidth = 0; // For non-name/type columns, use 0 (flex-1 will apply)
              const columnWidth = stored?.width && stored?.width > 0 ? stored?.width : defaultWidth;

              return {
                ...columnDef,
                uniqueId,
                // ALWAYS prioritize stored columnType (user changes), converted to proper enum value
                // Use stored.columnType first (direct from localStorage), then storedInfo, then backend
                column_type: storedColumnType || columnDef.column_type,
                // ALWAYS prioritize stored isRequired (user changes)
                required:
                  stored.isRequired !== undefined
                    ? stored.isRequired
                    : storedInfo?.isRequired !== undefined
                      ? storedInfo.isRequired
                      : (columnDef.required ?? false),
                // ALWAYS prioritize stored defaultValue (user changes)
                default:
                  stored.defaultValue !== undefined
                    ? stored.defaultValue
                    : storedInfo?.defaultValue !== undefined
                      ? storedInfo.defaultValue
                      : (columnDef.default ?? null),
                // ALWAYS use stored columnName (user changes), fallback to Column {index} if empty
                column_name:
                  (stored.columnName?.trim() ? stored.columnName : null) ||
                  (columnDef.column_name?.trim() ? columnDef.column_name : null) ||
                  `Column ${index + 1}`,
                isVisible: stored.isVisible,
                width: columnWidth,
                order: index,
              };
            }

            // For new datasets, create columns from stored config even if no matching initialColumn
            if (isNewDataset) {
              const uniqueId = `unique_${stored.colId}_${index}`;
              // Use mapSchemaTypeToColumnType to convert to proper enum value (e.g., "TEXT", "INTEGER")
              // This ensures it matches DatasetColumnTypes enum for the dropdown
              const mappedType = stored.columnType
                ? mapSchemaTypeToColumnType(stored.columnType)
                : DatasetColumnTypes.TEXT;
              return {
                id: stored.colId,
                column_name: stored.columnName?.trim() ? stored.columnName : `Column ${index + 1}`,
                column_type: mappedType, // Keep as enum value (uppercase), not lowercase
                required: stored.isRequired ?? false,
                default: stored.defaultValue ?? null,
                uniqueId,
                isVisible: stored.isVisible ?? true,
                width: stored.width ?? 0,
                order: index,
              } as EnhancedColumnDataType;
            }

            // For existing datasets, if stored column doesn't match backend column,
            // it's a newly added column that hasn't been saved yet - keep it
            // Check if it's a FE temp ID pattern (newly created column)
            if (FE_TEMP_ID_PATTERN.test(stored.colId)) {
              const uniqueId = `unique_${stored.colId}_${index}`;
              const mappedType = stored.columnType
                ? mapSchemaTypeToColumnType(stored.columnType)
                : DatasetColumnTypes.TEXT;
              return {
                id: stored.colId,
                column_name: stored.columnName?.trim() ? stored.columnName : `Column ${index + 1}`,
                column_type: mappedType,
                required: stored.isRequired ?? false,
                default: stored.defaultValue ?? null,
                uniqueId,
                isVisible: stored.isVisible ?? true,
                width: stored.width ?? 0,
                order: index,
              } as EnhancedColumnDataType;
            }

            return null;
          })
          .filter(Boolean) as EnhancedColumnDataType[];

        // Add any new columns that aren't in stored config (case-insensitive check)
        columnsWithAliases.forEach((col, index) => {
          if (!enhancedColumns.find((ec) => ec.id.toLowerCase() === col.id.toLowerCase())) {
            // Try to transfer settings from FE temp columns by matching column name
            const normalizedName = col.column_name?.toLowerCase().trim();
            const feSettings = normalizedName ? feSettingsByName.get(normalizedName) : undefined;
            // Generate uniqueId if it doesn't exist
            const uniqueId =
              (col as EnhancedColumnDataType).uniqueId || `unique_${col.id}_${enhancedColumns.length + index}`;

            // Use default width from header constants if width is 0 or not set
            // This ensures columns don't expand to full width when opening existing datasets
            const defaultWidth = 0; // For new columns, use 0 (flex-1 will apply for non-fixed columns)
            const columnWidth = feSettings?.width && feSettings.width > 0 ? feSettings.width : defaultWidth;

            enhancedColumns.push({
              ...col,
              uniqueId,
              column_type: feSettings?.columnType || col.column_type,
              required: feSettings?.isRequired ?? col.required ?? false,
              default: feSettings?.defaultValue ?? col.default ?? null,
              isVisible: feSettings?.isVisible ?? true,
              width: columnWidth,
              order: enhancedColumns.length, // Will be reassigned below
            });
          }
        });

        // Reassign order sequentially to prevent gaps (from filtered null entries in
        // validStoredConfig) and collisions (from global index in the append step).
        enhancedColumns.forEach((col, i) => {
          col.order = i;
        });

        setColumns(enhancedColumns);
        // Store original columns for change tracking (only existing BE columns, not FE temp columns)
        // Use enhancedColumns as source to inherit correct types from localStorage/schema
        const enhancedColumnsMap = new Map(enhancedColumns.map((col) => [col.id.toLowerCase(), col]));
        const beOriginalColumns = columnsWithAliases
          .filter((col) => !FE_TEMP_ID_PATTERN.test(col.id))
          .map((col, index) => {
            // Generate uniqueId if it doesn't exist
            const uniqueId = (col as EnhancedColumnDataType).uniqueId || `unique_${col.id}_${index}`;
            // Determine isVisible - priority order:
            const displayConfigItem = displayConfigData?.display_config?.find(
              (item) => item.column.toLowerCase() === col.id.toLowerCase(),
            );
            let isVisible: boolean;
            if (displayConfigItem) {
              isVisible = !displayConfigItem.is_hidden;
            } else {
              // Fallback: use stored config (localStorage) visibility
              const storedCol = storedConfig?.find((s) => s.colId.toLowerCase() === col.id.toLowerCase());
              isVisible = storedCol?.isVisible ?? true;
            }

            // Use the resolved column_type from enhancedColumns (which has accurate types
            // from localStorage/schema) instead of filterConfig's generic JS types
            const enhancedCol = enhancedColumnsMap.get(col.id.toLowerCase());
            const resolvedColumnType = enhancedCol?.column_type || col.column_type;

            return {
              ...col,
              column_type: resolvedColumnType,
              uniqueId,
              isVisible,
              width: 0,
              order: index,
            } as EnhancedColumnDataType;
          });
        setOriginalColumns(beOriginalColumns);
      } else {
        // No stored config, use initial columns (with aliases from displayConfigData)
        // For new datasets (empty initialColumns), add a default column "Column 1"
        const isNewDataset = columnsWithAliases.length === 0;

        let columnsToUse = columnsWithAliases;
        if (isNewDataset) {
          // Add default column "Column 1" for new datasets
          const defaultColId = `${dependencies.NEW_COLUMN_PREFIX.COL_}${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          const defaultUniqueId = `unique_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          columnsToUse = [
            {
              id: defaultColId,
              column_name: 'Column 1',
              column_type: DatasetColumnTypes.TEXT,
              required: false,
              uniqueId: defaultUniqueId,
              isVisible: true,
              width: 150,
              order: 0,
            } as ColumnDataType & { uniqueId: string; isVisible: boolean; width: number; order: number },
          ];
        }

        const enhancedColumns: EnhancedColumnDataType[] = columnsToUse.map((col, index) => {
          // Generate uniqueId if it doesn't exist
          const uniqueId = (col as EnhancedColumnDataType).uniqueId || `unique_${col?.id}_${index}`;
          // Determine isVisible from displayConfigData (is_hidden field)
          const displayConfigItem = displayConfigData?.display_config?.find(
            (item) => item?.column?.toLowerCase() === col?.id?.toLowerCase(),
          );
          const isVisible = displayConfigItem ? !displayConfigItem.is_hidden : true;
          // Preserve existing width if set, otherwise default to 150
          const existingWidth = (col as EnhancedColumnDataType).width;
          const width = existingWidth && existingWidth > 0 ? existingWidth : 150;

          return {
            ...col,
            uniqueId,
            isVisible,
            width,
            order: index,
          };
        });

        setColumns(enhancedColumns);
        // Store original columns for change tracking (use backend data, not merged data)
        // Set isVisible from displayConfigData to match backend state
        const beOriginalColumns = columnsToUse.map((col, index) => {
          const uniqueId = (col as EnhancedColumnDataType).uniqueId || `unique_${col.id}_${index}`;
          const displayConfigItem = displayConfigData?.display_config?.find(
            (item) => item?.column?.toLowerCase() === col?.id?.toLowerCase(),
          );
          const isVisible = displayConfigItem ? !displayConfigItem.is_hidden : true;

          return {
            ...col,
            uniqueId,
            isVisible,
            width: 0,
            order: index,
          } as EnhancedColumnDataType;
        });
        setOriginalColumns(beOriginalColumns);
      }

      isInitializedRef.current = true;
    },
    [loadFromLocalStorage, displayConfigData],
  );

  /**
   * Sync current state to local storage
   * For widths: Prioritize localStorage (user resizes save directly to localStorage)
   * For other properties: Use context state
   */
  const syncWithLocalStorage = useCallback(() => {
    if (!datasetId || columns?.length === 0) return;

    const existingConfig = loadFromLocalStorage(datasetId);
    const existingWidthsMap = new Map(existingConfig?.map((col) => [col?.colId, col?.width]) || []);

    const config: ColumnOrderingVisibilityType[] = [...columns]
      .filter((col) => col?.id?.trim())
      .sort((a, b) => a.order - b.order)
      .map((col) => {
        const localStorageWidth = existingWidthsMap.get(col?.id);
        const width =
          localStorageWidth !== undefined && localStorageWidth > 0
            ? localStorageWidth
            : col?.width > 0
              ? col?.width
              : 0;

        return {
          colId: col?.id,
          columnName: col?.column_name,
          columnType: col?.column_type?.toUpperCase() || 'TEXT',
          isVisible: col?.isVisible,
          width,
          isRequired: col?.required ?? false,
          defaultValue: col?.default ?? null,
        };
      });

    saveToLocalStorage(datasetId, config);
  }, [datasetId, columns, saveToLocalStorage, loadFromLocalStorage]);

  // Track if we've done the initial sync for the current datasetId to prevent overwriting localStorage on reload
  const hasInitialSyncedRef = useRef<{ [datasetId: string]: boolean }>({});

  /**
   * Auto-sync to local storage whenever columns change
   * This ensures user changes are saved immediately, even before transaction
   * Works for both new datasets (preview ID) and existing datasets
   *
   * IMPORTANT: On initial load, only sync if localStorage is empty (to prevent BE from overwriting user changes)
   * After initial load, always save user changes to localStorage
   */
  useEffect(() => {
    if (datasetId && columns?.length > 0) {
      const storedConfig = loadFromLocalStorage(datasetId);
      const hasStoredData = storedConfig && storedConfig?.length > 0;
      const hasSynced = hasInitialSyncedRef.current[datasetId] || false;

      // On initial load: only sync if localStorage is empty (don't overwrite existing data)
      // After initial load: always save user changes
      if (!hasSynced) {
        // First time for this datasetId - only sync if localStorage is empty
        if (!hasStoredData) {
          syncWithLocalStorage();
        }
        hasInitialSyncedRef.current[datasetId] = true;
      } else {
        // After initial load - always save user changes
        syncWithLocalStorage();
      }
    }
  }, [columns, syncWithLocalStorage, datasetId, loadFromLocalStorage]);

  /**
   * Apply aliases from displayConfigData when it becomes available
   * This handles the case where displayConfigData loads after columns are initialized
   * Updates both context state AND localStorage directly for immediate effect
   */
  useEffect(() => {
    if (!isInitializedRef.current || !displayConfigData?.display_config || columns.length === 0 || !datasetId) {
      return;
    }

    // Load localStorage column names — these represent the user's/transaction's saved state.
    const storedConfig = loadFromLocalStorage(datasetId);
    const storedNameByColId = new Map<string, string>();
    storedConfig?.forEach((stored) => {
      if (stored?.colId && stored?.columnName) {
        storedNameByColId.set(stored.colId.toLowerCase(), stored.columnName);
      }
    });

    // Build alias map from displayConfigData (case-insensitive)
    const aliasMap = new Map<string, string>();
    displayConfigData?.display_config?.forEach((item) => {
      if (item.alias) {
        aliasMap.set(item?.column?.toLowerCase(), item?.alias);
      }
    });

    // Check if any column needs alias update
    let needsUpdate = false;
    const updatedColumns = columns?.map((col) => {
      const alias = aliasMap.get(col?.id?.toLowerCase());
      if (!alias || alias === col?.column_name) {
        return col; // No alias or already matches — skip
      }

      // If localStorage has a saved name for this column, and the context column name
      // matches it, the name was set from a save/transaction.
      const storedName = storedNameByColId.get(col?.id?.toLowerCase());
      if (storedName && col?.column_name === storedName) {
        return col; // Context name matches localStorage — preserve it
      }

      needsUpdate = true;
      return { ...col, column_name: alias };
    });

    if (needsUpdate) {
      setColumns(updatedColumns);

      // Also update localStorage directly to ensure aliases are persisted (org-scoped)
      try {
        const existingConfig = dependencies.getColumnConfigForDataset(datasetId) as {
          columns?: Array<{ colId: string; columnName: string; isVisible: boolean; width: number }>;
          dataset_name?: string;
        } | null;

        if (existingConfig?.columns) {
          // Update column names in localStorage using case-insensitive matching
          // Only update columns that were also updated in context (same guard applies)
          const updatedLocalStorageColumns = existingConfig.columns.map((col) => {
            const alias = aliasMap.get(col?.colId?.toLowerCase());
            if (!alias || alias === col?.columnName) {
              return col;
            }
            // Don't overwrite localStorage name with stale alias
            const storedName = storedNameByColId.get(col?.colId?.toLowerCase());
            if (storedName && col?.columnName === storedName) {
              return col;
            }
            return { ...col, columnName: alias };
          });

          dependencies.setColumnConfigForDataset(datasetId, {
            ...existingConfig,
            columns: updatedLocalStorageColumns,
          });
        }
      } catch (error) {
        console.error('[DatasetColumnContext] Error updating localStorage with aliases:', error);
      }
    }
  }, [
    displayConfigData,
    datasetId,
    columns.length,
    dependencies.LOCAL_STORAGE_KEYS.COLUMN_ORDERING_VISIBILITY,
    loadFromLocalStorage,
  ]); // Run when displayConfigData or columns.length changes

  /**
   * Sync originalColumns visibility with backend display_config when it becomes available
   * This fixes the case where initializeColumns runs BEFORE displayConfigData is loaded,
   * causing originalColumns to have default isVisible=true for all columns instead of
   * the actual backend visibility (is_hidden).
   */
  const hasVisibilitySyncedRef = useRef(false);
  useEffect(() => {
    if (
      !isInitializedRef.current ||
      !displayConfigData?.display_config ||
      originalColumns.length === 0 ||
      hasVisibilitySyncedRef.current
    ) {
      return;
    }

    // Build visibility map from backend display_config
    const visibilityMap = new Map<string, boolean>();
    displayConfigData.display_config.forEach((item) => {
      visibilityMap.set(item.column.toLowerCase(), !item.is_hidden);
    });

    // Check if any originalColumn needs visibility update
    let needsUpdate = false;
    const updatedOriginalColumns = originalColumns.map((col) => {
      const backendVisibility = visibilityMap.get(col.id.toLowerCase());
      if (backendVisibility !== undefined && col.isVisible !== backendVisibility) {
        needsUpdate = true;
        return { ...col, isVisible: backendVisibility };
      }
      return col;
    });

    if (needsUpdate) {
      setOriginalColumns(updatedOriginalColumns);
    }

    // Mark as synced so we don't re-run (prevents infinite loops)
    hasVisibilitySyncedRef.current = true;
  }, [displayConfigData, originalColumns.length]);

  /**
   * BLUEPRINT ACTIONS
   */

  const handleColumnChange = useCallback((id: string, field: string, value: string | boolean | null) => {
    // Optimistic update: Update UI immediately
    setColumns((prev) => {
      return prev.map((col) => {
        if (col.id === id) {
          // Handle 'hidden' field by converting to 'isVisible' (inverted)
          const actualField = field === 'hidden' ? 'isVisible' : field;
          const updatedCol = { ...col };

          // Explicitly handle 'default' field to ensure null is properly set
          if (actualField === 'default') {
            updatedCol.default = value === null ? null : value;
          } else {
            updatedCol[actualField as keyof typeof updatedCol] = value as never;
          }

          return updatedCol;
        }

        return col;
      });
    });
  }, []);

  const handleDeleteColumn = useCallback((id: string) => {
    setColumns((prev) => {
      const filtered = prev.filter((col) => col?.id !== id);

      // Reorder remaining columns
      return filtered.map((col, index) => ({ ...col, order: index }));
    });
  }, []);

  const handleAddColumn = useCallback(
    (type: string, columnName?: string) => {
      // Generate unique stable ID for new column
      const uniqueColId = `${dependencies.NEW_COLUMN_PREFIX.COL_}${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      // Generate unique ID that never changes, even when backend ID updates
      const uniqueId = `unique_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Generate column name based on index (Column 1, Column 2, etc.)
      // Index starts from 1, so new column index = columns.length + 1
      const columnIndex = columns?.length + 1;
      const defaultColumnName = `Column ${columnIndex}`;

      const newColumn: EnhancedColumnDataType = {
        id: uniqueColId, // Temporary ID that will be replaced by backend ID
        uniqueId, // Unique ID for React keys - never changes
        column_name: columnName || defaultColumnName,
        column_type: type,
        required: false,
        isVisible: true,
        width: 150,
        order: columns?.length,
      };

      setColumns((prev) => [...prev, newColumn]);

      // Mark as initialized when adding columns to a new dataset
      // This ensures syncWithLocalStorage runs for new datasets
      if (datasetId && !isInitializedRef.current) {
        isInitializedRef.current = true;
      }
    },
    [columns?.length, dependencies.NEW_COLUMN_PREFIX, datasetId],
  );

  const handleReorderColumns = useCallback((newOrder: ColumnDataType[]) => {
    setColumns((prev) => {
      // Create a map of existing columns for quick lookup
      const columnMap = new Map(prev.map((col) => [col?.id, col]));

      // Create new ordered list
      return newOrder.map((orderedCol, index) => {
        const existingCol = columnMap.get(orderedCol?.id);

        if (existingCol) {
          return {
            ...existingCol,
            ...orderedCol, // Update with any changes from drag-drop
            uniqueId: existingCol?.uniqueId, // Preserve uniqueId
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
        const columnsWithLatestWidths = sortedColumns.map((col) => {
          const localStorageWidth = existingWidthsMap.get(col?.id);
          const latestWidth = localStorageWidth !== undefined ? localStorageWidth : col?.width;

          return { ...col, width: latestWidth };
        });

        // Reorder using the sorted array
        const newColumns = [...columnsWithLatestWidths];
        const [movedColumn] = newColumns.splice(fromIndex, 1);

        newColumns.splice(toIndex, 0, movedColumn);

        // Update order property
        return newColumns.map((col, index) => ({ ...col, order: index }));
      });
    },
    [datasetId, loadFromLocalStorage],
  );

  const handleColumnVisibilityChange = useCallback((columnId: string, isVisible: boolean) => {
    setColumns((prev) => prev.map((col) => (col?.id === columnId ? { ...col, isVisible } : col)));
  }, []);

  const handleColumnWidthChange = useCallback((columnId: string, width: number) => {
    setColumns((prev) => prev.map((col) => (col?.id === columnId ? { ...col, width } : col)));
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
          const localStorageWidth = existingWidthsMap.get(col?.id);
          const freshWidth = localStorageWidth !== undefined ? localStorageWidth : col.width;

          return { ...col, width: freshWidth };
        });

        const columnMap = new Map(columnsWithFreshWidths.map((col) => [col?.id, col]));
        const reordered: EnhancedColumnDataType[] = [];

        order.forEach((colId, index) => {
          const col = columnMap.get(colId);

          if (col) {
            reordered.push({ ...col, order: index });
          }
        });

        // Add any columns not in the order array at the end
        columnsWithFreshWidths.forEach((col) => {
          if (!order.includes(col?.id)) {
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
        isVisible: visibility[col?.id] !== undefined ? visibility[col?.id] : col?.isVisible,
      })),
    );
  }, []);

  /**
   * GETTERS FOR DIFFERENT CONSUMERS
   */

  const getBlueprintColumns = useCallback((): (ColumnDataType & { uniqueId?: string })[] => {
    // Blueprint should ALWAYS show ALL columns regardless of visibility
    return [...columns]
      .sort((a, b) => a.order - b.order)
      .map(({ id, column_name, column_type, required, isVisible, default: defaultValue, uniqueId }) => ({
        id,
        column_name,
        column_type,
        required,
        isVisible,
        default: defaultValue,
        uniqueId,
      }));
  }, [columns]);

  const getPreviewColumnConfig = useCallback((): ColumnOrderingVisibilityType[] => {
    return [...columns]
      .sort((a, b) => a.order - b.order)
      .map((col) => ({
        colId: col?.id,
        columnName: col?.column_name, // Use actual column name
        columnType: col?.column_type?.toLowerCase(), // Normalize to lowercase to match frontend constants
        isVisible: col?.isVisible,
        width: col?.width,
        isRequired: col?.required,
        defaultValue: col?.default ?? null,
      }));
  }, [columns]);

  const getColumnNamesMap = useCallback((): Record<string, string> => {
    return columns.reduce(
      (acc, col) => {
        acc[col.id] = col?.column_name;

        return acc;
      },
      {} as Record<string, string>,
    );
  }, [columns]);

  /**
   * Get column changes for update transaction payload
   * Compares current columns with original columns to determine:
   * - add_columns: New columns (FE-generated IDs)
   * - drop_columns: Deleted columns
   * - alter_columns: Type/required/default changes (NOT name changes)
   * - display_config: Name changes (using alias field)
   *
   * Rules:
   * - Name change only → display_config
   * - Type/required change → alter_columns
   * - Both name and type/required → BOTH display_config AND alter_columns
   */
  const getColumnChanges = useCallback((): ColumnChanges => {
    const FE_TEMP_ID_PATTERN = /^col_\d+_/;

    const backendDisplayConfigMap = new Map<string, { is_hidden: boolean }>();
    if (displayConfigData?.display_config) {
      displayConfigData.display_config.forEach((item) => {
        backendDisplayConfigMap.set(item.column.toLowerCase(), { is_hidden: !!item.is_hidden });
      });
    }

    const originalColumnsMap = new Map(originalColumns.map((col) => [col?.id, col]));
    const currentColumnsMap = new Map(columns.map((col) => [col?.id, col]));

    const add_columns: ColumnChanges['add_columns'] = [];
    const drop_columns: ColumnChanges['drop_columns'] = [];
    const alter_columns: ColumnChanges['alter_columns'] = [];
    const display_config: ColumnChanges['display_config'] = [];

    columns.forEach((col) => {
      if (FE_TEMP_ID_PATTERN.test(col?.id)) {
        if (!originalColumnsMap.has(col?.id)) {
          const defaultValue =
            col?.required && col?.default !== null && col?.default !== undefined
              ? typeof col?.default === 'boolean'
                ? String(col?.default)
                : col?.default
              : null;

          const sanitizedName = col?.column_name?.replace(/\s+/g, '_')?.toLowerCase();
          const columnType = col?.column_type?.toUpperCase();

          const addColumnEntry = {
            name: sanitizedName,
            type: columnType,
            nullable: !col?.required,
            default: defaultValue,
          };
          add_columns.push(addColumnEntry);

          const displayConfigEntry = {
            column: addColumnEntry.name,
            alias: col?.column_name,
            is_hidden: !col?.isVisible,
            is_editable: true,
            type: columnType,
          };
          display_config.push(displayConfigEntry);
        }
      }
    });

    originalColumns.forEach((originalCol) => {
      if (!currentColumnsMap.has(originalCol?.id)) {
        drop_columns.push(originalCol?.id?.toLowerCase());
      }
    });

    columns.forEach((col) => {
      const originalCol = originalColumnsMap.get(col?.id);
      if (!originalCol) return;

      const nameChanged = col?.column_name !== originalCol?.column_name;
      const backendDisplayConfig = backendDisplayConfigMap.get(col?.id.toLowerCase());

      let visibilityChanged = false;
      if (backendDisplayConfig !== undefined) {
        visibilityChanged = !!col?.isVisible === !!backendDisplayConfig.is_hidden;
      } else {
        visibilityChanged = col?.isVisible !== originalCol?.isVisible;
      }

      const typeChanged =
        normalizeTypeForComparison(col?.column_type || '') !==
        normalizeTypeForComparison(originalCol?.column_type || '');
      const requiredChanged = col?.required !== originalCol?.required;
      const defaultChanged = col?.default !== originalCol?.default;

      const hasAnyChange = nameChanged || visibilityChanged || typeChanged || requiredChanged || defaultChanged;

      if (hasAnyChange) {
        if (typeChanged || requiredChanged || defaultChanged) {
          const alterEntry: ColumnChanges['alter_columns'][0] = {
            name: originalCol?.id?.toLowerCase(),
          };

          if (typeChanged) {
            alterEntry.type = col?.column_type?.toUpperCase();
          }
          if (requiredChanged) {
            alterEntry.nullable = !col?.required;
          }
          if (requiredChanged || defaultChanged) {
            alterEntry.default = col?.required
              ? col?.default !== null && col?.default !== undefined
                ? typeof col?.default === 'boolean'
                  ? String(col?.default)
                  : col?.default
                : null
              : null;
          }

          alter_columns.push(alterEntry);
        }

        if (nameChanged || visibilityChanged || typeChanged) {
          let displayConfigEntry = display_config.find((entry) => entry?.column === originalCol?.id?.toLowerCase());

          if (!displayConfigEntry) {
            displayConfigEntry = {
              column: originalCol.id?.toLowerCase(),
            };
            display_config.push(displayConfigEntry);
          }

          if (nameChanged) {
            displayConfigEntry.alias = col?.column_name;
          }

          if (visibilityChanged) {
            displayConfigEntry.is_hidden = !col?.isVisible;
          }

          if (typeChanged) {
            displayConfigEntry.type = col?.column_type?.toUpperCase();
          }
        }
      }
    });

    return { add_columns, drop_columns, alter_columns, display_config };
  }, [columns, originalColumns, displayConfigData]);

  /**
   * Check if there are any changes from original columns
   */
  const hasChanges = useCallback((): boolean => {
    const changes = getColumnChanges();
    return (
      changes.add_columns.length > 0 ||
      changes.drop_columns.length > 0 ||
      changes.alter_columns.length > 0 ||
      changes.display_config.length > 0
    );
  }, [getColumnChanges]);

  /**
   * Reset original columns to current state after successful save
   * This includes ALL columns (including FE temp ones) because after a successful
   * create transaction, the FE temp columns represent columns that now exist in BE
   */
  const resetOriginalColumns = useCallback(() => {
    // Include all columns - after a successful transaction, current state IS the baseline
    setOriginalColumns(columns.map((col) => ({ ...col })));
  }, [columns]);

  /**
   * Update column IDs and names from BE after successful transaction (SSE event)
   * This handles:
   * 1. Replacing FE temp IDs with actual BE column IDs
   * 2. Updating renamed column IDs (e.g., col_10 -> col_11 when column was renamed)
   * 3. Updating column names to match BE aliases
   * @param beColumns - Array of BE columns with id and optional name (alias)
   */
  const updateColumnIdsFromBE = useCallback((beColumns: Array<{ id: string; name?: string }>) => {
    // Create a set of all BE column IDs for quick lookup
    const beIdSet = new Set(beColumns.map((col) => col?.id?.toLowerCase()));

    // Create maps for ID lookup and name/alias lookup
    const beIdByNormalizedName = new Map<string, string>();
    const beNameById = new Map<string, string>(); // BE column ID -> display name (alias or formatted)
    beColumns.forEach((beCol) => {
      const normalized = beCol?.id?.toLowerCase().trim();
      beIdByNormalizedName.set(normalized, beCol.id);
      if (beCol.name) {
        beNameById.set(beCol?.id, beCol?.name);
      }
    });

    setColumns((prev) => {
      return prev.map((col) => {
        const currentIdLower = col?.id?.toLowerCase();

        // If current ID exists in BE, check if name needs updating
        if (beIdSet.has(currentIdLower)) {
          // Use lowercase to lookup since beNameById is keyed by BE ID (which might have different casing)
          const beId = beIdByNormalizedName.get(currentIdLower);
          const newName = beId ? beNameById.get(beId) : undefined;
          if (newName && newName !== col.column_name) {
            return { ...col, column_name: newName };
          }
          return col;
        }

        // Current ID doesn't exist in BE - either FE temp ID or renamed column
        // Try to find matching BE ID by normalizing column name
        const normalizedName = col?.column_name?.toLowerCase().trim().replace(/\s+/g, '_');
        const beId = beIdByNormalizedName.get(normalizedName);

        if (beId) {
          // Replace with correct BE ID, but preserve uniqueId
          const newName = beNameById.get(beId);
          return { ...col, id: beId, column_name: newName || col?.column_name, uniqueId: col?.uniqueId };
        }

        // No match found - column might have been deleted or not yet processed
        return col;
      });
    });

    // Also update original columns
    setOriginalColumns((prev) => {
      return prev.map((col) => {
        const currentIdLower = col?.id?.toLowerCase();

        if (beIdSet.has(currentIdLower)) {
          // Use lowercase to lookup since beNameById is keyed by BE ID (which might have different casing)
          const beId = beIdByNormalizedName.get(currentIdLower);
          const newName = beId ? beNameById.get(beId) : undefined;
          if (newName && newName !== col?.column_name) {
            return { ...col, column_name: newName };
          }
          return col;
        }

        const normalizedName = col?.column_name?.toLowerCase().trim().replace(/\s+/g, '_');
        const beId = beIdByNormalizedName.get(normalizedName);

        if (beId) {
          const newName = beNameById.get(beId);
          return { ...col, id: beId, column_name: newName || col?.column_name, uniqueId: col?.uniqueId };
        }

        return col;
      });
    });
  }, []);

  /**
   * Derive column order and visibility for easy access
   * Memoized to prevent unnecessary re-renders and effect triggers
   */
  const columnOrder = useMemo(() => [...columns].sort((a, b) => a.order - b.order).map((col) => col?.id), [columns]);

  const columnVisibility = useMemo(
    () =>
      columns.reduce(
        (acc, col) => {
          acc[col?.id] = col?.isVisible;

          return acc;
        },
        {} as Record<string, boolean>,
      ),
    [columns],
  );

  const value: DatasetColumnContextType = {
    columns,
    originalColumns,
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
    getColumnChanges,
    hasChanges,
    resetOriginalColumns,
    updateColumnIdsFromBE,
  };

  return <DatasetColumnContext.Provider value={value}>{children}</DatasetColumnContext.Provider>;
};
