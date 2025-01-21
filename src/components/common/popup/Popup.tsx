import React, { FC } from 'react';
import { ICON_SPRITE_TYPES } from 'constants/icons';
import { defaultFnType } from 'types/commonTypes';
import { cn, stopPropagationAction } from 'utils/common';
import SvgSpriteLoader from 'components/SvgSpriteLoader';

type PopupProps = {
  title?: string;
  titleClassName?: string;
  popupWrapperClassName?: string;
  showIcon?: boolean;
  iconCategory?: ICON_SPRITE_TYPES;
  iconId: string;
  iconColor?: string;
  isOpen: boolean;
  children: any;
  className?: string;
  onClose?: defaultFnType;
  closeOnClickOutside?: boolean;
};

const Popup: FC<PopupProps> = ({
  title,
  titleClassName,
  popupWrapperClassName,
  showIcon,
  iconCategory,
  iconId,
  iconColor,
  isOpen = false,
  children,
  className = '',
  onClose,
  closeOnClickOutside = true,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className={cn(
        `bg-GRAY_70 transition-all duration-300 ease-in fixed w-screen h-screen z-1000 top-0 left-0 ${
          isOpen ? 'opacity-1' : 'hidden opacity-0'
        }`,
      )}
      role='presentation'
      onClick={() => {
        if (closeOnClickOutside) onClose?.();
      }}
    >
      <div className='w-full h-full flex items-center justify-center'>
        <div
          className={cn(
            `transition-all duration-300 ease-in px-5 py-5 rounded-xl block ${className} ${
              isOpen ? ' translate-y-0 opacity-1' : 'translate-y-[50px] opacity-0'
            }`,
          )}
          role='presentation'
          onClick={stopPropagationAction}
        >
            <div className={cn(`flex w-full justify-between items-center px-5 pt-5 pb-0 ${popupWrapperClassName}`)}>
              {title && <span className={titleClassName}>{title}</span>}
              {showIcon && (
                <div className='p-1 cursor-pointer' onClick={onClose}>
                  <SvgSpriteLoader id={iconId} iconCategory={iconCategory} width={16} height={16} color={iconColor} />
                </div>
              )}
            </div>
            {children}
        </div>
      </div>
    </div>
  );
};

export default Popup;
