import React, { FC, useEffect, useMemo, useRef, useState } from 'react';
import {
  CellEditRequestEvent,
  ColDef,
  FillEndEvent,
  IServerSideDatasource,
  IServerSideGetRowsParams,
} from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import {
  useGetDatasetFilterConfigQuery,
  useLazyGetActionStatusQuery,
  useLazyGetDatasetDataQuery,
  useUpdateDatasetDataMutation,
} from 'apis/dataset';
import { PAGE_LOADER } from 'constants/lottie/page_loader';
import { ROUTES_PATH } from 'constants/routeConfig';
import { useAppDispatch, useAppSelector } from 'hooks/toolkit';
import usePolling from 'hooks/usePolling';
import ExportDataset from 'modules/data/components/exportDataset';
import { formatColumns, getFilters } from 'modules/data/data.utils';
import RowPropertiesSideDrawer from 'modules/data/RowProperties';
import RulesListingSideDrawer from 'modules/data/RulesListing';
import { PAGE_CURRENCY_OPTIONS } from 'modules/page/pages.constants';
import SingleSelectFilter from 'modules/widgets/components/SingleSelectFilter';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/router';
import { RootState } from 'store';
import { addBreadcrumb } from 'store/slices/layout-configs';
import { DatasetActionStatusResponseType, DatasetUpdateResponseType } from 'types/api/dataset.types';
import { MapAny } from 'types/commonTypes';
import { LogicalOperatorType } from 'types/components/table.type';
import { cn } from 'utils/common';
import DatasetTable from 'components/common/table/DatasetTable';
import DisplayOptions from 'components/common/table/DisplayOptions';
import { getEncodedRequest } from 'components/common/table/table.utils';
import CommonWrapper from 'components/commonWrapper';
import { SkeletonTypes } from 'components/commonWrapper/commonWrapper.types';
import Player from 'components/DynamicLottiePlayer';
import FiltersWrapper from 'components/filter/filterMenu/FiltersWrapper';
import { CONDITION_OPERATOR_TYPE } from 'components/filter/filters.constants';
import { filtersContextActions, useFiltersContextStore, withFiltersContext } from 'components/filter/filters.context';

type DatasetByIdProps = {
  id: string;
  zampIds?: string[];
};

const DatasetById: FC<DatasetByIdProps> = ({ id, zampIds }) => {
  const filters = useSearchParams().get('filters');
  const currency = useSearchParams().get('currency') ?? 'local';
  const appDispatch = useAppDispatch();
  const breadcrumbStack = useAppSelector((state: RootState) => state.layoutConfig.breadcrumbStack);

  const {
    data: filterConfig,
    refetch: refetchFilterConfig,
    isLoading,
    isError,
  } = useGetDatasetFilterConfigQuery(
    {
      datasetId: id as string,
    },
    {
      skip: !id,
    },
  );
  const [updateDatasetData] = useUpdateDatasetDataMutation();
  const [getActionStatus] = useLazyGetActionStatusQuery();
  const [columns, setColumns] = useState<ColDef[]>([]);
  const [isPolling, setIsPolling] = useState<boolean>(false);
  const [totalRows, setTotalRows] = useState<number>(0);
  const [columnId, setColumnId] = useState<string>('');
  const [isRulesListingSideDrawerOpen, setIsRulesListingSideDrawerOpen] = useState(false);
  const [rowPropertiesData, setRowPropertiesData] = useState<MapAny>();
  const [exportsDatasetQuery, setExportsDatasetQuery] = useState<string>('');
  const [datasetTitle, setDatasetTitle] = useState<string>('');
  const [fxCurrency, setFxCurrency] = useState<string[]>([currency]);

  const { startPolling } = usePolling();
  const [refetchColumnList, setRefetchColumnList] = useState<number>(0);

  const [getDatasetData, { data: datasetData }] = useLazyGetDatasetDataQuery();

  const {
    dispatch,
    state: { selectedFilters, filtersConfig, statusBar },
  } = useFiltersContextStore();

  const serverSideDatasource: IServerSideDatasource = useMemo(() => {
    return {
      getRows: (parameters: IServerSideGetRowsParams): void => {
        const queryConfig = getEncodedRequest(parameters.request, fxCurrency?.[0], zampIds);

        setExportsDatasetQuery(queryConfig);
        getDatasetData({
          datasetId: id as string,
          query_config: queryConfig,
        })
          .unwrap()
          .then((response) => {
            if (parameters.request.startRow === 0) {
              setDatasetTitle(response?.title);
              setTotalRows(response?.data?.total_count);
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
  }, [getDatasetData, id, zampIds, fxCurrency]);

  const router = useRouter();
  const tableRef = useRef<AgGridReact>(null);

  const handleColumnVisible = () => {
    setRefetchColumnList((prev) => prev + 1);
  };

  const handleSuccessfulUpdate = (data: DatasetUpdateResponseType) => {
    setIsPolling(true);
    startPolling({
      fn: () => getActionStatus({ datasetId: id as string, params: { action_ids: [data.action_id] } }),
      validate: (data: DatasetActionStatusResponseType[]) => {
        return data.filter((item) => !item.is_completed).length === 0;
      },
      interval: 3000,
      maxAttempts: 50,
    }).then(() => {
      setIsPolling(false);
      tableRef.current?.api?.refreshServerSide();
      refetchFilterConfig();
    });
  };

  const updateApi = ({
    rowId,
    field,
    newValue,
    operator = CONDITION_OPERATOR_TYPE.EQUAL,
  }: {
    rowId: string | string[];
    field: string;
    newValue: string;
    operator?: CONDITION_OPERATOR_TYPE;
  }) => {
    updateDatasetData({
      datasetId: id as string,
      data: {
        filters: {
          logical_operator: LogicalOperatorType.OperatorLogicalAnd,
          conditions: [
            {
              column: '_zamp_id',
              value: rowId,
              operator: operator,
            },
          ],
        },
        update: {
          column: field as string,
          value: newValue,
        },
      },
    })
      .unwrap()
      .then(handleSuccessfulUpdate);
  };

  const onCellEditRequest = (event: CellEditRequestEvent) => {
    const { colDef, newValue, data, source } = event;
    const { field } = colDef;

    if (source === 'edit') updateApi({ rowId: data?._zamp_id as string, field: field as string, newValue });
  };

  const onFillEnd = (event: FillEndEvent) => {
    const { finalRange } = event;
    const { startRow, endRow, startColumn } = finalRange;

    const startIndex = startRow?.rowIndex as number;
    const endIndex = endRow?.rowIndex as number;
    const field = startColumn?.getColId();
    const rowIds: string[] = [];
    let newValue = '';
    let loopStartIndex = startIndex;
    let loopEndIndex = endIndex;

    if (startIndex > endIndex) {
      loopStartIndex = endIndex;
      loopEndIndex = startIndex;
    }
    for (let i = loopStartIndex; i <= loopEndIndex; i++) {
      const row = tableRef.current?.api?.getDisplayedRowAtIndex(i);

      rowIds.push(row?.data?._zamp_id as string);
      if (i === startIndex) {
        newValue = row?.data?.[field as string] as string;
      }
    }

    updateApi({
      rowId: rowIds,
      field,
      newValue,
      operator: CONDITION_OPERATOR_TYPE.CONTAINS,
    });
  };

  const handleDrilldownClick = (data: MapAny) => {
    appDispatch(addBreadcrumb('Drilldown'));
    router.push(ROUTES_PATH.DRILLDOWN.replace(':datasetId', id as string).replace(':rowId', data?._zamp_id as string));
  };

  const handleRowPropertiesClick = (data: MapAny) => {
    setRowPropertiesData(data);
  };

  const handleRulesListingSideDrawerOpen = (columnId: string) => {
    setIsRulesListingSideDrawerOpen(true);
    setColumnId(columnId);
  };

  useEffect(() => {
    if (filterConfig?.length) {
      const columns = formatColumns(
        filterConfig,
        isPolling,
        id as string,
        handleSuccessfulUpdate,
        tableRef,
        handleRulesListingSideDrawerOpen,
        zampIds,
      );

      if (columns?.length > 0) {
        setColumns(columns);
        dispatch({
          type: filtersContextActions.SET_FILTERS_CONFIG,
          payload: {
            filtersConfig: filterConfig
              ?.filter((item) => !item?.metadata?.is_hidden)
              ?.map((column) => ({
                key: column.column,
                label: column.column,
                values: column.options,
                type: column.type,
              })),
          },
        });
        if (filters)
          dispatch({
            type: filtersContextActions.INITIALIZE_DEFAULT_FILTERS,
            payload: { selectedFilters: getFilters(filters, filterConfig) ?? {} },
          });
      }
    }
  }, [filterConfig, isPolling, filters, id]);

  useEffect(() => {
    tableRef.current?.api?.setFilterModel(selectedFilters);
  }, [selectedFilters, fxCurrency]);

  const handleFilterChange = (value: string[]) => {
    setFxCurrency(value);
  };

  useEffect(() => {
    if (datasetTitle && breadcrumbStack?.length === 0) {
      appDispatch(addBreadcrumb([datasetTitle]));
    }
  }, [datasetTitle, breadcrumbStack]);

  return (
    <>
      <CommonWrapper
        className={cn('h-full', {
          'flex flex-col items-center justify-center': isLoading,
        })}
        isLoading={isLoading}
        isError={isError}
        skeletonType={SkeletonTypes.CUSTOM}
        refetchFunction={refetchFilterConfig}
        loader={
          <Player src={PAGE_LOADER} className='lottie-player' autoplay keepLastFrame style={{ height: '200px' }} />
        }
      >
        <div className='flex items-center justify-between pr-8'>
          <div className='flex items-center py-3'>
            <FiltersWrapper label='Filter' filterConfig={filtersConfig ?? []} />
          </div>
          <div className='flex items-center gap-2.5'>
            <ExportDataset query={exportsDatasetQuery} datasetId={id as string} />
            <DisplayOptions tableRef={tableRef} refetchColumnList={refetchColumnList} datasetId={id as string} />
            <div className='flex items-center gap-2'>
              <div className='border-r border-GRAY_400 h-7'></div>
              <SingleSelectFilter
                onFilterChange={handleFilterChange}
                value={fxCurrency}
                key='fx_currency'
                label='Currency'
                options={PAGE_CURRENCY_OPTIONS}
              />
            </div>
          </div>
        </div>

        <div className='z-10 w-full h-full'>
          <DatasetTable
            tableRef={tableRef}
            columns={columns}
            serverSideDatasource={serverSideDatasource}
            columnConfig={{ enableRowGroup: true, enableValue: true }}
            totalRows={totalRows}
            onColumnVisible={handleColumnVisible}
            onCellEditRequest={onCellEditRequest}
            onFillEnd={onFillEnd}
            onRowPropertiesClick={handleRowPropertiesClick}
            statusBarValues={statusBar}
            {...(datasetData?.data?.config?.is_drilldown_enabled ? { onDrilldownClick: handleDrilldownClick } : {})}
          />
        </div>
      </CommonWrapper>
      {isRulesListingSideDrawerOpen && (
        <RulesListingSideDrawer
          column={columnId}
          onClose={() => setIsRulesListingSideDrawerOpen(false)}
          datasetId={id as string}
        />
      )}
      {rowPropertiesData && (
        <RowPropertiesSideDrawer
          data={rowPropertiesData}
          onClose={() => setRowPropertiesData(undefined)}
          datasetId={id as string}
          isDrillDownEnabled={datasetData?.data?.config?.is_drilldown_enabled}
          columns={columns}
        />
      )}
    </>
  );
};

export default withFiltersContext(DatasetById);
