import React, { FC, MouseEvent, PropsWithChildren, RefObject } from 'react';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { ICON_SPRITE_TYPES } from '@zamp-platform/ui/types';
import { cn } from 'utils/common';
import { Loader } from 'components/common/loader/Loader';
import { Tooltip, TooltipPositions } from 'components/common/tooltip';

interface FilterControlButtonProps extends PropsWithChildren {
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
  tooltipText?: string;
  icon?: string;
  iconCategory?: ICON_SPRITE_TYPES;
  iconColor?: string;
  buttonRef?: RefObject<HTMLButtonElement | null>;
  isSelected?: boolean;
  childrenWrapperClassName?: string;
  className?: string;
  isLoading?: boolean;
  disabled?: boolean;
  id?: string;
  tooltipPosition?: TooltipPositions;
  testIdSuffix?: string;
}

const FilterControlButton: FC<FilterControlButtonProps> = ({
  onClick,
  tooltipText = '',
  tooltipPosition = TooltipPositions.BOTTOM,
  icon = 'plus',
  iconCategory = ICON_SPRITE_TYPES.GENERAL,
  iconColor,
  buttonRef,
  children,
  isSelected = false,
  childrenWrapperClassName = '',
  className = '',
  isLoading = false,
  id = '',
  disabled = false,
  testIdSuffix,
}) => {
  const onButtonClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (disabled || isLoading) {
      return;
    }

    onClick(event);
  };

  return (
    <Tooltip
      tooltipBody={tooltipText}
      color='{TMS_COLORS.GRAY_200}'
      tooltipBodyClassName='f-12-300 px-3 py-1.5 rounded-md whitespace-nowrap z-999 bg-black text-GRAY_200'
      className='z-1'
      disabled={disabled}
      position={tooltipPosition}
    >
      <button
        className={cn(
          'border-DIVIDER_SAIL_2 mb-3 flex h-fit w-fit items-center rounded-lg border px-2 py-1.5 outline-hidden',
          className,
          isSelected ? 'bg-DIVIDER_SAIL_1' : '',
          disabled ? 'opacity-50' : 'hover:border-DIVIDER_SAIL_4',
        )}
        onClick={onButtonClick}
        ref={buttonRef}
        data-testid={`filter-control-button-${id}${testIdSuffix ? `-${testIdSuffix}` : ''}`}
        disabled={disabled}
      >
        {isLoading ? (
          <Loader className='m-auto' />
        ) : (
          <>
            <SvgSpriteLoader id={icon} iconCategory={iconCategory} width={14} height={14} color={iconColor} />
            {!!children && (
              <span className={`f-13-400 ${typeof children === 'string' ? 'ml-1.5' : ''} ${childrenWrapperClassName}`}>
                {children}
              </span>
            )}
          </>
        )}
      </button>
    </Tooltip>
  );
};

export default FilterControlButton;
