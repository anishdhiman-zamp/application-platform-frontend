import React, { FC } from 'react';
import { defaultFnType, MapAny, OptionsType } from 'types/commonTypes';
import { FILTER_TYPES, FilterConfigType } from 'components/filter/filter.types';
import { AG_GRID_FILTER_TYPES } from 'components/filter/filters.constants';
import { useFiltersContextStore } from 'components/filter/filters.context';

interface FilterDropdownMenuProps {
  className?: string;
  filterKey: string;
  filterType: FILTER_TYPES;
  onClose?: defaultFnType;
  isOpen?: boolean;
  id?: string;
  onSelect?: defaultFnType;
  onChange?: defaultFnType;
  filter?: FilterConfigType;
  forView?: string;
  showSearch?: boolean;
  label?: string;
  allowClear?: boolean;
  filterComponentProps?: MapAny;
  disableFutureDate?: boolean;
  operatorOptions?: OptionsType[];
}

const FilterDropdownMenu: FC<FilterDropdownMenuProps> = ({
  filterKey,
  filterType,
  filterComponentProps = {},
}) => {
  const { state: { filtersConfig } } = useFiltersContextStore();

  const values = filtersConfig?.find((filter) => filter?.key === filterKey)?.values || [];

  const FilterMenuComponent = AG_GRID_FILTER_TYPES[filterType];

  return FilterMenuComponent ? (
    <FilterMenuComponent
      column={{ colId: filterKey }}
      values={values || []}
      key={filterKey}
      className='w-full'
      {...filterComponentProps}
    />
  ) : null;
};

export default FilterDropdownMenu;
