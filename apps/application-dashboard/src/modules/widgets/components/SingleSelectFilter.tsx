import { FILTER_TYPES } from 'components/filter/filter.types';
import FilterDropdown from 'components/filter/filterMenu/FilterDropdown';

interface SingleSelectFilterProps {
  value: string[];
  filterKey: string;
  label: string;
  onFilterChange: (value: string[]) => void;
  options?: string[];
  showColumnLabel?: boolean;
}

const SingleSelectFilter = ({
  value,
  filterKey,
  label,
  onFilterChange,
  options,
  showColumnLabel = true,
}: SingleSelectFilterProps) => {
  return (
    <FilterDropdown
      index={0}
      onFilterChange={onFilterChange}
      closeOnSelect={true}
      showColumnLabel={showColumnLabel}
      filter={{
        key: filterKey,
        title: value?.[0],
        label: label,
        values: value,
        type: FILTER_TYPES.SINGLE_SELECT,
        datatype: 'string',
        widgetsInScope: ['widget-1', 'widget-2'],
        targets: [],
      }}
      props={{
        filterComponentProps: {
          values: options,
          allowClear: false,
          allowSearch: true,
          debounceTime: 0,
        },
      }}
      allowActions={false}
      isFilterSelected={false}
      controlClassName='w-full'
      allowClear={false}
      isPeriodicityEnabled={false}
    />
  );
};

export default SingleSelectFilter;
