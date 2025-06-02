import React, { FC } from 'react';
import { MapAny } from 'types/commonTypes';
import { camelCaseToNormalText } from 'utils/common';
import SearchFilter from 'components/filter/filterMenu/components/SearchFilter';
import { SEARCH_FILTER_OPTIONS } from 'components/filter/filters.constants';
import { filtersContextActions, useFiltersContextStore } from 'components/filter/filters.context';

interface SearchFilterMenuItemProps {
  column: { colId: string };
  values: string[];
  className?: string;
  isOpen?: boolean;
  label?: string;
  showColumnLabel?: boolean;
  isDisabled?: boolean;
}

const SearchFilterMenuItem: FC<SearchFilterMenuItemProps> = ({
  column,
  className,
  isOpen = false,
  label,
  isDisabled = false,
}) => {
  const columnId = column?.colId;
  const {
    state: { selectedFilters },
    dispatch,
  } = useFiltersContextStore();

  const setFilter = (value: MapAny) => {
    dispatch({
      type: filtersContextActions.SET_SELECTED_FILTERS,
      payload: {
        selectedFilters: value,
      },
    });
  };

  return (
    <SearchFilter
      filterKey={columnId}
      className={className}
      isOpen={isOpen}
      label={label || camelCaseToNormalText(columnId)}
      isDisabled={isDisabled}
      initialSearchValue={selectedFilters[columnId]?.filter}
      initialOperator={SEARCH_FILTER_OPTIONS.find((option) => option.value === selectedFilters[columnId]?.type)}
      onChange={setFilter}
    />
  );
};

export default SearchFilterMenuItem;
