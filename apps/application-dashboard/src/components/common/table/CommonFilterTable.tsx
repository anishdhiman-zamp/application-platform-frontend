'use client';

import { FC, type ReactElement, useEffect, useMemo, useRef, useState } from 'react';
import {
  ColumnOrderingVisibilityType,
  getColumnConfigForDataset,
  setColumnConfigForDataset,
} from '@zamp-platform/dataset-create-edit';
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
import {
  formatColumns,
  formatDrilldownFilters,
  getColumnOrderingVisibilityForCurrentDataset,
  getFilters,
} from 'modules/data/data.utils';
import RowPropertiesSideDrawer from 'modules/data/RowProperties';
import { useRouter, useSearchParams } from 'next/navigation';
import { MapAny } from 'types/commonTypes';
import { FilterModelType } from 'types/components/table.type';
import { checkIsObjectEmpty, cn, snakeCaseToSentenceCase } from 'utils/common';
import { ZAMP_LOGO_LOADER_SVG } from '@/constants/icons';
import ImageLoader from 'components/common/loader/ImageLoader';
import CustomHeader from 'components/common/table/CustomHeader';
import DatasetTable from 'components/common/table/DatasetTable';
import { getColumnType, getEncodedRequest } from 'components/common/table/table.utils';
import CommonWrapper from 'components/commonWrapper';
import { SkeletonTypes } from 'components/commonWrapper/commonWrapper.types';
import FiltersWrapper from 'components/filter/filterMenu/FiltersWrapper';
import { filtersContextActions, useFiltersContextStore } from 'components/filter/filters.context';

interface CommonFilterTableProps {
  handleRowClicked?: (event: RowClickedEvent) => void;
  actionElements?: ReactElement;
  id: string;
  tableRef: React.RefObject<AgGridReact | null>;
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

  const filters = useSearchParams()?.get('filters') ?? '';

  const {
    dispatch,
    state: { selectedFilters, filtersConfig },
  } = useFiltersContextStore();

  const [columns, setColumns] = useState<ColDef[]>([]);
  const [totalRows, setTotalRows] = useState<number>(0);
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

    // Preserve the existing config structure (dataset_name, dataset_unique_key_name)
    // and only update the columns field
    const existingData = getColumnConfigForDataset(id);

    if (existingData && typeof existingData === 'object' && 'columns' in existingData) {
      // New format: update only the columns field
      setColumnConfigForDataset(id, {
        ...existingData,
        columns: finalList as ColumnOrderingVisibilityType[],
      });
    } else {
      // Old format or no existing data: set the array directly
      setColumnConfigForDataset(id, finalList as ColumnOrderingVisibilityType[]);
    }
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
            type: getColumnType(column),
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

  return (
    <>
      <CommonWrapper
        className={cn('h-full', {
          'flex flex-col items-center justify-center': isFilterConfigFetching,
        })}
        isLoading={isFilterConfigFetching}
        skeletonType={SkeletonTypes.CUSTOM}
        loader={
          <ImageLoader
            imageSrc={ZAMP_LOGO_LOADER_SVG}
            width={140}
            height={140}
            className='z-50 flex h-[calc(100vh-200px)]'
          />
        }
      >
        <div className='flex items-center justify-between py-3 pr-8'>
          <div className='flex w-full items-center justify-between'>
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
          <div className='z-10 h-full w-full' ref={datasetTableRef}>
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
