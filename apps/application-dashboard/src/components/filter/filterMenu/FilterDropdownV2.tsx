import React, { FC, useEffect, useMemo, useRef, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@zamp-platform/ui';
import { useOnClickOutside } from 'hooks';
import { useRouter } from 'next/navigation';
import { MapAny } from 'types/commonTypes';
import { useAppDispatch, useAppSelector } from '@/hooks/toolkit';
import useUpdateDatasetIds from '@/hooks/useUpdateDatasetIds';
import { setNewFilterId } from '@/store/slices/sheet-filters';
import { FILTER_TYPES, FilterConfigType } from 'components/filter/filter.types';
import FilterControl from 'components/filter/filterMenu/FilterDropdownControl';
import FilterDropdownMenu from 'components/filter/filterMenu/FilterDropdownMenu';
import { filtersContextActions, useFiltersContextStore } from 'components/filter/filters.context';

interface FilterDropdownProps {
  index: number;
  filter: FilterConfigType;
  onRemoveFilter?: ((filterKey: string) => void) | null;
  isFilterSelected: boolean;
  props?: MapAny;
  controlClassName?: string;
  allowClear?: boolean;
  allowActions: boolean;
  isPeriodicityEnabled?: boolean;
  onFilterChange?: (value: string[]) => void;
  closeOnSelect?: boolean;
  isRightAligned?: boolean;
  showColumnLabel?: boolean;
  titleClassName?: string;
  isDisabled?: boolean;
  isSheetFilters?: boolean;
  isProcessContext?: boolean;
}

const FilterDropdownV2: FC<FilterDropdownProps> = ({
  filter,
  onRemoveFilter,
  isFilterSelected,
  props = {},
  controlClassName = '',
  allowClear = true,
  allowActions = true,
  isPeriodicityEnabled = false,
  onFilterChange,
  closeOnSelect = false,
  showColumnLabel = true,
  titleClassName = '',
  isDisabled = false,
  isSheetFilters = false,
  isProcessContext = false,
}) => {
  const {
    dispatch,
    state: { datasetIdAndWidgetsMapping, selectedFilters },
  } = useFiltersContextStore();

  const updateDatasetIds = useUpdateDatasetIds();

  const [isOpen, setIsOpen] = useState<boolean>(!isFilterSelected && allowActions && !isSheetFilters);
  const [isHighlighted, setIsHighlighted] = useState<boolean>(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const initialFilterRender = useRef<boolean>(isProcessContext); // Only true for process context

  const router = useRouter();
  const newFilterId = useAppSelector((state) => state.sheetFilters.newFilterId);
  const appDispatch = useAppDispatch();

  const filterDatasetIds = useMemo(() => filter.targets?.map((target) => target.dataset_id) ?? [], [filter.targets]);

  const filterQueryParams = useMemo(() => {
    return {
      isFilterOpen: 'true',
      datasetIdAndWidgetsMapping: JSON.stringify(datasetIdAndWidgetsMapping),
    };
  }, [datasetIdAndWidgetsMapping]);

  useOnClickOutside(popoverRef, () => {
    if (isSheetFilters && isHighlighted) {
      updateDatasetIds([]);
      setIsHighlighted(false);
    }
  });

  const handlePopOverOpenChange = (open: boolean) => {
    if (isProcessContext) {
      if (initialFilterRender.current) {
        return;
      } else {
        setIsOpen(open);
      }
    } else {
      setIsOpen(open);
    }
  };

  const onClick = () => {
    setIsOpen((prev) => !prev);
    setIsHighlighted(true);
    if (isSheetFilters) {
      updateDatasetIds(filterDatasetIds);
    }
  };

  const onChange = (value: string[], filterType?: FILTER_TYPES) => {
    if (closeOnSelect || filterType === FILTER_TYPES.SINGLE_SELECT) {
      setIsOpen(false);
    }

    onFilterChange?.(value);
  };

  const handleConfigureFilter = () => {
    router.push(`?${new URLSearchParams(filterQueryParams).toString()}&filterId=${filter.key}`);
    setIsOpen(false);
  };

  const handleRemoveFilter = (filterKey: string) => {
    onRemoveFilter?.(filterKey);
    updateDatasetIds([]);
  };

  useEffect(() => {
    const filterKey = filter.key;
    const isHighlightedContext = selectedFilters?.[filterKey]?.isHighlighted ?? false;

    if (isHighlightedContext && isSheetFilters) {
      setIsHighlighted(true);
      updateDatasetIds(filterDatasetIds);
      dispatch({
        type: filtersContextActions.SET_SELECTED_FILTERS,
        payload: {
          selectedFilters: { [filterKey]: { ...selectedFilters[filterKey], isHighlighted: false } },
        },
      });
    }
  }, [selectedFilters, updateDatasetIds, dispatch, filterDatasetIds, isSheetFilters]);

  useEffect(() => {
    if (newFilterId && filter.key === newFilterId) {
      setIsHighlighted(true);
      updateDatasetIds(filterDatasetIds);
      appDispatch(setNewFilterId(''));
    }
  }, [newFilterId, filter.key, updateDatasetIds, filterDatasetIds, appDispatch]);

  useEffect(() => {
    // Only set timeout for process context
    if (isProcessContext) {
      const timeout = setTimeout(() => {
        initialFilterRender.current = false;
      }, 0);

      return () => {
        clearTimeout(timeout);
      };
    }
  }, [isProcessContext]);

  return (
    <div ref={popoverRef}>
      <Popover open={isOpen} onOpenChange={handlePopOverOpenChange}>
        <PopoverTrigger>
          <FilterControl
            filterConfig={filter}
            isMenuDropdownOpen={false}
            onClick={onClick}
            onClear={handleRemoveFilter}
            controlClassName={controlClassName}
            allowClear={allowClear}
            isOpen={isOpen}
            titleClassName={titleClassName}
            isHighlighted={isHighlighted}
          />
        </PopoverTrigger>
        <PopoverContent className='mt-1 border-none p-0'>
          <FilterDropdownMenu
            forView='filters'
            filterKey={filter?.key}
            filterType={filter?.type as FILTER_TYPES}
            label={filter?.label}
            className='w-full min-w-[200px]'
            isOpen={isOpen}
            updateContextOnChange
            onClose={() => setIsOpen(false)}
            allowClear={allowClear}
            isPeriodicityEnabled={isPeriodicityEnabled}
            onFilterChange={onChange}
            showColumnLabel={showColumnLabel}
            isDisabled={isDisabled}
            onConfigureFilter={isSheetFilters ? handleConfigureFilter : undefined}
            {...props}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default FilterDropdownV2;
