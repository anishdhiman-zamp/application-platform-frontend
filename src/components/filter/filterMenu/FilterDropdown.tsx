import React, { FC, useRef, useState } from 'react';
import { useOnClickOutside } from 'hooks';
import { MapAny } from 'types/commonTypes';
import { cn } from 'utils/common';
import { FILTER_TYPES, FilterConfigType } from 'components/filter/filter.types';
import FilterControl from 'components/filter/filterMenu/FilterDropdownControl';
import FilterDropdownMenu from 'components/filter/filterMenu/FilterDropdownMenu';

interface FilterDropdownProps {
  index: number;
  filter: FilterConfigType;
  onRemoveFilter?: ((filterKey: string) => void) | null;
  isFilterSelected: boolean;
  props?: MapAny;
  controlClassName?: string;
  allowClear?: boolean;
  allowActions: boolean;
}

const FilterDropdown: FC<FilterDropdownProps> = ({
  index,
  filter,
  onRemoveFilter,
  isFilterSelected,
  props = {},
  controlClassName = '',
  allowClear = true,
  allowActions = true
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(!isFilterSelected && allowActions);
  const controlRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(
    menuRef,
    () => {
      setIsOpen(false);
    },
    [controlRef]
  );

  const onClick = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <div key={index} className='relative w-fit'>
      <div ref={controlRef}>
        <FilterControl
          filterConfig={filter}
          key={index}
          isMenuDropdownOpen={false}
          onClick={onClick}
          onClear={onRemoveFilter}
          controlClassName={controlClassName}
          allowClear={allowClear}
        />
      </div>
      <div
        ref={menuRef}
        className={cn(`absolute top-7 w-fit shadow-dropdown transition-all duration-500 ${isOpen ? '' : 'max-h-0 overflow-hidden border-0'}`, controlClassName)}
      >
        <FilterDropdownMenu
          forView='filters'
          filterKey={filter?.key}
          filterType={filter?.type as FILTER_TYPES}
          label={filter?.label}
          className='min-w-[200px] w-full'
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          allowClear={allowClear}
          {...props}
        />
      </div>
    </div>
  );
};

export default FilterDropdown;
