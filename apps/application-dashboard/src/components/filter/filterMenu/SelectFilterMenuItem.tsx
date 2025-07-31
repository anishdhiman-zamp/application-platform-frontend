import { RefObject, useEffect, useMemo, useRef, useState } from 'react';
import { ICON_SPRITE_TYPES } from '@zamp-platform/ui/types';
import { POSITION_TYPES } from 'types/common/components';
import { cn, snakeCaseToSentenceCase } from 'utils/common';
import Input from 'components/common/input';
import { FilterConfigType } from 'components/filter/filter.types';

interface SelectFilterMenuItemProps {
  menuRef: RefObject<HTMLDivElement | null>;
  isOpen: boolean;
  getMenuPlacement: () => string;
  filtersConfig: FilterConfigType[];
  onAddFilter: (filter: string) => void;
  currentPageFilters: string[];
}

const SelectFilterMenuItem = ({
  menuRef,
  isOpen,
  getMenuPlacement,
  filtersConfig,
  onAddFilter,
  currentPageFilters,
}: SelectFilterMenuItemProps) => {
  const checkIfFilterIsSelected = (filterKey: string) => currentPageFilters?.includes(filterKey);
  const [search, setSearch] = useState('');
  const [menuWidth, setMenuWidth] = useState(0);
  const searchRef = useRef<HTMLInputElement>(null);
  const filteredMenuItems = useMemo(
    () => filtersConfig?.filter((filter) => filter?.label?.toLowerCase()?.includes(search?.toLowerCase())),
    [filtersConfig, search],
  );

  useEffect(() => {
    if (isOpen) {
      if (menuRef?.current) setMenuWidth(menuRef.current.offsetWidth);
      searchRef.current?.focus();
      menuRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setSearch('');
    }
  }, [isOpen]);

  return (
    <div
      ref={menuRef}
      style={{ minWidth: menuWidth }}
      className={cn(
        `shadow-table-filter-menu absolute top-full left-0 z-1000 mt-1 min-w-[300px] rounded-md border bg-white`,
        isOpen ? 'max-h-[500px] overflow-auto [&::-webkit-scrollbar]:hidden' : 'max-h-0 overflow-hidden border-0',
        getMenuPlacement() === POSITION_TYPES.LEFT ? '-right-full -translate-x-full' : '',
      )}
    >
      <Input
        autoFocus
        inputRef={searchRef}
        placeholder='Search...'
        className='sticky top-0 z-10 bg-white'
        inputClassName=' border-none w-full focus:outline-hidden focus:border-none focus:shadow-none'
        value={search}
        trailingIconProps={
          search
            ? {
                id: 'x',
                iconCategory: ICON_SPRITE_TYPES.GENERAL,
                onClick: () => setSearch(''),
              }
            : undefined
        }
        onChange={(e) => {
          if (e?.target?.value !== undefined) {
            setSearch(e.target.value);
          }
        }}
      />
      <div className='px-2.5'>
        {filteredMenuItems?.length > 0 ? (
          filteredMenuItems?.map((filter, index) => (
            <div
              key={index}
              data-testid={`filter-menu-item-${filter?.key}`}
              className={cn(
                `flex w-full items-center rounded p-2`,
                checkIfFilterIsSelected(filter?.key) ? 'cursor-default opacity-30' : 'hover:bg-GRAY_70 cursor-pointer',
              )}
              onClick={() => !checkIfFilterIsSelected(filter?.key) && onAddFilter(filter?.key)}
            >
              <div className='f-12-450 text-GRAY_1000 whitespace-nowrap'>{snakeCaseToSentenceCase(filter?.label)}</div>
            </div>
          ))
        ) : (
          <div className='f-12-450 text-GRAY_700 flex items-center justify-center p-2'>No results found</div>
        )}
      </div>
    </div>
  );
};

export default SelectFilterMenuItem;
