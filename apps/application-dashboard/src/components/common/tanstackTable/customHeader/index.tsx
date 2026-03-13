import { FC, KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react';
import { SortDirection } from '@zamp-platform/tanstack-table';
import { CSS_VARS, Popover, PopoverContent, PopoverPortal, PopoverTrigger } from '@zamp-platform/ui';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { PIVOT_HEADER_BG } from 'constants/icons';
import AddTag from 'modules/data/AddTag';
import { getColumnOrderingVisibilityForCurrentDataset, updateLocalStorage } from 'modules/data/data.utils';
import Image from 'next/image';
import { cn, preventAutoFocus } from 'utils/common';
import { KEYBOARD_KEYS } from '@/constants/shortcuts';
import useDisplayConfigUpdate from '@/hooks/useDisplayConfigUpdate';
import { useResourceAccess } from '@/hooks/useResourceAccess';
import { ColumnOrderingVisibilityType } from '@/modules/data/data.types';
import { DATASET_ACCESS_PRIVILEGES } from '@/modules/shareResource/shareResource.types';
import { ResourceType } from '@/types/api/policies.types';
import { CustomHeaderMenuOptions } from 'components/common/table/CustomHeader/customHeader.constants';
import { CustomHeaderMenuOptionTypes } from 'components/common/table/CustomHeader/customHeader.types';
import { CUSTOM_COLUMNS_TYPE } from 'components/common/table/table.types';
import { CustomHeaderProps } from 'components/common/tanstackTable/customHeader/custom-header.types';
import DateFormatPopover from 'components/common/tanstackTable/customHeader/DateFormatPopover';
import MainMenuPopover from 'components/common/tanstackTable/customHeader/MainMenuPopover';
import TypeMenuPopover from 'components/common/tanstackTable/customHeader/TypeMenuPopover';
import { FILTER_TYPES } from 'components/filter/filter.types';
import FilterDropdownMenu from 'components/filter/filterMenu/FilterDropdownMenu';
import { useFiltersContextStore } from 'components/filter/filters.context';

const CustomHeaderTk: FC<CustomHeaderProps> = ({
  metadata,
  handleRulesListingSideDrawerOpen,
  handleSuccessfulUpdate,
  datasetId,
  tableRef,
  filterType,
  options,
  columnId,
  headerLabel,
  onSortAsc,
  onSortDesc,
  onClearSort,
  getIsSorted,
  onHideColumn,
  filterComponentProps,
  className,
  headerBackgroundNeeded = false,
  hideFloatingFilter = false,
  dateFormat,
  isSelfServe = false,
}) => {
  const colId = columnId;

  const { handleAliasUpdate, handleDateFormatUpdate, handleTypeUpdate } = useDisplayConfigUpdate(
    tableRef as any,
    datasetId,
  );
  const {
    state: { selectedFilters },
  } = useFiltersContextStore();
  const filtersCount = selectedFilters ? Object.keys(selectedFilters)?.length : 0;
  const isTagColumn = metadata?.custom_type === CUSTOM_COLUMNS_TYPE.TAG;
  const sortState = getIsSorted?.();
  const closingRef = useRef(false);
  const [isTypeOpen, setIsTypeOpen] = useState(false);
  const [isAddTagOpen, setIsAddTagOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isDateFormatOpen, setIsDateFormatOpen] = useState(false);
  const [headerName, setHeaderName] = useState(headerLabel || '');

  const isFilterActive = useMemo(() => {
    const filters = selectedFilters as Record<string, unknown> | undefined;

    if (!filters) return false;
    if (filters[colId]) return true;
    const conditions = filters.conditions as Array<{ column?: string }> | undefined;

    return Array.isArray(conditions) ? conditions.some((c) => c?.column === colId) : false;
  }, [selectedFilters, colId]);

  const { checkUserPrivilege } = useResourceAccess({
    resourceType: ResourceType.DATASET,
    resourceId: datasetId,
  });

  const isCurrentUserAdmin = useMemo(() => {
    return checkUserPrivilege(DATASET_ACCESS_PRIVILEGES.ADMIN);
  }, [checkUserPrivilege]);

  const filteredMenuOptions = useMemo(
    () =>
      CustomHeaderMenuOptions.filter((option) => {
        if (option.value === CustomHeaderMenuOptionTypes.REMOVE_SORT) {
          return !!sortState;
        }

        return option.value === CustomHeaderMenuOptionTypes.RULES ? isTagColumn : true;
      }),
    [isTagColumn, sortState],
  );

  const handleMenuOptionClick = (option: CustomHeaderMenuOptionTypes) => {
    let columnOrderingVisibility: ColumnOrderingVisibilityType[] = [];

    switch (option) {
      case CustomHeaderMenuOptionTypes.RULES:
        handleRulesListingSideDrawerOpen({
          colId,
          columnLabel: headerName ?? colId,
          tagColorMap: filterComponentProps?.tagColorMap,
        });
        break;
      case CustomHeaderMenuOptionTypes.ADD_TAG:
        setIsAddTagOpen(true);
        break;
      case CustomHeaderMenuOptionTypes.SORT_ASC:
        onSortAsc?.();
        break;
      case CustomHeaderMenuOptionTypes.SORT_DESC:
        onSortDesc?.();
        break;
      case CustomHeaderMenuOptionTypes.FILTER:
        setIsFilterOpen(true);
        break;
      case CustomHeaderMenuOptionTypes.REMOVE_SORT:
        onClearSort?.();
        break;
      case CustomHeaderMenuOptionTypes.DATE_FORMAT:
        setIsDateFormatOpen(true);
        break;
      case CustomHeaderMenuOptionTypes.HIDE_COLUMN:
        onHideColumn?.();
        columnOrderingVisibility = getColumnOrderingVisibilityForCurrentDataset(datasetId).map((columnItem) => ({
          ...columnItem,
          isVisible: columnItem.colId === colId ? !columnItem.isVisible : columnItem.isVisible,
        }));

        updateLocalStorage(columnOrderingVisibility, datasetId);
        break;
      case CustomHeaderMenuOptionTypes.TYPE:
        setIsTypeOpen(true);
        break;
    }
  };

  const handleAddTagClose = () => {
    setIsAddTagOpen(false);
  };

  const handleDateFormatClose = () => {
    setIsDateFormatOpen(false);
  };

  const handleTypeClose = () => {
    setIsTypeOpen(false);
  };

  const handleHeaderNameBlur = () => {
    const updatedHeaderName = headerName?.trim();

    if (updatedHeaderName === headerLabel || !updatedHeaderName) return;
    handleAliasUpdate?.({ columnId: colId, value: updatedHeaderName });
  };

  const handleHeaderNameKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === KEYBOARD_KEYS.ENTER) {
      e.preventDefault();
      e.stopPropagation();

      handleHeaderNameBlur();
    }
  };

  const handleDateFormatChange = (value: string) => {
    if (value === dateFormat) return;
    handleDateFormatUpdate?.({ columnId: colId, value });
  };

  const handleTypeChange = (value: string) => {
    if (value === metadata?.custom_type) return;

    handleTypeUpdate?.({ columnId: colId, value });
  };

  // Handle header click - respect hideFloatingFilter
  const handleHeaderClick = () => {
    if (hideFloatingFilter) {
      return;
    }
    setIsPopoverOpen(true);
  };

  // Handle popover open/close changes - respect hideFloatingFilter
  const handlePopoverOpen = (open: boolean) => {
    if (!open) {
      // Mark that we're closing to prevent content switching
      closingRef.current = true;
      // Reset all sub-menu states when popover closes
      setIsFilterOpen(false);
      setIsDateFormatOpen(false);
      setIsTypeOpen(false);
      setIsAddTagOpen(false);
      setIsPopoverOpen(false);
      // Reset the closing flag after a brief delay
      setTimeout(() => {
        closingRef.current = false;
      }, 100);
    } else {
      // Block popover opening if hideFloatingFilter is true
      if (hideFloatingFilter) {
        return;
      }
      closingRef.current = false;
      setIsPopoverOpen(true);
    }
  };

  useEffect(() => {
    setHeaderName(headerLabel ?? colId);
  }, [headerLabel, colId]);

  return (
    <div className='relative -mx-4 h-full w-full flex-1'>
      <Popover open={isPopoverOpen} onOpenChange={handlePopoverOpen}>
        <PopoverTrigger asChild>
          <div
            className={cn(
              'hover:bg-BG_GRAY_1 group flex h-full w-full flex-1 cursor-pointer items-center justify-between overflow-hidden px-2 pt-5 pb-1 capitalize',
              className,
            )}
            onClick={handleHeaderClick}
          >
            {headerBackgroundNeeded && (
              <Image
                src={PIVOT_HEADER_BG}
                alt='Header Background'
                priority
                fill
                className='shrink-0 object-cover object-center'
              />
            )}
            <div className='flex flex-auto items-center gap-1 self-stretch truncate'>
              <span className='truncate'>{headerName || ''}</span>
              {!!sortState && (
                <>
                  {sortState === SortDirection.ASC && (
                    <SvgSpriteLoader id='arrow-narrow-up' width={12} height={12} color={CSS_VARS.BLUE_700} />
                  )}
                  {sortState === SortDirection.DESC && (
                    <SvgSpriteLoader id='arrow-narrow-down' width={12} height={12} color={CSS_VARS.BLUE_700} />
                  )}
                </>
              )}
              {isFilterActive && (
                <span>
                  <SvgSpriteLoader id='filter-lines' width={12} height={12} color={CSS_VARS.BLUE_700} />
                </span>
              )}
            </div>
            {!hideFloatingFilter && <SvgSpriteLoader id='chevron-down' width={12} height={12} className='ml-2.5' />}
          </div>
        </PopoverTrigger>
        <PopoverPortal>
          <PopoverContent
            data-id='custom-header-tk-filter-popover-content'
            align='start'
            sideOffset={0}
            className={cn('p-0 text-black', isFilterOpen && '!border-none shadow-none')}
            onOpenAutoFocus={preventAutoFocus}
          >
            {closingRef.current ? null : isFilterOpen ? (
              <FilterDropdownMenu
                filterKey={colId}
                label={headerLabel}
                filterType={filterType}
                {...(filterType === FILTER_TYPES.TAGS && { filterComponentProps })}
              />
            ) : (
              <MainMenuPopover
                isSelfServe={isSelfServe}
                isCurrentUserAdmin={isCurrentUserAdmin}
                headerName={headerName}
                setHeaderName={setHeaderName}
                handleHeaderNameBlur={handleHeaderNameBlur}
                handleHeaderNameKeyDown={handleHeaderNameKeyDown}
                filterType={filterType}
                dateFormat={dateFormat}
                metadata={metadata}
                handleMenuOptionClick={handleMenuOptionClick}
                filteredMenuOptions={filteredMenuOptions}
                isTagColumn={isTagColumn}
                filtersCount={filtersCount}
                selectedFilters={selectedFilters}
              />
            )}
          </PopoverContent>
        </PopoverPortal>
      </Popover>

      {/* Date Format Popover */}
      {isDateFormatOpen && (
        <Popover open={isDateFormatOpen} onOpenChange={setIsDateFormatOpen}>
          <PopoverTrigger asChild>
            <div className='pointer-events-none absolute top-0 left-0 opacity-0' />
          </PopoverTrigger>
          <PopoverContent
            data-id='custom-header-tk-date-format-popover-content'
            className='p-0'
            sideOffset={4}
            align='start'
          >
            <DateFormatPopover
              dateFormat={dateFormat}
              handleDateFormatClose={handleDateFormatClose}
              handleDateFormatChange={handleDateFormatChange}
            />
          </PopoverContent>
        </Popover>
      )}

      {/* Type Popover */}
      {isTypeOpen && (
        <Popover open={isTypeOpen} onOpenChange={setIsTypeOpen}>
          <PopoverTrigger asChild>
            <div className='pointer-events-none absolute top-0 left-0 opacity-0' />
          </PopoverTrigger>
          <PopoverContent data-id='custom-header-tk-type-popover-content' className='p-0' sideOffset={4} align='start'>
            <TypeMenuPopover handleTypeClose={handleTypeClose} handleTypeChange={handleTypeChange} />
          </PopoverContent>
        </Popover>
      )}

      {/* Add Tag Popover */}
      <Popover open={isAddTagOpen} onOpenChange={setIsAddTagOpen}>
        <PopoverContent
          data-id='custom-header-tk-add-tag-popover-content'
          className='max-h-[380px] overflow-visible p-0'
          sideOffset={4}
          align='start'
        >
          <AddTag
            tagList={options?.filter((option) => !!option)}
            datasetId={datasetId}
            handleSuccessfulUpdate={handleSuccessfulUpdate}
            column={colId}
            onClose={handleAddTagClose}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default CustomHeaderTk;
