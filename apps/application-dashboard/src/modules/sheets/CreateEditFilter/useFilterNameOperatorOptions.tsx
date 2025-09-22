import { useMemo } from 'react';
import { DATA_TYPE_TO_FILTER_TYPE } from 'modules/sheets/CreateEditFilter/constants';
import { useCreateEditFilterContext } from 'modules/sheets/CreateEditFilter/context';
import { useSearchParams } from 'next/navigation';
import { FILTER_TYPES } from '@/components/filter/filter.types';
import { getFilterValueForKey } from '@/components/filter/filter.utils';
import { useFiltersContextStore } from '@/components/filter/filters.context';

const useFilterNameOperatorOptions = () => {
  const searchParams = useSearchParams();

  const isFilterOpen = searchParams?.get('isFilterOpen') === 'true';

  const { formData, isSearchFilter } = useCreateEditFilterContext();

  const {
    state: { selectedFilters, filtersConfig },
  } = useFiltersContextStore();

  const filterType = useMemo(
    () => (isSearchFilter ? FILTER_TYPES.SEARCH : DATA_TYPE_TO_FILTER_TYPE[formData?.datatype]),
    [formData?.datatype, isSearchFilter],
  );

  const filterTitle = useMemo(() => {
    return getFilterValueForKey(
      'columnId',
      filtersConfig?.[0] ? [{ ...filtersConfig?.[0], type: filterType }] : [],
      selectedFilters,
    )?.title;
  }, [filtersConfig, selectedFilters, filterType]);

  const isDisabled = useMemo(
    () =>
      formData?.columnAndDatasetList?.length === 0 ||
      formData?.columnAndDatasetList?.every((item) => item?.columns?.length === 0),
    [formData?.columnAndDatasetList],
  );

  return {
    filterType,
    filterTitle,
    isDisabled,
    filterName: formData.name,
    isFilterOpen,
  };
};

export default useFilterNameOperatorOptions;
