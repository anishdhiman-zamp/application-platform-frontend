import { Popover, PopoverContent, PopoverTrigger } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import useFilterNameOperatorOptions from 'modules/sheets/CreateEditFilter/useFilterNameOperatorOptions';
import TooltipV2 from '@/components/common/TooltipV2';
import FilterDropdownMenu from '@/components/filter/filterMenu/FilterDropdownMenu';

const FilterNameOperatorOptions = () => {
  const { filterType, filterTitle, isDisabled, filterName, isFilterOpen } = useFilterNameOperatorOptions();

  return (
    <Popover>
      <TooltipV2
        tooltipBody={'Select dataset and columns first'}
        className='m-5'
        isDisabledBody={!isDisabled || !isFilterOpen}
        asChildTrigger
      >
        <PopoverTrigger
          className='w-64 cursor-pointer'
          disabled={isDisabled}
          data-testid='filter-name-operator-options-trigger'
        >
          <div className='f-13-450 flex items-center gap-1.5 rounded border border-dashed border-blue-300 px-2 py-1.5'>
            <span
              className={cn('truncate whitespace-nowrap text-gray-900', { 'max-w-18': !!filterTitle })}
              title={filterName}
            >
              {filterName}
            </span>
            <span className='max-w-40 truncate whitespace-nowrap' title={filterTitle}>
              {filterTitle}
            </span>
          </div>
        </PopoverTrigger>
      </TooltipV2>
      <PopoverContent side='left' sideOffset={30} align='start' className='border-none p-0'>
        <FilterDropdownMenu
          forView='filters'
          filterKey='columnId'
          filterType={filterType}
          label={filterName}
          isOpen
          showColumnLabel
        />
      </PopoverContent>
    </Popover>
  );
};

export default FilterNameOperatorOptions;
