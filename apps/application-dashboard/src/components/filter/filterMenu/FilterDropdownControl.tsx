import React, { FC, MouseEvent } from 'react';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { ICON_SPRITE_TYPES } from '@zamp-platform/ui/types';
import { defaultFnType } from 'types/commonTypes';
import { cn, formatToNormalText } from 'utils/common';
import { FilterConfigType } from 'components/filter/filter.types';

interface FilterDropdownControlProps {
  onClick?: defaultFnType;
  className?: string;
  filterConfig: FilterConfigType;
  onClear?: ((filterKey: string) => void) | null;
  controlClassName?: string;
  isMenuDropdownOpen?: boolean;
  allowClear?: boolean;
  isOpen?: boolean;
  titleClassName?: string;
  isHighlighted?: boolean;
}

const FilterDropdownControl: FC<FilterDropdownControlProps> = ({
  onClick,
  filterConfig,
  className = '',
  controlClassName = '',
  onClear,
  isMenuDropdownOpen,
  allowClear,
  isOpen,
  titleClassName = '',
  isHighlighted = false,
}) => {
  const handleRemoveFilter = (e: MouseEvent) => {
    if (allowClear) {
      e.stopPropagation();
      onClear?.(filterConfig.key);
    }
  };

  return (
    <div
      data-testid={`filter-control-${filterConfig?.key}`}
      className={cn('relative cursor-pointer', className)}
      onClick={onClick}
    >
      <div
        className={cn(
          'hover:border-DIVIDER_SAIL_4 border-DIVIDER_SAIL_3 flex h-[26px] w-fit items-center gap-1.5 rounded border bg-white px-1.5 py-1.5 select-none',
          isMenuDropdownOpen ? 'border-DIVIDER_SAIL_4' : '',
          controlClassName,
          { 'shadow-chart-highlight': isHighlighted },
        )}
        data-testid={`${filterConfig?.key}-filter-control-container`}
      >
        <div className='f-12-400 text-GRAY_900 max-w-[200px] truncate whitespace-nowrap' title={filterConfig?.label}>
          {formatToNormalText(filterConfig?.label)}
        </div>
        <div
          className={cn('f-12-500 text-GRAY_1000 max-w-[200px] truncate whitespace-nowrap', titleClassName)}
          title={filterConfig?.title}
        >
          {filterConfig?.title}
        </div>
        <div onClick={handleRemoveFilter} data-testid={`${filterConfig?.key}-filter-control-remove-btn`}>
          {allowClear ? (
            <SvgSpriteLoader
              id='x-close'
              iconCategory={ICON_SPRITE_TYPES.GENERAL}
              width={12}
              height={12}
              className={'text-GRAY_700 mt-0.5'}
            />
          ) : (
            <SvgSpriteLoader
              id='chevron-down'
              iconCategory={ICON_SPRITE_TYPES.ARROWS}
              width={16}
              height={16}
              className={cn('text-GRAY_700 transition-transform duration-300', isOpen ? 'rotate-180' : 'rotate-0')}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default FilterDropdownControl;
