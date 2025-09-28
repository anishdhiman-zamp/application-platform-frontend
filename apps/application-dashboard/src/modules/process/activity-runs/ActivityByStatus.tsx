import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ColumnDef,
  ColumnOrderState,
  SortDirection,
  Table,
  TanStackClientSideDatasourceProps,
  TanStackClientSideRequestProps,
  TanStackTable,
  VisibilityState,
} from '@zamp-platform/tanstack-table';
import { formatTanStackColumns } from 'modules/data/data.utils';
import ActivityRunsEmptyState from 'modules/process/activity-runs/components/ActivityRunsEmptyState';
import type { ACTIVITY_RUN_STATUS, ActivityRunRowData } from 'modules/process/process.types';
import { useRouter } from 'next/navigation';
import { type MapAny } from 'types/commonTypes';
import { checkIsObjectEmpty, snakeCaseToSentenceCase } from 'utils/common';
import { useLazyGetActivityRunsQuery } from '@/apis/processes';
import DisplayOptions from '@/components/common/table/DisplayOptions';
import { myThemeWithProcess } from '@/components/common/table/table.constants';
import { CUSTOM_COLUMNS_TYPE } from '@/components/common/table/table.types';
import { getEncodedRequest } from '@/components/common/tanstackTable/table.utils';
import { FILTER_TYPES } from '@/components/filter/filter.types';
import { CONDITION_OPERATOR_TYPE } from '@/components/filter/filters.constants';
import { getProcessActivityLogsRouteById } from '@/constants/routeConfig';
import { useDisplayOptionContext } from '@/modules/process/activity-runs/contextWrapper/DisplayOptionContext';
import CommonWrapper from 'components/commonWrapper';
import FiltersWrapper from 'components/filter/filterMenu/FiltersWrapper';
import { filtersContextActions, useFiltersContextStore } from 'components/filter/filters.context';

interface ActivityByStatusProps {
  processId: string;
  status: string;
  filterConfigData?: MapAny;
  isFilterConfigLoading: boolean;
  isFilterConfigError: boolean;
  isFilterConfigUninitialized: boolean;
  refetchFilterConfig: () => void;
  totalCount: number;
}

const ActivityByStatus: FC<ActivityByStatusProps> = ({
  processId,
  status,
  filterConfigData,
  isFilterConfigLoading,
  isFilterConfigError,
  isFilterConfigUninitialized,
  refetchFilterConfig,
  totalCount,
}) => {
  const {
    dispatch,
    state: { selectedFilters, filtersConfig },
  } = useFiltersContextStore();
  const { columnVisibility, columnOrder, setColumnVisibility, setColumnOrder } = useDisplayOptionContext(); // Use shared display-option context
  const [getActivityRuns, { data: activityRunsData, isError: lazyloadActivityRunsError }] =
    useLazyGetActivityRunsQuery();
  const router = useRouter();
  const tableRef = useRef<Table<MapAny>>(null);
  const datasetTableRef = useRef<HTMLDivElement>(null);
  const [totalRows, setTotalRows] = useState<number>(0);
  const [columns, setColumns] = useState<ColumnDef<ActivityRunRowData>[]>([]);
  const [table, setTable] = useState<Table<MapAny> | null>(null);
  const [exportsDatasetQuery, setExportsDatasetQuery] = useState<string>('');
  const [isNoRowsOverlayVisible, setIsNoRowsOverlayVisible] = useState<boolean>(false);
  const shouldShowEmptyState = totalCount === 0 && checkIsObjectEmpty(selectedFilters);

  // ClientSideDatasource - used to fetch data from server
  const clientSideDatasource: TanStackClientSideDatasourceProps = useMemo(() => {
    return {
      getRows: (params: {
        startRow: number;
        endRow: number;
        sortModel: Array<{ colId: string; sort: SortDirection }>;
        filterModel: unknown;
        request: TanStackClientSideRequestProps;
        success: (result: { rowData: unknown[]; rowCount: number }) => void;
        fail: () => void;
        api?: unknown;
      }): void => {
        const filterModel = params?.request?.filterModel;

        const activityStatusFilter = {
          filterType: FILTER_TYPES.MULTI_SELECT,
          type: CONDITION_OPERATOR_TYPE.CONTAINS,
          values: [status],
        };

        const mergedRequest: TanStackClientSideRequestProps = {
          ...params.request,
          filterModel: {
            ...filterModel,
            ...(status ? { status: activityStatusFilter } : {}),
          },
        };

        const queryConfig = getEncodedRequest({
          request: mergedRequest,
        });

        setExportsDatasetQuery(queryConfig);

        getActivityRuns({
          processId: processId as string,
          query_config: queryConfig,
        })
          .unwrap()
          .then((response) => {
            const totalCount = response?.total_count;

            if (params.request.startRow === 0) {
              setTotalRows(totalCount);
              setIsNoRowsOverlayVisible(totalCount === 0);
              dispatch({
                type: filtersContextActions.SET_TOTAL_ROWS,
                payload: { totalRows: totalCount },
              });
            }

            if (response?.rows?.length) {
              response?.rows?.forEach((row) => {
                router.prefetch(getProcessActivityLogsRouteById(processId, row?.id, status));
              });
            }

            params.success({
              rowData: response?.rows,
              rowCount: params.request.startRow === 0 ? totalCount : 0,
            });
          })
          .catch(() => {
            params.fail();
          });
      },
    };
  }, [processId, status]);

  // Direct context functions - single source of truth
  const handleColumnVisibilityDisplayOption = useCallback(
    (visibility: VisibilityState) => {
      setColumnVisibility(visibility);
    },
    [setColumnVisibility],
  );

  const handleColumnOrderDisplayOption = useCallback(
    (order: ColumnOrderState) => {
      setColumnOrder(order);
    },
    [setColumnOrder],
  );

  // handle moving columns in the table
  const handleColumnMoved = useCallback(
    (columnId: string, fromIndex: number, toIndex: number) => {
      const currentOrder = [...columnOrder];

      // validate that columnId matches the expected position
      if (currentOrder[fromIndex] !== columnId) {
        return;
      }

      // Remove the column from its old position and insert it at the new position
      const [movedColumn] = currentOrder.splice(fromIndex, 1);

      currentOrder.splice(toIndex, 0, movedColumn);

      setColumnOrder(currentOrder);
    },
    [columnOrder, setColumnOrder],
  );

  // Handle column visibility changes - direct context update
  const handleColumnVisible = useCallback(
    (columnId: string, visible: boolean) => {
      // Update context state directly
      const newVisibility = { ...columnVisibility, [columnId]: visible };

      setColumnVisibility(newVisibility);
    },
    [columnVisibility, setColumnVisibility],
  );

  // refetch the ClientSideDatasource
  const handleRefetch = () => {
    getActivityRuns({
      processId: processId as string,
      query_config: exportsDatasetQuery,
    });
  };

  // handle row-clicked
  const handleRowClicked = (rowData: ActivityRunRowData, rowIndex?: number) => {
    // Navigate to activity logs for the clicked activity run
    if (rowData?.id) {
      router.push(
        getProcessActivityLogsRouteById(
          processId,
          rowData.id,
          status,
          encodeURIComponent(JSON.stringify(selectedFilters)),
          rowIndex ?? -1,
          totalRows,
        ),
      );
    }
  };

  // Setup columns and filters configuration based on filter-config
  const setupColumnsAndFilters = () => {
    if (!filterConfigData?.data?.length || isFilterConfigLoading || isFilterConfigUninitialized) {
      return;
    }

    const columns = formatTanStackColumns({
      filterConfig: filterConfigData?.data,
      datasetId: processId,
      tableRef: null as any,
      isProcess: true,
      wrapLink: true,
    });

    if (columns?.length > 0) {
      setColumns(columns as ColumnDef<ActivityRunRowData>[]);
      dispatch({
        type: filtersContextActions.SET_FILTERS_CONFIG,
        payload: {
          filtersConfig: filterConfigData?.data
            ?.filter(
              (item: MapAny) =>
                !item?.metadata?.is_hidden &&
                item?.metadata?.custom_type !== CUSTOM_COLUMNS_TYPE.ACTIVITY_STATUS &&
                item?.metadata?.custom_type !== CUSTOM_COLUMNS_TYPE.ACTIVITY_CURRENT_STATUS,
            )
            ?.map((column: MapAny) => ({
              key: column?.column,
              label: snakeCaseToSentenceCase(column?.column),
              values: column?.options,
              type: column?.type,
            })),
        },
      });

      if (isNoRowsOverlayVisible || activityRunsData?.total_count === 0) return;
    }
  };

  // setup columns and filters
  useEffect(() => {
    setupColumnsAndFilters();
  }, [filterConfigData?.data, processId]);

  // Create a callback to update state when table is set
  const handleTableReady = useCallback(
    (tableInstance: Table<MapAny>) => {
      tableRef.current = tableInstance;
      setTable(tableInstance);
    },
    [status, processId],
  );

  if (shouldShowEmptyState) {
    return (
      <div className='h-full w-full'>
        <ActivityRunsEmptyState status={status as ACTIVITY_RUN_STATUS} />
      </div>
    );
  }

  return (
    <>
      <CommonWrapper className={'h-fit w-full'} isError={isFilterConfigError} refetchFunction={refetchFilterConfig}>
        <div data-testid='activity-by-status-table-header' className='z-1000 flex items-center justify-between pr-4'>
          <div className='flex items-center py-3'>
            <FiltersWrapper label='Filter' filterConfig={filtersConfig ?? []} className='px-3' isProcessContext />
          </div>
          <div className='relative items-center gap-2.5'>
            {table && (
              <DisplayOptions
                tableRef={null as any}
                isTanStackTable
                isGroupByDisabled
                table={table}
                columnOrder={columnOrder}
                datasetId={processId ?? ''}
                columnVisibility={columnVisibility}
                setColumnOrder={handleColumnOrderDisplayOption}
                setColumnVisibility={handleColumnVisibilityDisplayOption}
              />
            )}
          </div>
        </div>
      </CommonWrapper>

      <CommonWrapper
        isError={lazyloadActivityRunsError}
        errorCardTitle='Failed to load activity runs'
        errorCardSubTitle='Please try again later'
        refetchFunction={handleRefetch}
      >
        <div className='z-10 h-full w-full' ref={datasetTableRef} id='activity-by-status-table'>
          <TanStackTable
            tableRef={tableRef}
            columns={columns}
            totalRows={totalRows}
            emptyStateStatus={status}
            filterModel={selectedFilters}
            clientSideDatasource={clientSideDatasource}
            queryKeyParts={[processId, status]}
            customTheme={myThemeWithProcess as any}
            headerClass='f-12-450 text-GRAY_700 px-4!'
            gridStyle={{ height: 'calc(100vh - 150px)' }}
            cellClass='text-[13px]! font-[450]! flex items-center justify-start truncate'
            onTableReady={handleTableReady}
            onRowClicked={handleRowClicked}
            onColumnMoved={handleColumnMoved}
            onColumnVisible={handleColumnVisible}
            initialColumnOrder={columnOrder}
            initialColumnVisibility={columnVisibility}
            preserveScrollPosition={{
              key: `${processId}-${status}`,
              enabled: true,
            }}
            rowHighlighting={{
              key: `${processId}-${status}`,
              enabled: true,
            }}
          />
        </div>
      </CommonWrapper>
    </>
  );
};

export default ActivityByStatus;
