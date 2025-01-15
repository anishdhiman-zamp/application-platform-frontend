import React, { useEffect, useState } from 'react';
import { useGetDatasetDataQuery, useGetDatasetFilterConfigQuery } from 'apis/dataset';
import { DatasetFilterConfigResponseType } from 'types/api/dataset.types';
import Table from 'components/common/table';
import FiltersWrapper from 'components/filter/filterMenu/FiltersWrapper';
import { AG_GRID_FILTER_TYPES } from 'components/filter/filters.constants';
import { filtersContextActions, useFiltersContextStore, withFiltersContext } from 'components/filter/filters.context';


const DataHome = () => {
  const { dispatch, state: { filtersConfig } } = useFiltersContextStore();

  const { data: filterConfig } = useGetDatasetFilterConfigQuery({ datasetId: '10d8e092-ea1c-4e20-a1b4-a364201f9c99' });
  const { data: datasetData } = useGetDatasetDataQuery({ datasetId: '10d8e092-ea1c-4e20-a1b4-a364201f9c99', queryConfig: JSON.stringify({ "filters": null, "aggregations": [], "groupBy": [], "orderBy": [], "getTotalRecords": true, "pagination": { "page": 1, "pageSize": 100 } }) });
  const [columns, setColumns] = useState<any[]>([]);

  useEffect(() => {
    if (filterConfig?.length) {
      const columns = filterConfig?.map((column: DatasetFilterConfigResponseType) => ({
        field: column.column,
        filter: AG_GRID_FILTER_TYPES[column.type as keyof typeof AG_GRID_FILTER_TYPES] ?? '',
        filterParams: {
          values: column.options
        },
        flex: 1
      }));

      if (columns.length > 0) {
        setColumns(columns);
        dispatch({
          type: filtersContextActions.SET_FILTERS_CONFIG,
          payload: {
            filtersConfig: filterConfig.map((column) => ({ key: column.column, label: column.column, values: column.options, type: column.type }))
          }
        });
      }
    }
  }, [filterConfig]);




  return (
    <div className='h-full'>
      <div className='flex items-center py-3'>
        <FiltersWrapper
          label='Filter'
          allowActions={true}
          filterConfig={filtersConfig ?? []}
        />
      </div>
      <div className='z-10 w-full h-full' >
        <Table rows={datasetData?.rows ?? []} columns={columns} />
      </div>
    </div>
  );;
};

export default withFiltersContext(DataHome);
