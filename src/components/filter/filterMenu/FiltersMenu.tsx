import React, { FC, useRef, useState } from 'react';
import { useOnClickOutside } from 'hooks';
import { POSITION_TYPES } from 'types/common/components';
import { cn } from 'utils/common';
import { TooltipPositions } from 'components/common/tooltip';
import { FilterConfigType } from 'components/filter/filter.types';
import FilterControlButton from 'components/filter/FilterControlButton';
import { useFiltersContextStore } from 'components/filter/filters.context';

interface FiltersMenuProps {
  filtersList?: Record<string, FilterConfigType>;
  onAddFilter: (filterKey: string) => void;
  label?: string;
  tooltipText?: string;
  currentPageFilters?: string[];
}

const FiltersMenu: FC<FiltersMenuProps> = ({
  onAddFilter,
  label,
  tooltipText,
  currentPageFilters,
}) => {
  const { state: { filtersConfig } } = useFiltersContextStore();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const controlRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(
    menuRef,
    () => {
      setIsOpen(false);
    },
    [controlRef]
  );

  const toggleMenu = () => {
    setIsOpen((prev) => !prev);
  };

  const getMenuPlacement = () => {
    if (menuRef.current) {
      const { left } = menuRef.current.getBoundingClientRect();
      const isMenuCutOff = left + 200 > window.innerWidth;

      return isMenuCutOff ? POSITION_TYPES.LEFT : POSITION_TYPES.RIGHT;
    }

    return POSITION_TYPES.RIGHT;
  };

  const onAddfilter = (filterKey: string) => {
    onAddFilter(filterKey);
    toggleMenu();
  };

  const checkIfFilterIsSelected = (filterKey: string) => currentPageFilters?.includes(filterKey);

  return (
    <div className='relative'>
      <div ref={controlRef}>
        <FilterControlButton
          onClick={toggleMenu}
          tooltipPosition={TooltipPositions.TOP}
          tooltipText={tooltipText}
          id='add-filters'
        >
          {label}
        </FilterControlButton>
      </div>
      <div
        ref={menuRef}
        className={cn(
          `absolute top-10 left-0 px-2.5 z-1000 shadow-tableFilterMenu border transition-all duration-100 bg-white`,
          isOpen ? 'max-h-[500px] overflow-auto' : 'max-h-0 overflow-hidden border-0',
          getMenuPlacement() === POSITION_TYPES.LEFT ? '-right-full -translate-x-full' : ''
        )}
      >
        <div className=' text-GRAY_500 f-13-500 px-4 py-2'>Filter by</div>
        {filtersConfig?.map((filter, index) => (
          <div
            key={index}
            data-testid={`filter-menu-item-${filter?.key}`}
            className={cn(
              ` flex px-4 py-3 items-center rounded hover:bg-GRAY_70 w-full`,
              checkIfFilterIsSelected(filter?.key) ? ' cursor-default opacity-30' : 'cursor-pointer'
            )}
            onClick={() => !checkIfFilterIsSelected(filter?.key) && onAddfilter(filter?.key)}
          >
            <div className='f-12-400 text-GRAY_1000'>{filter.key}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FiltersMenu;
