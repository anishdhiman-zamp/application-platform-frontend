import { FC, ReactElement } from 'react';
import SvgSpriteLoader from '@/components/SvgSpriteLoader';
import { ICON_SPRITE_TYPES } from '@/constants/icons';
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
    <div className={cn('min-h-[56px] pl-5 pr-4 f-16-300 flex justify-between items-center py-4', headerClassName)}>
      {topBar ? (
        topBar
      ) : (
        <div className='grow'>
          <div className='f-14-550 gap-1 flex items-center '>
            <div className={cn(titleClassName)}>{title}</div>
            {step && <div className='text-ZAMP_PRIMARY uppercase f-12-300'>step {step}</div>}
          </div>
          {!!subtitle && <div className={cn('f-11-300 text-GRAY_600 mt-1', subtitleClassName)}>{subtitle}</div>}
        </div>
      )}

      {!!onClose && !hideCloseButton && (
        <div
          className={cn('hover:bg-BACKGROUND_SECONDARY p-2 rounded-full cursor-pointer', closeButtonClassName)}
          onClick={onClose}
        >
          <SvgSpriteLoader id='x-close' iconCategory={ICON_SPRITE_TYPES.GENERAL} {...closeButtonDimensions} />
        </div>
      )}
    </div>
  );

export default OverlayTitle;
