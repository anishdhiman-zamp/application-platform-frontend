import { FC } from 'react';
import { filtersContextActions, useFiltersContextStore } from '@/components/filter/filters.context';
import { defaultFnType, MapAny } from '@/types/commonTypes';
import { camelCaseToNormalText } from '@/utils/common';
import MultiSearchFilter from 'components/filter/filterMenu/components/MultiSearchFilter';

interface MultiSearchFilterMenuItemProps {
  column: { colId: string };
  handleClose?: defaultFnType;
  id?: string;
  isOpen?: boolean;
  forView?: string;
  label?: string;
  placeholder?: string;
  className?: string;
  showColumnLabel?: boolean;
  isDisabled?: boolean;
}

const MultiSearchFilterMenuItem: FC<MultiSearchFilterMenuItemProps> = ({
  column,
  isOpen,
  forView = 'table_header',
  className = '',
  label,
  placeholder,
  handleClose,
  isDisabled = false,
}) => {
  const columnId = column?.colId;
  const {
    state: { selectedFilters },
    dispatch,
  } = useFiltersContextStore();

  const ArraySearchFilter = selectedFilters[columnId];

  const setFilter = (value: MapAny) => {
    dispatch({
      type: filtersContextActions.SET_SELECTED_FILTERS,
      payload: {
        selectedFilters: value,
      },
    });
  };

  return (
    <MultiSearchFilter
      filterKey={columnId}
      isOpen={isOpen}
      forView={forView}
      className={className}
      label={label || camelCaseToNormalText(columnId)}
      placeholder={placeholder}
      initialOperator={ArraySearchFilter?.operator}
      initialSearchTags={ArraySearchFilter?.descriptionTags ?? []}
      initialInputValue={ArraySearchFilter?.values ?? ''}
      onChange={setFilter}
      handleClose={handleClose}
      isDisabled={isDisabled}
    />
  );
};

export default MultiSearchFilterMenuItem;
