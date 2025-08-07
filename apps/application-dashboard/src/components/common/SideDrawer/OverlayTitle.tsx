import { FC } from 'react';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { ICON_SPRITE_TYPES } from '@zamp-platform/ui/types';
import { cn } from 'utils/common';
import { OverlayTitleProps } from 'components/common/SideDrawer/sideDrawer.types';

// TODO: needs to be updated to use the new design system
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
  closeButtonDimensions = { width: 24, height: 24 },
}) =>
  (topBar || title || !hideCloseButton) && (
    <div
      className={cn('f-16-300 flex min-h-[56px] items-center justify-between border-b px-4 py-2.5', headerClassName)}
    >
      {topBar ? (
        topBar
      ) : (
        <div className='grow'>
          <div className='f-14-500 flex items-center gap-1'>
            <div className={titleClassName}>{title}</div>
            {step && <div className='text-GRAY_1000 f-12-300 uppercase'>step {step}</div>}
          </div>
          {!!subtitle && <div className={cn('f-11-300 text-GRAY_600 mt-1', subtitleClassName)}>{subtitle}</div>}
        </div>
      )}

      {!!onClose && !hideCloseButton && (
        <div className={cn('cursor-pointer rounded-full p-2', closeButtonClassName)} onClick={onClose}>
          <SvgSpriteLoader id='x-close' iconCategory={ICON_SPRITE_TYPES.GENERAL} {...closeButtonDimensions} />
        </div>
      )}
    </div>
  );

export default OverlayTitle;
