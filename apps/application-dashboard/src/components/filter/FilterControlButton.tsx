import { FC, MouseEvent, PropsWithChildren, RefObject } from 'react';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { SIZE } from 'constants/common.constants';
import { ICON_SPRITE_TYPES } from 'constants/icons';
import { cn } from 'utils/common';
import TooltipV2 from '@/components/common/TooltipV2';
import { SIDE_OPTIONS } from '@/types/commonTypes';
import { Loader } from 'components/common/loader/Loader';

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
  tooltipPosition?: SIDE_OPTIONS;
}

const FilterControlButton: FC<FilterControlButtonProps> = ({
  onClick,
  tooltipText = '',
  tooltipPosition = SIDE_OPTIONS.BOTTOM,
  icon = 'filter-lines',
  iconCategory = ICON_SPRITE_TYPES.GENERAL,
  buttonRef,
  children,
  isSelected = false,
  childrenWrapperClassName = '',
  className = '',
  isLoading = false,
  id = '',
  disabled = false,
}) => {
  const onButtonClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (disabled || isLoading) {
      return;
    }

    onClick(event);
  };

  return (
    <TooltipV2 side={tooltipPosition} tooltipBody={tooltipText} asChildTrigger>
      <button
        className={cn(
          'border-GRAY_400 text-GRAY_1000 flex h-[26px] w-fit cursor-pointer items-center rounded border px-2 py-1.5 outline-hidden',
          className,
          isSelected ? 'bg-DIVIDER_SAIL_1' : '',
          disabled ? 'opacity-50' : 'hover:border-DIVIDER_SAIL_4',
        )}
        onClick={onButtonClick}
        ref={buttonRef}
        data-testid={`filter-control-button-${id}`}
        disabled={disabled}
      >
        {isLoading ? (
          <Loader size={SIZE.XSMALL} className='m-auto' />
        ) : (
          <>
            <SvgSpriteLoader id={icon} iconCategory={iconCategory} width={12} height={12} />
            {!!children && (
              <span className={`f-12-500 ${typeof children === 'string' ? 'ml-1' : ''} ${childrenWrapperClassName}`}>
                {children}
              </span>
            )}
          </>
        )}
      </button>
    </TooltipV2>
  );
};

export default FilterControlButton;
