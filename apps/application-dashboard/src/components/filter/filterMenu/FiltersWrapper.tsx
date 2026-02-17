import { FC, useCallback, useEffect, useRef, useState } from 'react';
import { ICON_SPRITE_TYPES } from '@zamp-platform/ui/types';
import { useOnClickOutside } from 'hooks';
import { defaultFn, defaultFnType, MapAny, SIDE_OPTIONS } from 'types/commonTypes';
import FiltersMenuV3 from '@/components/filter/filterMenu/FiltersMenuV3';
import { FilterConfigType } from 'components/filter/filter.types';
import { getFilterValueForKey } from 'components/filter/filter.utils';
import FilterControlButton from 'components/filter/FilterControlButton';
import ClearFiltersConfirmationPopup from 'components/filter/filterMenu/ClearFiltersConfirmationPopup';
import FilterDropdownV2 from 'components/filter/filterMenu/FilterDropdownV2';
import FiltersMenu from 'components/filter/filterMenu/FiltersMenu';
import FiltersMenuV2 from 'components/filter/filterMenu/FiltersMenuV2';
import { FILTER_KEYS } from 'components/filter/filters.constants';
import { filtersContextActions, useFiltersContextStore } from 'components/filter/filters.context';

interface FiltersContainerProps {
  onClearAllFilters?: defaultFnType;
  onClearRules?: defaultFnType;
  onOpenAdvancedSearch?: defaultFnType;
  persistId?: string;
  onSetTotalSelectedFilters?: (val: number) => void;
  filterConfig: FilterConfigType[];
  className?: string;
  allowActions?: boolean;
  controlClassName?: string;
  allowClear?: boolean;
  label?: string;
  showResetFilters?: boolean;
  isPeriodicityEnabled?: boolean;
  isRightAligned?: boolean;
  titleClassName?: string;
  isPlayground?: boolean;
  isSheetFilters?: boolean;
  isProcessContext?: boolean;
  testIdSuffix?: string;
  disable?: boolean;
}

const FiltersContainer: FC<FiltersContainerProps> = ({
  onClearAllFilters = defaultFn,
  persistId,
  testIdSuffix,
  onSetTotalSelectedFilters,
  filterConfig,
  className = 'px-6',
  allowActions = true,
  controlClassName = '',
  allowClear = true,
  label = 'Add Filters',
  isPeriodicityEnabled = false,
  isRightAligned = false,
  titleClassName = '',
  isPlayground = false,
  isSheetFilters = false,
  isProcessContext = false,
  disable = false,
}) => {
  const [shouldShowConfirmationPopup, setShouldShowConfirmationPopup] = useState(false);
  const {
    dispatch,
    state: { selectedFilters, selectedFiltersInUI, currentPageFilters },
  } = useFiltersContextStore();

  const [filtersList, setFiltersList] = useState<FilterConfigType[]>([]);

  const onAddFilterToFiltersList = (filterKey: string, list: FilterConfigType[], value: FilterConfigType) => {
    // Skip if value is undefined
    if (!value) {
      return;
    }

    const filterItemIndex = list.findIndex((item: FilterConfigType) => item?.key === filterKey);

    if (filterItemIndex === -1) {
      list.push(value);

      return;
    }

    list[filterItemIndex] = value;
  };

  const onRemoveFiltersWithoutKeys = (list: FilterConfigType[], selectedFiltersInUI: MapAny) => {
    const keys = Object.keys(selectedFiltersInUI);

    for (let i = list?.length - 1; i >= 0; i--) {
      const filter = list[i];

      if (!keys?.includes(filter?.key)) {
        list?.splice(i, 1);
      }
    }
  };

  const onSetFiltersList = useCallback(() => {
    const list = [...filtersList];

    const selectedFilters = selectedFiltersInUI;

    for (const key in selectedFilters) {
      const value: any = getFilterValueForKey(key as FILTER_KEYS, filterConfig, selectedFilters);

      // Skip if value is undefined (filter config not found)
      if (value) {
        onAddFilterToFiltersList(key, list, value);
      }
    }

    onRemoveFiltersWithoutKeys(list, selectedFiltersInUI);
    onSetTotalSelectedFilters?.(list?.length);

    setFiltersList(list);
  }, [selectedFiltersInUI, selectedFilters, filterConfig]);

  useEffect(() => {
    onSetFiltersList();
  }, [selectedFiltersInUI, filterConfig, selectedFilters]);

  const handleResetFilters = () => {
    setShouldShowConfirmationPopup(false);

    dispatch({
      type: filtersContextActions.RESET_ALL_FILTERS,
      payload: { shouldClearDate: false },
    });

    onClearAllFilters?.();
  };

  const onAddEmptyFilter = (filterKey: string) => {
    dispatch({
      type: filtersContextActions.ADD_EMPTY_STATE_FILTER,
      payload: { filterKey },
    });
  };

  const onRemoveFilter = (filterKey: string) => {
    dispatch({
      type: filtersContextActions.REMOVE_FILTER,
      payload: { filterKey },
    });
  };

  const confirmationPopupRef = useRef<HTMLDivElement>(null);
  const confirmationPopupControlRef = useRef<HTMLButtonElement>(null);

  useOnClickOutside(confirmationPopupRef, () => {
    setShouldShowConfirmationPopup(false);
  }, [confirmationPopupControlRef]);

  return (
    <div>
      {isPlayground && <FiltersMenuV2 onAddFilter={onAddEmptyFilter} currentPageFilters={currentPageFilters} />}
      <div
        id={`${persistId ?? ''}FILTERS_CONTAINER`}
        className={`z-50 flex flex-wrap items-center gap-2 ${className}`}
        data-testid={`FILTERS_CONTAINER${testIdSuffix ? `-${testIdSuffix}` : ''}`}
      >
        {filtersList.map((filter, index) => (
          <FilterDropdownV2
            key={index}
            index={index}
            filter={filter}
            onRemoveFilter={allowActions || allowClear ? onRemoveFilter : null}
            allowActions={allowActions}
            isFilterSelected={selectedFilters[filter?.key]}
            controlClassName={controlClassName}
            allowClear={allowClear}
            isPeriodicityEnabled={isPeriodicityEnabled}
            isRightAligned={isRightAligned}
            titleClassName={titleClassName}
            isSheetFilters={isSheetFilters}
            isProcessContext={isProcessContext}
          />
        ))}

        {!isSheetFilters && !isPlayground && allowActions && !filtersList?.length && (
          <FiltersMenu label={label} onAddFilter={onAddEmptyFilter} testIdSuffix={testIdSuffix} disable={disable} />
        )}

        {!isSheetFilters && !isPlayground && allowActions && filtersList?.length > 0 ? (
          <>
            <FiltersMenu
              tooltipText='Add Filters'
              currentPageFilters={currentPageFilters}
              onAddFilter={onAddEmptyFilter}
              testIdSuffix={testIdSuffix}
            />

            <div className='relative'>
              <FilterControlButton
                tooltipText='Remove all filters'
                tooltipPosition={SIDE_OPTIONS.TOP}
                onClick={() => setShouldShowConfirmationPopup(!shouldShowConfirmationPopup)}
                buttonRef={confirmationPopupControlRef}
                icon='x-close'
                iconCategory={ICON_SPRITE_TYPES.GENERAL}
                id='clear-all-filters'
                testIdSuffix={testIdSuffix}
              >
                {shouldShowConfirmationPopup ? (
                  <ClearFiltersConfirmationPopup
                    containerRef={confirmationPopupRef}
                    onClick={handleResetFilters}
                    onCancel={() => setShouldShowConfirmationPopup(false)}
                    className='absolute left-0 z-9999'
                  />
                ) : null}
              </FilterControlButton>
            </div>
          </>
        ) : null}
        {isSheetFilters && <FiltersMenuV3 />}
      </div>
    </div>
  );
};

export default FiltersContainer;
