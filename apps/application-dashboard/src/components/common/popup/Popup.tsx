import { FC } from 'react';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { cn, stopPropagationAction } from 'utils/common';
import { PopupProps } from 'components/common/popup/popup.types';

const Popup: FC<PopupProps> = ({
  title,
  subTitle,
  titleClassName,
  subTitleClassName,
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
  isOverlay = true,
  wrapperClassName,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className={cn(
        `fixed top-0 left-0 z-1000 h-screen w-screen transition-all duration-300 ease-in ${isOverlay ? 'bg-GRAY_70' : ''} ${
          isOpen ? 'opacity-100' : 'hidden opacity-0'
        }`,
      )}
      role='presentation'
      onClick={() => {
        if (closeOnClickOutside) onClose?.();
      }}
    >
      <div className={cn('flex h-full w-full items-center justify-center', wrapperClassName)}>
        <div
          className={cn(
            `block rounded-xl px-5 py-5 transition-all duration-300 ease-in ${className} ${
              isOpen ? 'translate-y-0 opacity-100' : 'translate-y-[50px] opacity-0'
            }`,
          )}
          role='presentation'
          onClick={stopPropagationAction}
        >
          <div className={cn('flex w-full items-center justify-between px-5 pt-5 pb-0', popupWrapperClassName)}>
            <div className='flex flex-col'>
              {title && <span className={cn('f-16-600 text-GRAY_950', titleClassName)}>{title}</span>}
              {subTitle && <span className={cn('f-12-400 text-GRAY_700 mt-1', subTitleClassName)}>{subTitle}</span>}
            </div>
            {showIcon && (
              <div className='cursor-pointer p-1' onClick={onClose}>
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
