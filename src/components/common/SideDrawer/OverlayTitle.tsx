import { FC } from 'react';
import { ICON_SPRITE_TYPES } from 'constants/icons';
import { cn } from 'utils/common';
import { OverlayTitleProps } from 'components/common/SideDrawer/sideDrawer.types';
import SvgSpriteLoader from 'components/SvgSpriteLoader';

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
      className={cn(
        'tw-min-h-[56px] tw-px-4 tw-border-b tw-border-400 f-16-300 tw-flex tw-justify-between tw-items-center tw-py-2.5',
        headerClassName,
      )}
    >
      {topBar ? (
        topBar
      ) : (
        <div className='tw-grow'>
          <div className='f-14-500 tw-gap-1 tw-flex tw-items-center '>
            <div className={titleClassName}>{title}</div>
            {step && <div className='tw-text-GRAY_1000 tw-uppercase f-12-300'>step {step}</div>}
          </div>
          {!!subtitle && <div className={cn('f-11-300 tw-text-GRAY_600 tw-mt-1', subtitleClassName)}>{subtitle}</div>}
        </div>
      )}

      {!!onClose && !hideCloseButton && (
        <div className={cn('tw-p-2 tw-rounded-full tw-cursor-pointer', closeButtonClassName)} onClick={onClose}>
          <SvgSpriteLoader id='x-close' iconCategory={ICON_SPRITE_TYPES.GENERAL} {...closeButtonDimensions} />
        </div>
      )}
    </div>
  );

export default OverlayTitle;
