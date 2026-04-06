import React, { FC, ReactNode, useRef } from 'react';
import { createPortal } from 'react-dom';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { ICON_SPRITE_TYPES } from '@zamp-platform/ui/types';
import { useOnClickOutside } from 'hooks';
import { defaultFnType } from 'types/commonTypes';
import { cn } from 'utils/common';

export interface PositionedMenuWrapperProps {
  children: ReactNode;
  className?: string;
  resetText?: string;
  resetClassName?: string;
  resetTextClassName?: string;
  onReset?: defaultFnType;
  id: string;
  childrenWrapperClassName?: string;
  menuPosition?: { top: number; left: number };
  onClose?: defaultFnType;
}

const PositionedMenuWrapper: FC<PositionedMenuWrapperProps> = ({
  children,
  className = '',
  resetText = 'Reset filters',
  resetClassName = '',
  resetTextClassName = '',
  onReset,
  id,
  childrenWrapperClassName = '',
  menuPosition,
  onClose,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  const handleReset = () => {
    onReset?.();
  };

  useOnClickOutside(menuRef, () => {
    onClose?.();
  });

  return createPortal(
    <div
      className={cn('abslolute shadow-menu-list border-0.5 border-GRAY_500 bg-BG_WHITE z-1202 rounded-md', className)}
      data-testid={`menu-wrapper-${id}`}
      style={{
        top: menuPosition?.top + 'px',
        left: menuPosition?.left + 'px',
        position: 'absolute',
      }}
      ref={menuRef}
    >
      <div
        className={cn('max-h-[400px] overflow-y-scroll', childrenWrapperClassName)}
        data-testid={`menu-wrapper-children-${id}`}
      >
        {children}
      </div>
      {!!onReset && (
        <div
          className={cn('border-GRAY_400 flex border-t py-3 pl-4', resetClassName)}
          onClick={handleReset}
          data-testid={`menu-wrapper-reset-${id}`}
        >
          <SvgSpriteLoader id='refresh-ccw-01' iconCategory={ICON_SPRITE_TYPES.ARROWS} height={14} width={14} />
          <div className={cn('f-12-400 pl-2', resetTextClassName)} data-testid={`menu-wrapper-reset-text-${id}`}>
            {resetText}
          </div>
        </div>
      )}
    </div>,
    document.body,
  );
};

export default PositionedMenuWrapper;
