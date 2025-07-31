import { FC, ReactElement } from 'react';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { ICON_SPRITE_TYPES } from '@zamp-platform/ui/types';
import { defaultFnType } from '@/types/commonTypes';
import { cn } from '@/utils/common';

export interface OverlayTitleProps {
  topBar?: ReactElement | string;
  subtitle?: string | ReactElement;
  step?: string;
  title?: string | ReactElement;
  hideCloseButton?: boolean;
  onClose: defaultFnType;
  headerClassName?: string;
  closeButtonClassName?: string;
  closeButtonDimensions?: { width: number; height: number };
  titleClassName?: string;
  subtitleClassName?: string;
}

const OverlayTitle: FC<OverlayTitleProps> = ({
  topBar,
  title,
  hideCloseButton,
  step,
  subtitle,
  onClose,
  headerClassName = '',
  closeButtonClassName,
  titleClassName = '',
  subtitleClassName = '',
  closeButtonDimensions = { size: 14 },
}) =>
  (topBar || title || !hideCloseButton) && (
    <div className={cn('f-16-300 flex min-h-[56px] items-center justify-between py-4 pr-4 pl-5', headerClassName)}>
      {topBar ? (
        topBar
      ) : (
        <div className='grow'>
          <div className='f-14-550 flex items-center gap-1'>
            <div className={cn(titleClassName)}>{title}</div>
            {step && <div className='text-ZAMP_PRIMARY f-12-300 uppercase'>step {step}</div>}
          </div>
          {!!subtitle && <div className={cn('f-11-300 text-GRAY_600 mt-1', subtitleClassName)}>{subtitle}</div>}
        </div>
      )}

      {!!onClose && !hideCloseButton && (
        <div
          className={cn('hover:bg-BACKGROUND_SECONDARY cursor-pointer rounded-full p-2', closeButtonClassName)}
          onClick={onClose}
        >
          <SvgSpriteLoader id='x-close' iconCategory={ICON_SPRITE_TYPES.GENERAL} {...closeButtonDimensions} />
        </div>
      )}
    </div>
  );

export default OverlayTitle;
