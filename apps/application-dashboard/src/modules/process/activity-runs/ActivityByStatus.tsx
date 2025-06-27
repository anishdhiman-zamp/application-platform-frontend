import { FC, useEffect, useMemo, useRef, useState } from 'react';
import { ColDef, type ColumnMovedEvent, IServerSideDatasource, IServerSideGetRowsParams } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { formatColumns, getColumnOrderingVisibilityForCurrentDataset } from 'modules/data/data.utils';
import ActivityRunsEmptyState from 'modules/process/activity-runs/components/ActivityRunsEmptyState';
import type { ACTIVITY_RUN_STATUS } from 'modules/process/process.types';
import { useRouter } from 'next/navigation';
import { type MapAny } from 'types/commonTypes';
import { checkIsObjectEmpty, snakeCaseToSentenceCase } from 'utils/common';
import { useLazyGetActivityRunsQuery } from '@/apis/processes';
import { myThemeWithProcess } from '@/components/common/table/table.constants';
import { CUSTOM_COLUMNS_TYPE } from '@/components/common/table/table.types';
import { FILTER_TYPES } from '@/components/filter/filter.types';
import { CONDITION_OPERATOR_TYPE } from '@/components/filter/filters.constants';
import { getProcessActivityLogsRouteById } from '@/constants/routeConfig';
import { getFromLocalStorage, LOCAL_STORAGE_KEYS, setToLocalStorage } from '@/utils/localstorage';
import CustomHeader from 'components/common/table/CustomHeader';
import DatasetTable from 'components/common/table/DatasetTable';
import DisplayOptions from 'components/common/table/DisplayOptions';
import { getEncodedRequest } from 'components/common/table/table.utils';
import CommonWrapper from 'components/commonWrapper';
import FiltersWrapper from 'components/filter/filterMenu/FiltersWrapper';
import { filtersContextActions, useFiltersContextStore } from 'components/filter/filters.context';

type ActivityByStatusProps = {
  processId: string;
  status: string;
  filterConfigData?: MapAny;
  isFilterConfigLoading: boolean;
  isFilterConfigError: boolean;
  isFilterConfigUninitialized: boolean;
  refetchFilterConfig: () => void;
};

const ActivityByStatus: FC<ActivityByStatusProps> = ({
  processId,
  status,
  filterConfigData,
  isFilterConfigLoading,
  isFilterConfigError,
  isFilterConfigUninitialized,
  refetchFilterConfig,
}) => {
  const tableRef = useRef<AgGridReact>(null);
  const datasetTableRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const {
    dispatch,
    state: { selectedFilters, filtersConfig },
  } = useFiltersContextStore();

  const [columns, setColumns] = useState<ColDef[]>([]);
  const [totalRows, setTotalRows] = useState<number>(0);

  const [isNoRowsOverlayVisible, setIsNoRowsOverlayVisible] = useState<boolean>(false);
  const [exportsDatasetQuery, setExportsDatasetQuery] = useState<string>('');
  const [hasServerSideDataLoaded, setHasServerSideDataLoaded] = useState<boolean>(false);
  const [isGridReady, setIsGridReady] = useState<boolean>(false);

  const [getActivityRuns, { data: activityRunsData, isError: lazyloadActivityRunsError }] =
    useLazyGetActivityRunsQuery();

  const serverSideDatasource: IServerSideDatasource = useMemo(() => {
    return {
      getRows: (parameters: IServerSideGetRowsParams): void => {
        const filterModel = parameters?.request?.filterModel;

        const activityStatusFilter = {
          filterType: FILTER_TYPES.MULTI_SELECT,
          type: CONDITION_OPERATOR_TYPE.CONTAINS,
          values: [status],
        };

        const mergedRequest = {
          ...parameters.request,
          filterModel: {
            ...filterModel,
            ...(status ? { status: activityStatusFilter } : {}),
          },
        };

        const queryConfig = getEncodedRequest(mergedRequest);

        removeCellFocus();
        setExportsDatasetQuery(queryConfig);

        getActivityRuns({
          processId: processId as string,
          query_config: queryConfig,
        })
          .unwrap()
          .then((response) => {
            const totalCount = response?.total_count;

            if (parameters.request.startRow === 0) {
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

            parameters.success({
              rowData: response?.rows,
              ...(parameters.request.startRow === 0 ? { rowCount: totalCount } : {}),
            });
            setHasServerSideDataLoaded(true);
          })
          .catch(() => {
            parameters.fail();
          });
      },
    };
  }, [processId, status]);

  const handleColumnMoved = (event: ColumnMovedEvent) => {
    const columnOrderingFromLocalStorage = getColumnOrderingVisibilityForCurrentDataset(processId as string);
    const latestColumns = event?.api?.getColumns() ?? [];
    const { column, toIndex = 0 } = event;

    if (!column) return;

    // If the moved column is non-movable, prevent the move
    if (column?.getColDef()?.suppressMovable) {
      const fromIndex = latestColumns.findIndex((col) => col.getColId() === column.getColId());

      event.api?.moveColumns([column], fromIndex);

      return;
    }

    // Check if the target position is valid (not in a non-movable column's position)
    const targetColumn = latestColumns[toIndex];

    if (targetColumn?.getColDef()?.suppressMovable) {
      const fromIndex = latestColumns.findIndex((col) => col.getColId() === column.getColId());

      event.api?.moveColumns([column], fromIndex);

      return;
    }

    const columnOrderingVisibility: { colId: string; isVisible: boolean }[] = columnOrderingFromLocalStorage?.length
      ? columnOrderingFromLocalStorage
      : latestColumns.map((column) => ({
          colId: column?.getColId(),
          isVisible: column?.isVisible(),
        }));

    const movedColumn = columnOrderingVisibility?.find((item) => item?.colId === column?.getColId()) ?? {};
    const fromIndex = columnOrderingVisibility?.findIndex((item) => item?.colId === column?.getColId());

    if (fromIndex === toIndex) return;
    let finalList: { colId?: string; isVisible?: boolean }[] = [];

    if (fromIndex < toIndex) {
      const zeroToOldIndex = columnOrderingVisibility?.slice(0, fromIndex) ?? [];
      const oldIndexToNewIndex = columnOrderingVisibility?.slice(fromIndex + 1, toIndex + 1) ?? [];
      const newIndexToEnd = columnOrderingVisibility?.slice(toIndex + 1) ?? [];

      finalList = [...zeroToOldIndex, ...oldIndexToNewIndex, movedColumn, ...newIndexToEnd];
    } else {
      const endToOldIndex = columnOrderingVisibility?.slice(fromIndex + 1) ?? [];
      const oldIndexToNewIndex = columnOrderingVisibility?.slice(toIndex, fromIndex) ?? [];
      const newIndexToStart = columnOrderingVisibility?.slice(0, toIndex) ?? [];

      finalList = [...newIndexToStart, movedColumn, ...oldIndexToNewIndex, ...endToOldIndex];
    }

    const currentColumnOrderingVisibility = JSON.parse(
      getFromLocalStorage(LOCAL_STORAGE_KEYS.COLUMN_ORDERING_VISIBILITY) ?? '{}',
    );

    setToLocalStorage(
      LOCAL_STORAGE_KEYS.COLUMN_ORDERING_VISIBILITY,
      JSON.stringify({ ...currentColumnOrderingVisibility, [processId as string]: finalList }),
    );
  };

  const removeCellFocus = () => {
    if (isGridReady) {
      tableRef.current?.api?.clearCellSelection();
      tableRef.current?.api?.clearFocusedCell();
    }
  };

  const handleRefetch = () => {
    getActivityRuns({
      processId: processId as string,
      query_config: exportsDatasetQuery,
    });
  };

  const handleGridReady = () => {
    setIsGridReady(true);
  };

  useEffect(() => {
    if (filterConfigData?.data?.length && !isFilterConfigLoading && !isFilterConfigUninitialized) {
      const columns = formatColumns({
        filterConfig: filterConfigData?.data,
        datasetId: processId,
        tableRef,
        isProcess: true,
      });

      if (columns?.length > 0) {
        setColumns(columns);
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
    }
  }, [filterConfigData?.data, processId]);

  useEffect(() => {
    if (isGridReady && selectedFilters) {
      tableRef.current?.api?.setFilterModel(selectedFilters);
      setHasServerSideDataLoaded(false);
    }
  }, [selectedFilters, isGridReady]);

  useEffect(() => {
    if (isGridReady && isNoRowsOverlayVisible) {
      tableRef.current?.api?.showNoRowsOverlay();
    } else if (isGridReady) {
      tableRef.current?.api?.hideOverlay();
    }
  }, [isNoRowsOverlayVisible, isGridReady]);

  const handleRowClicked = (data: MapAny) => {
    if (!data?.data?.id) return;

    const target = data?.event?.target as HTMLElement;

    if (target.closest('.combobox-trigger')) return;

    const activityId = data?.data?.id;
    const path = getProcessActivityLogsRouteById(processId as string, activityId, status);

    router.push(path);
  };

  if (isNoRowsOverlayVisible && checkIsObjectEmpty(selectedFilters) && hasServerSideDataLoaded) {
    return (
      <div className='h-full w-full'>
        <ActivityRunsEmptyState status={status as ACTIVITY_RUN_STATUS} />
      </div>
    );
  }

  return (
    <>
      <CommonWrapper className={'h-full'} isError={isFilterConfigError} refetchFunction={refetchFilterConfig}>
        <div className='z-1000 flex items-center justify-between pr-8'>
          <div className='flex items-center py-3'>
            <FiltersWrapper label='Filter' filterConfig={filtersConfig ?? []} className='px-3' />
          </div>
          <div className='relative flex items-center gap-2.5'>
            <DisplayOptions isGroupByDisabled tableRef={tableRef} datasetId={processId as string} />
          </div>
        </div>
      </CommonWrapper>

      <CommonWrapper
        isError={lazyloadActivityRunsError}
        errorCardTitle='Failed to load activity runs'
        errorCardSubTitle='Please try again later'
        refetchFunction={handleRefetch}
      >
        <div className='sensitive z-10 h-full w-full' ref={datasetTableRef}>
          <DatasetTable
            tableRef={tableRef}
            columns={columns}
            serverSideDatasource={serverSideDatasource}
            columnConfig={{ enableRowGroup: true, enableValue: true, headerComponent: CustomHeader }}
            totalRows={totalRows}
            customTheme={myThemeWithProcess}
            headerClass='f-12-450 text-GRAY_700'
            cellClass='text-[13px]! font-[450]! px-4!'
            suppressCellFocus
            gridStyle={{ height: 'calc(100vh - 150px)' }}
            enableCellSelection={false}
            onGridReady={handleGridReady}
            onColumnMoved={handleColumnMoved}
            onRowClicked={handleRowClicked}
            menuTitle='Activity properties'
            showStatusBar={false}
            shouldShowNA
          />
        </div>
      </CommonWrapper>
    </>
  );
};

export default ActivityByStatus;
