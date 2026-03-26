'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ColDef, IServerSideDatasource } from 'ag-grid-community';
import { ArrowLeft } from 'lucide-react';
import PaceColumnHeader from 'modules/pace/datasets/PaceColumnHeader';
import {
  buildCountQuery,
  buildFilterClauses,
  buildSelectTableQuery,
  DETAIL_PAGE_SIZE,
  PACE_DATASET_THEME_PARAMS,
} from 'modules/pace/datasets/paceDatasets.constants';
import Link from 'next/link';
import { useExecuteAgentDbQueryMutation } from '@/apis/agentManagedDb';
import { ROUTES_PATH } from '@/constants/routeConfig';
import DatasetTable from 'components/common/table/DatasetTable';
import { getDataTableTheme } from 'components/common/table/table.utils';

interface PaceDatasetDetailProps {
  tableName: string;
}

const PaceDatasetDetail = ({ tableName }: PaceDatasetDetailProps) => {
  const [executeQuery] = useExecuteAgentDbQueryMutation();
  const [columns, setColumns] = useState<ColDef[] | null>(null);
  const [totalRows, setTotalRows] = useState<number | null>(null);

  const totalRowsRef = useRef<number | undefined>(undefined);
  const columnsFetchedRef = useRef(false);

  const customTheme = useMemo(() => getDataTableTheme(PACE_DATASET_THEME_PARAMS), []);

  useEffect(() => {
    if (columnsFetchedRef.current) return;
    columnsFetchedRef.current = true;

    const query = `SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = '${tableName}' ORDER BY ordinal_position`;

    executeQuery({ query })
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
      const limit = endRow - startRow;
      const offset = startRow;
      const filterClauses = filterModel
        ? buildFilterClauses(filterModel as Record<string, Record<string, unknown>>)
        : undefined;

      try {
        const selectPromise = executeQuery({
          query: buildSelectTableQuery(tableName, limit, offset, sortModel, filterClauses),
        }).unwrap();

        let countPromise: Promise<{ rows: Record<string, unknown>[]; count: number }> | undefined;

        if (startRow === 0) {
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
        {totalRows !== null && <span className='text-GRAY_700 f-12-400'>({totalRows.toLocaleString()} rows)</span>}
      </div>
      <div className='grid flex-1 overflow-hidden'>
        {columns && (
          <DatasetTable
            columns={columns}
            serverSideDatasource={serverSideDatasource}
            gridStyle={{ height: '100%', width: '100%' }}
            customTheme={customTheme}
            columnConfig={{
              headerComponent: PaceColumnHeader,
              sortable: true,
              filter: 'agTextColumnFilter',
              flex: 1,
              minWidth: 150,
            }}
            showStatusBar={false}
          />
        )}
      </div>
    </div>
  );
};

export default PaceDatasetDetail;
