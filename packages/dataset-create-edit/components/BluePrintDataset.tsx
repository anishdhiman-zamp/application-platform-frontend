'use client';

import { closestCenter, DndContext, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { captureException } from '@sentry/browser';
import { useResource } from '@zamp-platform/battalion';
import {
  deleteColumnConfigForDataset,
  getColumnConfigForDataset,
  setColumnConfigForDataset,
} from '@zamp-platform/dataset-create-edit';
import { Button, toast } from '@zamp-platform/ui';
import { AnimatePresence, motion } from 'framer-motion';
import { useParams, usePathname, useRouter } from 'next/navigation';
import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { usePendingDatasetContextOptional } from '@/context/pendingDataset.context';
import { UNTITLED_DATASET_NAME } from '@/modules/data/data.constants';
import { DATASET_CREATED_EVENT, DATASET_UPDATED_EVENT } from '@/utils/events';

import { DATASET_TOAST_MESSAGES, DatasetTabsTypes, PREVIEW_DATASET_ID, SYSTEM_COLUMNS } from '../constants';
import { useDatasetColumnContext } from '../context/DatasetColumnContext';
import { useCheckDatasetCreationEnabled } from '../hooks/useCheckDatasetCreationEnabled';
import { useDragAndDrop } from '../hooks/useDragAndDrop';
import { normalizeTypeForComparison } from '../utils/columnConversion';
import ColumnTypeDropdown from './ColumnTypeDropdown';
import DatasetColumDetails from './DatasetColumDetails';
import DatasetColumnHeader from './DatasetColumnHeader';
import UnsavedChangesModal from './UnsavedChangesModal';

// Type for Battalion Dataset resource
interface DatasetResource {
  id: string;
  title: string;
  description: string;
  columns?: Array<{
    name: string;
    type: string;
    nullable?: boolean;
    default?: string | boolean | null;
    primary_key?: boolean;
  }>;
}

interface BluePrintDatasetProps {
  datasetId?: string; // If provided, it's an existing dataset
  isCreating?: boolean; // If true, we're in creation mode
  title?: string; // Dataset title (from breadcrumb or parent)
  onTransactionSuccess?: () => void; // Callback when transaction succeeds
}

const BluePrintDataset: FC<BluePrintDatasetProps> = ({
  datasetId: propDatasetId,
  isCreating = false,
  title = '',
  onTransactionSuccess,
}) => {
  const router = useRouter();
  const pathname = usePathname();

  const params = useParams<{ datasetId: string }>(); // Get datasetId from URL param
  const datasetId = propDatasetId || params?.datasetId || '';
  const hasDiscardedRef = useRef(false); // Flag to allow navigation after discard
  const isNavigatingAwayRef = useRef(false);
  const shouldBlockNavigationRef = useRef(false);
  const prevPathnameRef = useRef<string | null>(null);
  const prevDatasetIdForCacheRef = useRef<string>('');
  const scrollContainerRef = useRef<HTMLDivElement>(null); // Handle drag-and-drop with context
  const cachedLocalStorageTitleRef = useRef<string | null>(null);
  // Get pendingTitle directly from context (user's current input) if available
  const pendingTitleContext = usePendingDatasetContextOptional();

  // Battalion resource for creating/updating datasets
  const {
    create: createDataset,
    update: updateDataset,
    data: datasets,
    isCreating: isCreatePending,
    isUpdating: isUpdatePending,
    invalidate: invalidateDatasetCache,
  } = useResource<DatasetResource>('Dataset');
  // Navigation guard state
  const [showNavigationGuard, setShowNavigationGuard] = useState(false);
  const [pendingNavigationPath, setPendingNavigationPath] = useState<string | null>(null);
  const [isTransactionSuccessful, setIsTransactionSuccessful] = useState(false);
  const isCreationMode = useCheckDatasetCreationEnabled();
  const isTransactionPending = isCreatePending || isUpdatePending;
  // Store the title and columns that were sent in the transaction payload
  const lastTransactionPayloadRef = useRef<{
    title: string;
    dataset_unique_key_name?: string;
    columns: ReturnType<typeof getPreviewColumnConfig>;
  } | null>(null);

  // Use unified context for column management
  const {
    getBlueprintColumns,
    handleColumnChange: contextHandleColumnChange,
    handleDeleteColumn: contextHandleDeleteColumn,
    handleAddColumn: contextHandleAddColumn,
    handleReorderColumns,
    getPreviewColumnConfig,
    syncWithLocalStorage,
    getColumnChanges,
    resetOriginalColumns,
  } = useDatasetColumnContext(); // Get columns from context

  const columns = getBlueprintColumns();
  const isInitialMountRef = useRef(true);
  const prevColumnCountRef = useRef(columns.length);
  const [lastAddedColumnId, setLastAddedColumnId] = useState<string | null>(null);
  const [buttonAnimationKey, setButtonAnimationKey] = useState(0);
  const { sensors, modifiers } = useDragAndDrop({
    items: columns,
    setItems: () => {},
  });

  // Get the actual dataset title - priority: localStorage -> listing API -> pendingTitle (context) -> "Untitled Dataset"
  const actualTitle = useMemo(() => {
    const storageKey = datasetId && datasetId.trim() !== '' ? datasetId : isCreating ? PREVIEW_DATASET_ID : null;

    if (storageKey) {
      try {
        const datasetData = getColumnConfigForDataset(storageKey);

        if (datasetData) {
          if (typeof datasetData === 'object' && 'dataset_name' in datasetData) {
            const storedName = (datasetData as { dataset_name?: string }).dataset_name;
            if (storedName && storedName.trim() !== '' && storedName !== storageKey) {
              cachedLocalStorageTitleRef.current = storedName;
              return storedName;
            }
          }
        }
      } catch (error) {
        console.error('[actualTitle] Error reading from localStorage:', error);
        if (cachedLocalStorageTitleRef.current) {
          return cachedLocalStorageTitleRef.current;
        }
      }
    }

    // If we have a cached localStorage value, use it (prevents "Untitled Dataset" from overriding)
    if (cachedLocalStorageTitleRef.current) {
      return cachedLocalStorageTitleRef.current;
    }

    // 2. Try to get from datasets listing API
    if (datasetId && datasets && datasets.length > 0) {
      const dataset = datasets.find((d) => d.id === datasetId);
      if (dataset?.title && dataset.title.trim() !== '') {
        return dataset.title;
      }
    }

    // 3. Use title prop (which comes from pendingTitle context when user edits)
    const currentTitleProp = title;
    if (currentTitleProp && currentTitleProp.trim() !== '' && currentTitleProp.trim() !== 'Untitled Dataset') {
      return currentTitleProp;
    }

    return UNTITLED_DATASET_NAME;
  }, [datasetId, datasets]);

  // Reset or pre-populate the cached title when datasetId changes
  const syncCachedTitleWithLocalStorage = useCallback(() => {
    if (!datasetId) return;

    // Reset cache when navigating to a different dataset
    if (prevDatasetIdForCacheRef.current && prevDatasetIdForCacheRef.current !== datasetId) {
      cachedLocalStorageTitleRef.current = null;
    }

    // Pre-populate cache from localStorage on initial load
    if (!prevDatasetIdForCacheRef.current && !cachedLocalStorageTitleRef.current) {
      try {
        const storageKey = datasetId.trim() !== '' ? datasetId : isCreating ? PREVIEW_DATASET_ID : null;
        if (storageKey) {
          const datasetData = getColumnConfigForDataset(storageKey);
          if (datasetData && typeof datasetData === 'object' && 'dataset_name' in datasetData) {
            const storedName = (datasetData as { dataset_name?: string }).dataset_name;
            if (storedName && storedName.trim() !== '' && storedName !== storageKey) {
              cachedLocalStorageTitleRef.current = storedName;
            }
          }
        }
      } catch (error) {
        console.error('[actualTitle] Error pre-populating cache:', error);
      }
    }

    prevDatasetIdForCacheRef.current = datasetId;
  }, [datasetId, isCreating]);

  // Check if dataset exists in both localStorage and datasets listing
  const isDatasetCreated = useMemo(() => {
    if (!datasetId) return false;

    // Check if dataset exists in localStorage (org-scoped)
    const datasetData = getColumnConfigForDataset(datasetId);

    // Check if dataset has column data in localStorage (not just empty entry from sync)
    let hasColumnData = false;
    if (datasetData) {
      // New format: object with columns array
      if (typeof datasetData === 'object' && 'columns' in datasetData) {
        hasColumnData =
          Array.isArray((datasetData as { columns?: unknown[] }).columns) &&
          (datasetData as { columns: unknown[] }).columns.length > 0;
      } else if (Array.isArray(datasetData)) {
        // Old format: direct array
        hasColumnData = (datasetData as unknown[]).length > 0;
      }
    }

    // Check if dataset exists in the datasets listing (from Battalion)
    const isInListing = datasets?.some((dataset) => dataset.id === datasetId) ?? false;

    return hasColumnData && isInListing;
  }, [datasetId, datasets]);

  // Check if dataset is not saved in BE (for navigation guard)
  const isDatasetNotSaved = useMemo(() => {
    if (!datasetId) return false;
    // If datasets listing is loaded, check if dataset exists
    if (datasets && datasets.length >= 0) {
      return !datasets.some((dataset) => dataset.id === datasetId);
    }
    // If listing not loaded yet, assume it might not be saved (conservative approach)
    return true;
  }, [datasetId, datasets]);

  const handleColumnChange = (id: string, field: string, value: string | boolean | null) => {
    contextHandleColumnChange(id, field, value);
  };

  const handleDeleteColumn = (id: string) => {
    contextHandleDeleteColumn(id);
  };

  const handleAddColumn = (type: string) => {
    contextHandleAddColumn(type);
  };

  // Custom drag end handler that updates context directly
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = columns.findIndex((col) => col.id === active.id);
    const newIndex = columns.findIndex((col) => col.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    // Create new array with reordered columns
    const reordered = [...columns];
    const [movedItem] = reordered.splice(oldIndex, 1);

    reordered.splice(newIndex, 0, movedItem);

    // Update context with new order
    handleReorderColumns(reordered);
  };

  // Handle tracking newly added columns for auto-focus
  const trackColumnChanges = () => {
    const prevCount = prevColumnCountRef.current;
    const currentCount = columns.length;

    // Skip on initial mount
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      prevColumnCountRef.current = currentCount;

      return;
    }

    if (currentCount > prevCount) {
      // Adding a column - track the newly added column for auto-focus
      if (columns.length > 0) {
        setLastAddedColumnId(columns[columns.length - 1].id);
      }
      setButtonAnimationKey((prev) => prev + 1);
    } else if (currentCount < prevCount) {
      // Deleting a column
      setLastAddedColumnId(null);
    }

    prevColumnCountRef.current = currentCount;
  };

  // Save title to localStorage immediately when pendingTitle changes
  const saveTitleToLocalStorage = useCallback(() => {
    const storageKey = datasetId || (isCreating ? PREVIEW_DATASET_ID : null);
    if (!storageKey) return;

    const currentTitle = pendingTitleContext?.pendingTitle;
    if (!currentTitle || currentTitle.trim() === '' || currentTitle.trim() === 'Untitled Dataset') return;

    try {
      const existingData = getColumnConfigForDataset(storageKey);
      const existingColumns = (existingData as { columns?: unknown[] })?.columns || [];

      // For datasets being created, always update dataset_unique_key_name from the current title
      // For existing datasets, preserve existing dataset_unique_key_name
      const existingUniqueKeyName =
        (existingData as { dataset_unique_key_name?: string })?.dataset_unique_key_name || '';
      const uniqueKeyName = isCreating ? currentTitle.trim().replace(/\s+/g, '_') : existingUniqueKeyName;

      setColumnConfigForDataset(storageKey, {
        dataset_name: currentTitle.trim(),
        dataset_unique_key_name: uniqueKeyName,
        columns: existingColumns,
      });

      cachedLocalStorageTitleRef.current = currentTitle.trim();
    } catch (error) {
      console.error('[BluePrintDataset] Error saving title to localStorage:', error);
    }
  }, [datasetId, isCreating, pendingTitleContext?.pendingTitle]);

  // Compare backend data with localStorage structure exactly as stored
  const hasBackendLocalStorageDiff = useMemo(() => {
    // After successful creation, isCreating might still be true from props, but we have a datasetId
    // So check if we have a datasetId and it exists in datasets (meaning it was created)
    const datasetExists = datasets?.some((d) => d.id === datasetId);

    if (!datasetId || (isCreating && !datasetExists)) {
      return false; // For new datasets that haven't been created yet, no backend to compare
    }

    try {
      // Get backend dataset from listing (has full metadata with schema and display_config)
      const backendDataset = datasets?.find((d) => d.id === datasetId);
      if (!backendDataset) {
        return false;
      }

      const backendTitle = backendDataset.title || '';
      // DatasetResource interface doesn't include metadata, but actual API response does
      // Create a type-safe interface for the backend dataset with metadata
      interface BackendDatasetWithMetadata {
        metadata?: {
          schema?: { columns?: Array<{ name: string; type: string; nullable: boolean; default: string | null }> };
          display_config?: Array<{ column: string; alias: string | null; is_hidden: boolean }>;
        };
      }
      const backendDatasetWithMetadata = backendDataset as BackendDatasetWithMetadata;
      const backendMetadata = backendDatasetWithMetadata.metadata;

      // Get localStorage data structure (org-scoped)
      const localStorageData = getColumnConfigForDataset(datasetId);

      // Get localStorage structure: { dataset_name, columns: [...] }
      const localStorageTitle = (localStorageData as { dataset_name?: string })?.dataset_name || '';
      const localStorageColumns =
        (
          localStorageData as {
            columns?: Array<{
              colId: string;
              columnName: string;
              columnType: string;
              isVisible: boolean;
              width: number;
              isRequired: boolean;
              defaultValue: string | boolean | null;
            }>;
          }
        )?.columns || [];

      // Transform BE data to match localStorage structure
      // Filter out: id, created_at, updated_at, _zamp_is_deleted

      const backendSchemaColumns = backendMetadata?.schema?.columns || [];
      const backendDisplayConfig = backendMetadata?.display_config || [];

      // Create maps for quick lookup
      const schemaMap = new Map(
        backendSchemaColumns
          .filter((col) => !SYSTEM_COLUMNS.includes(col.name))
          .map((col) => [col.name.toLowerCase(), col]),
      );
      const displayConfigMap = new Map(
        backendDisplayConfig
          .filter((item) => !SYSTEM_COLUMNS.includes(item.column))
          .map((item) => [item.column.toLowerCase(), item]),
      );

      // Helper function to normalize column name for comparison
      // Convert all letters to lowercase and replace spaces with underscores
      const normalizeColumnName = (name: string): string => {
        if (!name) return '';
        return name.trim().toLowerCase().replace(/\s+/g, '_');
      };

      // Helper function to clean defaultValue
      const cleanDefaultValue = (value: string | null): string | null => {
        if (value === null || value === undefined) return null;
        const strValue = String(value);
        // Remove PostgreSQL type casting (::text, ::integer, etc.)
        let cleaned = strValue.replace(/::\w+/g, '');
        // Remove surrounding single quotes if present
        cleaned = cleaned.replace(/^'|'$/g, '');
        return cleaned || null;
      };

      // Transform BE columns to match localStorage structure
      const transformedBackendColumns = Array.from(schemaMap.entries()).map(([colNameKey, schemaCol]) => {
        const displayConfig = displayConfigMap.get(colNameKey);
        const columnName = displayConfig?.alias || schemaCol.name;
        const isHidden = displayConfig?.is_hidden || false;

        return {
          colId: schemaCol.name, // Stable backend column ID (e.g., "col_1", "col_2")
          columnName: normalizeColumnName(columnName || schemaCol.name),
          columnType: schemaCol.type || '',
          isVisible: !isHidden,
          isRequired: !schemaCol.nullable,
          defaultValue: cleanDefaultValue(schemaCol.default ?? null),
        };
      });

      // Transform localStorage columns OR use current columns from context (for immediate comparison)
      // Filter out system columns to match the backend side filtering
      const currentColumnsFromContext = columns
        .filter((col) => !SYSTEM_COLUMNS.includes(col.id))
        .map((col) => ({
          colId: col.id,
          columnName: normalizeColumnName(col.column_name || ''),
          columnType: col.column_type?.toUpperCase() || '',
          isVisible: col.isVisible,
          isRequired: col.required || false,
          defaultValue: col.default ?? null,
        }));

      // Use context columns if available, otherwise fallback to localStorage
      const transformedLocalStorageColumns =
        currentColumnsFromContext.length > 0
          ? currentColumnsFromContext
          : localStorageColumns
              .filter((col) => !SYSTEM_COLUMNS.includes(col.colId))
              .map((col) => ({
                colId: col.colId, // Keep colId for matching with backend
                columnName: normalizeColumnName(col.columnName || ''),
                columnType: col.columnType || '',
                isVisible: col.isVisible,
                isRequired: col.isRequired || false,
                defaultValue: col.defaultValue ?? null,
              }));

      // If localStorage is empty but backend has data, there's a diff
      if (!localStorageData || localStorageColumns.length === 0) {
        if (transformedBackendColumns.length > 0) {
          return true; // Backend has data but localStorage is empty - there's a diff
        }
        return false; // Both are empty - no diff
      }

      // Compare titles
      if (localStorageTitle.trim() !== backendTitle.trim()) {
        return true;
      }

      // Check if column counts match
      if (transformedBackendColumns.length !== transformedLocalStorageColumns.length) {
        return true;
      }

      // Match columns by colId (stable backend ID) - this ensures we match correctly even if column name changes
      for (const beCol of transformedBackendColumns) {
        // Find matching localStorage column by colId (stable ID, not by name)
        const matchingLsCol = transformedLocalStorageColumns.find((lsCol) => {
          return lsCol.colId?.toLowerCase() === beCol.colId.toLowerCase();
        });

        if (!matchingLsCol) {
          return true;
        }

        // Compare columnName - normalized comparison
        if (beCol.columnName !== matchingLsCol.columnName) {
          return true;
        }

        // Compare columnType - normalize using mapSchemaTypeToColumnType to handle equivalent types
        const beType = normalizeTypeForComparison(beCol.columnType || '');
        const lsType = normalizeTypeForComparison(matchingLsCol.columnType || '');
        if (beType !== lsType) {
          return true;
        }

        // Compare isVisible
        if (beCol.isVisible !== matchingLsCol.isVisible) {
          return true;
        }

        // Compare isRequired
        if (beCol.isRequired !== matchingLsCol.isRequired) {
          return true;
        }

        // Compare defaultValue
        const beDefault =
          beCol.defaultValue === null || beCol.defaultValue === undefined ? null : String(beCol.defaultValue);
        const lsDefault =
          matchingLsCol.defaultValue === null || matchingLsCol.defaultValue === undefined
            ? null
            : String(matchingLsCol.defaultValue);
        if (beDefault !== lsDefault) {
          return true;
        }
      }

      // Check for columns in localStorage that aren't in backend
      for (const lsCol of transformedLocalStorageColumns) {
        const foundMatch = transformedBackendColumns.some((beCol) => {
          return lsCol.colId?.toLowerCase() === beCol.colId.toLowerCase();
        });

        if (!foundMatch) {
          return true;
        }
      }

      return false; // No differences found
    } catch {
      return false; // On error, assume no diff to be safe
    }
  }, [datasetId, isCreating, datasets, columns, pendingTitleContext?.pendingTitle]);

  // Check if there are unsaved changes (for navigation guard - both create and update scenarios)
  const hasUnsavedChanges = useMemo(() => {
    if (!datasetId) return false;

    // Check if dataset exists in backend
    const datasetExists = datasets?.some((d) => d.id === datasetId);

    // If dataset exists in backend, always use diff logic to check for unsaved changes
    if (datasetExists) {
      return hasBackendLocalStorageDiff;
    }

    // For new datasets that haven't been created yet, check if there's any data in localStorage
    try {
      const localStorageData = getColumnConfigForDataset(datasetId);
      if (localStorageData) {
        const hasColumns =
          Array.isArray((localStorageData as { columns?: unknown[] }).columns) &&
          (localStorageData as { columns: unknown[] }).columns.length > 0;
        const hasTitle =
          (localStorageData as { dataset_name?: string }).dataset_name &&
          (localStorageData as { dataset_name: string }).dataset_name.trim() !== '';
        return hasColumns || hasTitle;
      }
    } catch {
      return false;
    }
    return false;
  }, [datasetId, datasets, hasBackendLocalStorageDiff]);

  const isDuplicateDatasetName = useCallback(
    (nameToCheck: string): boolean => {
      if (!nameToCheck || nameToCheck === 'Untitled Dataset') return false;

      const normalizedName = nameToCheck.trim().toLowerCase();

      // Priority 1: Check localStorage dataset_unique_key_name (org-scoped)
      // Transform dataset_unique_key_name: remove schema prefix, replace _ with space, then compare
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { getOrgColumnConfigs } = require('@zamp-platform/utils');
        const orgConfigs = getOrgColumnConfigs() as Record<string, unknown>;

        const existingNames: string[] = [];
        Object.entries(orgConfigs).forEach(([id, data]) => {
          // Skip current dataset
          if (id === datasetId) return;

          if (data && typeof data === 'object') {
            const record = data as Record<string, unknown>;
            // Collect transformed dataset_unique_key_name values
            if ('dataset_unique_key_name' in record) {
              const uniqueKeyName = (record as { dataset_unique_key_name?: string }).dataset_unique_key_name;
              if (uniqueKeyName) {
                // Extract table name part (after schema prefix like "test_dataset_creation.")
                const tableNamePart = uniqueKeyName.includes('.')
                  ? uniqueKeyName.split('.').pop() || uniqueKeyName
                  : uniqueKeyName;
                // Replace underscores with spaces for comparison with user's title
                const transformedName = tableNamePart.replace(/_/g, ' ').toLowerCase();
                existingNames.push(transformedName);
              }
            }
          }
        });

        // Check if user's title matches any transformed dataset_unique_key_name
        if (existingNames.length > 0 && existingNames.includes(normalizedName)) {
          return true;
        }
      } catch (error) {
        console.error('Failed to check for duplicate dataset name in localStorage:', error);
      }

      // Priority 2: Always check datasets listing from Battalion as well
      // This covers cases where localStorage doesn't have all dataset names yet
      if (datasets && datasets.length > 0) {
        // Check against tableName (unique key) - transform _ to space
        const isDuplicateByTableName = datasets.some((dataset) => {
          if (dataset.id === datasetId) return false;
          const tableName = (dataset as { tableName?: string }).tableName || '';
          const tableNamePart = tableName.includes('.') ? tableName.split('.').pop() || tableName : tableName;
          const transformedTableName = tableNamePart.replace(/_/g, ' ').toLowerCase();
          return transformedTableName === normalizedName;
        });
        if (isDuplicateByTableName) {
          return true;
        }
      }

      return false;
    },
    [datasetId, datasets],
  );

  // Handle Preview Dataset / Save click
  const handlePreviewDataset = useCallback(() => {
    if (!datasetId) return;

    // ALWAYS prioritize pendingTitle from context
    const userInputTitle = pendingTitleContext?.pendingTitle ?? title;

    // Get current columns from context (works after reload as it reads from localStorage)
    const currentColumns = getBlueprintColumns();

    // Validate that no column names are empty
    const hasEmptyColumnName = currentColumns.some((col) => {
      const columnName = col.column_name;
      return !columnName || columnName.trim() === '';
    });

    // Validate that no duplicate column names (aliases) exist (case-insensitive)
    const columnNames = currentColumns.map((col) => col.column_name?.toLowerCase().trim()).filter(Boolean);
    const duplicateNames = columnNames.filter((name, index) => columnNames.indexOf(name) !== index);
    const hasDuplicateNames = duplicateNames.length > 0;

    // In creation mode, validate that column names only contain alphabets, numbers, and spaces
    const hasInvalidColumnNameChars =
      isCreating &&
      currentColumns.some((col) => {
        const columnName = col.column_name?.trim();
        return columnName && /[^a-zA-Z0-9 ]/.test(columnName);
      });

    // Show unified error message if there are any validation errors
    if (hasEmptyColumnName || hasDuplicateNames || hasInvalidColumnNameChars) {
      toast.error(DATASET_TOAST_MESSAGES.FIX_ERRORS_BEFORE_CREATING);
      return;
    }

    // For new datasets, prioritize actualTitle (from localStorage) if userInputTitle is empty or "Untitled Dataset"
    const datasetTitle =
      isCreating && (!userInputTitle || userInputTitle.trim() === '' || userInputTitle.trim() === 'Untitled Dataset')
        ? actualTitle // For new datasets, use localStorage title if userInputTitle is empty/default
        : userInputTitle && userInputTitle.trim() !== ''
          ? userInputTitle.trim()
          : actualTitle; // Otherwise, prioritize user input

    // Validate title is not empty
    const trimmedTitle = datasetTitle?.trim();
    if (!trimmedTitle || trimmedTitle === '') {
      toast.error('Dataset title cannot be empty');
      return;
    }

    const isExistingDataset = isDatasetCreated || isTransactionSuccessful;

    if (isExistingDataset) {
      // UPDATE FLOW: Dataset already exists, call update transaction
      const columnChanges = getColumnChanges();

      // Check if title has changed by comparing userInputTitle (from pendingTitle context) with localStorage
      // Get original title from localStorage
      let originalTitle = '';
      if (datasetId) {
        try {
          const datasetData = getColumnConfigForDataset(datasetId);
          if (datasetData && typeof datasetData === 'object' && 'dataset_name' in datasetData) {
            originalTitle = (datasetData as { dataset_name?: string }).dataset_name || '';
          }
        } catch (error) {
          console.error('[handlePreviewDataset] Error reading from localStorage:', error);
        }
      }

      // Compare userInputTitle (from pendingTitle context - user's current input) with localStorage
      // userInputTitle reflects what the user typed in the breadcrumb, so compare that directly
      const currentTitleForComparison =
        userInputTitle && userInputTitle.trim() !== '' && userInputTitle.trim() !== 'Untitled Dataset'
          ? userInputTitle.trim()
          : datasetTitle.trim();

      const hasTitleChanged =
        currentTitleForComparison !== '' &&
        originalTitle.trim() !== '' &&
        currentTitleForComparison !== originalTitle.trim();

      // Check if there are any changes (columns or title)
      const hasColumnChanges =
        columnChanges.add_columns.length > 0 ||
        columnChanges.drop_columns.length > 0 ||
        columnChanges.alter_columns.length > 0 ||
        columnChanges.display_config.length > 0;

      // Also check if there's a diff between backend and localStorage
      // This ensures the button state and save logic are in sync
      const hasBackendDiff = hasBackendLocalStorageDiff;

      if (!hasColumnChanges && !hasTitleChanged && !hasBackendDiff) {
        toast.info(DATASET_TOAST_MESSAGES.NO_CHANGES_TO_SAVE);
        return;
      }

      const updatePayload = {
        id: datasetId,
        title: trimmedTitle,
        add_columns: columnChanges.add_columns,
        drop_columns: columnChanges.drop_columns,
        alter_columns: columnChanges.alter_columns,
        display_config: columnChanges.display_config,
      };

      // Store the payload title and columns for saving to localStorage on success
      lastTransactionPayloadRef.current = {
        title: trimmedTitle,
        columns: getPreviewColumnConfig(),
      };

      // Call the update transaction API
      updateDataset(datasetId, updatePayload);
    } else if (isCreating) {
      // CREATE FLOW: New dataset, call create transaction
      // Block creation with default "Untitled Dataset" name
      if (!datasetTitle || datasetTitle.trim() === 'Untitled Dataset') {
        toast.error(DATASET_TOAST_MESSAGES.DUPLICATE_DATASET_NAME);
        return;
      }
      // Check for duplicate dataset name
      if (isDuplicateDatasetName(datasetTitle)) {
        toast.error(DATASET_TOAST_MESSAGES.DUPLICATE_DATASET_NAME);
        return;
      }

      // Transform blueprint columns to API format
      // When nullable is false (required), include the default value
      // When nullable is true (not required), default is null
      const apiColumns = columns.map((col) => ({
        name: col.column_name,
        type: col.column_type.toUpperCase(),
        nullable: !col.required,
        default: col.required ? col.default : null,
        is_hidden: !col.isVisible,
      }));

      const payload = {
        id: datasetId,
        title: trimmedTitle,
        description: 'New Dataset',
        columns: apiColumns,
      };

      // Store the payload title and columns for saving to localStorage on success
      // For creation, generate dataset_unique_key_name by replacing spaces with underscores
      lastTransactionPayloadRef.current = {
        title: trimmedTitle,
        dataset_unique_key_name: trimmedTitle.replace(/\s+/g, '_'),
        columns: getPreviewColumnConfig(),
      };

      // Call the create transaction API with the dataset and columns
      createDataset(payload);
    }
  }, [
    isCreating,
    datasetId,
    columns,
    getBlueprintColumns,
    createDataset,
    updateDataset,
    actualTitle,
    isDuplicateDatasetName,
    isDatasetCreated,
    isTransactionSuccessful,
    getColumnChanges,
    pendingTitleContext,
    pendingTitleContext?.pendingTitle, // Include pendingTitle in deps to ensure callback uses latest value
    title,
  ]);

  // Intercept link clicks and navigation BEFORE they happen
  const historyStatePushedRef = useRef(false);

  // Block navigation and show the unsaved changes guard modal
  const blockNavigation = useCallback((e: Event | null, path: string | null) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
    }
    setPendingNavigationPath(path);
    setShowNavigationGuard(true);
    shouldBlockNavigationRef.current = true;
  }, []);

  // Handle click events to intercept navigation away from unsaved dataset
  const handleNavigationClick = useCallback(
    (e: MouseEvent) => {
      if (!hasUnsavedChanges) return;

      const target = e.target as HTMLElement;

      // Don't interfere with drag and drop operations
      const isDragHandle =
        target.closest('[data-sortable-handle]') ||
        target.closest('.cursor-grab') ||
        target.closest('[role="button"][aria-pressed]') ||
        (target.closest('svg') && target.closest('svg')?.parentElement?.classList.contains('cursor-grab'));

      if (isDragHandle) return;

      const currentDatasetPath = `/datasets/${datasetId}`;

      // Check for link elements (Next.js Link or regular anchor)
      const link = target.closest('a') as HTMLAnchorElement;
      if (link) {
        const href = link.getAttribute('href');
        if (href && href.startsWith('/') && !href.startsWith(currentDatasetPath)) {
          blockNavigation(e, href);
          return;
        }
      }

      // Check for breadcrumb arrow button (SVG element with data attribute)
      if (target.closest('[data-breadcrumb-arrow="true"]')) {
        blockNavigation(e, '/datasets');
        return;
      }

      // Check for breadcrumb buttons that might trigger navigation
      const button = target.closest('button') as HTMLButtonElement;
      if (button) {
        let element: HTMLElement | null = button;
        let isBreadcrumbButton = false;

        // Check up to 5 levels up for breadcrumb indicators
        for (let i = 0; i < 5 && element; i++) {
          const className = element.className || '';
          const id = element.id || '';
          if (
            className.includes('BreadCrumb') ||
            className.includes('breadcrumb') ||
            id.includes('breadcrumb') ||
            (element.tagName === 'DIV' && element.textContent?.includes('/'))
          ) {
            isBreadcrumbButton = true;
            break;
          }
          element = element.parentElement;
        }

        if (isBreadcrumbButton && button.textContent?.trim() === 'Data') {
          blockNavigation(e, '/datasets');
        }
      }
    },
    [hasUnsavedChanges, datasetId, blockNavigation],
  );

  // Handle browser back/forward buttons
  const handlePopState = useCallback(() => {
    if (hasUnsavedChanges && !showNavigationGuard) {
      window.history.pushState(null, '', window.location.pathname + window.location.search);
      blockNavigation(null, null);
    }
  }, [hasUnsavedChanges, showNavigationGuard, blockNavigation]);

  // Handle Save dataset action (from navigation guard modal)
  // Fire-and-forget: trigger save, close modal, navigate immediately
  const handleCreateDataset = useCallback(() => {
    // Store the navigation path before clearing state
    const targetPath = pendingNavigationPath;

    // Trigger the save/create transaction (fire-and-forget)
    handlePreviewDataset();

    // Set discard flag to prevent navigation guard from re-triggering during navigation
    hasDiscardedRef.current = true;
    isNavigatingAwayRef.current = false;
    shouldBlockNavigationRef.current = false;

    // Close modal immediately
    setShowNavigationGuard(false);
    setPendingNavigationPath(null);

    // Navigate immediately — don't wait for transaction to complete
    // Transaction success/failure is handled by SSE events and onRollback
    if (targetPath) {
      router.push(targetPath);
    } else {
      router.back();
    }

    // Reset discard flag after navigation completes
    setTimeout(() => {
      hasDiscardedRef.current = false;
    }, 500);
  }, [handlePreviewDataset, pendingNavigationPath, router]);

  // Handle Discard dataset action
  const handleDiscardDataset = useCallback(() => {
    // Store the navigation path before clearing state
    const targetPath = pendingNavigationPath;

    // Set discard flag FIRST to prevent navigation guard from interfering
    hasDiscardedRef.current = true;
    isNavigatingAwayRef.current = false;
    shouldBlockNavigationRef.current = false;

    // For new datasets (creation mode): remove the entry entirely
    // For existing datasets: restore localStorage from BE data (discard user changes)
    try {
      if (isCreationMode) {
        deleteColumnConfigForDataset(datasetId);
      } else {
        // Rebuild localStorage from BE data
        const backendDataset = datasets?.find((d) => d.id === datasetId);
        if (backendDataset) {
          interface BackendDatasetWithMetadata {
            tableName?: string;
            metadata?: {
              schema?: { columns?: Array<{ name: string; type: string; nullable: boolean; default: string | null }> };
              display_config?: Array<{ column: string; alias: string | null; is_hidden: boolean }>;
            };
          }
          const beWithMeta = backendDataset as BackendDatasetWithMetadata;
          const beMeta = beWithMeta.metadata;

          const schemaColumns = beMeta?.schema?.columns?.filter((col) => !SYSTEM_COLUMNS.includes(col.name)) || [];
          const displayConfigMap = new Map(
            (beMeta?.display_config || [])
              .filter((item) => !SYSTEM_COLUMNS.includes(item.column))
              .map((item) => [item.column.toLowerCase(), item]),
          );

          const cleanDefault = (value: string | null): string | null => {
            if (value === null || value === undefined) return null;
            let cleaned = String(value).replace(/::\w+/g, '');
            cleaned = cleaned.replace(/^'|'$/g, '');
            return cleaned || null;
          };

          // Get existing widths from localStorage to preserve user resizes
          const existingData = getColumnConfigForDataset(datasetId);
          const existingColumns =
            (existingData as { columns?: Array<{ colId: string; width?: number }> })?.columns || [];
          const existingWidthsMap = new Map(existingColumns.map((col) => [col.colId, col.width || 150]));

          const restoredColumns = schemaColumns.map((schemaCol) => {
            const displayConfig = displayConfigMap.get(schemaCol.name.toLowerCase());
            const columnName =
              displayConfig?.alias ||
              schemaCol.name.charAt(0).toUpperCase() + schemaCol.name.slice(1).replace(/_/g, ' ');
            const isHidden = displayConfig?.is_hidden || false;

            return {
              colId: schemaCol.name,
              columnName,
              columnType: schemaCol.type?.toUpperCase() || 'TEXT',
              isVisible: !isHidden,
              width: existingWidthsMap.get(schemaCol.name) || 150,
              isRequired: !schemaCol.nullable,
              defaultValue: cleanDefault(schemaCol.default ?? null),
            };
          });

          const existingUniqueKeyName =
            (existingData as { dataset_unique_key_name?: string })?.dataset_unique_key_name ||
            beWithMeta.tableName ||
            '';

          setColumnConfigForDataset(datasetId, {
            dataset_name: backendDataset.title,
            dataset_unique_key_name: existingUniqueKeyName,
            columns: restoredColumns,
          });
        } else {
          // No BE data found, just delete
          deleteColumnConfigForDataset(datasetId);
        }
      }
    } catch (error) {
      console.error('[NavigationGuard] Error restoring localStorage:', error);
    }

    // Close modal immediately (non-blocking state update)
    setShowNavigationGuard(false);
    setPendingNavigationPath(null);

    // Navigate immediately - no setTimeout needed since we've set the discard flag
    if (targetPath) {
      router.push(targetPath);
    } else {
      // If no pending path (back button), just go back
      router.back();
    }

    // Reset discard flag after a short delay to ensure navigation completes
    // This is just cleanup, doesn't affect navigation speed
    setTimeout(() => {
      hasDiscardedRef.current = false;
    }, 500);
  }, [datasetId, pendingNavigationPath, router]);

  // Handle modal close (X button or outside click)
  const handleModalClose = useCallback((open: boolean) => {
    setShowNavigationGuard(open);
    if (!open) {
      setPendingNavigationPath(null);
      isNavigatingAwayRef.current = false;
    }
  }, []);

  // Handle internal navigation (route changes) - fallback for programmatic navigation
  const handleInternalNavigation = useCallback(() => {
    if (!prevPathnameRef.current) {
      prevPathnameRef.current = pathname;
      return;
    }

    const currentDatasetPath = `/datasets/${datasetId}`;
    const wasOnDatasetPage =
      prevPathnameRef.current === currentDatasetPath || prevPathnameRef.current?.startsWith(currentDatasetPath);
    const isLeavingDatasetPage =
      pathname !== currentDatasetPath && pathname && !pathname.startsWith(currentDatasetPath);

    const shouldShowNavigationGuard =
      wasOnDatasetPage &&
      isLeavingDatasetPage &&
      hasUnsavedChanges &&
      !isNavigatingAwayRef.current &&
      !showNavigationGuard &&
      !shouldBlockNavigationRef.current &&
      !hasDiscardedRef.current;

    if (shouldShowNavigationGuard) {
      isNavigatingAwayRef.current = true;
      setPendingNavigationPath(pathname);
      setShowNavigationGuard(true);
      shouldBlockNavigationRef.current = true;
      const currentSearch = typeof window !== 'undefined' ? window.location.search : '';
      router.replace(`${currentDatasetPath}${currentSearch}`);
    }

    prevPathnameRef.current = pathname;
  }, [pathname, datasetId, hasUnsavedChanges, router, showNavigationGuard]);

  useEffect(() => {
    syncCachedTitleWithLocalStorage();
  }, [syncCachedTitleWithLocalStorage]);

  useEffect(() => {
    trackColumnChanges();
  }, [columns.length]);

  useEffect(() => {
    saveTitleToLocalStorage();
  }, [saveTitleToLocalStorage]);

  // Auto-scroll to bottom when new columns are added
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [columns.length]);

  // No longer need to wait for transaction success to close modal
  // Save now uses fire-and-forget: modal closes and navigates immediately

  // Handle successful dataset transaction (create or update) via custom events
  const handleTransactionSuccess = useCallback(
    (operationType: 'create' | 'update') => {
      setIsTransactionSuccessful(true);

      // Switch to preview tab on successful transaction
      if (onTransactionSuccess) {
        onTransactionSuccess();
      }

      // Remove source=creation from URL params after successful creation
      if (operationType === 'create' && isCreationMode) {
        // Use setTimeout to ensure this runs after the tab switch router.push
        setTimeout(() => {
          const currentParams = new URLSearchParams(window.location.search);
          currentParams.delete('source');
          // Ensure the tab parameter is preserved (set to preview after transaction)
          if (!currentParams.has('tab')) {
            currentParams.set('tab', DatasetTabsTypes.PREVIEW);
          }
          const newUrl = `${window.location.pathname}${currentParams.toString() ? `?${currentParams.toString()}` : ''}`;
          router.replace(newUrl, { scroll: false });
        }, 100);
      }

      // Reset original columns to current state (for change tracking)
      resetOriginalColumns();

      // Save dataset ID and column structure to localStorage on successful transaction
      if (datasetId) {
        try {
          const existingDatasetData = getColumnConfigForDataset(datasetId);

          // Keep existing columns from localStorage as-is (preserves user's resized widths)
          const existingColumns = (existingDatasetData as { columns?: unknown[] })?.columns || [];
          const existingUniqueKeyName =
            (existingDatasetData as { dataset_unique_key_name?: string })?.dataset_unique_key_name || '';

          // Only update title and unique key name; columns stay as they are in localStorage
          const payloadTitle = lastTransactionPayloadRef.current?.title || actualTitle;
          const uniqueKeyName = lastTransactionPayloadRef.current?.dataset_unique_key_name || existingUniqueKeyName;

          setColumnConfigForDataset(datasetId, {
            dataset_name: payloadTitle,
            dataset_unique_key_name: uniqueKeyName,
            columns: existingColumns,
          });

          cachedLocalStorageTitleRef.current = payloadTitle;
        } catch (error) {
          captureException(error, { tags: { source: 'BluePrintDataset', datasetId } });
        }

        lastTransactionPayloadRef.current = null;

        // Also sync context to localStorage for consistency
        syncWithLocalStorage();
        // Invalidate Battalion's TanStack Query cache so `datasets` (used in hasBackendLocalStorageDiff) refetches
        invalidateDatasetCache();
      }
    },
    [
      datasetId,
      actualTitle,
      syncWithLocalStorage,
      resetOriginalColumns,
      onTransactionSuccess,
      isCreationMode,
      router,
      invalidateDatasetCache,
    ],
  );

  // Listen for dataset created/updated events from the resource layer
  useEffect(() => {
    const onDatasetCreated = () => handleTransactionSuccess('create');
    const onDatasetUpdated = () => handleTransactionSuccess('update');

    window.addEventListener(DATASET_CREATED_EVENT, onDatasetCreated);
    window.addEventListener(DATASET_UPDATED_EVENT, onDatasetUpdated);

    return () => {
      window.removeEventListener(DATASET_CREATED_EVENT, onDatasetCreated);
      window.removeEventListener(DATASET_UPDATED_EVENT, onDatasetUpdated);
    };
  }, [handleTransactionSuccess]);

  useEffect(() => {
    if (!datasetId || showNavigationGuard || hasDiscardedRef.current) {
      historyStatePushedRef.current = false;
      return;
    }

    // Push a state only once to track when user tries to go back
    if (!historyStatePushedRef.current) {
      window.history.pushState({ preventBack: true }, '', window.location.pathname + window.location.search);
      historyStatePushedRef.current = true;
    }

    // Intercept clicks on links (capture phase to catch before Next.js handles it)
    document.addEventListener('click', handleNavigationClick, true);
    window.addEventListener('popstate', handlePopState);

    return () => {
      document.removeEventListener('click', handleNavigationClick, true);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [datasetId, showNavigationGuard, pathname, handleNavigationClick, handlePopState]);

  useEffect(() => {
    handleInternalNavigation();
  }, [handleInternalNavigation]);

  // Reset navigation guard state after successful transaction
  useEffect(() => {
    if (isTransactionSuccessful || isDatasetCreated) {
      setShowNavigationGuard(false);
      setPendingNavigationPath(null);
      isNavigatingAwayRef.current = false;
      shouldBlockNavigationRef.current = false;
      // Reset isTransactionSuccessful after a delay to allow the guard to work again for new changes
      // This ensures that after saving, if user makes new changes, the guard will work again
      if (isTransactionSuccessful) {
        setTimeout(() => {
          setIsTransactionSuccessful(false);
        }, 100);
      }
    }
  }, [isTransactionSuccessful, isDatasetCreated]);

  return (
    <div className='flex h-full flex-col'>
      <div className='sticky top-0 z-[100] bg-white'>
        <DatasetColumnHeader />
      </div>
      <div ref={scrollContainerRef} className='max-h-[calc(100vh-150px)] min-h-0 flex-1 overflow-y-auto'>
        <div className='flex flex-col overflow-hidden pb-4'>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            modifiers={modifiers}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={columns.filter((col) => col.id).map((col) => col.id)}
              strategy={verticalListSortingStrategy}
            >
              <AnimatePresence>
                {columns
                  .filter((col) => col.id)
                  .map((col, index) => {
                    // Skip animation for the default column (first column when it's a new dataset with only one column)
                    const isDefaultColumn =
                      isDatasetNotSaved && columns.filter((c) => c.id).length === 1 && index === 0;
                    return (
                      <DatasetColumDetails
                        key={(col as { uniqueId?: string }).uniqueId || col.id}
                        columnData={col}
                        onChange={handleColumnChange}
                        onDelete={handleDeleteColumn}
                        shouldAutoFocus={col.id === lastAddedColumnId}
                        allColumns={columns}
                        skipInitialAnimation={isDefaultColumn}
                        canEdit
                        isCreating={isCreating}
                      />
                    );
                  })}
              </AnimatePresence>
            </SortableContext>
          </DndContext>
          <div className='ml-4 pt-3 pl-7'>
            <motion.div
              key={buttonAnimationKey}
              className=''
              initial={buttonAnimationKey > 0 ? { opacity: 0, y: -20 } : false}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.15, 0.0, 0.4, 1.0] } }}
            >
              <ColumnTypeDropdown onTypeSelect={handleAddColumn} label='Columns' />
            </motion.div>
          </div>
        </div>
      </div>
      <div className='border-GRAY_200 sticky bottom-0 z-[100] flex justify-end border-t bg-white p-3'>
        <AnimatePresence mode='wait'>
          <motion.div
            key={isDatasetCreated || isTransactionSuccessful ? 'save' : 'create'}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.15, 0.0, 0.4, 1.0] }}
          >
            <Button onClick={handlePreviewDataset} disabled={isTransactionPending}>
              {isDatasetCreated || isTransactionSuccessful ? 'Save' : 'Create Dataset'}
            </Button>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Guard Modal */}
      <UnsavedChangesModal
        open={showNavigationGuard}
        onOpenChange={handleModalClose}
        onSave={handleCreateDataset}
        onDiscard={handleDiscardDataset}
        isCreating={isDatasetNotSaved}
      />
    </div>
  );
};

export default BluePrintDataset;
