import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ColDef, IServerSideDatasource, IServerSideGetRowsParams, RowClickedEvent } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { useGetDatasetFilterConfigQuery, useLazyGetDatasetDataQuery } from 'apis/dataset';
import { ROUTES_PATH } from 'constants/routeConfig';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/router';
import { DatasetFilterConfigResponseType } from 'types/api/dataset.types';
import Table from 'components/common/table';
import { getEncodedRequest } from 'components/common/table/utils';
import FiltersWrapper from 'components/filter/filterMenu/FiltersWrapper';
import { AG_GRID_FILTER_TYPES } from 'components/filter/filters.constants';
import { filtersContextActions, useFiltersContextStore, withFiltersContext } from 'components/filter/filters.context';

const DatasetById = () => {
  const { id } = useParams();

  const { data: filterConfig } = useGetDatasetFilterConfigQuery({ datasetId: id });
  const [columns, setColumns] = useState<ColDef[]>([]);

  const [getDatasetData, { data }] = useLazyGetDatasetDataQuery();

  const {
    dispatch,
    state: { selectedFilters, filtersConfig },
  } = useFiltersContextStore();

  useEffect(() => {
    if (filterConfig?.length) {
      const columns = filterConfig?.map((column: DatasetFilterConfigResponseType) => ({
        field: column.column,
        filter: AG_GRID_FILTER_TYPES[column.type as keyof typeof AG_GRID_FILTER_TYPES] ?? '',
        filterParams: {
          values: column.options,
        },
        flex: 1,
      }));

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
      }
    }
  }, [filterConfig]);

  const serverSideDatasource: IServerSideDatasource = useMemo(() => {
    return {
      getRows: (parameters: IServerSideGetRowsParams): void => {
        getDatasetData({
          datasetId: id as string,
          queryConfig: getEncodedRequest(parameters.request),
        })
          .unwrap()
          .then((data) => {
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

  const onRowClicked = (event: RowClickedEvent) => {
    router.push(
      ROUTES_PATH.DRILLDOWN.replace(':datasetId', id as string).replace(':rowId', event.data?.rowId as string),
    );
  };

  return (
    <div className='h-full'>
      <div className='flex items-center py-3'>
        <FiltersWrapper label='Filter' allowActions={true} filterConfig={filtersConfig ?? []} />
      </div>
      <div className='z-10 w-full h-full'>
        <Table
          tableRef={tableRef}
          columns={columns}
          serverSideDatasource={serverSideDatasource}
          columnConfig={{ enableRowGroup: true, enableValue: true }}
          {...(data?.config?.isDrilldownEnabled ? { onRowClicked } : {})}
        />
      </div>
    </div>
  );
};

export default withFiltersContext(DatasetById);
