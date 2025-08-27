import { useEffect, useMemo } from 'react';
import { toast } from '@zamp-platform/ui';
import type { IServerSideGetRowsRequest } from 'ag-grid-community';
import { useWidgetCreationContext } from 'modules/widgets/create/context/WidgetCreationContext';
import { useLazyGetDatasetDataQuery } from '@/apis/dataset';
import { PAGE_SIZE } from '@/components/common/table/table.constants';
import { getFilterModelFromGroupAndFilterModel } from '@/components/common/table/table.utils';
import { useFiltersContextStore } from '@/components/filter/filters.context';

const useMockData = () => {
  const [getDatasetData, { isFetching }] = useLazyGetDatasetDataQuery();

  const { formData, setMockData } = useWidgetCreationContext();

  const {
    state: { selectedFilters },
  } = useFiltersContextStore();

  const queryConfig = useMemo(() => {
    return JSON.stringify({
      pagination: {
        page: 1,
        page_size: PAGE_SIZE,
      },
      filters: getFilterModelFromGroupAndFilterModel({ filterModel: selectedFilters } as IServerSideGetRowsRequest),
    });
  }, [selectedFilters]);

  const fetchMockData = () => {
    if (!formData.datasetId) return;

    getDatasetData({
      datasetId: formData.datasetId,
      query_config: queryConfig,
    })
      .unwrap()
      .then((res) => {
        setMockData(res?.data?.rows);
      })
      .catch(() => {
        toast.error('Failed to fetch preview data');
      });
  };

  useEffect(() => {
    fetchMockData();
  }, [formData.datasetId, queryConfig]);

  return isFetching;
};

export default useMockData;
