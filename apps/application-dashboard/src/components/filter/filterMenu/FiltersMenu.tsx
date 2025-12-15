import React, { FC, useState } from 'react';
import { Popover, PopoverTrigger } from '@zamp-platform/ui';
import { SIDE_OPTIONS } from '@/types/commonTypes';
import { FilterConfigType } from 'components/filter/filter.types';
import FilterControlButton from 'components/filter/FilterControlButton';
import SelectFilterMenuItem from 'components/filter/filterMenu/SelectFilterMenuItem';
import { useFiltersContextStore } from 'components/filter/filters.context';

interface FiltersMenuProps {
  filtersList?: Record<string, FilterConfigType>;
  onAddFilter: (filterKey: string) => void;
  label?: string;
  tooltipText?: string;
  currentPageFilters?: string[];
  testIdSuffix?: string;
}

const FiltersMenu: FC<FiltersMenuProps> = ({ onAddFilter, label, tooltipText, currentPageFilters, testIdSuffix }) => {
  const {
    state: { filtersConfig },
  } = useFiltersContextStore();

  const [isOpen, setIsOpen] = useState<boolean>(false);

  const onAddfilter = (filterKey: string) => {
    onAddFilter(filterKey);
    setIsOpen(false);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <div className='relative'>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <div>
            <FilterControlButton
              onClick={() => setIsOpen((prev) => !prev)}
              tooltipPosition={SIDE_OPTIONS.TOP}
              tooltipText={tooltipText}
              id='add-filters'
              testIdSuffix={testIdSuffix}
            >
              {label}
            </FilterControlButton>
          </div>
        </PopoverTrigger>
        <SelectFilterMenuItem
          filtersConfig={filtersConfig ?? []}
          onAddFilter={onAddfilter}
          position='start'
          currentPageFilters={currentPageFilters ?? []}
          onClose={handleClose}
        />
      </Popover>
    </div>
  );
};

export default FiltersMenu;
