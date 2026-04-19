'use client';

import { FC, KeyboardEvent, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { RequiredDefaultValueModal } from '@zamp-platform/dataset-create-edit';
import { Input, Switch } from '@zamp-platform/ui';
import { ColumnHeaderClickedEvent, IHeaderParams } from 'ag-grid-community';
import { ArrowDown, ArrowUp, Asterisk, ChevronDown, ChevronUp, Filter, Pencil, XIcon } from 'lucide-react';
import type { BlueprintColumn } from 'modules/pace/components/datasets/datasets.constants';
import { cn } from 'utils/common';
import { KEYBOARD_KEYS } from '@/constants/shortcuts';
import PositionedMenuWrapper from 'components/common/PositionedMenuWrapper';
import { CONDITION_OPERATOR_TYPE } from 'components/filter/filters.constants';
import { filtersContextActions, useFiltersContextStore } from 'components/filter/filters.context';

type FilterOperator = 'contains' | 'ncontains' | 'eq' | 'neq' | 'startswith' | 'endswith' | 'blank';

const FILTER_OPERATORS: { label: string; value: FilterOperator }[] = [
  { label: 'contains', value: 'contains' },
  { label: 'does not contain', value: 'ncontains' },
  { label: 'equals', value: 'eq' },
  { label: 'not equal', value: 'neq' },
  { label: 'begins with', value: 'startswith' },
  { label: 'ends with', value: 'endswith' },
  { label: 'is blank', value: 'blank' },
];

interface MenuOption {
  label: string;
  value: string;
  icon: ReactNode;
}

interface ColumnHeaderParams {
  onColumnRename?: (colId: string, newName: string) => void;
  onColumnRequiredChange?: (colId: string, required: boolean, defaultValue?: string | null) => void;
  getColumnInfo?: (colId: string) => BlueprintColumn | undefined;
}

const ColumnHeader: FC<IHeaderParams & ColumnHeaderParams> = (props) => {
  const { column, api, displayName, onColumnRename, onColumnRequiredChange, getColumnInfo } = props;
  const colId = column.getColId();

  // --- Refs ---
  const menuRef = useRef<HTMLDivElement>(null);
  const wasRequiredFalseRef = useRef(false);
  const renameSubmittedRef = useRef(false);

  // --- Hooks ---
  const {
    dispatch,
    state: { selectedFilters },
  } = useFiltersContextStore();

  // --- State ---
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isRequiredModalOpen, setIsRequiredModalOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [filterOperator, setFilterOperator] = useState<FilterOperator>('contains');
  const [filterValue, setFilterValue] = useState('');
  const [isOperatorOpen, setIsOperatorOpen] = useState(false);
  const [sortState, setSortState] = useState(column.getSort());
  const [headerName, setHeaderName] = useState(displayName);

  // --- Memo ---
  const columnInfo = getColumnInfo?.(colId);
  const requiredState = columnInfo?.required ?? false;
  const columnType = columnInfo?.type ?? 'text';

  const hasActiveFilter = useMemo(
    () =>
      !!(
        selectedFilters?.[colId] &&
        typeof selectedFilters[colId] === 'object' &&
        ('filter' in (selectedFilters[colId] as Record<string, unknown>) ||
          (selectedFilters[colId] as Record<string, unknown>).type === 'blank')
      ),
    [selectedFilters, colId],
  );

  const menuOptions: MenuOption[] = useMemo(() => {
    const options: MenuOption[] = [
      { label: 'Sort Ascending', value: 'sort_asc', icon: <ArrowUp size={12} /> },
      { label: 'Sort Descending', value: 'sort_desc', icon: <ArrowDown size={12} /> },
    ];

    if (sortState) {
      options.push({ label: 'Remove Sort', value: 'remove_sort', icon: <XIcon size={12} /> });
    }
    options.push({ label: 'Filter', value: 'filter', icon: <Filter size={12} /> });

    return options;
  }, [sortState]);

  // --- Callbacks ---
  const updateMenuPosition = useCallback(() => {
    if (!menuRef.current) return;
    const rect = menuRef.current.getBoundingClientRect();
    const menuWidth = 240;
    const viewportWidth = window.innerWidth;
    const left = rect.left + menuWidth > viewportWidth ? rect.right - menuWidth : rect.left;

    setMenuPosition({ top: rect.bottom + window.scrollY, left });
  }, []);

  const handleHeaderNameBlur = useCallback(() => {
    if (renameSubmittedRef.current) return;
    const trimmed = headerName?.trim() ?? '';

    if (!trimmed || trimmed === displayName) return;
    renameSubmittedRef.current = true;
    onColumnRename?.(colId, trimmed);
  }, [headerName, displayName, colId, onColumnRename]);

  const handleHeaderNameKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === KEYBOARD_KEYS.ENTER) {
        e.preventDefault();
        e.stopPropagation();
        handleHeaderNameBlur();
      }
    },
    [handleHeaderNameBlur],
  );

  const handleClose = useCallback(() => {
    if (isRequiredModalOpen) return;
    handleHeaderNameBlur();
    setIsMenuOpen(false);
    setIsFilterOpen(false);
    setIsOperatorOpen(false);
  }, [isRequiredModalOpen, handleHeaderNameBlur]);

  const applyFilter = useCallback(
    (operator: FilterOperator, value: string) => {
      if (operator === 'blank') {
        dispatch({
          type: filtersContextActions.SET_SELECTED_FILTERS,
          payload: {
            selectedFilters: {
              [colId]: { filterType: 'search', type: CONDITION_OPERATOR_TYPE.IS_NULL, filter: '' },
            },
          },
        });
      } else if (value.trim()) {
        dispatch({
          type: filtersContextActions.SET_SELECTED_FILTERS,
          payload: {
            selectedFilters: {
              [colId]: { filterType: 'search', type: operator, filter: value },
            },
          },
        });
      }
    },
    [dispatch, colId],
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

  const handleRequiredToggle = useCallback(
    (checked: boolean) => {
      if (checked) {
        wasRequiredFalseRef.current = !requiredState;
        setIsRequiredModalOpen(true);
      } else {
        onColumnRequiredChange?.(colId, false, null);
      }
    },
    [colId, requiredState, onColumnRequiredChange],
  );

  const handleRequiredModalConfirm = useCallback(
    (defaultValue: string) => {
      onColumnRequiredChange?.(colId, true, defaultValue);
      setIsRequiredModalOpen(false);
      setIsMenuOpen(false);
      wasRequiredFalseRef.current = false;
    },
    [colId, onColumnRequiredChange],
  );

  const handleRequiredModalClose = useCallback(() => {
    if (wasRequiredFalseRef.current) {
      wasRequiredFalseRef.current = false;
    }
    setIsRequiredModalOpen(false);
    setIsMenuOpen(false);
  }, []);

  const handleRequiredModalDismiss = useCallback(() => {
    onColumnRequiredChange?.(colId, false, null);
    setIsRequiredModalOpen(false);
    setIsMenuOpen(false);
  }, [colId, onColumnRequiredChange]);

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

  // --- Effects ---
  useEffect(() => {
    const onSortChanged = () => setSortState(column.getSort());

    api.addEventListener('sortChanged', onSortChanged);

    return () => {
      api.removeEventListener('sortChanged', onSortChanged);
    };
  }, [api, column]);

  useEffect(() => {
    if (isMenuOpen) {
      setHeaderName(displayName);
      renameSubmittedRef.current = false;
    }
  }, [isMenuOpen, displayName]);

  useEffect(() => {
    if (filterOperator === 'blank') return;
    if (!filterValue.trim()) return;
    const timer = setTimeout(() => {
      applyFilter(filterOperator, filterValue);
    }, 500);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterValue, filterOperator]);

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
          {sortState === 'asc' && <ArrowUp size={12} className='text-GRAY_700' />}
          {sortState === 'desc' && <ArrowDown size={12} className='text-GRAY_700' />}
          {hasActiveFilter && <Filter size={12} className='text-GRAY_700' />}
        </div>
        <ChevronDown size={12} className='ml-2.5' />
      </div>

      {isMenuOpen && (
        <PositionedMenuWrapper
          id='pace-column-menu'
          className='bg-BG_WHITE w-52 p-1'
          childrenWrapperClassName='overflow-auto!'
          menuPosition={menuPosition}
          onClose={handleClose}
        >
          {onColumnRename && (
            <Input
              size='small'
              placeholder='Column name'
              value={headerName}
              onChange={(e) => setHeaderName(e.target.value)}
              onBlur={handleHeaderNameBlur}
              autoFocus
              wrapperClassName='m-2'
              className='focus:border-gray-600 focus:ring-gray-400 focus-visible:outline-none'
              error={!headerName?.trim()}
              icon={<Pencil size={16} className='text-GRAY_500' />}
              onKeyDown={handleHeaderNameKeyDown}
            />
          )}
          {menuOptions.map((option) => (
            <div
              key={option.value}
              className='hover:bg-GRAY_100 flex cursor-pointer items-center gap-1.5 rounded-md px-2.5 py-2'
              onClick={(e) => {
                e.stopPropagation();
                handleMenuOptionClick(option.value);
              }}
            >
              {option.icon}
              <div className='f-12-500'>{option.label}</div>
            </div>
          ))}
          {onColumnRequiredChange && (
            <div
              className='hover:bg-GRAY_100 flex cursor-pointer items-center justify-between rounded-md px-2.5 py-2'
              onClick={(e) => e.stopPropagation()}
            >
              <div className='flex items-center gap-1.5'>
                <Asterisk size={12} className='text-GRAY_900' />
                <span className='f-12-500'>Require</span>
              </div>
              <Switch checked={requiredState} onCheckedChange={handleRequiredToggle} size='small' />
            </div>
          )}
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
            dispatch({
              type: filtersContextActions.REMOVE_FILTER,
              payload: { filterKey: colId },
            });
          }}
        >
          <div className='mb-2 flex items-center gap-1'>
            <span className='text-GRAY_1000 f-12-400 truncate'>{displayName}</span>
            <div
              className='relative flex cursor-pointer items-center gap-0.5'
              onClick={() => setIsOperatorOpen((prev) => !prev)}
            >
              <span className='text-GRAY_700 f-12-500'>
                {FILTER_OPERATORS.find((op) => op.value === filterOperator)?.label}
              </span>
              {isOperatorOpen ? (
                <ChevronUp size={10} className='text-GRAY_700' />
              ) : (
                <ChevronDown size={10} className='text-GRAY_700' />
              )}
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
            <Input
              size='small'
              placeholder='type a value...'
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              autoFocus
            />
          )}
        </PositionedMenuWrapper>
      )}

      <RequiredDefaultValueModal
        isOpen={isRequiredModalOpen}
        onClose={handleRequiredModalClose}
        onDismiss={handleRequiredModalDismiss}
        onConfirm={handleRequiredModalConfirm}
        columnType={columnType}
        initialDefaultValue={columnInfo?.defaultValue}
      />
    </div>
  );
};

export default ColumnHeader;
