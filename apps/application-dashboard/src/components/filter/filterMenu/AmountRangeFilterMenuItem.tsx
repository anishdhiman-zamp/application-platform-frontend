import React, { FC } from 'react';
import { camelCaseToNormalText } from 'utils/common';
import { defaultFnType } from '@/types/commonTypes';
import { AmountRangeFilterValue } from 'components/filter/filter.types';
import AmountRangeFilter from 'components/filter/filterMenu/components/AmountRangeFilter';
import { AMOUNT_RANGE_FILTER_OPTIONS } from 'components/filter/filters.constants';
import { filtersContextActions, useFiltersContextStore } from 'components/filter/filters.context';

interface AmountRangeFilterMenuItemProps {
  column: { colId: string };
  className?: string;
  label?: string;
  isDisabled?: boolean;
  onConfigureFilter?: defaultFnType;
}

const AmountRangeFilterMenuItem: FC<AmountRangeFilterMenuItemProps> = ({
  column,
  className,
  label,
  isDisabled = false,
  onConfigureFilter,
}) => {
  const columnId = column?.colId;
  const {
    state: { selectedFilters },
    dispatch,
  } = useFiltersContextStore();

  const setFilter = (value: Record<string, AmountRangeFilterValue | object>) => {
    dispatch({
      type: filtersContextActions.SET_SELECTED_FILTERS,
      payload: {
        selectedFilters: value,
      },
    });
  };

  return (
    <AmountRangeFilter
      label={label || camelCaseToNormalText(columnId)}
      className={className}
      onChange={setFilter}
      initialStartValue={selectedFilters[columnId]?.filter}
      initialEndValue={selectedFilters[columnId]?.filterTo}
      initialOperator={AMOUNT_RANGE_FILTER_OPTIONS.find((option) => option.value === selectedFilters[columnId]?.type)}
      filterKey={columnId}
      isDisabled={isDisabled}
      onConfigureFilter={onConfigureFilter}
    />
  );
};

export default AmountRangeFilterMenuItem;
