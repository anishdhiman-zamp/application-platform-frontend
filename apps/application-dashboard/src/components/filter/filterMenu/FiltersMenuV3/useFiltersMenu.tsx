import { ChangeEvent, MouseEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FilterConfigType } from 'components/filter/filter.types';
import { getFilterValueForKey } from 'components/filter/filter.utils';
import { NON_CONFIGURABLE_CURRENCY_FILTER_KEY } from 'components/filter/filterMenu/FiltersMenuV3/constants';
import { hasNoFiltersExceptCurrency } from 'components/filter/filterMenu/FiltersMenuV3/utils';
import { FILTER_KEYS } from 'components/filter/filters.constants';
import { filtersContextActions, useFiltersContextStore } from 'components/filter/filters.context';

export const useFiltersMenu = () => {
  const {
    dispatch,
    state: { selectedFilters, filtersConfig, allSelectedFilters, datasetIdAndWidgetsMapping },
  } = useFiltersContextStore();

  const router = useRouter();

  const [search, setSearch] = useState('');
  const [searchedFilters, setSearchedFilters] = useState<
    {
      key: string;
      value?: FilterConfigType;
    }[]
  >([]);
  const [openFiltersMenu, setOpenFiltersMenu] = useState(false);
  const [pendingFilterKey, setPendingFilterKey] = useState<string | null>(null);

  const filters = useMemo(() => {
    const filters = [];

    for (const key in allSelectedFilters) {
      if (key === NON_CONFIGURABLE_CURRENCY_FILTER_KEY || (selectedFilters && Object.hasOwn(selectedFilters, key)))
        continue;

      const value = getFilterValueForKey(key as FILTER_KEYS, filtersConfig ?? [], allSelectedFilters);

      filters.push({
        key,
        value,
      });
    }

    return filters;
  }, [selectedFilters, filtersConfig, allSelectedFilters]);

  const hasNoSelectedFilters = useMemo(() => hasNoFiltersExceptCurrency(selectedFilters), [selectedFilters]);

  const hasNoFilters = useMemo(() => hasNoFiltersExceptCurrency(allSelectedFilters), [allSelectedFilters]);

  const filterQueryParams = useMemo(() => {
    return {
      isFilterOpen: 'true',
      datasetIdAndWidgetsMapping: JSON.stringify(datasetIdAndWidgetsMapping),
    };
  }, [datasetIdAndWidgetsMapping]);

  const handleAddFilter = (filterKey: string) => {
    // Set the pending filter and close the menu - React will batch these updates
    setPendingFilterKey(filterKey);
    setOpenFiltersMenu(false);
  };

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    setSearch(value);
    setSearchedFilters(filters.filter((filter) => filter.value?.label?.toLowerCase()?.startsWith(value.toLowerCase())));
  };

  const handleOpenFilter = () => {
    router.push(`?${new URLSearchParams(filterQueryParams).toString()}`);
    setOpenFiltersMenu(false);
  };

  const handleConfigureFilter = (e: MouseEvent<HTMLButtonElement>, filterId: string) => {
    e.stopPropagation();
    router.push(`?${new URLSearchParams(filterQueryParams).toString()}&filterId=${filterId}`);
    setOpenFiltersMenu(false);
  };

  useEffect(() => {
    setSearchedFilters(filters);
  }, [filters]);

  // Handle pending filter addition when menu closes
  useEffect(() => {
    if (!openFiltersMenu && pendingFilterKey) {
      dispatch({
        type: filtersContextActions.SET_SELECTED_FILTERS,
        payload: {
          selectedFilters: { [pendingFilterKey]: { ...allSelectedFilters[pendingFilterKey], isHighlighted: true } },
        },
      });
      setPendingFilterKey(null);
    } else if (openFiltersMenu && pendingFilterKey) {
      // Clear pending filter if menu opens again (user cancelled previous action)
      setPendingFilterKey(null);
    }
  }, [openFiltersMenu, pendingFilterKey, dispatch, allSelectedFilters]);

  return {
    searchedFilters,
    handleAddFilter,
    handleSearch,
    search,
    handleOpenFilter,
    selectedFilters,
    hasNoSelectedFilters,
    openFiltersMenu,
    setOpenFiltersMenu,
    handleConfigureFilter,
    hasNoFilters,
  };
};
