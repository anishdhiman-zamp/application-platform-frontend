import { FC, useEffect, useMemo, useRef, useState } from 'react';
import { captureException } from '@sentry/nextjs';
import { ColDef, IServerSideDatasource, IServerSideGetRowsParams, IServerSideGetRowsRequest } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { ZAMP_LOGO_LOADER } from 'constants/lottie/zamp-logo-loader';
import { useOnClickOutside } from 'hooks';
import { formatColumns } from 'modules/data/data.utils';
import { useRouter } from 'next/navigation';
import { defaultFn } from 'types/commonTypes';
import { checkIsObjectEmpty, cn, snakeCaseToSentenceCase } from 'utils/common';
import { useGetFilterConfigByProcessIdQuery, useLazyGetActivityRunsQuery } from '@/apis/processes';
import { myThemeWithProcess } from '@/components/common/table/table.constants';
import type { ActivityRunsDataResponseType } from '@/types/api/processApi.types';
import CustomHeader from 'components/common/table/CustomHeader';
import DatasetTable from 'components/common/table/DatasetTable';
import DisplayOptions from 'components/common/table/DisplayOptions';
import { getEncodedRequest } from 'components/common/table/table.utils';
import CommonWrapper from 'components/commonWrapper';
import { SkeletonTypes } from 'components/commonWrapper/commonWrapper.types';
import DynamicLottiePlayer from 'components/DynamicLottiePlayer';
import FiltersWrapper from 'components/filter/filterMenu/FiltersWrapper';
import { filtersContextActions, useFiltersContextStore, withFiltersContext } from 'components/filter/filters.context';
type ProcessByIdProps = {
  processId: string;
  pageSize?: number;
};

const ProcessById: FC<ProcessByIdProps> = ({ processId, pageSize }) => {
  const router = useRouter();
  const tableRef = useRef<AgGridReact>(null);
  const datasetTableRef = useRef<HTMLDivElement>(null);
  const firstLoadDone = useRef(false);

  const {
    dispatch,
    state: { selectedFilters, filtersConfig },
  } = useFiltersContextStore();

  const [columns, setColumns] = useState<ColDef[]>([]);
  const [totalRows, setTotalRows] = useState<number>(0);

  const [isNoRowsOverlayVisible, setIsNoRowsOverlayVisible] = useState<boolean>(false);
  const [cachedDatasetData, setCachedDatasetData] = useState<ActivityRunsDataResponseType>();

  // const {
  //   data: activityRunsSummaryData,
  //   isError: isActivityRunsSummaryError,
  //   isFetching: isActivityRunsSummaryFetching,
  //   isUninitialized: isActivityRunsSummaryUninitialized,
  // } = useGetActivityRunsSummaryQuery(
  //   {
  //     processId: processId as string,
  //   },
  //   {
  //     skip: !processId,
  //     refetchOnMountOrArgChange: true,
  //   },
  // );

  const [getActivityRuns, { data: activityRunsData, isError: lazyloadActivityRunsError }] =
    useLazyGetActivityRunsQuery();

  const {
    data: filterConfigData,
    refetch: refetchFilterConfig,
    isFetching,
    isError,
    isUninitialized,
  } = useGetFilterConfigByProcessIdQuery(
    {
      processId: processId as string,
    },
    {
      skip: !processId,
      refetchOnMountOrArgChange: true,
    },
  );

  const serverSideDatasource: IServerSideDatasource = useMemo(() => {
    return {
      getRows: (parameters: IServerSideGetRowsParams): void => {
        const queryConfig = getEncodedRequest(parameters.request);

        const filterModel = parameters?.request?.filterModel;
        const isDefaultFilters = checkIsObjectEmpty(filterModel ?? {})
          ? false
          : Object.values(filterModel ?? {}).every((filter) => filter?.isDefault);

        removeCellFocus();
        if (!firstLoadDone.current || isDefaultFilters) {
          // Use Cached Data for First Load
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
                ...(parameters.request.startRow === 0
                  ? { rowCount: pageSize ? (totalCount < pageSize ? totalCount : pageSize) : totalCount }
                  : {}),
              });
            })
            .catch(() => {
              parameters.fail();
            });
        }
      },
    };
  }, [processId, cachedDatasetData, getActivityRuns]);

  const removeCellFocus = () => {
    tableRef.current?.api?.clearCellSelection();
    tableRef.current?.api?.clearFocusedCell();
  };

  useEffect(() => {
    if (filterConfigData?.data?.length && !isFetching && !isUninitialized) {
      const columns = formatColumns(filterConfigData?.data, false, processId as string, undefined, tableRef, defaultFn);

      if (columns?.length > 0) {
        setColumns(columns);
        dispatch({
          type: filtersContextActions.SET_FILTERS_CONFIG,
          payload: {
            filtersConfig: filterConfigData?.data
              ?.filter((item) => !item?.metadata?.is_hidden)
              ?.map((column) => ({
                key: column.column,
                label: column.alias ?? snakeCaseToSentenceCase(column?.column),
                values: column.options,
                type: column.type,
              })),
          },
        });

        if (isNoRowsOverlayVisible || activityRunsData?.total_count === 0) return;
      }
    }
  }, [filterConfigData?.data, processId, isFetching, isUninitialized]);

  useEffect(() => {
    tableRef.current?.api?.setFilterModel(selectedFilters);
  }, [selectedFilters]);

  useEffect(() => {
    if (isNoRowsOverlayVisible) {
      tableRef.current?.api?.showNoRowsOverlay();
    } else {
      tableRef.current?.api?.hideOverlay();
    }
  }, [isNoRowsOverlayVisible]);

  useEffect(() => {
    firstLoadDone.current = false;

    const queryConfig = getEncodedRequest(
      {} as IServerSideGetRowsRequest,
      undefined,
      false,
      false,
      false,
      undefined,
      undefined,
      pageSize,
    );

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
  }, [processId]);

  useOnClickOutside(datasetTableRef, removeCellFocus);

  return (
    <>
      <CommonWrapper
        className={cn('h-full', {
          'flex flex-col items-center justify-center': isFetching,
        })}
        isLoading={isFetching}
        isError={isError}
        skeletonType={SkeletonTypes.CUSTOM}
        refetchFunction={refetchFilterConfig}
        loader={
          <div className='flex justify-center items-center h-[calc(100vh-200px)] w-full z-50 bg-white'>
            <DynamicLottiePlayer
              src={ZAMP_LOGO_LOADER}
              className='lottie-player h-[140px]'
              autoplay
              loop
              keepLastFrame
            />
          </div>
        }
      >
        <div className='flex items-center justify-between pr-8 z-1000'>
          <div className='flex items-center py-3'>
            <FiltersWrapper label='Filter' filterConfig={filtersConfig ?? []} />
          </div>
          <div className='relative flex items-center gap-2.5'>
            <DisplayOptions tableRef={tableRef} datasetId={processId as string} />
          </div>
        </div>

        <CommonWrapper
          isError={lazyloadActivityRunsError}
          errorCardTitle='Failed to load activity runs'
          errorCardSubTitle='Please try again later'
          refetchFunction={() => router.refresh()}
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
              cellClass='!text-[13px] !font-[450]'
              suppressCellFocus
              enableCellSelection={false}
            />
          </div>
        </CommonWrapper>
      </CommonWrapper>
    </>
  );
};

export default withFiltersContext(ProcessById);
