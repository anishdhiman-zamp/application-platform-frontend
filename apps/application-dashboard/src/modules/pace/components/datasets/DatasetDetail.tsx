'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DatasetEditPreviewTab, DatasetTabsTypes, PREVIEW_DATASET_ID } from '@zamp-platform/dataset-create-edit';
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
} from '@zamp-platform/ui';
import { CellEditRequestEvent, ColDef, FillEndEvent, IRowNode, IServerSideDatasource } from 'ag-grid-community';
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
  DETAIL_PAGE_SIZE,
  escapeSqlIdentifier,
  getCellEditorForPgType,
  pgTypeToColumnType,
  sanitizeColumnName,
} from 'modules/pace/components/datasets/datasets.constants';
import ShareDatasetNeonPopup from 'modules/pace/components/datasets/ShareDatasetNeonPopup';
import { preserveSidebarParam } from 'modules/pace/pace.utils';
import Link from 'next/link';
import { cn } from 'utils/common';
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
import DatasetTable from 'components/common/table/DatasetTable';
import DisplayOptions from 'components/common/table/DisplayOptions';
import TooltipV2 from 'components/common/TooltipV2';
import { FILTER_TYPES } from 'components/filter/filter.types';
import FiltersWrapper from 'components/filter/filterMenu/FiltersWrapper';
import { filtersContextActions, useFiltersContextStore, withFiltersContext } from 'components/filter/filters.context';

interface DatasetDetailProps {
  tableName: string;
}

const DatasetDetailInner = ({ tableName }: DatasetDetailProps) => {
  // --- Refs ---
  const tableRef = useRef<AgGridReact | null>(null);
  const totalRowsRef = useRef<number | undefined>(undefined);
  const lastFilterClausesRef = useRef<string | undefined>(undefined);
  const activeFilterClausesRef = useRef<string | undefined>(undefined);
  const initRef = useRef(false);
  const prefetchRef = useRef<{
    dataPromise: Promise<{ rows: Record<string, unknown>[]; count: number }>;
    countPromise: Promise<{ rows: Record<string, unknown>[]; count: number }>;
    consumed: boolean;
  } | null>(null);
  // Cache of the last successfully fetched raw rows — used to re-serve augmented data
  // when blueprint has unsaved changes, avoiding redundant API calls on tab switches.
  const cachedRowsRef = useRef<Record<string, unknown>[]>([]);

  // --- Hooks ---
  const { userId } = useUserIdentity();
  const [executeQuery] = useLazyAgentDbReadQuery();
  const [executeMutation] = useAgentDbWriteMutation();
  const [exportTable] = useExportAgentDbTableMutation();
  const [getExportStatus] = useLazyGetAgentDbExportStatusQuery();
  const { startPolling } = usePolling();
  const { data: rolesData, isLoading: isLoadingRoles } = useGetDatasetRolesQuery({ tableName });
  const {
    dispatch: filterDispatch,
    state: { selectedFilters, filtersConfig: contextFiltersConfig },
  } = useFiltersContextStore();

  // --- State ---
  const [columns, setColumns] = useState<ColDef[] | null>(null);
  const [totalRows, setTotalRows] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<DatasetTabsTypes>(DatasetTabsTypes.PREVIEW);
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

      // Keep id column in grid but hide by default (user can enable via Display Options)
      const userRows = allRows.filter((r) => String(r.column_name) !== 'id');

      const gridCols: ColDef[] = [
        // id column: hidden by default, non-editable, shown in Display Options
        ...(allRows.some((r) => String(r.column_name) === 'id')
          ? [{ field: 'id', headerName: 'id', hide: true, editable: false, suppressFillHandle: true }]
          : []),
        ...userRows.map((row: Record<string, unknown>) => {
          const field = String(row.column_name);
          const pgType = String(row.data_type);

          return {
            field,
            headerName: field,
            ...getCellEditorForPgType(pgType),
          };
        }),
      ];

      setColumns(gridCols);

      const config = gridCols.map((c) => ({
        key: c.field as string,
        label: c.headerName as string,
        values: [],
        type: FILTER_TYPES.SEARCH,
        datatype: 'string',
      }));

      filterDispatch({ type: filtersContextActions.SET_FILTERS_CONFIG, payload: { filtersConfig: config } });

      const bpCols: BlueprintColumn[] = allRows.map((row: Record<string, unknown>) => {
        const colName = String(row.column_name);

        return {
          id: colName,
          name: colName,
          type: pgTypeToColumnType(String(row.data_type)),
          required: String(row.is_nullable) === 'NO',
          frozen: colName === 'id',
        };
      });

      setBlueprintColumns(bpCols);
      setOriginalBlueprintColumns(bpCols);
    } catch {
      setColumns([]);
      setSchemaError('Failed to load dataset schema. The table may not exist or you may not have access.');
    }
  }, [executeQuery, tableName, filterDispatch]);

  const reloadSchemaAndData = useCallback(async () => {
    setColumns(null);
    prefetchRef.current = null;
    cachedRowsRef.current = [];
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
      if (!col.name.trim()) {
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
            executeMutation({ query: buildBackfillNullsQuery(tableName, m.oldName, m.defaultValue!) }).unwrap(),
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
      try {
        await executeMutation({
          query: `ALTER TABLE "${escapeSqlIdentifier(tableName)}" RENAME COLUMN "${escapeSqlIdentifier(colId)}" TO "${escapeSqlIdentifier(sanitized)}"`,
        }).unwrap();
        toast.success('Column renamed');
        await loadSchema();
        tableRef.current?.api?.refreshServerSide({ purge: true });
      } catch {
        toast.error('Failed to rename column');
      }
    },
    [tableName, executeMutation, loadSchema],
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
    if (!hasBlueprintChanges) return columns;

    const originalMap = new Map(originalBlueprintColumns.map((c) => [c.id, c]));
    const droppedIds = new Set(
      originalBlueprintColumns.filter((c) => !blueprintColumns.find((b) => b.id === c.id)).map((c) => c.id),
    );

    const result: ColDef[] = [];

    for (const bpCol of blueprintColumns) {
      if (bpCol.frozen) {
        // Keep the frozen id column as-is (hidden)
        const existing = columns.find((c) => c.field === bpCol.id);

        if (existing) result.push(existing);
        continue;
      }

      const isNew = !originalMap.has(bpCol.id) || bpCol.id.startsWith(COL_PREFIX);
      // For new columns, the field name will be the sanitized name
      const fieldName = isNew ? sanitizeColumnName(bpCol.name) || bpCol.name : bpCol.id;

      const existing = columns.find((c) => c.field === bpCol.id);

      if (existing && !droppedIds.has(bpCol.id)) {
        // Existing column — may have been renamed in blueprint; update headerName
        const sanitizedName = sanitizeColumnName(bpCol.name);

        result.push({
          ...existing,
          headerName: sanitizedName || bpCol.name,
          editable: false,
          suppressFillHandle: true,
        });
      } else if (isNew) {
        // New column pending save — non-editable in preview
        result.push({
          field: fieldName,
          headerName: sanitizeColumnName(bpCol.name) || bpCol.name,
          editable: false,
          suppressFillHandle: true,
        });
      }
    }

    return result;
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
        window.location.href = href;
      }
    },
    [hasBlueprintChanges],
  );

  const handleModalDiscard = useCallback(() => {
    setShowUnsavedModal(false);
    const href = pendingNavRef.current;

    pendingNavRef.current = null;
    // Reset blueprint to original so the guard is lifted before navigating
    setBlueprintColumns(originalBlueprintColumns);
    if (href) window.location.href = href;
  }, [originalBlueprintColumns]);

  const handleModalSave = useCallback(async () => {
    await handleSaveBlueprint();
    setShowUnsavedModal(false);
    const href = pendingNavRef.current;

    pendingNavRef.current = null;
    if (href) window.location.href = href;
  }, [handleSaveBlueprint]);

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

      // When blueprint has unsaved changes, serve from cache — no API calls
      if (hasBlueprintChangesRef.current && cachedRowsRef.current.length > 0) {
        const augmented = augmentRowsRef.current(cachedRowsRef.current);

        params.success({ rowData: augmented, rowCount: totalRowsRef.current });
        setInitialDataLoaded(true);

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
        } catch (err: any) {
          if (err?.status === 403) {
            setSchemaError('Access denied: insufficient privileges on this table.');
          }
          params.fail();
          setInitialDataLoaded(true);
        }

        return;
      }

      const limit = endRow - startRow;
      const offset = startRow;

      const filterChanged = filterClauses !== lastFilterClausesRef.current;

      lastFilterClausesRef.current = filterClauses;

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
      }
    },
    [tableName, executeQuery],
  );

  const serverSideDatasource: IServerSideDatasource = useMemo(() => ({ getRows }), [getRows]);

  // Refresh grid row data whenever pending blueprint changes update (new columns, required changes).
  // This ensures the augmented rows are re-fetched when previewColumns changes.
  const prevPreviewColumnsRef = useRef<ColDef[] | null>(null);

  useEffect(() => {
    if (!gridReady) return;
    if (previewColumns === prevPreviewColumnsRef.current) return;
    prevPreviewColumnsRef.current = previewColumns;
    // Purge and re-fetch rows so augmentRows applies to the new column set
    tableRef.current?.api?.refreshServerSide({ purge: true });
  }, [previewColumns, gridReady]);

  // When switching to Preview from Blueprint, always purge and re-fetch
  const prevTabRef = useRef<DatasetTabsTypes>(DatasetTabsTypes.PREVIEW);

  useEffect(() => {
    if (activeTab === DatasetTabsTypes.PREVIEW && prevTabRef.current === DatasetTabsTypes.BLUEPRINT) {
      tableRef.current?.api?.refreshServerSide({ purge: true });
    }
    prevTabRef.current = activeTab;
  }, [activeTab]);

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
    tableRef.current?.api?.refreshServerSide({ purge: true });
  }, [selectedFilters, gridReady]);

  if (accessDenied) {
    return (
      <div className='bg-BG_WHITE flex h-full w-full flex-1 flex-col'>
        <div className='border-GRAY_400 flex items-center gap-3 border-b px-6 pt-10 pb-8'>
          <Link href={preserveSidebarParam(ROUTES_PATH.CHAT_SETTINGS_DATASETS)}>
            <ArrowLeft width={18} height={18} className='text-GRAY_700 hover:text-GRAY_1000 transition-colors' />
          </Link>
          <h1 className='f-18-500 flex-1'>{tableName}</h1>
        </div>
        <div className='flex flex-1 flex-col items-center justify-center gap-3'>
          <ShieldOff className='text-GRAY_500 h-10 w-10' />
          <p className='f-14-500 text-GRAY_700'>Access denied</p>
          <p className='f-12-400 text-GRAY_600 max-w-[300px] text-center'>
            You don&apos;t have permission to view this dataset. Ask an admin to share it with you.
          </p>
          <Link href={preserveSidebarParam(ROUTES_PATH.CHAT_SETTINGS_DATASETS)}>
            <Button size='small' variant='outline' className='mt-2'>
              Back to datasets
            </Button>
          </Link>
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
      <div className='border-GRAY_400 flex items-center gap-3 border-b px-6 pt-10 pb-8'>
        <button
          type='button'
          onClick={() => handleNavAttempt(preserveSidebarParam(ROUTES_PATH.CHAT_SETTINGS_DATASETS))}
          className='text-GRAY_700 hover:text-GRAY_1000 transition-colors'
        >
          <ArrowLeft width={18} height={18} />
        </button>
        <h1 className='f-18-500 flex-1'>{tableName}</h1>
        <ShareDatasetNeonPopup tableName={tableName} />
      </div>

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
        <DisplayOptions tableRef={tableRef} datasetId={PREVIEW_DATASET_ID} isGroupByDisabled />
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
                gridStyle={{ height: '100%', width: '100%' }}
                columnConfig={{
                  headerComponent: ColumnHeader,
                  headerComponentParams: {
                    onColumnRename: canEditBlueprint && !hasBlueprintChanges ? handleColumnRename : undefined,
                    onColumnRequiredChange:
                      canEditBlueprint && !hasBlueprintChanges ? handleColumnRequiredChange : undefined,
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
                }}
                showStatusBar
                totalRows={totalRows ?? undefined}
                onGridReady={() => setGridReady(true)}
                onCellEditRequest={canEditData && !hasBlueprintChanges ? handleCellEditRequest : undefined}
                onFillEnd={canEditData && !hasBlueprintChanges ? handleFillEnd : undefined}
                enableCellSelection={canEditData && !hasBlueprintChanges}
                useGetRowId
              />
            )}
          </div>
        </div>

        <div className={activeTab === DatasetTabsTypes.BLUEPRINT ? 'flex h-full flex-col overflow-hidden' : 'hidden'}>
          <div className='flex-1 overflow-hidden'>
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
