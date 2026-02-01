import { FC } from 'react';
import { MapAny } from 'types/commonTypes';
import { camelCaseToNormalText } from 'utils/common';
import { FILTER_TYPES } from 'components/filter/filter.types';
import SearchFilter from 'components/filter/filterMenu/components/SearchFilter';
import { DOCUMENT_SEARCH_FILTER_OPTIONS } from 'components/filter/filters.constants';
import { filtersContextActions, useFiltersContextStore } from 'components/filter/filters.context';

interface DocumentSearchFilterMenuItemType {
  column: {
    colId: string;
  };
  className?: string;
  isOpen?: boolean;
  label?: string;
  isDisabled?: boolean;
}

const DocumentSearchFilterMenuItem: FC<DocumentSearchFilterMenuItemType> = ({
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
      initialOperator={DOCUMENT_SEARCH_FILTER_OPTIONS.find(
        (option) => option.value === selectedFilters[columnId]?.type,
      )}
      operatorOptions={DOCUMENT_SEARCH_FILTER_OPTIONS}
      onChange={setFilter}
      filterType={FILTER_TYPES.DOCUMENT}
    />
  );
};

export default DocumentSearchFilterMenuItem;
