import React from 'react';
import { BUTTON_TYPE, SIZE } from 'constants/common.constants';
import { ICON_SPRITE_TYPES } from 'constants/icons';
import { defaultFn } from 'types/commonTypes';
import { doDebounce } from 'utils/common';
import Icon, { IconProps } from 'components/Icon/Icon';
import SvgSpriteLoader from 'components/SvgSpriteLoader';

const ICON_SIZE_BY_TYPE = {
  [SIZE.LARGE]: 16,
  [SIZE.MEDIUM]: 16,
  [SIZE.SMALL]: 14,
  [SIZE.XSMALL]: 12,
};

const BUTTON_SIZE_CLASSNAME = {
  [SIZE.LARGE]: 'py-3 px-3.5 text-14 font-medium gap-1.5',
  [SIZE.MEDIUM]: 'py-2 px-3.5 text-13 font-medium gap-1.5',
  [SIZE.SMALL]: 'py-1.5 px-3 text-12 font-medium gap-1',
  [SIZE.XSMALL]: 'py-1.5 px-2.5 text-11 font-medium',
};

export const BUTTON_BG_CLASSNAME = {
  [BUTTON_TYPE.PRIMARY]:
    'bg-black text-white hover:bg-black-hover active:bg-black-hover disabled:bg-bg-disabled disabled:text-text-disabled',
  [BUTTON_TYPE.SECONDARY]:
    'tw-bg-white text-text-primary border-border border hover:bg-grey-2 active:bg-grey-100 disabled:bg-grey-1 disabled:text-text-disabled',
  [BUTTON_TYPE.TERTIARY]: 'text-text-primary hover:bg-grey-100 active:bg-grey-300 disabled:text-text-disabled',
  [BUTTON_TYPE.ICON]:
    'text-grey-900 hover:bg-grey-300 active:bg-grey-300 active:text-grey-1000 disabled:text-text-disabled',
  [BUTTON_TYPE.DESTRUCTIVE_HC]:
    'bg-hc-red text-white hover:bg-hc-red-hover active:bg-hc-red-hover disabled:bg-grey-200 disabled:text-text-disabled',
  [BUTTON_TYPE.DESTRUCTIVE_LC]:
    'text-hc-red border border-hc-red hover:border-hc-red-hover hover:text-hc-red-hover disabled:border-hc-disabled disabled:text-text-disabled',
  [BUTTON_TYPE.LINK]: 'text-hc-blue hover:text-text-secondary',
};

const BUTTON_DEFAULT_STYLES = 'cursor-pointer disabled:cursor-not-allowed rounded-md flex items-center justify-center';
const ICON_SIZE_CLASSNAME = 'p-1';

export type ButtonProps = {
  variant?: BUTTON_TYPE;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  size?: SIZE;
  className?: string;
  onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
  isLoading?: boolean;
  id: string;
  eventCallback?: (type: string, data: Record<string, unknown>) => void;
  children?: React.ReactNode;
  licon?: IconProps;
  ticon?: IconProps;
  tabIndex?: number;
  onMouseEnter?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onMouseLeave?: (e: React.MouseEvent<HTMLButtonElement>) => void;
};

const Button: React.FC<ButtonProps> = ({
  variant = BUTTON_TYPE.PRIMARY,
  type = 'button',
  disabled = false,
  size = SIZE.LARGE,
  className = '',
  onClick = defaultFn,
  isLoading = false,
  id = '',
  eventCallback,
  children = null,
  licon,
  ticon,
  tabIndex = 0,
  onMouseEnter = defaultFn,
  onMouseLeave = defaultFn,
}) => {
  const sizeClassName = variant === BUTTON_TYPE.ICON ? ICON_SIZE_CLASSNAME : BUTTON_SIZE_CLASSNAME?.[size];
  const bgClassName = BUTTON_BG_CLASSNAME?.[variant];
  const iconSize = ICON_SIZE_BY_TYPE[size];

  const wrapperClassName = `${sizeClassName} ${bgClassName}`;

  const handleButtonClick = (e?: React.MouseEvent<HTMLButtonElement>) => {
    if (isLoading || disabled) return;

    onClick(e);
    eventCallback?.('BUTTON_CLICK' + id, {
      id,
      text: typeof children === 'string' ? children : 'ReactElement',
    });
  };

  const debouncedClick = doDebounce(handleButtonClick, 500);

  return (
    <button
      type={type}
      tabIndex={tabIndex}
      data-testid={`btn-${id}`}
      onClick={debouncedClick}
      disabled={disabled}
      className={`${BUTTON_DEFAULT_STYLES} ${wrapperClassName} ${className}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {isLoading ? (
        <div className='animate-spin'>
          <SvgSpriteLoader
            className='animate-spin duration-1000'
            id='loading-01'
            height={iconSize}
            width={iconSize}
            iconCategory={ICON_SPRITE_TYPES.GENERAL}
          />
        </div>
      ) : (
        <>
          {licon && <Icon {...licon} size={iconSize} className={variant !== BUTTON_TYPE.ICON ? 'mr-1' : ''} />}

          {children && <div className=''>{children}</div>}

          {ticon && <Icon {...ticon} size={iconSize} className={variant !== BUTTON_TYPE.ICON ? 'ml-1' : ''} />}
        </>
      )}
    </button>
  );
};

export default Button;
