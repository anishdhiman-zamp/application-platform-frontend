import { useMemo, useRef, useState } from 'react';
import { PopoverContent, PopoverPortal } from '@zamp-platform/ui';
import { ICON_SPRITE_TYPES } from '@zamp-platform/ui/types';
import { cn, snakeCaseToSentenceCase } from 'utils/common';
import Input from 'components/common/input';
import { FilterConfigType } from 'components/filter/filter.types';

interface SelectFilterMenuItemProps {
  filtersConfig: FilterConfigType[];
  onAddFilter: (filter: string) => void;
  currentPageFilters: string[];
  openClassName?: string;
  onClose?: () => void;
  position?: 'start' | 'end';
}

const SelectFilterMenuItem = ({
  filtersConfig,
  onAddFilter,
  currentPageFilters,
  openClassName,
  onClose,
  position = 'start',
}: SelectFilterMenuItemProps) => {
  const searchRef = useRef<HTMLInputElement>(null);
  const contentWrapperRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const [search, setSearch] = useState('');
  const [popoverWidth, setPopoverWidth] = useState<number | null>(null);

  const checkIfFilterIsSelected = (filterKey: string) => currentPageFilters?.includes(filterKey);

  const filteredMenuItems = useMemo(
    () => filtersConfig?.filter((filter) => filter?.label?.toLowerCase()?.includes(search?.toLowerCase())),
    [filtersConfig, search],
  );

  const handleClose = () => {
    setSearch('');
    setPopoverWidth(null); // Reset width when closing
    onClose?.();
  };

  // Measure and set popover width
  const measurePopoverWidth = () => {
    if (contentWrapperRef.current) {
      const width = contentWrapperRef.current.offsetWidth;

      if (width >= 150) {
        setPopoverWidth(width);
      } else {
        setPopoverWidth(150);
      }
    }
  };

  return (
    <PopoverPortal>
      <PopoverContent
        ref={menuRef}
        align={position}
        side='bottom'
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          setTimeout(() => {
            // setMenuAlign(getMenuPlacement());
            searchRef.current?.focus();
            setTimeout(() => {
              measurePopoverWidth();
            }, 10);
          }, 0);
        }}
        onCloseAutoFocus={(e) => {
          e.preventDefault();
          handleClose();
        }}
        className={cn(
          'shadow-table-filter-menu !border-GRAY_400 overflow-hidden rounded-md border bg-white p-0',
          openClassName || 'max-h-[500px]',
        )}
        style={{
          minWidth: '150px',
          width: popoverWidth ? `${popoverWidth}px` : undefined,
        }}
      >
        <div
          ref={contentWrapperRef}
          className={cn('overflow-auto [&::-webkit-scrollbar]:hidden', openClassName || 'max-h-[500px]')}
        >
          <Input
            inputRef={searchRef}
            placeholder='Search...'
            className='sticky top-0 z-10 bg-white'
            inputClassName='border-none w-full focus:outline-hidden focus:border-none focus:shadow-none !p-2.5 !text-xs !placeholder-GRAY_500'
            value={search}
            trailingIconProps={
              search
                ? {
                    id: 'x',
                    iconCategory: ICON_SPRITE_TYPES.GENERAL,
                    onClick: () => {
                      setSearch('');
                      searchRef.current?.focus();
                    },
                  }
                : undefined
            }
            onChange={(e) => {
              if (e?.target?.value !== undefined) {
                setSearch(e.target.value);
              }
            }}
          />
          <div className='flex flex-col gap-1 px-2.5'>
            {filteredMenuItems?.length > 0 ? (
              filteredMenuItems?.map((filter, index) => (
                <div
                  key={index}
                  data-testid={`filter-menu-item-${filter?.key}`}
                  className={cn(
                    `flex w-full items-center rounded px-1 py-1.5`,
                    checkIfFilterIsSelected(filter?.key)
                      ? 'cursor-default opacity-30'
                      : 'hover:bg-GRAY_70 cursor-pointer',
                  )}
                  onClick={() => !checkIfFilterIsSelected(filter?.key) && onAddFilter(filter?.key)}
                >
                  <div className='f-12-450 text-GRAY_1000 whitespace-nowrap'>
                    {snakeCaseToSentenceCase(filter?.label)}
                  </div>
                </div>
              ))
            ) : (
              <div className='f-12-450 text-GRAY_500 flex items-center py-2'>No results found</div>
            )}
          </div>
        </div>
      </PopoverContent>
    </PopoverPortal>
  );
};

export default SelectFilterMenuItem;
