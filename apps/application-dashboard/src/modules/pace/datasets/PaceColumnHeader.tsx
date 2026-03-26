'use client';

import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CSS_VARS } from '@zamp-platform/ui';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { ColumnHeaderClickedEvent, IHeaderParams } from 'ag-grid-community';
import { cn } from 'utils/common';
import PositionedMenuWrapper from 'components/common/PositionedMenuWrapper';

type FilterOperator = 'contains' | 'notContains' | 'blank';

const FILTER_OPERATORS: { label: string; value: FilterOperator }[] = [
  { label: 'contains', value: 'contains' },
  { label: 'does not contain', value: 'notContains' },
  { label: 'is blank', value: 'blank' },
];

const MENU_OPTIONS = [
  { label: 'Sort Ascending', value: 'sort_asc', iconId: 'arrow-up' },
  { label: 'Sort Descending', value: 'sort_desc', iconId: 'arrow-down' },
  { label: 'Filter', value: 'filter', iconId: 'filter-lines' },
];

const PaceColumnHeader: FC<IHeaderParams> = (props) => {
  const { column, api, displayName } = props;
  const colId = column.getColId();

  const menuRef = useRef<HTMLDivElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [filterOperator, setFilterOperator] = useState<FilterOperator>('contains');
  const [filterValue, setFilterValue] = useState('');
  const [isOperatorOpen, setIsOperatorOpen] = useState(false);

  const sortState = column.getSort();
  const isFilterActive = column.isFilterActive();

  const updateMenuPosition = useCallback(() => {
    if (!menuRef.current) return;
    const rect = menuRef.current.getBoundingClientRect();
    const menuWidth = 240;
    const viewportWidth = window.innerWidth;
    const left = rect.left + menuWidth > viewportWidth ? rect.right - menuWidth : rect.left;

    setMenuPosition({ top: rect.bottom + window.scrollY, left });
  }, []);

  const handleClose = useCallback(() => {
    setIsMenuOpen(false);
    setIsFilterOpen(false);
    setIsOperatorOpen(false);
  }, []);

  const applyFilter = useCallback(
    (operator: FilterOperator, value: string) => {
      let model: Record<string, unknown> | null = null;

      if (operator === 'blank') {
        model = { filterType: 'text', type: 'blank' };
      } else if (value.trim()) {
        model = { filterType: 'text', type: operator, filter: value };
      }
      api.setColumnFilterModel(colId, model).then(() => {
        api.onFilterChanged();
      });
    },
    [api, colId],
  );

  const handleMenuOptionClick = useCallback(
    (option: string) => {
      switch (option) {
        case 'sort_asc':
          api.applyColumnState({ state: [{ colId, sort: 'asc' }] });
          handleClose();
          break;
        case 'sort_desc':
          api.applyColumnState({ state: [{ colId, sort: 'desc' }] });
          handleClose();
          break;
        case 'remove_sort':
          api.applyColumnState({ state: [{ colId, sort: null }] });
          handleClose();
          break;
        case 'filter':
          setIsMenuOpen(false);
          updateMenuPosition();
          setIsFilterOpen(true);
          break;
      }
    },
    [api, colId, handleClose, updateMenuPosition],
  );

  const menuOptions = useMemo(() => {
    const options = [...MENU_OPTIONS];

    if (sortState) {
      options.splice(2, 0, { label: 'Remove Sort', value: 'remove_sort', iconId: 'x-close' });
    }

    return options;
  }, [sortState]);

  const handleFilterOperatorChange = useCallback(
    (operator: FilterOperator) => {
      setFilterOperator(operator);
      setIsOperatorOpen(false);
      if (operator === 'blank') {
        setFilterValue('');
        applyFilter(operator, '');
      }
    },
    [applyFilter],
  );

  useEffect(() => {
    if (filterOperator === 'blank') return;
    const timer = setTimeout(() => {
      applyFilter(filterOperator, filterValue);
    }, 300);

    return () => clearTimeout(timer);
  }, [filterValue, filterOperator, applyFilter]);

  useEffect(() => {
    const handler = (event: ColumnHeaderClickedEvent) => {
      if (event.column?.getId() !== colId) return;
      updateMenuPosition();
      setIsMenuOpen((prev) => !prev);
      setIsFilterOpen(false);
    };

    api.addEventListener('columnHeaderClicked', handler);

    return () => {
      api.removeEventListener('columnHeaderClicked', handler);
    };
  }, [api, colId, updateMenuPosition]);

  return (
    <div ref={menuRef} className='relative -mx-4 h-full w-full flex-1'>
      <div
        className={cn(
          'hover:bg-BG_GRAY_1 group flex h-full w-full flex-1 cursor-pointer items-center justify-between overflow-hidden px-2 pt-5 pb-1',
          { 'bg-BG_GRAY_1': isMenuOpen || isFilterOpen },
        )}
      >
        <div className='flex flex-auto items-center gap-1 self-stretch truncate'>
          <span className='truncate'>{displayName}</span>
          {sortState === 'asc' && (
            <SvgSpriteLoader id='arrow-narrow-up' width={12} height={12} color={CSS_VARS.BLUE_700} />
          )}
          {sortState === 'desc' && (
            <SvgSpriteLoader id='arrow-narrow-down' width={12} height={12} color={CSS_VARS.BLUE_700} />
          )}
          {isFilterActive && <SvgSpriteLoader id='filter-lines' width={12} height={12} color={CSS_VARS.BLUE_700} />}
        </div>
        <SvgSpriteLoader id='chevron-down' width={12} height={12} className='ml-2.5' />
      </div>

      {isMenuOpen && (
        <PositionedMenuWrapper
          id='pace-column-menu'
          className='bg-BG_WHITE w-52 p-1'
          childrenWrapperClassName='overflow-auto!'
          menuPosition={menuPosition}
          onClose={handleClose}
        >
          {menuOptions.map((option) => (
            <div
              key={option.value}
              className='hover:bg-GRAY_100 flex cursor-pointer items-center gap-1.5 rounded-md px-2.5 py-2'
              onClick={(e) => {
                e.stopPropagation();
                handleMenuOptionClick(option.value);
              }}
            >
              <SvgSpriteLoader id={option.iconId} width={12} height={12} />
              <div className='f-12-500'>{option.label}</div>
            </div>
          ))}
        </PositionedMenuWrapper>
      )}

      {isFilterOpen && (
        <PositionedMenuWrapper
          id='pace-column-filter'
          className='bg-BG_WHITE w-60 p-3'
          childrenWrapperClassName='overflow-visible!'
          menuPosition={menuPosition}
          onClose={handleClose}
          onReset={() => {
            setFilterValue('');
            setFilterOperator('contains');
            api.setColumnFilterModel(colId, null).then(() => {
              api.onFilterChanged();
            });
          }}
        >
          <div className='mb-2 flex items-center gap-1'>
            <span className='text-GRAY_1000 f-12-400 truncate'>{displayName}</span>
            <div
              className='relative flex cursor-pointer items-center gap-0.5'
              onClick={() => setIsOperatorOpen((prev) => !prev)}
            >
              <span className='text-BLUE_700 f-12-500'>
                {FILTER_OPERATORS.find((op) => op.value === filterOperator)?.label}
              </span>
              <SvgSpriteLoader
                id={isOperatorOpen ? 'chevron-up' : 'chevron-down'}
                width={10}
                height={10}
                color={CSS_VARS.BLUE_700}
              />
            </div>
          </div>
          {isOperatorOpen && (
            <div className='bg-BG_WHITE border-GRAY_400 shadow-menu-list mb-2 rounded-md border p-1'>
              {FILTER_OPERATORS.map((op) => (
                <div
                  key={op.value}
                  className={cn('hover:bg-GRAY_100 f-12-400 cursor-pointer rounded px-2 py-1.5', {
                    'bg-GRAY_100': filterOperator === op.value,
                  })}
                  onClick={() => handleFilterOperatorChange(op.value)}
                >
                  {op.label}
                </div>
              ))}
            </div>
          )}
          {filterOperator !== 'blank' && (
            <input
              type='text'
              className='border-GRAY_400 bg-BG_WHITE text-GRAY_1000 placeholder:text-GRAY_700 f-12-400 w-full rounded-md border px-2.5 py-1.5 outline-none'
              placeholder='type a value...'
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              autoFocus
            />
          )}
        </PositionedMenuWrapper>
      )}
    </div>
  );
};

export default PaceColumnHeader;
