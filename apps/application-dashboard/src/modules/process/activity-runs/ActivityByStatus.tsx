import { FC, useEffect, useMemo, useRef, useState } from 'react';
import { captureException } from '@sentry/nextjs';
import {
  ColDef,
  type ColumnMovedEvent,
  IServerSideDatasource,
  IServerSideGetRowsParams,
  IServerSideGetRowsRequest,
} from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { formatColumns, getColumnOrderingVisibilityForCurrentDataset } from 'modules/data/data.utils';
import { useParams, useRouter } from 'next/navigation';
import { defaultFn, type MapAny } from 'types/commonTypes';
import { checkIsObjectEmpty, snakeCaseToSentenceCase } from 'utils/common';
import { useLazyGetActivityRunsQuery } from '@/apis/processes';
import { myThemeWithProcess } from '@/components/common/table/table.constants';
import { CUSTOM_COLUMNS_TYPE } from '@/components/common/table/table.types';
import { FILTER_TYPES } from '@/components/filter/filter.types';
import { CONDITION_OPERATOR_TYPE } from '@/components/filter/filters.constants';
import { getProcessActivityLogsRouteById } from '@/constants/routeConfig';
import type { ActivityRunsDataResponseType } from '@/types/api/processApi.types';
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
  const firstLoadDone = useRef(false);
  const router = useRouter();
  const { process } = useParams();

  const {
    dispatch,
    state: { selectedFilters, filtersConfig },
  } = useFiltersContextStore();

  const [columns, setColumns] = useState<ColDef[]>([]);
  const [totalRows, setTotalRows] = useState<number>(0);

  const [isNoRowsOverlayVisible, setIsNoRowsOverlayVisible] = useState<boolean>(false);
  const [cachedDatasetData, setCachedDatasetData] = useState<ActivityRunsDataResponseType>();
  const [exportsDatasetQuery, setExportsDatasetQuery] = useState<string>('');

  const [getActivityRuns, { data: activityRunsData, isError: lazyloadActivityRunsError }] =
    useLazyGetActivityRunsQuery();

  const [isGridReady, setIsGridReady] = useState(false);

  const serverSideDatasource: IServerSideDatasource = useMemo(() => {
    return {
      getRows: (parameters: IServerSideGetRowsParams): void => {
        const filterModel = parameters?.request?.filterModel;
        const isDefaultFilters = checkIsObjectEmpty(filterModel ?? {})
          ? false
          : Object.values(filterModel ?? {}).every((filter) => filter?.isDefault);

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
        if (!firstLoadDone.current || isDefaultFilters) {
          // Use Cached Data for First Load or when no valid filters
          firstLoadDone.current = true; // Mark first load as done
          if (!checkIsObjectEmpty(cachedDatasetData)) {
            const totalCount = cachedDatasetData?.total_count ?? 0;

            setIsNoRowsOverlayVisible(totalCount === 0);
            parameters.success({
              rowData: cachedDatasetData?.rows ?? [],
              ...(parameters.request.startRow === 0 ? { rowCount: totalCount } : {}),
            });
          }
        } else {
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

              parameters.success({
                rowData: response?.rows,
                ...(parameters.request.startRow === 0 ? { rowCount: totalCount } : {}),
              });
            })
            .catch(() => {
              parameters.fail();
            });
        }
      },
    };
  }, [processId, cachedDatasetData, status]);

  const handleColumnMoved = (event: ColumnMovedEvent) => {
    const columnOrderingFromLocalStorage = getColumnOrderingVisibilityForCurrentDataset(processId as string);
    const latestColumns = event?.api?.getColumns() ?? [];
    const { column, toIndex = 0 } = event;

    if (!column) return;
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
      const columns = formatColumns(
        filterConfigData?.data,
        false,
        processId as string,
        undefined,
        tableRef,
        defaultFn,
        undefined,
        undefined,
        true,
      );

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
    }
  }, [selectedFilters, isGridReady]);

  useEffect(() => {
    if (isGridReady && isNoRowsOverlayVisible) {
      tableRef.current?.api?.showNoRowsOverlay();
    } else if (isGridReady) {
      tableRef.current?.api?.hideOverlay();
    }
  }, [isNoRowsOverlayVisible, isGridReady]);

  useEffect(() => {
    if (status) {
      firstLoadDone.current = false;

      const activityStatusFilter = {
        filterType: FILTER_TYPES.MULTI_SELECT,
        type: CONDITION_OPERATOR_TYPE.CONTAINS,
        values: [status],
      };

      const queryConfig = getEncodedRequest({
        filterModel: {
          ...(status ? { status: activityStatusFilter } : {}),
        },
      } as IServerSideGetRowsRequest);

      getActivityRuns({
        processId: processId as string,
        query_config: queryConfig,
      })
        .unwrap()
        .then((response) => {
          setTotalRows(response?.total_count);
          setCachedDatasetData(response);
          dispatch({
            type: filtersContextActions.SET_TOTAL_ROWS,
            payload: { totalRows: response?.total_count },
          });
        })
        .catch((err) => {
          captureException(err);
        });
    }
  }, [processId, status]);

  const handleRowClicked = (data: MapAny) => {
    const activityId = data?.id;
    const path = getProcessActivityLogsRouteById(processId as string, process as string, activityId);

    router.push(`${path}?status=${status}`);
  };

  return (
    <>
      <CommonWrapper className={'h-full'} isError={isFilterConfigError} refetchFunction={refetchFilterConfig}>
        <div className='flex items-center justify-between pr-8 z-1000'>
          <div className='flex items-center py-3'>
            <FiltersWrapper label='Filter' filterConfig={filtersConfig ?? []} className='px-3' />
          </div>
          <div className='relative flex items-center gap-2.5'>
            <DisplayOptions tableRef={tableRef} datasetId={processId as string} />
          </div>
        </div>
      </CommonWrapper>

      <CommonWrapper
        isError={lazyloadActivityRunsError}
        errorCardTitle='Failed to load activity runs'
        errorCardSubTitle='Please try again later'
        refetchFunction={handleRefetch}
      >
        <div className='z-10 w-full h-full sensitive' ref={datasetTableRef}>
          <DatasetTable
            tableRef={tableRef}
            columns={columns}
            serverSideDatasource={serverSideDatasource}
            columnConfig={{ enableRowGroup: true, enableValue: true, headerComponent: CustomHeader }}
            totalRows={totalRows}
            customTheme={myThemeWithProcess}
            headerClass='f-12-450 text-GRAY_700'
            cellClass='!text-[13px] !font-[450] !px-4'
            suppressCellFocus
            enableCellSelection={false}
            onGridReady={handleGridReady}
            onColumnMoved={handleColumnMoved}
            onRowPropertiesClick={handleRowClicked}
            menuTitle='Activity properties'
          />
        </div>
      </CommonWrapper>
    </>
  );
};

export default ActivityByStatus;
