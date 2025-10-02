import { FC, KeyboardEvent } from 'react';
import { Button, Input } from '@zamp-platform/ui';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { FILTER_TYPES } from '@/components/filter/filter.types';
import { COLORS } from '@/constants/colors';
import type { defaultFnType, MapAny } from '@/types/commonTypes';
import {
  DateFormatOptions,
  DisplayTypeNonApplicableFilterTypes,
  DisplayTypeOptions,
} from 'components/common/table/CustomHeader/customHeader.constants';
import { CustomHeaderMenuOptionTypes } from 'components/common/table/CustomHeader/customHeader.types';
import { TABLE_COPIES } from 'components/common/table/table.constants';

// Type definition for menu option items
export interface FilteredMenuOption {
  label: string;
  value: CustomHeaderMenuOptionTypes;
  iconId: string;
}

interface MainMenuPopoverProps {
  isSelfServe: boolean;
  isCurrentUserAdmin: boolean;
  headerName: string;
  setHeaderName: (value: string) => void;
  handleHeaderNameBlur: defaultFnType;
  handleHeaderNameKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
  filterType: FILTER_TYPES;
  dateFormat?: string;
  metadata?: {
    custom_type?: string;
    [key: string]: unknown;
  };
  handleMenuOptionClick: (value: CustomHeaderMenuOptionTypes) => void;
  filteredMenuOptions: FilteredMenuOption[];
  isTagColumn: boolean;
  filtersCount: number;
  selectedFilters: MapAny;
}

const MainMenuPopover: FC<MainMenuPopoverProps> = ({
  isSelfServe,
  isCurrentUserAdmin,
  headerName,
  setHeaderName,
  handleHeaderNameBlur,
  handleHeaderNameKeyDown,
  filterType,
  dateFormat,
  metadata,
  handleMenuOptionClick,
  filteredMenuOptions,
  isTagColumn,
  filtersCount,
  selectedFilters,
}) => (
  <div className='z-10! w-52 p-1'>
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
            {DisplayTypeOptions.find((item) => item.value === metadata?.custom_type)?.label ?? TABLE_COPIES.DEFAULT}
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
          <div className='f-11-400 mt-1.5 text-black'>{Object.keys(selectedFilters)?.length} filters applied</div>
        )}
      </div>
    )}
  </div>
);

export default MainMenuPopover;
