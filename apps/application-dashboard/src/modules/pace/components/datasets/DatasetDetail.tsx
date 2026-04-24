'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DatasetEditPreviewTab, DatasetTabsTypes } from '@zamp-platform/dataset-create-edit';
import {
  Button,
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogHeaderTitle,
  toast,
  TooltipV2,
} from '@zamp-platform/ui';
import {
  CellEditRequestEvent,
  ColDef,
  ColumnMovedEvent,
  FillEndEvent,
  IRowNode,
  IServerSideDatasource,
} from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import usePolling from 'hooks/usePolling';
import { useUserIdentity } from 'hooks/useUserIdentity';
import { AlertTriangle, ArrowLeft, Download, Loader2, ShieldOff } from 'lucide-react';
import ColumnHeader from 'modules/pace/components/datasets/ColumnHeader';
import DatasetBlueprintEditor from 'modules/pace/components/datasets/DatasetBlueprintEditor';
import {
  type BlueprintColumn,
  buildAlterTableAddColumnQuery,
  buildAlterTableBatchQuery,
  buildAlterTableDropColumnQuery,
  buildBackfillNullsQuery,
  buildCountQuery,
  buildFilterClauses,
  buildPrimaryKeyQuery,
  buildSelectTableQuery,
  buildTableColumnsDetailQuery,
  buildUpdateCellQuery,
  buildUpdateFillQuery,
  COL_PREFIX,
  type ColumnModification,
  DATASETS_POLL_INTERVAL_MS,
  DETAIL_PAGE_SIZE,
  escapeSqlIdentifier,
  getCellEditorForPgType,
  pgTypeToColumnType,
  reorderBlueprintColumns,
  sanitizeColumnName,
} from 'modules/pace/components/datasets/datasets.constants';
import ShareDatasetNeonPopup from 'modules/pace/components/datasets/ShareDatasetNeonPopup';
import { preserveSidebarParam } from 'modules/pace/pace.utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn, snakeCaseToSentenceCase } from 'utils/common';
import {
  DatasetRoleValue,
  useAgentDbWriteMutation,
  useExportAgentDbTableMutation,
  useGetDatasetRolesQuery,
  useLazyAgentDbReadQuery,
  useLazyGetAgentDbExportStatusQuery,
} from '@/apis/agentManagedDb';
import ImageLoader from '@/components/common/loader/ImageLoader';
import { ZAMP_LOGO_LOADER_SVG } from '@/constants/icons';
import { ROUTES_PATH } from '@/constants/routeConfig';
import {
  getFromLocalStorage,
  LOCAL_STORAGE_KEYS,
  removeFromLocalStorage,
  setToLocalStorage,
} from '@/utils/localstorage';
import DatasetTable from 'components/common/table/DatasetTable';
import DisplayOptions from 'components/common/table/DisplayOptions';
import { FILTER_TYPES } from 'components/filter/filter.types';
import FiltersWrapper from 'components/filter/filterMenu/FiltersWrapper';
import { filtersContextActions, useFiltersContextStore, withFiltersContext } from 'components/filter/filters.context';

const PREVIEW_GRID_STYLE = { height: '100%', width: '100%' } as const;

const parseBlueprintDraft = (raw: string | null): BlueprintColumn[] | null => {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);

    return Array.isArray(parsed) ? (parsed as BlueprintColumn[]) : null;
  } catch {
    return null;
  }
};

// Debug logging — off by default. To enable in any environment, in the browser console:
//   window.__DATASET_DEBUG__ = true
// Disable with: window.__DATASET_DEBUG__ = false
const datasetDebugLog = (...args: unknown[]) => {
  if (typeof window !== 'undefined' && (window as unknown as { __DATASET_DEBUG__?: boolean }).__DATASET_DEBUG__) {
    // eslint-disable-next-line no-console
    console.log('[DatasetDetail]', new Date().toISOString().slice(11, 23), ...args);
  }
};

interface DatasetDetailProps {
  tableName: string;
  header?: React.ReactNode;
  onBackToDatasets?: () => void;
}

const DatasetDetailInner = ({ tableName, header, onBackToDatasets }: DatasetDetailProps) => {
  // --- Refs ---
  const tableRef = useRef<AgGridReact | null>(null);
  const renderCountRef = useRef(0);

  renderCountRef.current += 1;
  datasetDebugLog('render', { count: renderCountRef.current, tableName });
  const totalRowsRef = useRef<number | undefined>(undefined);
  const lastFilterClausesRef = useRef<string | undefined>(undefined);
  const activeFilterClausesRef = useRef<string | undefined>(undefined);
  const initRef = useRef(false);
  const prefetchRef = useRef<{
    dataPromise: Promise<{ rows: Record<string, unknown>[]; count: number }>;
    countPromise: Promise<{ rows: Record<string, unknown>[]; count: number }>;
    consumed: boolean;
  } | null>(null);
  // Last successful raw rows; reused for augmented data when blueprint has unsaved changes.
  const cachedRowsRef = useRef<Record<string, unknown>[]>([]);
  // True while we programmatically move columns in AG Grid, to avoid feedback loops.
  const isProgrammaticMoveRef = useRef(false);
  // Skip the next previewColumns refresh so rename's optimistic update isn't purged mid-flight.
  const skipNextPreviewRefreshRef = useRef(false);

  // --- Hooks ---
  const router = useRouter();
  const { userId } = useUserIdentity();
  const [executeQuery] = useLazyAgentDbReadQuery();
  const [executeMutation] = useAgentDbWriteMutation();
  const [exportTable] = useExportAgentDbTableMutation();
  const [getExportStatus] = useLazyGetAgentDbExportStatusQuery();
  const { startPolling } = usePolling();
  const { data: rolesData, isLoading: isLoadingRoles } = useGetDatasetRolesQuery(
    { tableName },
    {
      pollingInterval: DATASETS_POLL_INTERVAL_MS,
      skipPollingIfUnfocused: true,
    },
  );
  const {
    dispatch: filterDispatch,
    state: { selectedFilters, filtersConfig: contextFiltersConfig },
  } = useFiltersContextStore();

  // --- State ---
  const [columns, setColumns] = useState<ColDef[] | null>(null);
  const [totalRows, setTotalRows] = useState<number | null>(null);

  const [activeTab, setActiveTab] = useState<DatasetTabsTypes>(() => {
    const saved = getFromLocalStorage(`${LOCAL_STORAGE_KEYS.DATASET_ACTIVE_TAB}_${tableName}` as LOCAL_STORAGE_KEYS);

    return saved === DatasetTabsTypes.BLUEPRINT ? DatasetTabsTypes.BLUEPRINT : DatasetTabsTypes.PREVIEW;
  });
  const [blueprintColumns, setBlueprintColumns] = useState<BlueprintColumn[]>([]);
  const [originalBlueprintColumns, setOriginalBlueprintColumns] = useState<BlueprintColumn[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [blueprintHasErrors, setBlueprintHasErrors] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const pendingNavRef = useRef<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [gridReady, setGridReady] = useState(false);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  const [schemaError, setSchemaError] = useState<string | null>(null);
  const [pkColumn, setPkColumn] = useState<string | null>(null);

  // --- Memo ---
  const userRole = useMemo(() => {
    if (!rolesData?.roles?.length || !userId) return undefined;

    return rolesData.roles.find((r) => r?.user_id === userId && r?.table_name === tableName)?.role;
  }, [rolesData, userId, tableName]);

  const accessDenied = !isLoadingRoles && !!userId && !!rolesData && userRole === undefined;

  const canEditData =
    (userRole === DatasetRoleValue.ADMIN || userRole === DatasetRoleValue.EDITOR) && pkColumn !== null;
  const canEditBlueprint = userRole === DatasetRoleValue.ADMIN || userRole === DatasetRoleValue.EDITOR;

  const columnOrderKey = `${LOCAL_STORAGE_KEYS.DATASET_COLUMN_ORDER}_${tableName}` as LOCAL_STORAGE_KEYS;

  const applyColumnOrder = useCallback(
    (cols: BlueprintColumn[]): BlueprintColumn[] => {
      const raw = getFromLocalStorage(columnOrderKey);

      if (!raw) return cols;
      try {
        const order = JSON.parse(raw) as string[];
        const orderMap = new Map(order.map((id, i) => [id, i]));
        const sorted = [...cols].sort((a, b) => {
          const ai = orderMap.has(a.id) ? orderMap.get(a.id)! : Infinity;
          const bi = orderMap.has(b.id) ? orderMap.get(b.id)! : Infinity;

          return ai - bi;
        });

        return sorted;
      } catch {
        return cols;
      }
    },
    [columnOrderKey],
  );

  const loadSchema = useCallback(async () => {
    try {
      const [result, pkResult] = await Promise.all([
        executeQuery({ query: buildTableColumnsDetailQuery(tableName) }).unwrap(),
        executeQuery({ query: buildPrimaryKeyQuery(tableName) })
          .unwrap()
          .catch(() => ({ rows: [] })),
      ]);
      const allRows = result.rows ?? [];
      const pkRows = pkResult.rows ?? [];

      const detectedPk = pkRows.length > 0 ? String(pkRows[0].column_name) : null;

      setPkColumn(detectedPk);

      const bpColsRaw: BlueprintColumn[] = allRows.map((row: Record<string, unknown>) => {
        const colName = String(row.column_name);

        return {
          id: colName,
          name: colName,
          type: pgTypeToColumnType(String(row.data_type)),
          required: String(row.is_nullable) === 'NO',
          frozen: colName === 'id',
        };
      });

      // Apply saved column order — frozen 'id' always stays first
      const bpCols = applyColumnOrder(bpColsRaw);

      setOriginalBlueprintColumns(bpCols);

      // Build grid ColDefs in the same order as bpCols
      const gridCols: ColDef[] = bpCols.map((bp) => {
        const dbRow = allRows.find((r) => r.column_name != null && String(r.column_name) === bp.id);

        if (bp.frozen) {
          return {
            field: bp.id,
            headerName: bp.id ? snakeCaseToSentenceCase(bp.id) : '',
            hide: true,
            editable: false,
            suppressFillHandle: true,
          };
        }

        return {
          field: bp.id,
          headerName: bp.id ? snakeCaseToSentenceCase(bp.id) : '',
          ...(dbRow ? getCellEditorForPgType(String(dbRow.data_type)) : {}),
        };
      });

      setColumns(gridCols);

      const config = gridCols
        .filter((c) => !c.hide)
        .map((c) => ({
          key: c.field as string,
          label: c.headerName as string,
          values: [],
          type: FILTER_TYPES.SEARCH,
          datatype: 'string',
        }));

      filterDispatch({ type: filtersContextActions.SET_FILTERS_CONFIG, payload: { filtersConfig: config } });

      // Restore any unsaved draft from localStorage, but only if it's consistent with
      // the current schema. A draft whose column ids don't match the schema (e.g. left
      // over from a prior version that stored display names as ids) would make
      // hasBlueprintChanges permanently true, trapping the grid in its blueprint-cache
      // path and breaking server-side pagination.
      const draftKey = `${LOCAL_STORAGE_KEYS.DATASET_BLUEPRINT_DRAFT}_${tableName}` as LOCAL_STORAGE_KEYS;
      const raw = getFromLocalStorage(draftKey);
      const draft = parseBlueprintDraft(raw);
      const schemaIds = new Set(bpCols.map((c) => c.id));
      const isDraftValid =
        draft !== null && draft.length > 0 && draft.every((c) => c.id.startsWith(COL_PREFIX) || schemaIds.has(c.id));

      if (isDraftValid) {
        setBlueprintColumns(draft);
      } else {
        if (raw !== null) removeFromLocalStorage(draftKey);
        setBlueprintColumns(bpCols);
      }
    } catch {
      setColumns([]);
      setSchemaError('Failed to load dataset schema. The table may not exist or you may not have access.');
    }
  }, [executeQuery, tableName, filterDispatch, applyColumnOrder]);

  const reloadSchemaAndData = useCallback(async () => {
    setColumns(null);
    prefetchRef.current = null;
    cachedRowsRef.current = [];
    removeFromLocalStorage(`${LOCAL_STORAGE_KEYS.DATASET_BLUEPRINT_DRAFT}_${tableName}` as LOCAL_STORAGE_KEYS);
    const dataPromise = executeQuery({
      query: buildSelectTableQuery(tableName, DETAIL_PAGE_SIZE, 0, undefined, undefined, 'id'),
    }).unwrap();
    const countPromise = executeQuery({ query: buildCountQuery(tableName) }).unwrap();

    prefetchRef.current = { dataPromise, countPromise, consumed: false };
    await loadSchema();
  }, [executeQuery, tableName, loadSchema]);

  const handleSaveBlueprint = useCallback(async () => {
    const originalMap = new Map(originalBlueprintColumns.map((c) => [c.id, c]));
    const currentIds = new Set(blueprintColumns.map((c) => c.id));

    const addedColumns = blueprintColumns.filter((c) => !originalMap.has(c.id));
    const droppedColumns = originalBlueprintColumns.filter((c) => !currentIds.has(c.id));

    const modifications: ColumnModification[] = [];

    for (const col of blueprintColumns) {
      const orig = originalMap.get(col.id);

      if (!orig) continue;
      const newSanitized = sanitizeColumnName(col.name);
      const renamed = newSanitized !== orig.id;
      const requiredChanged = col.required !== orig.required;

      if (renamed || requiredChanged) {
        modifications.push({
          oldName: orig.id,
          newName: renamed ? col.name : undefined,
          setNotNull: requiredChanged && col.required ? true : undefined,
          dropNotNull: requiredChanged && !col.required ? true : undefined,
          defaultValue: requiredChanged && col.required ? col.defaultValue : undefined,
        });
      }
    }

    if (addedColumns.length === 0 && droppedColumns.length === 0 && modifications.length === 0) {
      toast.info('No changes to save');

      return;
    }

    for (const col of addedColumns) {
      if (!col.name?.trim()) {
        toast.error('Column name cannot be empty');

        return;
      }
    }

    setIsSaving(true);
    try {
      // Backfill NULL values before setting NOT NULL
      const backfills = modifications.filter((m) => m.setNotNull && m.defaultValue);

      if (backfills.length > 0) {
        await Promise.all(
          backfills.map((m) =>
            executeMutation({ query: buildBackfillNullsQuery(tableName, m.oldName, m.defaultValue ?? '') }).unwrap(),
          ),
        );
      }

      const totalOps = droppedColumns.length + addedColumns.length + modifications.length;

      if (totalOps > 1 || modifications.length > 0) {
        const query = buildAlterTableBatchQuery(
          tableName,
          droppedColumns.map((c) => c.id),
          addedColumns,
          modifications,
        );
        const statements = query.split(';\n').filter(Boolean);

        for (const stmt of statements) {
          await executeMutation({ query: stmt }).unwrap();
        }
      } else if (droppedColumns.length === 1) {
        await executeMutation({ query: buildAlterTableDropColumnQuery(tableName, droppedColumns[0].id) }).unwrap();
      } else if (addedColumns.length === 1) {
        await executeMutation({ query: buildAlterTableAddColumnQuery(tableName, addedColumns[0]) }).unwrap();
      }

      toast.success('Schema updated successfully');
      setActiveTab(DatasetTabsTypes.PREVIEW);
      await reloadSchemaAndData();
    } catch {
      toast.error('Failed to update schema');
    } finally {
      setIsSaving(false);
    }
  }, [blueprintColumns, originalBlueprintColumns, tableName, executeMutation, reloadSchemaAndData]);

  const handleColumnRename = useCallback(
    async (colId: string, newName: string) => {
      const sanitized = sanitizeColumnName(newName);

      if (sanitized === colId) return;

      const newHeaderName = snakeCaseToSentenceCase(sanitized);
      const previousHeaderName = snakeCaseToSentenceCase(colId);

      // Optimistic header rename; skip next preview refresh since ALTER TABLE is in flight.
      skipNextPreviewRefreshRef.current = true;
      setColumns(
        (prev) => prev?.map((col) => (col.field === colId ? { ...col, headerName: newHeaderName } : col)) ?? null,
      );

      // Remap stored column order so the renamed column keeps its position after loadSchema.
      const rawOrder = getFromLocalStorage(columnOrderKey);

      if (rawOrder) {
        try {
          const order = JSON.parse(rawOrder) as string[];
          const updatedOrder = order.map((id) => (id === colId ? sanitized : id));

          setToLocalStorage(columnOrderKey, JSON.stringify(updatedOrder));
        } catch {
          // ignore parse errors — column may land at the end, but rename still succeeds
        }
      }

      try {
        await executeMutation({
          query: `ALTER TABLE "${escapeSqlIdentifier(tableName)}" RENAME COLUMN "${escapeSqlIdentifier(colId)}" TO "${escapeSqlIdentifier(sanitized)}"`,
        }).unwrap();
        toast.success('Column renamed');
        await loadSchema();
      } catch {
        toast.error('Failed to rename column');
        skipNextPreviewRefreshRef.current = true;
        setColumns(
          (prev) =>
            prev?.map((col) => (col.field === colId ? { ...col, headerName: previousHeaderName } : col)) ?? null,
        );
        if (rawOrder) {
          setToLocalStorage(columnOrderKey, rawOrder);
        }
      }
    },
    [tableName, executeMutation, loadSchema, columnOrderKey],
  );

  const handleColumnRequiredChange = useCallback(
    async (colId: string, required: boolean, defaultValue?: string | null) => {
      try {
        if (required && defaultValue) {
          await executeMutation({
            query: buildBackfillNullsQuery(tableName, colId, defaultValue),
          }).unwrap();
        }
        const op = required ? 'SET NOT NULL' : 'DROP NOT NULL';

        await executeMutation({
          query: `ALTER TABLE "${escapeSqlIdentifier(tableName)}" ALTER COLUMN "${escapeSqlIdentifier(colId)}" ${op}`,
        }).unwrap();
        toast.success(required ? 'Column set to required' : 'Column set to optional');
        await reloadSchemaAndData();
      } catch {
        toast.error('Failed to update column');
      }
    },
    [tableName, executeMutation, reloadSchemaAndData],
  );

  const getColumnInfo = useCallback(
    (colId: string) => blueprintColumns.find((c) => c.id === colId),
    [blueprintColumns],
  );

  const handleCellEditRequest = useCallback(
    async (event: CellEditRequestEvent) => {
      const { colDef, newValue, data, node, oldValue, source } = event;
      const field = colDef.field;

      if (!field || newValue === oldValue) return;

      if (source !== 'edit' && source !== 'api') return;

      if (!pkColumn) return;

      node.setData({ ...data, [field]: newValue });

      const rowId = data?.[pkColumn];

      if (rowId === undefined || rowId === null) return;

      try {
        await executeMutation({
          query: buildUpdateCellQuery(tableName, field, newValue, String(rowId), pkColumn),
        }).unwrap();
      } catch {
        node.setData({ ...data, [field]: oldValue });
        toast.error('Failed to update cell');
      }
    },
    [tableName, executeMutation, pkColumn],
  );

  const handleFillEnd = useCallback(
    async (event: FillEndEvent) => {
      const { finalRange, initialRange, api } = event;

      if (!finalRange?.startRow || !finalRange?.endRow || !initialRange?.startRow) return;
      if (!pkColumn) return;

      const colId = finalRange.columns[0]?.getColId();

      if (!colId) return;

      const srcIdx = initialRange.startRow.rowIndex;
      const fillValue = api.getDisplayedRowAtIndex(srcIdx)?.data?.[colId];

      const affectedNodes: { node: IRowNode; oldData: Record<string, unknown> }[] = [];
      const rowIds: string[] = [];

      for (let i = finalRange.startRow.rowIndex; i <= finalRange.endRow.rowIndex; i++) {
        const node = api.getDisplayedRowAtIndex(i);
        const rid = node?.data?.[pkColumn];

        if (node && rid !== undefined && rid !== null && i !== srcIdx) {
          rowIds.push(String(rid));
          affectedNodes.push({ node, oldData: { ...node.data } });
          node.setData({ ...node.data, [colId]: fillValue });
        }
      }
      if (!rowIds.length) return;

      try {
        await executeMutation({
          query: buildUpdateFillQuery(tableName, colId, fillValue, rowIds, pkColumn),
        }).unwrap();
      } catch {
        affectedNodes.forEach(({ node, oldData }) => node.setData(oldData));
        toast.error('Failed to update cells');
      }
    },
    [tableName, executeMutation, pkColumn],
  );

  // When the user reorders columns in the Preview grid, sync the order back to blueprintColumns
  // and persist to localStorage so Blueprint tab reflects the same order.
  // Only active when there are no unsaved blueprint changes (otherwise preview shows pending columns
  // with col_ ids that don't map back cleanly to saved field names).
  const handleColumnMoved = useCallback(
    (event: ColumnMovedEvent) => {
      if (!event.finished || event.source !== 'uiColumnMoved') return;
      if (hasBlueprintChangesRef.current) return;
      if (isProgrammaticMoveRef.current) return;
      const allCols = event.api.getAllGridColumns();

      if (!allCols?.length) return;
      // Build new ordered field list from AG Grid's current column state
      const newFieldOrder = allCols.map((c) => c.getColId());
      const final = reorderBlueprintColumns(newFieldOrder, blueprintColumns);

      setBlueprintColumns(final);
      setToLocalStorage(columnOrderKey, JSON.stringify(final.map((c) => c.id)));
    },
    [blueprintColumns, columnOrderKey],
  );

  const hasBlueprintChanges = useMemo(() => {
    const originalMap = new Map(originalBlueprintColumns.map((c) => [c.id, c]));
    const currentIds = new Set(blueprintColumns.map((c) => c.id));

    const hasAdded = blueprintColumns.some((c) => !originalMap.has(c.id));
    const hasDropped = originalBlueprintColumns.some((c) => !currentIds.has(c.id));
    const hasModified = blueprintColumns.some((c) => {
      const orig = originalMap.get(c.id);

      if (!orig) return false;

      return sanitizeColumnName(c.name) !== orig.id || c.required !== orig.required;
    });

    return hasAdded || hasDropped || hasModified;
  }, [blueprintColumns, originalBlueprintColumns]);

  // Keep a ref so getRows can read hasBlueprintChanges without being a dependency
  const hasBlueprintChangesRef = useRef(false);

  hasBlueprintChangesRef.current = hasBlueprintChanges;

  // --- Preview columns: derived from pending blueprint state when there are unsaved changes ---
  // When the blueprint has unsaved changes, we compute what the grid columns *should* look like
  // based on the pending blueprint, so the Preview tab reflects those changes immediately.
  const previewColumns = useMemo<ColDef[] | null>(() => {
    if (!columns) return null;

    const colMap = new Map(columns.map((c) => [c.field, c]));
    const originalMap = new Map(originalBlueprintColumns.map((c) => [c.id, c]));
    const droppedIds = new Set(
      originalBlueprintColumns.filter((c) => !blueprintColumns.find((b) => b.id === c.id)).map((c) => c.id),
    );

    const result: ColDef[] = [];

    for (const bpCol of blueprintColumns) {
      if (bpCol.frozen) {
        const existing = colMap.get(bpCol.id);

        if (existing) result.push(existing);
        continue;
      }

      const isNew = !originalMap.has(bpCol.id) || bpCol.id.startsWith(COL_PREFIX);
      const existing = colMap.get(bpCol.id);

      if (existing && !droppedIds.has(bpCol.id)) {
        if (hasBlueprintChanges) {
          // Reflect any pending rename
          const sanitizedName = bpCol.name ? sanitizeColumnName(bpCol.name) : '';

          result.push({
            ...existing,
            headerName: snakeCaseToSentenceCase(sanitizedName || bpCol.name || ''),
            editable: false,
            suppressFillHandle: true,
          });
        } else {
          // No unsaved changes — use existing ColDef as-is (preserves editor config etc.)
          result.push(existing);
        }
      } else if (isNew && hasBlueprintChanges) {
        // New column pending save — non-editable in preview
        const fieldName = sanitizeColumnName(bpCol.name) || bpCol.name;

        result.push({
          field: fieldName,
          headerName: snakeCaseToSentenceCase(fieldName),
          editable: false,
          suppressFillHandle: true,
        });
      }
    }

    return result.length > 0 ? result : columns;
  }, [columns, hasBlueprintChanges, blueprintColumns, originalBlueprintColumns]);

  // Maps new COL_PREFIX column id → sanitized field name, used to augment rows
  const pendingColumnDefaults = useMemo<
    { field: string; defaultValue: string | null | undefined; required: boolean; isNew: boolean; origId: string }[]
  >(() => {
    if (!hasBlueprintChanges) return [];
    const originalMap = new Map(originalBlueprintColumns.map((c) => [c.id, c]));

    return blueprintColumns
      .filter((c) => !c.frozen)
      .map((c) => {
        const isNew = !originalMap.has(c.id) || c.id.startsWith(COL_PREFIX);
        const orig = originalMap.get(c.id);
        const becameRequired = !isNew && orig && !orig.required && c.required;

        return {
          field: isNew ? sanitizeColumnName(c.name) || c.name : c.id,
          defaultValue: c.defaultValue,
          required: c.required,
          isNew,
          origId: c.id,
          becameRequired: becameRequired ?? false,
        };
      });
  }, [hasBlueprintChanges, blueprintColumns, originalBlueprintColumns]) as {
    field: string;
    defaultValue: string | null | undefined;
    required: boolean;
    isNew: boolean;
    origId: string;
    becameRequired: boolean;
  }[];

  // Intercept navigation away when there are unsaved blueprint changes
  const handleNavAttempt = useCallback(
    (href: string) => {
      if (hasBlueprintChanges) {
        pendingNavRef.current = href;
        setShowUnsavedModal(true);
      } else {
        router.push(href);
      }
    },
    [hasBlueprintChanges, router],
  );

  const handleModalDiscard = useCallback(() => {
    setShowUnsavedModal(false);
    const href = pendingNavRef.current;

    pendingNavRef.current = null;
    // Clear draft and reset blueprint so guard is lifted before navigating
    removeFromLocalStorage(`${LOCAL_STORAGE_KEYS.DATASET_BLUEPRINT_DRAFT}_${tableName}` as LOCAL_STORAGE_KEYS);
    setBlueprintColumns(originalBlueprintColumns);
    if (href) router.push(href);
  }, [originalBlueprintColumns, tableName, router]);

  const handleModalSave = useCallback(async () => {
    await handleSaveBlueprint();
    setShowUnsavedModal(false);
    const href = pendingNavRef.current;

    pendingNavRef.current = null;
    if (href) router.push(href);
  }, [handleSaveBlueprint, router]);

  const handleExportCsv = useCallback(async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      const whereClause = activeFilterClausesRef.current;
      const { workflow_id } = await exportTable({
        table_name: tableName,
        ...(whereClause ? { where_clause: whereClause } : {}),
      }).unwrap();

      const finalResult = await startPolling({
        fn: () => getExportStatus({ workflowId: workflow_id }),
        validate: (res: { status: string } | undefined) => res?.status === 'COMPLETED' || res?.status === 'FAILED',
        interval: 3000,
        maxAttempts: 100,
        isExponential: true,
        backoffFactor: 2,
        maxInterval: 20000,
      });

      if (finalResult?.status === 'COMPLETED' && finalResult?.signed_url) {
        const response = await fetch(finalResult.signed_url);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');

        link.href = url;
        link.download = `${tableName}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success(`Exported ${finalResult.row_count?.toLocaleString() ?? ''} rows`);
      } else {
        toast.error('Export failed. Please try again.');
      }
    } catch {
      toast.error('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  }, [tableName, isExporting, exportTable, getExportStatus, startPolling]);

  // Augments fetched rows with pending blueprint changes (new columns + newly-required defaults)
  const augmentRows = useCallback(
    (rows: Record<string, unknown>[]): Record<string, unknown>[] => {
      if (!pendingColumnDefaults.length) return rows;

      return rows.map((row) => {
        const augmented = { ...row };

        for (const col of pendingColumnDefaults) {
          if (col.isNew) {
            // New column: fill with default value if required, otherwise null
            augmented[col.field] = col.required && col.defaultValue != null ? col.defaultValue : null;
          } else if (col.becameRequired && col.defaultValue != null) {
            // Existing column newly marked required: fill null cells with the default value
            if (augmented[col.field] === null || augmented[col.field] === undefined) {
              augmented[col.field] = col.defaultValue;
            }
          }
        }

        return augmented;
      });
    },
    [pendingColumnDefaults],
  );

  // Keep a ref so getRows can always call the latest augmentRows without re-creating the datasource
  const augmentRowsRef = useRef(augmentRows);

  augmentRowsRef.current = augmentRows;

  const getRows: IServerSideDatasource['getRows'] = useCallback(
    async (params) => {
      const { startRow = 0, endRow = DETAIL_PAGE_SIZE, sortModel } = params.request;

      datasetDebugLog('getRows.enter', {
        startRow,
        endRow,
        sortModel: sortModel?.length ? sortModel : undefined,
        hasBlueprintChanges: hasBlueprintChangesRef.current,
      });

      // When blueprint has unsaved changes, serve only the cached first block.
      // Report rowCount as the cache size so AG Grid doesn't keep requesting more blocks
      // (the cache only holds the first page, not the full dataset).
      if (hasBlueprintChangesRef.current && cachedRowsRef.current.length > 0) {
        if (startRow === 0) {
          const augmented = augmentRowsRef.current(cachedRowsRef.current);

          params.success({ rowData: augmented, rowCount: cachedRowsRef.current.length });
          setInitialDataLoaded(true);
          datasetDebugLog('getRows.success.blueprintCache', {
            rows: augmented.length,
            rowCount: cachedRowsRef.current.length,
          });
        } else {
          params.success({ rowData: [], rowCount: cachedRowsRef.current.length });
          datasetDebugLog('getRows.success.blueprintCache.empty', { startRow });
        }

        return;
      }

      const prefetch = prefetchRef.current;
      const filterClauses = activeFilterClausesRef.current;
      const hasFilters = !!filterClauses;

      if (prefetch && !prefetch.consumed && startRow === 0 && !sortModel?.length && !hasFilters) {
        prefetch.consumed = true;
        try {
          const [selectResult, countResult] = await Promise.all([prefetch.dataPromise, prefetch.countPromise]);
          const total = Number(countResult.rows[0]?.total ?? 0);

          totalRowsRef.current = total;
          setTotalRows(total);
          cachedRowsRef.current = selectResult.rows ?? [];
          params.success({ rowData: augmentRowsRef.current(cachedRowsRef.current), rowCount: total });
          setInitialDataLoaded(true);
          datasetDebugLog('getRows.success.prefetch', { rows: cachedRowsRef.current.length, rowCount: total });
        } catch (err: any) {
          if (err?.status === 403) {
            setSchemaError('Access denied: insufficient privileges on this table.');
          }
          params.fail();
          setInitialDataLoaded(true);
          datasetDebugLog('getRows.fail.prefetch', { status: err?.status });
        }

        return;
      }

      const limit = endRow - startRow;
      const offset = startRow;

      const filterChanged = filterClauses !== lastFilterClausesRef.current;

      lastFilterClausesRef.current = filterClauses;

      datasetDebugLog('getRows.fetch', { limit, offset, filterChanged });

      try {
        const selectPromise = executeQuery({
          query: buildSelectTableQuery(tableName, limit, offset, sortModel, filterClauses, 'id'),
        }).unwrap();

        let countPromise: Promise<{ rows: Record<string, unknown>[]; count: number }> | undefined;

        if (filterChanged) {
          totalRowsRef.current = undefined;
          countPromise = executeQuery({
            query: buildCountQuery(tableName, filterClauses),
          }).unwrap();
        }

        const [selectResult, countResult] = await Promise.all([
          selectPromise,
          countPromise ?? Promise.resolve(undefined),
        ]);

        if (countResult) {
          const total = Number(countResult.rows[0]?.total ?? 0);

          totalRowsRef.current = total;
          setTotalRows(total);
        }

        cachedRowsRef.current = selectResult.rows ?? [];
        datasetDebugLog('getRows.success.fetch', {
          rows: cachedRowsRef.current.length,
          rowCount: totalRowsRef.current,
          offset,
        });
        params.success({
          rowData: augmentRowsRef.current(cachedRowsRef.current),
          rowCount: totalRowsRef.current,
        });
        setInitialDataLoaded(true);
      } catch (err: any) {
        if (err?.status === 403) {
          setSchemaError('Access denied: insufficient privileges on this table.');
        }
        params.fail();
        setInitialDataLoaded(true);
        datasetDebugLog('getRows.fail.fetch', { status: err?.status });
      }
    },
    [tableName, executeQuery],
  );

  const serverSideDatasource: IServerSideDatasource = useMemo(() => ({ getRows }), [getRows]);

  // Sync blueprintColumns order into AG Grid via moveColumns(); must run before refreshServerSide.
  const prevBlueprintOrderRef = useRef<string>('');

  useEffect(() => {
    if (!gridReady) return;
    const newOrder = blueprintColumns.map((c) => c.id).join(',');

    if (newOrder === prevBlueprintOrderRef.current) return;
    prevBlueprintOrderRef.current = newOrder;

    const api = tableRef.current?.api;

    if (!api) return;
    // Move each column to its desired position, guarded against feedback loop
    isProgrammaticMoveRef.current = true;
    blueprintColumns.forEach((bpCol, targetIndex) => {
      const col = api.getColumn(bpCol.id);

      if (!col) return;
      api.moveColumns([bpCol.id], targetIndex);
    });
    isProgrammaticMoveRef.current = false;
  }, [blueprintColumns, gridReady]);

  // Refresh grid row data whenever pending blueprint changes update (new columns, required changes).
  // This ensures the augmented rows are re-fetched when previewColumns changes.
  const prevPreviewColumnsRef = useRef<ColDef[] | null>(null);

  useEffect(() => {
    if (!gridReady) return;
    if (previewColumns === prevPreviewColumnsRef.current) return;
    prevPreviewColumnsRef.current = previewColumns;
    if (skipNextPreviewRefreshRef.current) {
      skipNextPreviewRefreshRef.current = false;

      return;
    }
    // Purge and re-fetch rows so augmentRows applies to the new column set
    datasetDebugLog('refreshServerSide.purge', { reason: 'previewColumns changed' });
    tableRef.current?.api?.refreshServerSide({ purge: true });
  }, [previewColumns, gridReady]);

  // When switching to Preview from Blueprint, always purge and re-fetch
  const prevTabRef = useRef<DatasetTabsTypes>(DatasetTabsTypes.PREVIEW);

  useEffect(() => {
    if (activeTab === DatasetTabsTypes.PREVIEW && prevTabRef.current === DatasetTabsTypes.BLUEPRINT) {
      datasetDebugLog('refreshServerSide.purge', { reason: 'switched to Preview from Blueprint' });
      tableRef.current?.api?.refreshServerSide({ purge: true });
    }
    prevTabRef.current = activeTab;
  }, [activeTab]);

  // --- Draft persistence ---
  // Persist active tab across refreshes; skip initial mount to avoid overwriting the stored value.
  const isFirstTabRender = useRef(true);

  useEffect(() => {
    if (isFirstTabRender.current) {
      isFirstTabRender.current = false;

      return;
    }
    setToLocalStorage(`${LOCAL_STORAGE_KEYS.DATASET_ACTIVE_TAB}_${tableName}` as LOCAL_STORAGE_KEYS, activeTab);
  }, [activeTab, tableName]);

  // Save blueprint draft + column order; skip until schema has loaded so initial mount doesn't wipe the draft.
  useEffect(() => {
    if (originalBlueprintColumns.length === 0) return;
    const draftKey = `${LOCAL_STORAGE_KEYS.DATASET_BLUEPRINT_DRAFT}_${tableName}` as LOCAL_STORAGE_KEYS;

    if (hasBlueprintChanges) {
      setToLocalStorage(draftKey, JSON.stringify(blueprintColumns));
    } else {
      removeFromLocalStorage(draftKey);
    }
    // Always persist the current column order (Blueprint DnD or Preview column move)
    setToLocalStorage(columnOrderKey, JSON.stringify(blueprintColumns.map((c) => c.id)));
  }, [blueprintColumns, hasBlueprintChanges, tableName, originalBlueprintColumns.length, columnOrderKey]);

  // --- Navigation guard ---
  useEffect(() => {
    if (!hasBlueprintChanges) return;

    // 1. Reload / tab close
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };

    // 2. Browser back/forward (popstate)
    // Push a sentinel entry so back button triggers popstate instead of leaving the page
    history.pushState(null, '', window.location.href);
    const handlePopState = () => {
      // Re-push to keep the URL stable while modal is shown
      history.pushState(null, '', window.location.href);
      pendingNavRef.current = preserveSidebarParam(ROUTES_PATH.CHAT_SETTINGS_DATASETS);
      setShowUnsavedModal(true);
    };

    // 3. All anchor clicks (catches Next.js <Link> and plain <a> tags)
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest('a');

      if (!anchor) return;

      const href = anchor.getAttribute('href');

      if (!href) return;

      // Ignore same-page hash links or javascript: links
      if (href.startsWith('#') || href.startsWith('javascript:')) return;

      let targetPath: string;

      try {
        targetPath = new URL(href, window.location.href).pathname;
      } catch {
        return;
      }

      // Allow same pathname (query/hash changes only)
      if (targetPath === window.location.pathname) return;

      e.preventDefault();
      e.stopPropagation();
      pendingNavRef.current = href;
      setShowUnsavedModal(true);
    };

    // 4. Patch pushState/replaceState as a fallback for programmatic navigation
    const originalPushState = history.pushState.bind(history);
    const originalReplaceState = history.replaceState.bind(history);

    const makeGuard = (original: typeof history.pushState) =>
      function (data: unknown, unused: string, url?: string | URL | null) {
        if (!url) return original(data, unused, url);
        let targetPath: string;

        try {
          targetPath = new URL(String(url), window.location.href).pathname;
        } catch {
          return original(data, unused, url);
        }
        if (targetPath === window.location.pathname) {
          return original(data, unused, url);
        }
        pendingNavRef.current = String(url);
        setShowUnsavedModal(true);
      };

    history.pushState = makeGuard(originalPushState);
    history.replaceState = makeGuard(originalReplaceState);

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);
    document.addEventListener('click', handleClick, true); // capture phase

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
      document.removeEventListener('click', handleClick, true);
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
    };
  }, [hasBlueprintChanges]);

  const previewColumnConfig = useMemo(
    () => ({
      headerComponent: ColumnHeader,
      headerComponentParams: {
        onColumnRename: canEditBlueprint && !hasBlueprintChanges ? handleColumnRename : undefined,
        onColumnRequiredChange: canEditBlueprint && !hasBlueprintChanges ? handleColumnRequiredChange : undefined,
        getColumnInfo,
      },
      sortable: true,
      flex: 0,
      width: 200,
      minWidth: 150,
      maxWidth: 400,
      resizable: true,
      editable: canEditData && !hasBlueprintChanges,
      suppressFillHandle: !canEditData || hasBlueprintChanges,
    }),
    [canEditBlueprint, canEditData, hasBlueprintChanges, handleColumnRename, handleColumnRequiredChange, getColumnInfo],
  );

  // --- Effects ---
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const dataPromise = executeQuery({
      query: buildSelectTableQuery(tableName, DETAIL_PAGE_SIZE, 0, undefined, undefined, 'id'),
    }).unwrap();
    const countPromise = executeQuery({ query: buildCountQuery(tableName) }).unwrap();

    prefetchRef.current = { dataPromise, countPromise, consumed: false };
    loadSchema();
  }, [tableName, executeQuery, loadSchema]);

  useEffect(() => {
    tableRef.current?.api?.refreshHeader();
  }, [canEditData]);

  useEffect(() => {
    if (!gridReady || !selectedFilters) return;

    const model: Record<string, Record<string, unknown>> = {};

    for (const [key, value] of Object.entries(selectedFilters)) {
      if (value && typeof value === 'object') {
        const v = value as Record<string, unknown>;
        const filterVal = v.filter;
        const hasNonEmptyValue = filterVal !== undefined && filterVal !== null && String(filterVal).trim() !== '';
        const isBlankOperator = v.type === 'blank' || v.type === 'notBlank' || v.type === 'is_null';

        if (hasNonEmptyValue || isBlankOperator) {
          model[key] = v;
        }
      }
    }

    const clauses = Object.keys(model).length > 0 ? buildFilterClauses(model) : undefined;

    if (clauses === activeFilterClausesRef.current) return;
    activeFilterClausesRef.current = clauses;
    datasetDebugLog('refreshServerSide.purge', { reason: 'filters changed', clauses });
    tableRef.current?.api?.refreshServerSide({ purge: true });
  }, [selectedFilters, gridReady]);

  // Debug: when enabled via window.__DATASET_DEBUG__, log grid dimensions every 5s
  // and once when ready, so we can detect viewport collapse or unexpected resizes.
  useEffect(() => {
    if (!gridReady) return;
    const logDims = () => {
      const bodyEl = document.querySelector('.ag-body-viewport') as HTMLElement | null;
      const rootWrapper = document.querySelector('.ag-root-wrapper') as HTMLElement | null;
      const displayedRowCount = tableRef.current?.api?.getDisplayedRowCount?.();

      datasetDebugLog('gridDims', {
        rootWrapper: rootWrapper ? { w: rootWrapper.clientWidth, h: rootWrapper.clientHeight } : null,
        bodyViewport: bodyEl
          ? {
              w: bodyEl.clientWidth,
              h: bodyEl.clientHeight,
              scrollH: bodyEl.scrollHeight,
              scrollTop: bodyEl.scrollTop,
            }
          : null,
        displayedRowCount,
      });
    };

    logDims();
    const interval = setInterval(logDims, 5000);

    return () => clearInterval(interval);
  }, [gridReady]);

  if (accessDenied) {
    return (
      <div className='bg-BG_WHITE flex h-full w-full flex-1 flex-col'>
        {header ?? (
          <div className='border-GRAY_400 flex items-center gap-3 border-b px-6 pt-10 pb-8'>
            <Link href={preserveSidebarParam(ROUTES_PATH.CHAT_SETTINGS_DATASETS)}>
              <ArrowLeft width={18} height={18} className='text-GRAY_700 hover:text-GRAY_1000 transition-colors' />
            </Link>
            <h1 className='f-18-500 flex-1'>{snakeCaseToSentenceCase(tableName)}</h1>
          </div>
        )}
        <div className='flex flex-1 flex-col items-center justify-center gap-3'>
          <ShieldOff className='text-GRAY_500 h-10 w-10' />
          <p className='f-14-500 text-GRAY_700'>Access denied</p>
          <p className='f-12-400 text-GRAY_600 max-w-[300px] text-center'>
            You don&apos;t have permission to view this dataset. Ask an admin to share it with you.
          </p>
          {onBackToDatasets ? (
            <Button size='small' variant='outline' className='mt-2' onClick={onBackToDatasets}>
              Back to datasets
            </Button>
          ) : (
            <Link href={preserveSidebarParam(ROUTES_PATH.CHAT_SETTINGS_DATASETS)}>
              <Button size='small' variant='outline' className='mt-2'>
                Back to datasets
              </Button>
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className='bg-BG_WHITE flex h-full w-full flex-1 flex-col'>
      {/* Unsaved changes modal */}
      <Dialog open={showUnsavedModal} onOpenChange={setShowUnsavedModal}>
        <DialogContent size='small' showCloseButton className='w-[400px]'>
          <DialogHeader>
            <DialogHeaderTitle>Save changes before leaving?</DialogHeaderTitle>
          </DialogHeader>
          <DialogBody className='f-14-400 text-GRAY_700 p-5'>
            You have unsaved changes to this dataset. Do you want to save them now or discard your changes?
          </DialogBody>
          <DialogFooter className='flex justify-end gap-2.5'>
            <DialogClose asChild>
              <Button variant='secondary' size='medium' onClick={handleModalDiscard}>
                Discard changes
              </Button>
            </DialogClose>
            <Button variant='default' size='medium' onClick={handleModalSave} disabled={isSaving || blueprintHasErrors}>
              {isSaving ? 'Saving...' : 'Save changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Header */}
      {header ?? (
        <div className='border-GRAY_400 flex items-center gap-3 border-b px-6 pt-10 pb-8'>
          <Button
            variant='ghost'
            size='icon'
            className='text-GRAY_700 hover:text-GRAY_1000 h-auto w-auto p-0 hover:bg-transparent'
            onClick={() => handleNavAttempt(preserveSidebarParam(ROUTES_PATH.CHAT_SETTINGS_DATASETS))}
          >
            <ArrowLeft width={18} height={18} />
          </Button>
          <h1 className='f-18-500 flex-1'>{snakeCaseToSentenceCase(tableName)}</h1>
          <ShareDatasetNeonPopup tableName={tableName} />
        </div>
      )}

      {/* Toolbar + Filter in one row */}
      <div
        className={cn(
          'border-GRAY_400 flex items-center gap-2.5 border-b px-6 py-2 transition-opacity duration-300',
          initialDataLoaded ? 'opacity-100' : 'opacity-0',
        )}
      >
        {activeTab === DatasetTabsTypes.PREVIEW && contextFiltersConfig && contextFiltersConfig.length > 0 && (
          <div className='flex flex-1 items-center'>
            <FiltersWrapper label='Filter' filterConfig={contextFiltersConfig} className='px-0' />
          </div>
        )}
        {(activeTab !== DatasetTabsTypes.PREVIEW || !contextFiltersConfig?.length) && <div className='flex-1' />}

        <DatasetEditPreviewTab
          selectedTab={activeTab}
          handleTabSelect={(tab) => {
            // When on Blueprint with unsaved changes, only allow switching to Preview
            // Switching back to Blueprint from Preview is always allowed
            if (hasBlueprintChanges && activeTab === DatasetTabsTypes.BLUEPRINT && tab !== DatasetTabsTypes.PREVIEW) {
              return;
            }
            setActiveTab(tab);
          }}
        />

        {/* Export */}
        <TooltipV2
          tooltipBody={
            isExporting
              ? 'Exporting...'
              : activeFilterClausesRef.current
                ? 'Export filtered data as CSV'
                : 'Export all data as CSV'
          }
          className='cursor-pointer'
          asChildTrigger
        >
          <Button
            size='small'
            variant='ghost'
            className='text-GRAY_700 hover:text-GRAY_1000 flex h-5.5 w-5.5 items-center justify-center p-1'
            onClick={handleExportCsv}
            disabled={isExporting || activeTab !== DatasetTabsTypes.PREVIEW}
          >
            {isExporting ? <Loader2 className='h-3.5 w-3.5 animate-spin' /> : <Download className='h-3.5 w-3.5' />}
          </Button>
        </TooltipV2>

        {/* Display Options */}
        <DisplayOptions tableRef={tableRef} datasetId={tableName} isGroupByDisabled />
      </div>

      {/* Content — both tabs stay mounted, visibility toggled via CSS to avoid re-fetching */}
      <div className='grid flex-1 overflow-hidden'>
        <div className={activeTab === DatasetTabsTypes.PREVIEW ? 'flex flex-col overflow-hidden' : 'hidden'}>
          <div className='relative grid flex-1 overflow-hidden'>
            {schemaError && (
              <div className='flex h-full flex-col items-center justify-center gap-3'>
                <AlertTriangle className='text-GRAY_600 h-10 w-10' />
                <p className='f-14-500 text-GRAY_700'>Unable to load dataset</p>
                <p className='f-12-400 text-GRAY_600 max-w-[300px] text-center'>{schemaError}</p>
                <Button
                  size='small'
                  variant='outline'
                  className='mt-2'
                  onClick={() => {
                    setSchemaError(null);
                    setColumns(null);
                    setInitialDataLoaded(false);
                    loadSchema();
                  }}
                >
                  Try again
                </Button>
              </div>
            )}
            <div
              className={cn(
                'bg-BG_WHITE absolute inset-0 z-10 flex items-center justify-center transition-opacity duration-300',
                !initialDataLoaded && !schemaError ? 'opacity-100' : 'pointer-events-none opacity-0',
              )}
            >
              <ImageLoader imageSrc={ZAMP_LOGO_LOADER_SVG} width={140} height={140} />
            </div>
            {previewColumns && !schemaError && (
              <DatasetTable
                tableRef={tableRef}
                columns={previewColumns}
                serverSideDatasource={serverSideDatasource}
                gridStyle={PREVIEW_GRID_STYLE}
                columnConfig={previewColumnConfig}
                showStatusBar
                totalRows={totalRows ?? undefined}
                onGridReady={() => setGridReady(true)}
                onCellEditRequest={canEditData && !hasBlueprintChanges ? handleCellEditRequest : undefined}
                onFillEnd={canEditData && !hasBlueprintChanges ? handleFillEnd : undefined}
                onColumnMoved={handleColumnMoved}
                enableCellSelection={canEditData && !hasBlueprintChanges}
                useGetRowId
              />
            )}
          </div>
        </div>

        <div className={activeTab === DatasetTabsTypes.BLUEPRINT ? 'flex h-full flex-col overflow-hidden' : 'hidden'}>
          {columns === null && (
            <div className='flex h-full flex-col'>
              {/* Header — matches DatasetBlueprintEditor header: pt-4 pr-8 pl-4 py-2.5 */}
              <div className='border-GRAY_100 flex items-center justify-between border-b pt-4 pr-8 pl-4'>
                {/* grip: w-30 */}
                <div style={{ width: 30, flex: 'none' }} className='py-2.5' />
                {/* Column Name: w-380 */}
                <div style={{ width: 380, flex: 'none' }} className='py-2.5 pr-12'>
                  <div className='bg-GRAY_100 h-3 w-24 animate-pulse rounded' />
                </div>
                {/* Column Type: w-200 */}
                <div style={{ width: 200, flex: 'none' }} className='py-2.5'>
                  <div className='bg-GRAY_100 h-3 w-20 animate-pulse rounded' />
                </div>
                {/* Required: flex-1 */}
                <div className='flex-1 py-2.5'>
                  <div className='bg-GRAY_100 h-3 w-14 animate-pulse rounded' />
                </div>
                {/* Actions: w-20 */}
                <div style={{ width: 20, flex: 'none' }} />
              </div>

              {/* Row skeletons — matches ColumnRow: border-b py-2.5 pr-8 pl-4 */}
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className='border-GRAY_100 flex items-center justify-between border-b py-2.5 pr-8 pl-4'>
                  {/* grip */}
                  <div style={{ width: 30, flex: 'none' }}>
                    <div className='bg-GRAY_100 h-4 w-4 animate-pulse rounded' />
                  </div>
                  {/* name input */}
                  <div style={{ width: 380, flex: 'none' }} className='pr-12'>
                    <div className='bg-GRAY_100 h-8 w-full animate-pulse rounded' />
                  </div>
                  {/* type pill */}
                  <div style={{ width: 200, flex: 'none' }} className='pr-4'>
                    <div className='bg-GRAY_100 h-6 w-24 animate-pulse rounded-md' />
                  </div>
                  {/* required toggle */}
                  <div className='flex-1'>
                    <div className='bg-GRAY_100 h-5 w-9 animate-pulse rounded-full' />
                  </div>
                  {/* delete icon */}
                  <div style={{ width: 20, flex: 'none' }}>
                    <div className='bg-GRAY_100 h-4 w-4 animate-pulse rounded' />
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className={cn('flex-1 overflow-hidden', columns === null ? 'hidden' : '')}>
            <DatasetBlueprintEditor
              columns={blueprintColumns}
              onChange={setBlueprintColumns}
              canEdit={canEditBlueprint}
              onHasErrors={setBlueprintHasErrors}
            />
          </div>
          {canEditBlueprint && hasBlueprintChanges && (
            <div className='border-GRAY_200 bg-BG_WHITE sticky bottom-0 z-10 flex justify-end border-t p-3'>
              <Button onClick={handleSaveBlueprint} disabled={isSaving || blueprintHasErrors}>
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const DatasetDetail = withFiltersContext(DatasetDetailInner);

export default DatasetDetail;
