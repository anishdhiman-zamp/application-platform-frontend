import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ColDef, IServerSideDatasource, IServerSideGetRowsParams, RowClickedEvent } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { useGetDatasetFilterConfigQuery, useLazyGetDatasetDataQuery } from 'apis/dataset';
import { ROUTES_PATH } from 'constants/routeConfig';
import { formatColumns } from 'modules/data/data.utils';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/router';
import DatasetTable from 'components/common/table/DatasetTable';
import { getEncodedRequest } from 'components/common/table/table.utils';
import FiltersWrapper from 'components/filter/filterMenu/FiltersWrapper';
import { filtersContextActions, useFiltersContextStore, withFiltersContext } from 'components/filter/filters.context';

const DatasetById = () => {
  const { id } = useParams();

  const { data: filterConfig } = useGetDatasetFilterConfigQuery({ datasetId: id });
  const [columns, setColumns] = useState<ColDef[]>([]);
  const [columnDataTypeMapping, setColumnDataTypeMapping] = useState<Record<string, string>>({});
  const [totalRows, setTotalRows] = useState<number>(0);

  const [getDatasetData, { data }] = useLazyGetDatasetDataQuery();

  const {
    dispatch,
    state: { selectedFilters, filtersConfig },
  } = useFiltersContextStore();

  useEffect(() => {
    if (filterConfig?.length) {
      const { columns, columnDataTypeMapping } = formatColumns(filterConfig);

      if (columns.length > 0) {
        setColumns(columns);
        setColumnDataTypeMapping(columnDataTypeMapping);
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
          queryConfig: getEncodedRequest(parameters.request, columnDataTypeMapping),
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
  }, [getDatasetData, columnDataTypeMapping]);

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
        <DatasetTable
          tableRef={tableRef}
          columns={columns}
          serverSideDatasource={serverSideDatasource}
          columnConfig={{ enableRowGroup: true, enableValue: true }}
          totalRows={totalRows}
          {...(data?.config?.isDrilldownEnabled ? { onRowClicked } : {})}
        />
      </div>
    </div>
  );
};

export default withFiltersContext(DatasetById);
