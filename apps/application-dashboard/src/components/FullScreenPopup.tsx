import { FC } from 'react';
import { ZAMP_ICON } from 'constants/icons';
import Image from 'next/image';
import { defaultFn, defaultFnType } from 'types/commonTypes';
import { cn } from 'utils/common';
import SvgSpriteLoader from 'components/SvgSpriteLoader';

interface FullScreenPopupProps {
  onClose?: defaultFnType;
  hideLogo?: boolean;
  className?: string;
  childrenClassName?: string;
  children?: any;
  hideCloseButton?: boolean;
  isOpen: boolean;
}

const FullScreenPopup: FC<FullScreenPopupProps> = ({
  onClose = defaultFn,
  hideLogo = false,
  className = '',
  childrenClassName = '',
  children = null,
  hideCloseButton = false,
  isOpen,
}) => {
  if (!isOpen) return null;

  return (
    <div className={`h-screen w-screen fixed top-0 left-0 overflow-y-auto bg-white z-1000  ${className}`}>
      <div className='flex items-center justify-between p-4'>
        {!hideLogo && (
          <Image
            width={16}
            height={16}
            alt='zamp logo'
            className='w-4 align-middle cursor-pointer'
            src={ZAMP_ICON}
            priority
          />
        )}

        {!!onClose && !hideCloseButton && (
          <div className='p-2 rounded-full cursor-pointer' onClick={onClose}>
            <SvgSpriteLoader id='x-close' size={16} />
          </div>
        )}
      </div>
      <div className={cn('overflow-y-auto w-full', childrenClassName)}>{children}</div>
    </div>
  );
};

export default FullScreenPopup;
