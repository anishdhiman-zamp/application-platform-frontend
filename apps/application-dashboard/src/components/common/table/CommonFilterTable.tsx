import { FC, type ReactElement, useEffect, useMemo, useRef, useState } from 'react';
import { GlobalCacheStore } from '@zamp-platform/utils';
import {
  ColDef,
  ColumnMovedEvent,
  IServerSideDatasource,
  IServerSideGetRowsParams,
  RowClickedEvent,
} from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { useGetFilterConfigQuery, useLazyGetDataQuery } from 'apis/filterTable';
import { ZAMP_LOGO_LOADER } from 'constants/lottie/zamp-logo-loader';
import { useAppDispatch, useAppSelector } from 'hooks/toolkit';
import {
  formatColumns,
  formatDrilldownFilters,
  getColumnOrderingVisibilityForCurrentDataset,
  getFilters,
} from 'modules/data/data.utils';
import RowPropertiesSideDrawer from 'modules/data/RowProperties';
import { useRouter, useSearchParams } from 'next/navigation';
import { RootState } from 'store';
import { addBreadcrumb } from 'store/slices/layout-configs';
import { MapAny } from 'types/commonTypes';
import { FilterModelType } from 'types/components/table.type';
import { checkIsObjectEmpty, cn, snakeCaseToSentenceCase } from 'utils/common';
import { getFromLocalStorage, LOCAL_STORAGE_KEYS, setToLocalStorage } from 'utils/localstorage';
import CustomHeader from 'components/common/table/CustomHeader';
import DatasetTable from 'components/common/table/DatasetTable';
import { CUSTOM_COLUMNS_TYPE } from 'components/common/table/table.types';
import { getEncodedRequest } from 'components/common/table/table.utils';
import CommonWrapper from 'components/commonWrapper';
import { SkeletonTypes } from 'components/commonWrapper/commonWrapper.types';
import DynamicLottiePlayer from 'components/DynamicLottiePlayer';
import { FILTER_TYPES } from 'components/filter/filter.types';
import FiltersWrapper from 'components/filter/filterMenu/FiltersWrapper';
import { filtersContextActions, useFiltersContextStore } from 'components/filter/filters.context';

interface CommonFilterTableProps {
  handleRowClicked?: (event: RowClickedEvent) => void;
  actionElements?: ReactElement;
  id: string;
  tableRef: React.RefObject<AgGridReact>;
  cellClass?: string;
  filterConfigUrl: string;
  dataUrl: string;
  isHeaderMenuDisabled?: boolean;
  updateFiltersInParent?: (filters: MapAny) => void;
  updateFilterConfigInParent?: (filterConfig: MapAny[]) => void;
  parentSelectedFilters?: MapAny;
  disableFilterActions?: boolean;
  drilldownFilters?: FilterModelType;
  sortColumn?: string;
  sortOrder?: string;
  isProcess?: boolean;
  gridStyle?: MapAny;
}

interface DatasetResponse {
  title: string;
  data: {
    total_count: number;
    rows: any[];
  };
}

const CommonFilterTable: FC<CommonFilterTableProps> = ({
  handleRowClicked,
  actionElements,
  id,
  tableRef,
  cellClass,
  disableFilterActions = false,
  filterConfigUrl,
  dataUrl,
  isHeaderMenuDisabled,
  updateFiltersInParent,
  updateFilterConfigInParent,
  parentSelectedFilters,
  drilldownFilters,
  sortColumn,
  sortOrder,
  isProcess = false,
  gridStyle,
}) => {
  const router = useRouter();
  const datasetTableRef = useRef<HTMLDivElement>(null);

  const filters = useSearchParams().get('filters');
  const appDispatch = useAppDispatch();
  const breadcrumbStack = useAppSelector((state: RootState) => state.layoutConfig.breadcrumbStack);

  const {
    dispatch,
    state: { selectedFilters, filtersConfig },
  } = useFiltersContextStore();

  const [columns, setColumns] = useState<ColDef[]>([]);
  const [totalRows, setTotalRows] = useState<number>(0);
  const [datasetTitle, setDatasetTitle] = useState<string>('');
  const [isNoRowsOverlayVisible, setIsNoRowsOverlayVisible] = useState<boolean>(false);
  const [rowPropertiesData, setRowPropertiesData] = useState<MapAny>();

  const [getData, { data, isError }] = useLazyGetDataQuery();
  const {
    data: filterConfig,
    isFetching: isFilterConfigFetching,
    isError: isFilterConfigError,
  } = useGetFilterConfigQuery({ url: filterConfigUrl }, { skip: !filterConfigUrl, refetchOnMountOrArgChange: false });

  const serverSideDatasource: IServerSideDatasource = useMemo(() => {
    return {
      getRows: (parameters: IServerSideGetRowsParams): void => {
        const queryConfig = getEncodedRequest(parameters.request);
        const cacheKey = `DATASET_CACHE_${id}_${dataUrl}_${JSON.stringify(queryConfig)}`;

        // Check if data exists in cache
        const cachedData = GlobalCacheStore.get<DatasetResponse>(cacheKey);

        if (cachedData) {
          if (parameters.request.startRow === 0) {
            setDatasetTitle(cachedData.title);
            setTotalRows(cachedData.data?.total_count);
            setIsNoRowsOverlayVisible(cachedData.data?.total_count === 0);
            dispatch({
              type: filtersContextActions.SET_TOTAL_ROWS,
              payload: { totalRows: cachedData.data?.total_count },
            });
          }
          parameters.success({
            rowData: cachedData.data?.rows,
            ...(parameters.request.startRow === 0 ? { rowCount: cachedData.data?.total_count } : {}),
          });
        }

        getData({
          url: dataUrl || '',
          query_config: queryConfig,
        })
          .unwrap()
          .then((response) => {
            // Cache the response
            GlobalCacheStore.set(cacheKey, response);

            if (parameters.request.startRow === 0) {
              setDatasetTitle(response?.title);
              setTotalRows(response?.data?.total_count);
              setIsNoRowsOverlayVisible(response?.data?.total_count === 0);
              dispatch({
                type: filtersContextActions.SET_TOTAL_ROWS,
                payload: { totalRows: response?.data?.total_count },
              });
            }
            parameters.success({
              rowData: response?.data?.rows,
              ...(parameters.request.startRow === 0 ? { rowCount: response?.data?.total_count } : {}),
            });
          })
          .catch(() => {
            parameters.fail();
          });
      },
    };
  }, [getData, id, dataUrl]);

  const handleColumnMoved = (event: ColumnMovedEvent) => {
    const columnOrderingFromLocalStorage = getColumnOrderingVisibilityForCurrentDataset(id);
    const latestColumns = event?.api?.getColumns() ?? [];
    const { column, toIndex = 0 } = event;

    if (!column) return;
    const columnOrderingVisibility: { colId: string; isVisible: boolean }[] = columnOrderingFromLocalStorage?.length
      ? columnOrderingFromLocalStorage
      : latestColumns.map((column) => ({
          colId: column.getColId(),
          isVisible: column.isVisible(),
        }));

    const movedColumn = columnOrderingVisibility.find((item) => item.colId === column?.getColId()) ?? {};
    const fromIndex = columnOrderingVisibility.findIndex((item) => item.colId === column?.getColId());

    if (fromIndex === toIndex) return;
    let finalList: { colId?: string; isVisible?: boolean }[] = [];

    if (fromIndex < toIndex) {
      const zeroToOldIndex = columnOrderingVisibility.slice(0, fromIndex) ?? [];
      const oldIndexToNewIndex = columnOrderingVisibility.slice(fromIndex + 1, toIndex + 1) ?? [];
      const newIndexToEnd = columnOrderingVisibility.slice(toIndex + 1) ?? [];

      finalList = [...zeroToOldIndex, ...oldIndexToNewIndex, movedColumn, ...newIndexToEnd];
    } else {
      const endToOldIndex = columnOrderingVisibility.slice(fromIndex + 1) ?? [];
      const oldIndexToNewIndex = columnOrderingVisibility.slice(toIndex, fromIndex) ?? [];
      const newIndexToStart = columnOrderingVisibility.slice(0, toIndex) ?? [];

      finalList = [...newIndexToStart, movedColumn, ...oldIndexToNewIndex, ...endToOldIndex];
    }
    const currentColumnOrderingVisibility = JSON.parse(
      getFromLocalStorage(LOCAL_STORAGE_KEYS.COLUMN_ORDERING_VISIBILITY) ?? '{}',
    );

    setToLocalStorage(
      LOCAL_STORAGE_KEYS.COLUMN_ORDERING_VISIBILITY,
      JSON.stringify({ ...currentColumnOrderingVisibility, [id]: finalList }),
    );
  };

  useEffect(() => {
    if (filterConfig?.length) {
      const columns = formatColumns({
        filterConfig,
        datasetId: id,
        tableRef,
        sortColumn,
        sortOrder,
        isProcess,
        isMenuDisabled: isHeaderMenuDisabled,
      });

      if (columns?.length > 0) {
        setColumns(columns);
        const formattedFilterConfig = filterConfig
          ?.filter((item) => !item?.metadata?.is_hidden)
          ?.map((column) => ({
            key: column.column,
            label: column.alias ?? snakeCaseToSentenceCase(column?.column),
            values: column.options,
            type: column?.metadata?.custom_type === CUSTOM_COLUMNS_TYPE.TAG ? FILTER_TYPES.TAGS : column?.type,
          }));

        dispatch({
          type: filtersContextActions.SET_FILTERS_CONFIG,
          payload: {
            filtersConfig: formattedFilterConfig,
          },
        });

        if (updateFilterConfigInParent) {
          updateFilterConfigInParent(formattedFilterConfig);
        }

        if (filters)
          dispatch({
            type: filtersContextActions.INITIALIZE_DEFAULT_FILTERS,
            payload: { selectedFilters: getFilters(filters, filterConfig) ?? {} },
          });
      }
      if (parentSelectedFilters) {
        dispatch({
          type: filtersContextActions.INITIALIZE_DEFAULT_FILTERS,
          payload: { selectedFilters: parentSelectedFilters },
        });
      }

      if (drilldownFilters) {
        const { selectedDrilldownFilters } = formatDrilldownFilters(drilldownFilters, filterConfig);

        if (!checkIsObjectEmpty(selectedDrilldownFilters))
          dispatch({
            type: filtersContextActions.INITIALIZE_DEFAULT_FILTERS,
            payload: { selectedFilters: selectedDrilldownFilters },
          });
      }
    }
  }, [filterConfig, filters]);

  useEffect(() => {
    tableRef.current?.api?.setFilterModel(selectedFilters);
    updateFiltersInParent?.(selectedFilters);
  }, [selectedFilters]);

  useEffect(() => {
    if (isNoRowsOverlayVisible) {
      tableRef.current?.api?.showNoRowsOverlay();
    } else {
      tableRef.current?.api?.hideOverlay();
    }
  }, [isNoRowsOverlayVisible]);

  useEffect(() => {
    if (datasetTitle && breadcrumbStack?.length === 0) {
      appDispatch(addBreadcrumb([datasetTitle]));
    }
  }, [datasetTitle, breadcrumbStack]);

  return (
    <>
      <CommonWrapper
        className={cn('h-full', {
          'flex flex-col items-center justify-center': isFilterConfigFetching,
        })}
        isLoading={isFilterConfigFetching}
        skeletonType={SkeletonTypes.CUSTOM}
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
        <div className='flex items-center justify-between pr-8 py-3'>
          <div className='flex items-center justify-between w-full'>
            {!isFilterConfigError && (
              <FiltersWrapper
                label='Filter'
                filterConfig={filtersConfig ?? []}
                allowActions={!disableFilterActions}
                allowClear={!disableFilterActions}
              />
            )}
            {actionElements}
          </div>
        </div>

        <CommonWrapper isError={isError} refetchFunction={() => router.refresh()}>
          <div className='z-10 w-full h-full' ref={datasetTableRef}>
            <DatasetTable
              tableRef={tableRef}
              columns={columns}
              serverSideDatasource={serverSideDatasource}
              columnConfig={{ enableRowGroup: true, enableValue: true, headerComponent: CustomHeader }}
              totalRows={totalRows}
              onColumnMoved={handleColumnMoved}
              onRowClicked={handleRowClicked}
              cellClass={cellClass}
              gridStyle={gridStyle}
            />
          </div>
        </CommonWrapper>
      </CommonWrapper>
      {rowPropertiesData && (
        <RowPropertiesSideDrawer
          data={rowPropertiesData}
          onClose={() => setRowPropertiesData(undefined)}
          datasetId={id as string}
          isDrillDownEnabled={data?.data?.config?.is_drilldown_enabled}
          columns={columns}
        />
      )}
    </>
  );
};

export default CommonFilterTable;
