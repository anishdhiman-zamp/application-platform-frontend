import React, { FC, ReactNode } from 'react';
import { MapAny, OptionsType } from 'types/commonTypes';
import { camelCaseToNormalText } from '@/utils/common';
import { MultiSelectFilterValue } from 'components/filter/filter.types';
import MultiSelectFilter from 'components/filter/filterMenu/components/MultiSelectFilter';
import { MULTI_SELECT_FILTER_OPTIONS } from 'components/filter/filters.constants';
import { filtersContextActions, useFiltersContextStore } from 'components/filter/filters.context';

interface MultiSelectFilterMenuItemProps {
  column: { colId: string };
  values: MultiSelectFilterValue[];
  className?: string;
  LabelComponent?: (item: MultiSelectFilterValue) => ReactNode;
  operatorOptions?: OptionsType[];
  isOpen?: boolean;
  showSelectAll?: boolean;
  label?: string;
  isDisabled?: boolean;
}

const MultiSelectFilterMenuItem: FC<MultiSelectFilterMenuItemProps> = ({
  column,
  values,
  className,
  LabelComponent,
  operatorOptions = MULTI_SELECT_FILTER_OPTIONS,
  isOpen = false,
  showSelectAll = false,
  label,
  isDisabled = false,
}) => {
  const columnId = column?.colId;
  const {
    state: { selectedFilters },
    dispatch,
  } = useFiltersContextStore();

  const currentOperator =
    operatorOptions.find((option) => option.value === selectedFilters[columnId]?.type) || operatorOptions[0];

  const setFilter = (value: MapAny) => {
    dispatch({
      type: filtersContextActions.SET_SELECTED_FILTERS,
      payload: {
        selectedFilters: value,
      },
    });
  };

  return (
    <MultiSelectFilter
      filterKey={columnId}
      values={values}
      className={className}
      LabelComponent={LabelComponent}
      operatorOptions={operatorOptions}
      isOpen={isOpen}
      showSelectAll={showSelectAll}
      label={label || camelCaseToNormalText(columnId)}
      isDisabled={isDisabled}
      initialSelectedValues={selectedFilters[columnId]?.values || []}
      initialOperator={currentOperator}
      onChange={setFilter}
    />
  );
};

export default MultiSelectFilterMenuItem;
