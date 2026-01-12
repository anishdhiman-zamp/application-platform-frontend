import { FC, KeyboardEvent, RefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDatasetColumnContextOptional } from '@zamp-platform/dataset-create-edit';
import { Button, Input } from '@zamp-platform/ui';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { DATE_FORMATS, formatRelativeWithCustomLocale } from '@zamp-platform/utils';
import { ColDef, ColumnHeaderClickedEvent, ColumnResizedEvent } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { COLORS } from 'constants/colors';
import { PIVOT_HEADER_BG } from 'constants/icons';
import { format } from 'date-fns';
import AddTag from 'modules/data/AddTag';
import { getColumnOrderingVisibilityForCurrentDataset, updateLocalStorage } from 'modules/data/data.utils';
import { DatasetColumnHeaderTypes } from 'modules/process/process.types';
import Image from 'next/image';
import { DatasetFilterConfigMetadataType, DatasetUpdateResponseType } from 'types/api/dataset.types';
import { MapAny } from 'types/commonTypes';
import { OrderType } from 'types/components/table.type';
import { cn } from 'utils/common';
import { KEYBOARD_KEYS } from '@/constants/shortcuts';
import useDisplayConfigUpdate from '@/hooks/useDisplayConfigUpdate';
import { useResourceAccess } from '@/hooks/useResourceAccess';
import { ColumnOrderingVisibilityType, RuleColumnDetailsType } from '@/modules/data/data.types';
import { DATASET_ACCESS_PRIVILEGES } from '@/modules/shareResource/shareResource.types';
import { ResourceType } from '@/types/api/policies.types';
import PositionedMenuWrapper from 'components/common/PositionedMenuWrapper';
import {
  CustomHeaderMenuOptions,
  DateFormatOptions,
  DisplayTypeNonApplicableFilterTypes,
  DisplayTypeOptions,
  UI_COLUMN_RESIZED,
} from 'components/common/table/CustomHeader/customHeader.constants';
import { CustomHeaderMenuOptionTypes } from 'components/common/table/CustomHeader/customHeader.types';
import { TABLE_COPIES } from 'components/common/table/table.constants';
import { CUSTOM_COLUMNS_TYPE } from 'components/common/table/table.types';
import { FILTER_TYPES } from 'components/filter/filter.types';
import FilterDropdownMenu from 'components/filter/filterMenu/FilterDropdownMenu';
import { useFiltersContextStore } from 'components/filter/filters.context';

type CustomHeaderProps = {
  metadata: DatasetFilterConfigMetadataType;
  handleRulesListingSideDrawerOpen: (ruleColumnDetailsValue: RuleColumnDetailsType) => void;
  handleSuccessfulUpdate: (data: DatasetUpdateResponseType) => void;
  datasetId: string;
  tableRef: RefObject<AgGridReact | null>;
  filterType: FILTER_TYPES;
  options: string[];
  column: {
    colId: string;
    colDef: ColDef;
  };
  filterComponentProps?: MapAny;
  className?: string;
  headerBackgroundNeeded?: boolean;
  hideFloatingFilter?: boolean;
  dateFormat?: string;
  isSelfServe?: boolean;
};
const CustomHeader: FC<CustomHeaderProps> = ({
  metadata,
  handleRulesListingSideDrawerOpen,
  handleSuccessfulUpdate,
  datasetId,
  tableRef,
  filterType,
  options,
  column,
  filterComponentProps,
  className,
  headerBackgroundNeeded = false,
  hideFloatingFilter = false,
  dateFormat,
  isSelfServe,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const lastResizedTimeRef = useRef<number | null>(null); // Track last resize time
  const { colId, colDef } = column;
  const { handleAliasUpdate, handleDateFormatUpdate, handleTypeUpdate } = useDisplayConfigUpdate(tableRef, datasetId);
  const columnContext = useDatasetColumnContextOptional(); // Use context if available (for unified state management)
  const {
    state: { selectedFilters },
  } = useFiltersContextStore();
  const [isTypeOpen, setIsTypeOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAddTagOpen, setIsAddTagOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isDateFormatOpen, setIsDateFormatOpen] = useState(false);
  const [headerName, setHeaderName] = useState(colDef?.headerName ?? colId);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const contextHandleColumnChange = columnContext?.handleColumnChange;
  const contextHandleColumnWidthChange = columnContext?.handleColumnWidthChange;
  const filtersCount = selectedFilters ? Object.keys(selectedFilters)?.length : 0;
  const isTagColumn = metadata?.custom_type === CUSTOM_COLUMNS_TYPE.TAG;
  const sortState = tableRef?.current?.api?.getColumn(colId)?.getSort();
  const isFilterActive = tableRef?.current?.api?.getColumn(colId)?.isFilterActive();

  const { checkUserPrivilege } = useResourceAccess({
    resourceType: ResourceType.DATASET,
    resourceId: datasetId,
    skipAudienceData: false,
    skipTeamsData: false,
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

  const handleMenuClose = () => {
    handleHeaderNameBlur();
    setIsMenuOpen(false);
  };

  const handleMenuOptionClick = (option: CustomHeaderMenuOptionTypes) => {
    handleMenuClose();
    let columnOrderingVisibility: ColumnOrderingVisibilityType[] = [];

    switch (option) {
      case CustomHeaderMenuOptionTypes.RULES:
        handleRulesListingSideDrawerOpen({
          colId,
          columnLabel: colDef?.headerName ?? colId,
          tagColorMap: filterComponentProps?.tagColorMap,
        });
        break;
      case CustomHeaderMenuOptionTypes.ADD_TAG:
        setIsAddTagOpen(true);
        break;
      case CustomHeaderMenuOptionTypes.SORT_ASC:
        tableRef?.current?.api?.applyColumnState({
          state: [{ colId: colId, sort: OrderType.ASC }],
        });
        break;
      case CustomHeaderMenuOptionTypes.SORT_DESC:
        tableRef?.current?.api?.applyColumnState({
          state: [{ colId: colId, sort: OrderType.DESC }],
        });
        break;
      case CustomHeaderMenuOptionTypes.FILTER:
        setIsFilterOpen(true);
        break;
      case CustomHeaderMenuOptionTypes.REMOVE_SORT:
        tableRef?.current?.api?.applyColumnState({
          state: [{ colId: colId, sort: null }],
        });
        break;
      case CustomHeaderMenuOptionTypes.DATE_FORMAT:
        setIsDateFormatOpen(true);
        break;
      case CustomHeaderMenuOptionTypes.HIDE_COLUMN:
        tableRef?.current?.api?.setColumnsVisible([colId], false);
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

  // Function to calculate and update menu position
  const updateMenuPosition = () => {
    if (!menuRef.current) return;

    const rect = menuRef.current.getBoundingClientRect();

    setMenuPosition({
      top: rect.bottom + window.scrollY, // Stick below the header
      left: rect.left, // Adjust for AG Grid's horizontal scroll
    });
  };

  // Function to open menu and set position
  const toggleMenu = useCallback(
    (event: ColumnHeaderClickedEvent) => {
      if (event.column?.getId() !== colId) return;
      const currentTime = Date.now();
      const lastResizedTime = lastResizedTimeRef.current;

      if (lastResizedTime !== null) {
        const timeDifference = currentTime - lastResizedTime;

        if (timeDifference <= 100) {
          return; // Suppress further handling
        }
      }

      tableRef?.current?.api?.clearCellSelection();
      tableRef?.current?.api?.clearFocusedCell();

      updateMenuPosition();
      setIsMenuOpen((prev) => !prev);
    },
    [colId, filterType],
  );

  const handleFilterClose = () => {
    setIsFilterOpen(false);
  };

  const handleDateFormatClose = () => {
    setIsDateFormatOpen(false);
    setIsMenuOpen(true);
  };

  const handleTypeClose = () => {
    setIsTypeOpen(false);
    setIsMenuOpen(true);
  };

  const handleColumnResizing = useCallback(
    (event: ColumnResizedEvent) => {
      if (event.column?.getId() !== colId) return;

      // Only save widths from user interactions, not grid internal changes, which prevents AG-Grid from overwriting user resizes with default widths
      if (event.source !== UI_COLUMN_RESIZED) {
        return;
      }

      // Only update when resize is finished (not during drag)
      if (!event.finished) {
        return;
      }

      const newWidth = event.column?.getActualWidth();

      if (!newWidth) return;

      // Update localStorage directly for persistence
      // We DON'T update context here to avoid triggering re-renders that reset AG Grid widths
      // Context will read widths from localStorage when needed (e.g., on reorder or reload)
      const columnOrderingVisibility = getColumnOrderingVisibilityForCurrentDataset(datasetId);
      const columnOrderingVisibilityIndex = columnOrderingVisibility.findIndex((column) => column.colId === colId);

      if (columnOrderingVisibilityIndex !== -1) {
        columnOrderingVisibility[columnOrderingVisibilityIndex].width = newWidth;
        updateLocalStorage(columnOrderingVisibility, datasetId);
      }

      lastResizedTimeRef.current = Date.now();
    },
    [colId, datasetId, contextHandleColumnWidthChange],
  );

  const handleHeaderNameBlur = () => {
    const updatedHeaderName = headerName?.trim();

    if (updatedHeaderName === colDef?.headerName || !updatedHeaderName) return;

    // Use context if available, otherwise fallback to regular flow
    if (contextHandleColumnChange) {
      contextHandleColumnChange(colId, DatasetColumnHeaderTypes.COLUMN_NAME, updatedHeaderName);
    } else {
      handleAliasUpdate?.({ columnId: colId, value: updatedHeaderName });
    }
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

  // Track column resize
  useEffect(() => {
    tableRef?.current?.api?.addEventListener('columnResized', handleColumnResizing);

    return () => {
      tableRef?.current?.api?.removeEventListener('columnResized', handleColumnResizing);
    };
  }, [colId, tableRef, handleColumnResizing]);

  // Track column header clicked
  useEffect(() => {
    if (!hideFloatingFilter) {
      tableRef?.current?.api?.addEventListener('columnHeaderClicked', toggleMenu);
    }

    return () => {
      tableRef?.current?.api?.removeEventListener('columnHeaderClicked', toggleMenu);
    };
  }, [colId, tableRef, toggleMenu, hideFloatingFilter]);

  useEffect(() => {
    if (isMenuOpen) {
      setHeaderName(colDef?.headerName ?? colId);
    }
  }, [isMenuOpen]);

  return (
    <div ref={menuRef} className='relative -mx-4 h-full w-full flex-1'>
      <div
        className={cn(
          'hover:bg-BACKGROUND_GRAY_1 group flex h-full w-full flex-1 cursor-pointer items-center justify-between overflow-hidden px-2 pt-5 pb-1 capitalize',
          { 'bg-BACKGROUND_GRAY_1': isMenuOpen },
          className,
        )}
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
          <span className='truncate'>{colDef?.headerName ?? colId}</span>
          {!!sortState && (
            <>
              {sortState === OrderType.ASC && (
                <SvgSpriteLoader id='arrow-narrow-up' width={12} height={12} color={COLORS.BLUE_700} />
              )}
              {sortState === OrderType.DESC && (
                <SvgSpriteLoader id='arrow-narrow-down' width={12} height={12} color={COLORS.BLUE_700} />
              )}
            </>
          )}
          {isFilterActive && (
            <span>
              <SvgSpriteLoader id='filter-lines' width={12} height={12} color={COLORS.BLUE_700} />
            </span>
          )}
        </div>
        {!hideFloatingFilter && <SvgSpriteLoader id='chevron-down' width={12} height={12} className='ml-2.5' />}
      </div>
      {isMenuOpen && (
        <PositionedMenuWrapper
          id='custom-header-menu'
          className='w-52 p-1'
          childrenWrapperClassName='overflow-auto!'
          menuPosition={menuPosition}
          onClose={handleMenuClose}
        >
          {isSelfServe && isCurrentUserAdmin && (
            <Input
              size='small'
              placeholder='Header'
              value={headerName}
              onChange={(e) => setHeaderName(e.target.value)}
              onBlur={handleHeaderNameBlur}
              autoFocus
              wrapperClassName='m-2'
              error={!headerName?.trim()}
              icon={<SvgSpriteLoader id='edit-03' size={16} color={COLORS.GRAY_500} />}
              onKeyDown={handleHeaderNameKeyDown}
            />
          )}
          {isSelfServe && isCurrentUserAdmin && filterType === FILTER_TYPES.DATE_RANGE && (
            <div
              className='hover:bg-GRAY_100 group flex cursor-pointer items-center justify-between rounded-md px-2.5 py-2'
              onClick={(e) => {
                e.stopPropagation();
                handleMenuOptionClick(CustomHeaderMenuOptionTypes.DATE_FORMAT);
              }}
            >
              <div className='flex items-center gap-1.5'>
                <SvgSpriteLoader id='calendar' size={12} />
                <span className='f-12-500'>Date Range</span>
              </div>
              <div className='flex items-center gap-1'>
                <span className='f-11-450 text-gray-700'>
                  {DateFormatOptions.find((item) => item.value === dateFormat)?.label ?? DateFormatOptions[0].label}
                </span>
                <SvgSpriteLoader
                  id='arrow-narrow-right'
                  size={12}
                  color={COLORS.GRAY_600}
                  className='hidden group-hover:block'
                />
              </div>
            </div>
          )}
          {isSelfServe && isCurrentUserAdmin && !DisplayTypeNonApplicableFilterTypes.includes(filterType) && (
            <div
              className='hover:bg-GRAY_100 group flex cursor-pointer items-center justify-between rounded-md px-2.5 py-2'
              onClick={(e) => {
                e.stopPropagation();
                handleMenuOptionClick(CustomHeaderMenuOptionTypes.TYPE);
              }}
            >
              <div className='flex items-center gap-1.5'>
                <SvgSpriteLoader id='columns-02' size={12} />
                <span className='f-12-500'>Type</span>
              </div>
              <div className='flex items-center gap-1'>
                <span className='f-11-450 text-gray-700'>
                  {DisplayTypeOptions.find((item) => item.value === metadata?.custom_type)?.label ??
                    TABLE_COPIES.DEFAULT}
                </span>
                <SvgSpriteLoader
                  id='arrow-narrow-right'
                  size={12}
                  color={COLORS.GRAY_600}
                  className='hidden group-hover:block'
                />
              </div>
            </div>
          )}
          {filteredMenuOptions.map((option) => (
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
          {isTagColumn && (
            <div className='px-2.5 py-3'>
              <Button
                className='flex w-full items-center gap-1 [&_svg]:size-[14px]'
                onClick={() => handleMenuOptionClick(CustomHeaderMenuOptionTypes.ADD_TAG)}
                size='small'
              >
                <SvgSpriteLoader id='tag-01' />
                <span>Add Tag</span>
              </Button>
              {!!filtersCount && (
                <div className='f-11-400 text-GRAY_700 mt-1.5'>
                  {Object.keys(selectedFilters)?.length} filters applied
                </div>
              )}
            </div>
          )}
        </PositionedMenuWrapper>
      )}
      {isAddTagOpen && (
        <PositionedMenuWrapper
          id='custom-header-add-tag-menu'
          childrenWrapperClassName='overflow-visible! max-h-[380px]!'
          menuPosition={menuPosition}
          onClose={handleAddTagClose}
        >
          <AddTag
            tagList={options?.filter((option) => !!option)}
            datasetId={datasetId}
            handleSuccessfulUpdate={handleSuccessfulUpdate}
            column={colId}
            onClose={handleAddTagClose}
          />
        </PositionedMenuWrapper>
      )}
      {isFilterOpen && (
        <PositionedMenuWrapper
          id='custom-header-filter-menu'
          className='border-none'
          childrenWrapperClassName='overflow-visible!'
          menuPosition={menuPosition}
          onClose={handleFilterClose}
        >
          <FilterDropdownMenu
            filterKey={colId}
            label={colDef?.headerName}
            filterType={filterType}
            {...(filterType === FILTER_TYPES.TAGS
              ? {
                  filterComponentProps,
                }
              : {})}
          />
        </PositionedMenuWrapper>
      )}
      {isDateFormatOpen && (
        <PositionedMenuWrapper
          id='custom-header-date-format-menu'
          className='w-60 px-1 py-3'
          childrenWrapperClassName='overflow-auto!'
          menuPosition={menuPosition}
          onClose={handleDateFormatClose}
        >
          <div className='mb-3.5 flex items-center gap-1.5 px-2'>
            <Button
              variant='ghost'
              size='icon'
              className='h-3.5 w-3.5 p-0 [&_svg]:size-3.5'
              onClick={handleDateFormatClose}
            >
              <SvgSpriteLoader id='arrow-narrow-left' size={14} color={COLORS.GRAY_900} />
            </Button>
            <span className='f-13-500'>Date Format</span>
          </div>
          <div>
            {DateFormatOptions.map((option) => (
              <Button
                key={option.value}
                variant='ghost'
                size='medium'
                className={cn('w-full', {
                  'bg-GRAY_100':
                    dateFormat === option.value || (!dateFormat && option.value === DATE_FORMATS.ddMMMyyyy),
                })}
                onClick={() => handleDateFormatChange(option.value)}
              >
                <span className='f-12-500 w-[102px] text-left'>{option.label}</span>
                <span className='f-11-450 w-[102px] text-left text-gray-900'>
                  {DATE_FORMATS.RELATIVE === option.value
                    ? formatRelativeWithCustomLocale()
                    : format(new Date(), option.value)}
                </span>
                <SvgSpriteLoader
                  id='check'
                  size={12}
                  color={COLORS.GRAY_900}
                  className={cn('opacity-0', {
                    'opacity-100':
                      dateFormat === option.value || (!dateFormat && option.value === DATE_FORMATS.ddMMMyyyy),
                  })}
                />
              </Button>
            ))}
          </div>
        </PositionedMenuWrapper>
      )}
      {isTypeOpen && (
        <PositionedMenuWrapper
          id='custom-header-type-menu'
          className='w-60 px-1 py-3'
          childrenWrapperClassName='overflow-auto!'
          menuPosition={menuPosition}
          onClose={handleTypeClose}
        >
          <div className='mb-3.5 flex items-center gap-1.5 px-2'>
            <Button variant='ghost' size='icon' className='h-3.5 w-3.5 p-0 [&_svg]:size-3.5' onClick={handleTypeClose}>
              <SvgSpriteLoader id='arrow-narrow-left' size={14} color={COLORS.GRAY_900} />
            </Button>
            <span className='f-13-500'>Display type</span>
          </div>
          <div>
            {DisplayTypeOptions.map((option) => (
              <Button
                key={option.value}
                variant='ghost'
                size='medium'
                className='w-full justify-between'
                onClick={() => handleTypeChange(option.value)}
              >
                <span className='f-12-500'>{option.label}</span>
              </Button>
            ))}
          </div>
        </PositionedMenuWrapper>
      )}
    </div>
  );
};

export default CustomHeader;
