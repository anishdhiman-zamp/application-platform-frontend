import React, { type CSSProperties, FC, ReactNode } from 'react';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { ICON_SPRITE_TYPES } from 'constants/icons';
import { defaultFnType } from 'types/commonTypes';
import { cn } from 'utils/common';

export interface MenuWrapperProps {
  children: ReactNode;
  className?: string;
  resetText?: string;
  resetClassName?: string;
  resetTextClassName?: string;
  onReset?: defaultFnType;
  id: string;
  childrenWrapperClassName?: string;
  style?: CSSProperties;
}

export const MenuWrapper: FC<MenuWrapperProps> = ({
  children,
  className = '',
  resetText = 'Reset filters',
  resetClassName = '',
  resetTextClassName = '',
  onReset,
  id,
  childrenWrapperClassName = '',
  style,
}) => {
  const handleReset = () => {
    onReset?.();
  };

  return (
    <div
      className={cn('z-1 shadow-menu-list border-0.5 border-GRAY_500 relative rounded-md bg-white', className)}
      data-testid={`menu-wrapper-${id}`}
      style={style}
    >
      <div
        className={`max-h-[300px] overflow-y-scroll ${childrenWrapperClassName}`}
        data-testid={`menu-wrapper-children-${id}`}
      >
        {children}
      </div>
      {!!onReset && (
        <div
          className={`border-GRAY_400 flex border-t py-3 pl-4 ${resetClassName}`}
          onClick={handleReset}
          data-testid={`menu-wrapper-reset-${id}`}
        >
          <SvgSpriteLoader id='refresh-ccw-01' iconCategory={ICON_SPRITE_TYPES.ARROWS} height={14} width={14} />
          <div className={`f-12-400 pl-2 ${resetTextClassName}`} data-testid={`menu-wrapper-reset-text-${id}`}>
            {resetText}
          </div>
        </div>
      )}
    </div>
  );
};
