import React, { FC } from 'react';
import { ICON_SPRITE_TYPES } from 'constants/icons';
import { FilterConfigType } from 'components/filter/filter.types';
import SvgSpriteLoader from 'components/SvgSpriteLoader';

interface FilterDropdownControlProps {
  onClick?: () => void;
  className?: string;
  filterConfig: FilterConfigType;
  onClear?: ((filterKey: string) => void) | null;
  controlClassName?: string;
  isMenuDropdownOpen?: boolean;
  allowClear?: boolean;
}

const FilterDropdownControl: FC<FilterDropdownControlProps> = ({
  onClick,
  filterConfig,
  className = '',
  controlClassName = '',
  onClear,
  isMenuDropdownOpen,
  allowClear
}) => {

  const handleRemoveFilter = (e: React.MouseEvent) => {

    if (allowClear) {
      e.stopPropagation();
      onClear?.(filterConfig.key);
    }
  };


  return (
    <div
      data-testid={`filter-control-${filterConfig?.key}`}
      className={`cursor-pointer relative ${className}`}
      onClick={onClick}
    >
      <div
        className={`select-none rounded h-[26px] flex border hover:border-DIVIDER_SAIL_4 border-DIVIDER_SAIL_3 px-3 py-1.5 bg-white items-center w-fit ${isMenuDropdownOpen ? 'border-DIVIDER_SAIL_4' : ''
          } ${controlClassName}`}
      >
        <div className='mr-3 f-12-400 text-GRAY_900'>{filterConfig?.label}</div>
        <div className='relative w-4 h-4 group' onClick={handleRemoveFilter}>
          {allowClear && (
            <SvgSpriteLoader
              id='x-close'
              iconCategory={ICON_SPRITE_TYPES.GENERAL}
              width={16}
              height={16}
              className='absolute top-0 right-0 opacity-0 group-hover:opacity-100'
            />
          )}
          <SvgSpriteLoader
            id='chevron-down'
            iconCategory={ICON_SPRITE_TYPES.ARROWS}
            width={16}
            height={16}
            className={`${allowClear ? 'absolute top-0 right-0 opacity-100 group-hover:opacity-0' : ''}`}
          />
        </div>
      </div>
    </div>
  );
};

export default FilterDropdownControl;
