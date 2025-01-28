import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  CellDoubleClickedEvent,
  CellEditRequestEvent,
  ColDef,
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
import usePolling from 'hooks/usePolling';
import { DATASET_ACTION_STATUS } from 'modules/data/data.types';
import { formatColumns } from 'modules/data/data.utils';
import { useParams, useSearchParams } from 'next/navigation';
import { useRouter } from 'next/router';
import { DatasetActionStatusResponseType } from 'types/api/dataset.types';
import { LogicalOperatorType } from 'types/components/table.type';
import DatasetTable from 'components/common/table/DatasetTable';
import DisplayOptions from 'components/common/table/DisplayOptions';
import { getEncodedRequest } from 'components/common/table/table.utils';
import FiltersWrapper from 'components/filter/filterMenu/FiltersWrapper';
import { CONDITION_OPERATOR_TYPE } from 'components/filter/filters.constants';
import { filtersContextActions, useFiltersContextStore, withFiltersContext } from 'components/filter/filters.context';

const DatasetById = () => {
  const { id } = useParams();
  const filters = useSearchParams().get('filters');
  const { data: filterConfig, refetch: refetchFilterConfig } = useGetDatasetFilterConfigQuery({ datasetId: id });
  const [updateDatasetData] = useUpdateDatasetDataMutation();
  const [getActionStatus] = useLazyGetActionStatusQuery();
  const [columns, setColumns] = useState<ColDef[]>([]);
  const [isPolling, setIsPolling] = useState<boolean>(false);
  const [totalRows, setTotalRows] = useState<number>(0);
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

  useEffect(() => {
    if (filterConfig?.length) {
      const columns = formatColumns(filterConfig, actionStatus.length > 0 || isPolling);

      if (columns.length > 0) {
        setColumns(columns);
        dispatch({
          type: filtersContextActions.SET_FILTERS_CONFIG,
          payload: {
            filtersConfig: filterConfig.map((column) => ({
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
  }, [filterConfig, actionStatus, isPolling,filters]);

  const serverSideDatasource: IServerSideDatasource = useMemo(() => {
    return {
      getRows: (parameters: IServerSideGetRowsParams): void => {
        getDatasetData({
          datasetId: id as string,
          queryConfig: getEncodedRequest(parameters.request),
        })
          .unwrap()
          .then((data) => {
            if (parameters.request.startRow === 0) {
              setTotalRows(data.totalCount);
            }
            parameters.success({
              rowData: data.rows,
              ...(parameters.request.startRow === 0 ? { rowCount: data.totalCount } : {}),
            });
          })
          .catch(() => {
            parameters.fail();
          });
      },
    };
  }, [getDatasetData]);

  useEffect(() => {
    tableRef.current?.api?.setFilterModel(selectedFilters);
  }, [selectedFilters]);

  const router = useRouter();
  const tableRef = useRef<AgGridReact>(null);

  const onCellDoubleClicked = (event: CellDoubleClickedEvent) => {
    const { colDef } = event;

    if (!colDef?.cellRendererParams?.is_editable) {
      router.push(
        ROUTES_PATH.DRILLDOWN.replace(':datasetId', id as string).replace(':rowId', event.data?._zamp_id as string),
      );
    }
  };

  const handleColumnVisible = () => {
    setRefetchColumnList((prev) => prev + 1);
  };

  // TODO: Integrate with update API
  const onCellEditRequest = (event: CellEditRequestEvent) => {
    const { colDef, newValue, data } = event;
    const { field } = colDef;

    updateDatasetData({
      datasetId: id as string,
      data: {
        filters: {
          logicalOperator: LogicalOperatorType.OperatorLogicalAnd,
          conditions: [
            {
              column: '_zamp_id',
              value: data?._zamp_id,
              operator: CONDITION_OPERATOR_TYPE.EQUAL,
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
      .then((data) => {
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
      });
  };

  return (
    <div className='h-full'>
      <div className='flex items-center justify-between pr-4'>
        <div className='flex items-center py-3'>
          <FiltersWrapper label='Filter' allowActions={true} filterConfig={filtersConfig ?? []} />
        </div>
        <DisplayOptions tableRef={tableRef} refetchColumnList={refetchColumnList} />
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
          {...(data?.config?.isDrilldownEnabled ? { onCellDoubleClicked: onCellDoubleClicked } : {})}
        />
      </div>
    </div>
  );
};

export default withFiltersContext(DatasetById);
