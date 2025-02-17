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
  useGetActionStatusQuery,
  useGetDatasetFilterConfigQuery,
  useLazyGetActionStatusQuery,
  useLazyGetDatasetDataQuery,
  useUpdateDatasetDataMutation,
} from 'apis/dataset';
import { ROUTES_PATH } from 'constants/routeConfig';
import { useAppDispatch } from 'hooks/toolkit';
import usePolling from 'hooks/usePolling';
import ExportDataset from 'modules/data/components/exportDataset';
import { DATASET_ACTION_STATUS } from 'modules/data/data.types';
import { formatColumns } from 'modules/data/data.utils';
import RowPropertiesSideDrawer from 'modules/data/RowProperties';
import RulesListingSideDrawer from 'modules/data/RulesListing';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/router';
import { addBreadcrumb } from 'store/slices/layout-configs';
import { DatasetActionStatusResponseType, DatasetUpdateResponseType } from 'types/api/dataset.types';
import { MapAny } from 'types/commonTypes';
import { LogicalOperatorType } from 'types/components/table.type';
import DatasetTable from 'components/common/table/DatasetTable';
import DisplayOptions from 'components/common/table/DisplayOptions';
import { getEncodedRequest } from 'components/common/table/table.utils';
import CommonWrapper from 'components/commonWrapper';
import FiltersWrapper from 'components/filter/filterMenu/FiltersWrapper';
import { CONDITION_OPERATOR_TYPE } from 'components/filter/filters.constants';
import { filtersContextActions, useFiltersContextStore, withFiltersContext } from 'components/filter/filters.context';

type DatasetByIdProps = {
  id: string;
};

const DatasetById: FC<DatasetByIdProps> = ({ id }) => {
  const filters = useSearchParams().get('filters');
  const appDispatch = useAppDispatch();

  const {
    data: filterConfig,
    refetch: refetchFilterConfig,
    isLoading,
    isError,
  } = useGetDatasetFilterConfigQuery({
    datasetId: id as string,
  });
  const [updateDatasetData] = useUpdateDatasetDataMutation();
  const [getActionStatus] = useLazyGetActionStatusQuery();
  const [columns, setColumns] = useState<ColDef[]>([]);
  const [isPolling, setIsPolling] = useState<boolean>(false);
  const [totalRows, setTotalRows] = useState<number>(0);
  const [columnId, setColumnId] = useState<string>('');
  const [isRulesListingSideDrawerOpen, setIsRulesListingSideDrawerOpen] = useState(false);
  const [rowPropertiesData, setRowPropertiesData] = useState<MapAny>();
  const [exportsDatasetQuery, setExportsDatasetQuery] = useState<string>('');

  const { data: actionStatus = [] } = useGetActionStatusQuery({
    datasetId: id as string,
    params: {
      status: DATASET_ACTION_STATUS.INITIATED,
    },
  });

  const { startPolling } = usePolling();
  const [refetchColumnList, setRefetchColumnList] = useState<number>(0);

  const [getDatasetData, { data }] = useLazyGetDatasetDataQuery();

  const {
    dispatch,
    state: { selectedFilters, filtersConfig },
  } = useFiltersContextStore();

  const serverSideDatasource: IServerSideDatasource = useMemo(() => {
    return {
      getRows: (parameters: IServerSideGetRowsParams): void => {
        setExportsDatasetQuery(getEncodedRequest(parameters.request));
        getDatasetData({
          datasetId: id as string,
          query_config: getEncodedRequest(parameters.request),
        })
          .unwrap()
          .then((data) => {
            if (parameters.request.startRow === 0) {
              setTotalRows(data.total_count);
              dispatch({
                type: filtersContextActions.SET_TOTAL_ROWS,
                payload: { totalRows: data.total_count },
              });
            }
            parameters.success({
              rowData: data.rows,
              ...(parameters.request.startRow === 0 ? { rowCount: data.total_count } : {}),
            });
          })
          .catch(() => {
            parameters.fail();
          });
      },
    };
  }, [getDatasetData, id]);

  const router = useRouter();
  const tableRef = useRef<AgGridReact>(null);

  const handleColumnVisible = () => {
    setRefetchColumnList((prev) => prev + 1);
  };

  const handleSuccessfullUpdate = (data: DatasetUpdateResponseType) => {
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
      .then(handleSuccessfullUpdate);
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
        actionStatus?.length > 0 || isPolling,
        id as string,
        handleSuccessfullUpdate,
        tableRef,
        handleRulesListingSideDrawerOpen,
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
            payload: { selectedFilters: JSON.parse(filters) ?? {} },
          });
      }
    }
  }, [filterConfig, actionStatus, isPolling, filters, id]);

  useEffect(() => {
    tableRef.current?.api?.setFilterModel(selectedFilters);
  }, [selectedFilters]);

  return (
    <>
      <CommonWrapper className='h-full' isLoading={isLoading} isError={isError} refetchFunction={refetchFilterConfig}>
        <div className='flex items-center justify-between pr-4'>
          <div className='flex items-center py-3'>
            <FiltersWrapper label='Filter' filterConfig={filtersConfig ?? []} />
          </div>
          <div className='flex items-center gap-2.5'>
            <ExportDataset query={exportsDatasetQuery} datasetId={id as string} />
            <DisplayOptions tableRef={tableRef} refetchColumnList={refetchColumnList} datasetId={id as string} />
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
            {...(data?.config?.is_drilldown_enabled ? { onDrilldownClick: handleDrilldownClick } : {})}
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
          isDrillDownEnabled={data?.config?.is_drilldown_enabled}
          columns={columns}
        />
      )}
    </>
  );
};

export default withFiltersContext(DatasetById);
