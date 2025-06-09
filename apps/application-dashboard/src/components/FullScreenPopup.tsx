import { FC } from 'react';
import { Sheet, SheetContent } from '@zamp-platform/ui';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { ZAMP_ICON } from 'constants/icons';
import Image from 'next/image';
import { defaultFn, defaultFnType } from 'types/commonTypes';
import { cn } from 'utils/common';

interface FullScreenPopupProps {
  onClose?: defaultFnType;
  hideLogo?: boolean;
  className?: string;
  childrenClassName?: string;
  children?: any;
  hideCloseButton?: boolean;
  isOpen: boolean;
  hideHeader?: boolean;
}

const FullScreenPopup: FC<FullScreenPopupProps> = ({
  onClose = defaultFn,
  hideLogo = false,
  childrenClassName = '',
  children = null,
  hideCloseButton = false,
  isOpen,
  hideHeader = false,
}) => {
  if (!isOpen) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent size='large' className='z-1004 m-0 h-screen! w-screen rounded-none'>
        {!hideHeader && (
          <div className='flex items-center justify-between p-4'>
            {!hideLogo && (
              <Image
                width={16}
                height={16}
                alt='zamp logo'
                className='w-4 cursor-pointer align-middle'
                src={ZAMP_ICON}
                priority
              />
            )}

            {!!onClose && !hideCloseButton && (
              <div className='cursor-pointer rounded-full p-2' onClick={onClose}>
                <SvgSpriteLoader id='x-close' size={16} />
              </div>
            )}
          </div>
        )}
        <div className={cn('w-full overflow-y-auto', childrenClassName)}>{children}</div>
      </SheetContent>
    </Sheet>
  );
};

export default FullScreenPopup;
