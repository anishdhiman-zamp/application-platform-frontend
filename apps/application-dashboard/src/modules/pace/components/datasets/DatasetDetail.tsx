'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ColDef, IServerSideDatasource } from 'ag-grid-community';
import { ArrowLeft } from 'lucide-react';
import ColumnHeader from 'modules/pace/components/datasets/ColumnHeader';
import {
  buildCountQuery,
  buildFilterClauses,
  buildSelectTableQuery,
  buildTableColumnsQuery,
  DETAIL_PAGE_SIZE,
} from 'modules/pace/components/datasets/datasets.constants';
import Link from 'next/link';
import { useLazyAgentDbReadQuery } from '@/apis/agentManagedDb';
import { ROUTES_PATH } from '@/constants/routeConfig';
import DatasetTable from 'components/common/table/DatasetTable';

interface DatasetDetailProps {
  tableName: string;
}

const DatasetDetail = ({ tableName }: DatasetDetailProps) => {
  const [executeQuery] = useLazyAgentDbReadQuery();
  const [columns, setColumns] = useState<ColDef[] | null>(null);
  const [totalRows, setTotalRows] = useState<number | null>(null);

  const totalRowsRef = useRef<number | undefined>(undefined);
  const lastFilterClausesRef = useRef<string | undefined>(undefined);
  const initRef = useRef(false);
  const prefetchRef = useRef<{
    dataPromise: Promise<{ rows: Record<string, unknown>[]; count: number }>;
    countPromise: Promise<{ rows: Record<string, unknown>[]; count: number }>;
    consumed: boolean;
  } | null>(null);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const dataPromise = executeQuery({ query: buildSelectTableQuery(tableName, DETAIL_PAGE_SIZE, 0) }).unwrap();
    const countPromise = executeQuery({ query: buildCountQuery(tableName) }).unwrap();

    prefetchRef.current = { dataPromise, countPromise, consumed: false };

    executeQuery({ query: buildTableColumnsQuery(tableName) })
      .unwrap()
      .then((result) => {
        const cols = (result.rows ?? []).map((row: Record<string, unknown>) => ({
          field: String(row.column_name),
          headerName: String(row.column_name),
        }));

        setColumns(cols);
      })
      .catch(() => setColumns([]));
  }, [tableName, executeQuery]);

  const getRows: IServerSideDatasource['getRows'] = useCallback(
    async (params) => {
      const { startRow = 0, endRow = DETAIL_PAGE_SIZE, sortModel, filterModel } = params.request;

      const prefetch = prefetchRef.current;
      const hasFilters = filterModel && Object.keys(filterModel).length > 0;

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
      const filterClauses = filterModel
        ? buildFilterClauses(filterModel as Record<string, Record<string, unknown>>)
        : undefined;

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
      <div className='border-GRAY_400 flex items-center gap-3 border-b px-10 pt-10 pb-8'>
        <Link href={ROUTES_PATH.CHAT_SETTINGS_DATASETS}>
          <ArrowLeft width={18} height={18} className='text-GRAY_700 hover:text-GRAY_1000 transition-colors' />
        </Link>
        <h1 className='f-18-500'>{tableName}</h1>
      </div>
      <div className='grid flex-1 overflow-hidden'>
        {columns && (
          <DatasetTable
            columns={columns}
            serverSideDatasource={serverSideDatasource}
            gridStyle={{ height: '100%', width: '100%' }}
            columnConfig={{
              headerComponent: ColumnHeader,
              sortable: true,
              filter: 'agTextColumnFilter',
              flex: 1,
              minWidth: 150,
            }}
            showStatusBar
            totalRows={totalRows ?? undefined}
          />
        )}
      </div>
    </div>
  );
};

export default DatasetDetail;
