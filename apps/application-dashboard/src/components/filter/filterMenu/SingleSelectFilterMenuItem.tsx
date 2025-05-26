import React, { FC, ReactNode } from 'react';
import { MapAny } from 'types/commonTypes';
import { FILTER_TYPES } from 'components/filter/filter.types';
import SingleSelectFilter from 'components/filter/filterMenu/components/SingleSelectFilter';
import { filtersContextActions, useFiltersContextStore } from 'components/filter/filters.context';

interface SingleSelectFilterMenuItemProps {
  column: { colId: string };
  values: string[];
  className?: string;
  LabelComponent?: (item: string) => ReactNode;
  allowClear?: boolean;
  allowSearch?: boolean;
  onFilterChange?: (value: string[], filterType?: FILTER_TYPES) => void;
  debounceTime?: number;
  isOpen?: boolean;
  updateContextOnChange?: boolean;
  showColumnLabel?: boolean;
  isDisabled?: boolean;
}

const SingleSelectFilterMenuItem: FC<SingleSelectFilterMenuItemProps> = ({
  column,
  values,
  className,
  LabelComponent,
  allowClear = true,
  allowSearch = true,
  onFilterChange,
  debounceTime = 800,
  isOpen = false,
  updateContextOnChange = false,
  showColumnLabel = true,
  isDisabled = false,
}) => {
  const columnId = column?.colId;
  const {
    state: { selectedFilters },
    dispatch,
  } = useFiltersContextStore();

  const setFilter = (value: MapAny) => {
    if (onFilterChange && !updateContextOnChange) {
      onFilterChange(value[columnId]?.values || []);
    } else {
      if (onFilterChange) {
        onFilterChange(value[columnId]?.values || [], FILTER_TYPES.SINGLE_SELECT);
      }
      dispatch({
        type: filtersContextActions.SET_SELECTED_FILTERS,
        payload: {
          selectedFilters: value,
        },
      });
    }
  };

  return (
    <SingleSelectFilter
      filterKey={columnId}
      values={values}
      className={className}
      LabelComponent={LabelComponent}
      allowClear={allowClear}
      allowSearch={allowSearch}
      debounceTime={debounceTime}
      isOpen={isOpen}
      showColumnLabel={showColumnLabel}
      isDisabled={isDisabled}
      initialSelectedValue={selectedFilters[columnId]?.values?.[0] || ''}
      onChange={setFilter}
    />
  );
};

export default SingleSelectFilterMenuItem;
