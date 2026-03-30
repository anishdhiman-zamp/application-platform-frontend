'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DatasetEditPreviewTab, DatasetTabsTypes, PREVIEW_DATASET_ID } from '@zamp-platform/dataset-create-edit';
import { Button, toast } from '@zamp-platform/ui';
import { CellEditRequestEvent, ColDef, FillEndEvent, IServerSideDatasource } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { useUserIdentity } from 'hooks/useUserIdentity';
import { ArrowLeft, Download, Loader2 } from 'lucide-react';
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
  buildSelectTableQuery,
  buildTableColumnsDetailQuery,
  buildUpdateCellQuery,
  buildUpdateFillQuery,
  type ColumnModification,
  DETAIL_PAGE_SIZE,
  downloadCsvBlob,
  escapeSqlIdentifier,
  EXPORT_CHUNK_SIZE,
  getCellEditorForPgType,
  pgTypeToColumnType,
  rowsToCsv,
  sanitizeColumnName,
  ZAMP_ROW_ID_COLUMN,
} from 'modules/pace/components/datasets/datasets.constants';
import ShareDatasetNeonPopup from 'modules/pace/components/datasets/ShareDatasetNeonPopup';
import { preserveSidebarParam } from 'modules/pace/pace.utils';
import Link from 'next/link';
import { useAgentDbWriteMutation, useGetDatasetRolesQuery, useLazyAgentDbReadQuery } from '@/apis/agentManagedDb';
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
  const [executeQuery] = useLazyAgentDbReadQuery();
  const [executeMutation] = useAgentDbWriteMutation();
  const [columns, setColumns] = useState<ColDef[] | null>(null);
  const [totalRows, setTotalRows] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<DatasetTabsTypes>(DatasetTabsTypes.PREVIEW);

  const [blueprintColumns, setBlueprintColumns] = useState<BlueprintColumn[]>([]);
  const [originalBlueprintColumns, setOriginalBlueprintColumns] = useState<BlueprintColumn[]>([]);
  const [isBlueprintLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [gridReady, setGridReady] = useState(false);

  const { userId } = useUserIdentity();
  const { data: rolesData } = useGetDatasetRolesQuery({ tableName });

  const userRole = useMemo(() => {
    if (!rolesData?.roles || !userId) return undefined;

    return rolesData.roles.find((r) => r.user_id === userId && r.table_name === tableName)?.role;
  }, [rolesData, userId, tableName]);

  const canEditData = userRole === 'admin' || userRole === 'editor';
  const canEditBlueprint = userRole === 'admin';

  const {
    dispatch: filterDispatch,
    state: { selectedFilters, filtersConfig: contextFiltersConfig },
  } = useFiltersContextStore();

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

  const loadSchema = useCallback(async () => {
    try {
      const result = await executeQuery({ query: buildTableColumnsDetailQuery(tableName) }).unwrap();
      const allRows = result.rows ?? [];
      const userRows = allRows.filter((r) => String(r.column_name) !== ZAMP_ROW_ID_COLUMN);

      const gridCols: ColDef[] = userRows.map((row: Record<string, unknown>) => {
        const field = String(row.column_name);
        const pgType = String(row.data_type);

        return {
          field,
          headerName: field,
          ...getCellEditorForPgType(pgType),
        };
      });

      setColumns(gridCols);

      const config = gridCols.map((c) => ({
        key: c.field as string,
        label: c.headerName as string,
        values: [],
        type: FILTER_TYPES.SEARCH,
        datatype: 'string',
      }));

      filterDispatch({ type: filtersContextActions.SET_FILTERS_CONFIG, payload: { filtersConfig: config } });

      const bpCols: BlueprintColumn[] = userRows.map((row: Record<string, unknown>) => ({
        id: String(row.column_name),
        name: String(row.column_name),
        type: pgTypeToColumnType(String(row.data_type)),
        required: String(row.is_nullable) === 'NO',
      }));

      setBlueprintColumns(bpCols);
      setOriginalBlueprintColumns(bpCols);
    } catch {
      setColumns([]);
    }
  }, [executeQuery, tableName, filterDispatch]);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const dataPromise = executeQuery({ query: buildSelectTableQuery(tableName, DETAIL_PAGE_SIZE, 0) }).unwrap();
    const countPromise = executeQuery({ query: buildCountQuery(tableName) }).unwrap();

    prefetchRef.current = { dataPromise, countPromise, consumed: false };
    loadSchema();
  }, [tableName, executeQuery, loadSchema]);

  useEffect(() => {
    tableRef.current?.api?.refreshHeader();
  }, [canEditData]);

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

      // Reload schema (headers + blueprint) and preview data in one pass
      setColumns(null);
      prefetchRef.current = null;
      const dataPromise = executeQuery({ query: buildSelectTableQuery(tableName, DETAIL_PAGE_SIZE, 0) }).unwrap();
      const countPromise = executeQuery({ query: buildCountQuery(tableName) }).unwrap();

      prefetchRef.current = { dataPromise, countPromise, consumed: false };

      await loadSchema();
    } catch {
      toast.error('Failed to update schema');
    } finally {
      setIsSaving(false);
    }
  }, [blueprintColumns, originalBlueprintColumns, tableName, executeMutation, executeQuery, loadSchema]);

  const handleBlueprintChange = useCallback((cols: BlueprintColumn[]) => {
    setBlueprintColumns(cols);
  }, []);

  const reloadSchemaAndData = useCallback(async () => {
    setColumns(null);
    prefetchRef.current = null;
    const dataPromise = executeQuery({ query: buildSelectTableQuery(tableName, DETAIL_PAGE_SIZE, 0) }).unwrap();
    const countPromise = executeQuery({ query: buildCountQuery(tableName) }).unwrap();

    prefetchRef.current = { dataPromise, countPromise, consumed: false };
    await loadSchema();
  }, [executeQuery, tableName, loadSchema]);

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

      node.setData({ ...data, [field]: newValue });

      const rowId = data?._zamp_row_id;

      if (!rowId) return;

      try {
        await executeMutation({
          query: buildUpdateCellQuery(tableName, field, newValue, rowId),
        }).unwrap();
      } catch {
        node.setData({ ...data, [field]: oldValue });
        toast.error('Failed to update cell');
      }
    },
    [tableName, executeMutation],
  );

  const handleFillEnd = useCallback(
    async (event: FillEndEvent) => {
      const { finalRange, initialRange, api } = event;

      if (!finalRange?.startRow || !finalRange?.endRow || !initialRange?.startRow) return;

      const colId = finalRange.columns[0]?.getColId();

      if (!colId) return;

      const srcIdx = initialRange.startRow.rowIndex;
      const fillValue = api.getDisplayedRowAtIndex(srcIdx)?.data?.[colId];

      const affectedNodes: { node: any; oldData: any }[] = [];
      const rowIds: string[] = [];

      for (let i = finalRange.startRow.rowIndex; i <= finalRange.endRow.rowIndex; i++) {
        const node = api.getDisplayedRowAtIndex(i);
        const rid = node?.data?._zamp_row_id;

        if (rid && i !== srcIdx) {
          rowIds.push(rid as string);
          affectedNodes.push({ node, oldData: { ...node.data } });
          node.setData({ ...node.data, [colId]: fillValue });
        }
      }
      if (!rowIds.length) return;

      try {
        await executeMutation({
          query: buildUpdateFillQuery(tableName, colId, fillValue, rowIds),
        }).unwrap();
      } catch {
        affectedNodes.forEach(({ node, oldData }) => node.setData(oldData));
        toast.error('Failed to update cells');
      }
    },
    [tableName, executeMutation],
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

  const handleExportCsv = useCallback(async () => {
    setIsExporting(true);
    try {
      const filterClauses = activeFilterClausesRef.current;
      const colState = tableRef.current?.api?.getColumnState();
      const sortModel = colState?.filter((c) => c.sort).map((c) => ({ colId: c.colId, sort: c.sort as string }));

      const countResult = await executeQuery({ query: buildCountQuery(tableName, filterClauses) }).unwrap();
      const total = Number(countResult.rows[0]?.total ?? 0);

      if (total === 0) {
        toast.info('No data to export');

        return;
      }

      const csvChunks: string[] = [];

      for (let offset = 0; offset < total; offset += EXPORT_CHUNK_SIZE) {
        const chunk = await executeQuery({
          query: buildSelectTableQuery(tableName, EXPORT_CHUNK_SIZE, offset, sortModel, filterClauses),
        }).unwrap();
        const rows = (chunk.rows ?? []).map(({ _zamp_row_id: _, ...rest }) => rest);

        if (rows.length === 0) break;
        csvChunks.push(rowsToCsv(rows, offset === 0));
      }

      downloadCsvBlob(csvChunks.join('\n'), `${tableName}.csv`);
      toast.success(`Exported ${total.toLocaleString()} rows`);
    } catch {
      toast.error('Failed to export data');
    } finally {
      setIsExporting(false);
    }
  }, [tableName, executeQuery]);

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

  const getRows: IServerSideDatasource['getRows'] = useCallback(
    async (params) => {
      const { startRow = 0, endRow = DETAIL_PAGE_SIZE, sortModel } = params.request;

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
          params.success({ rowData: selectResult.rows ?? [], rowCount: total });
        } catch {
          params.fail();
        }

        return;
      }

      const limit = endRow - startRow;
      const offset = startRow;

      const filterChanged = filterClauses !== lastFilterClausesRef.current;

      lastFilterClausesRef.current = filterClauses;

      try {
        const selectPromise = executeQuery({
          query: buildSelectTableQuery(tableName, limit, offset, sortModel, filterClauses),
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

        params.success({
          rowData: selectResult.rows ?? [],
          rowCount: totalRowsRef.current,
        });
      } catch {
        params.fail();
      }
    },
    [tableName, executeQuery],
  );

  const serverSideDatasource: IServerSideDatasource = useMemo(() => ({ getRows }), [getRows]);

  return (
    <div className='bg-BG_WHITE flex h-full w-full flex-1 flex-col'>
      {/* Header */}
      <div className='border-GRAY_400 flex items-center gap-3 border-b px-10 pt-10 pb-4'>
        <Link href={preserveSidebarParam(ROUTES_PATH.CHAT_SETTINGS_DATASETS)}>
          <ArrowLeft width={18} height={18} className='text-GRAY_700 hover:text-GRAY_1000 transition-colors' />
        </Link>
        <h1 className='f-18-500 flex-1'>{tableName}</h1>
        <ShareDatasetNeonPopup tableName={tableName} />
      </div>

      {/* Toolbar + Filter in one row */}
      <div className='border-GRAY_400 flex items-center gap-2.5 border-b py-2 pr-8'>
        {activeTab === DatasetTabsTypes.PREVIEW && contextFiltersConfig && contextFiltersConfig.length > 0 && (
          <div className='flex flex-1 items-center'>
            <FiltersWrapper label='Filter' filterConfig={contextFiltersConfig} />
          </div>
        )}
        {(activeTab !== DatasetTabsTypes.PREVIEW || !contextFiltersConfig?.length) && <div className='flex-1' />}

        <DatasetEditPreviewTab selectedTab={activeTab} handleTabSelect={setActiveTab} />

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
        <div className={activeTab === DatasetTabsTypes.PREVIEW ? 'grid overflow-hidden' : 'hidden'}>
          {columns && (
            <DatasetTable
              tableRef={tableRef}
              columns={columns}
              serverSideDatasource={serverSideDatasource}
              gridStyle={{ height: '100%', width: '100%' }}
              columnConfig={{
                headerComponent: ColumnHeader,
                headerComponentParams: {
                  onColumnRename: canEditBlueprint ? handleColumnRename : undefined,
                  onColumnRequiredChange: canEditBlueprint ? handleColumnRequiredChange : undefined,
                  getColumnInfo,
                },
                sortable: true,
                flex: 0,
                width: 200,
                minWidth: 150,
                maxWidth: 400,
                resizable: true,
                editable: canEditData,
                suppressFillHandle: !canEditData,
              }}
              showStatusBar
              totalRows={totalRows ?? undefined}
              onGridReady={() => setGridReady(true)}
              onCellEditRequest={canEditData ? handleCellEditRequest : undefined}
              onFillEnd={canEditData ? handleFillEnd : undefined}
              enableCellSelection={canEditData}
              useGetRowId
            />
          )}
        </div>

        <div className={activeTab === DatasetTabsTypes.BLUEPRINT ? 'flex h-full flex-col overflow-hidden' : 'hidden'}>
          {isBlueprintLoading ? (
            <div className='flex flex-1 items-center justify-center'>
              <span className='text-GRAY_700 f-13-400'>Loading schema...</span>
            </div>
          ) : (
            <>
              <div className='flex-1 overflow-hidden'>
                <DatasetBlueprintEditor
                  columns={blueprintColumns}
                  onChange={handleBlueprintChange}
                  canEdit={canEditBlueprint}
                />
              </div>
              {canEditBlueprint && hasBlueprintChanges && (
                <div className='border-GRAY_200 bg-BG_WHITE sticky bottom-0 z-10 flex justify-end border-t p-3'>
                  <Button onClick={handleSaveBlueprint} disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const DatasetDetail = withFiltersContext(DatasetDetailInner);

export default DatasetDetail;
