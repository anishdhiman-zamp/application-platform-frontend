import { FC, useState } from 'react';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { ERROR_BUTTON_TEXT } from 'constants/auth.constants';
import { COLORS } from 'constants/colors';
import { ICON_SPRITE_TYPES } from 'constants/icons';
import { SIZE_TYPES } from 'types/common/components';
import { defaultFn } from 'types/commonTypes';
import { BUTTON_TYPES } from 'types/components/button.type';
import { cn } from 'utils/common';
import { Button } from 'components/common/button/Button';
import { ErrorCardPropTypes, ErrorCardTypes } from 'components/commonWrapper/commonWrapper.types';

const ErrorCard: FC<ErrorCardPropTypes> = ({
  className,
  onClose = defaultFn,
  type = ErrorCardTypes.GENERAL_API_FAIL,
  isLoading = false,
  height,
  title = 'Something went wrong',
  subtitle = "We wish we could blame the WiFi, but this one's on us.",
  refetchButtonId = '',
  contentClassName = '',
}) => {
  const [isOfflineClicked, setIsOfflineClick] = useState(false);
  const toggleIsOfflineClick = () => setIsOfflineClick(!isOfflineClicked);

  switch (type) {
    case ErrorCardTypes.GENERAL_API_FAIL: {
      return (
        <div
          className={cn('animate-opacity flex h-full items-center', className)}
          style={{ minHeight: height && height + 'px' }}
        >
          <div className='flex h-full w-full flex-col items-center justify-center gap-y-9'>
            <div className={cn('flex w-full flex-col items-center justify-center gap-y-3', contentClassName)}>
              <SvgSpriteLoader
                id='alert-triangle'
                iconCategory={ICON_SPRITE_TYPES.ALERTS_AND_FEEDBACK}
                color={COLORS.RED_800}
              />
              <div className='flex flex-col items-center justify-center gap-1'>
                <span className='f-13-600 text-black'>{title}</span>
                <span className='f-11-400 text-GRAY_900'>{subtitle}</span>
              </div>
              <div className='flex items-center justify-center gap-1.5'>
                <Button
                  type={BUTTON_TYPES.SECONDARY}
                  isLoading={isLoading}
                  id='wifi-only'
                  size={SIZE_TYPES.SMALL}
                  onClick={toggleIsOfflineClick}
                  className={isOfflineClicked ? 'px-2.5! py-1.5!' : 'p-1.5!'}
                >
                  {isOfflineClicked ? (
                    <span className='text-base'>{ERROR_BUTTON_TEXT.WIFI_ONLY_EMOJI}</span>
                  ) : (
                    <span className='f-12-400'>{ERROR_BUTTON_TEXT.WIFI_ONLY}</span>
                  )}
                </Button>
                <Button
                  type={BUTTON_TYPES.SECONDARY}
                  isLoading={isLoading}
                  size={SIZE_TYPES.SMALL}
                  onClick={onClose}
                  id={refetchButtonId}
                  className='px-2.5 py-1.5'
                >
                  <span className='f-12-400'>Reload</span>
                </Button>
              </div>
            </div>
            <div className='flex max-w-[182px] items-center justify-center text-center text-wrap'>
              <span className='text-GRAY_700 f-11-400'>Also, our team has been notified and is working on it!</span>
            </div>
          </div>
        </div>
      );
    }
    case ErrorCardTypes.KPI_API_FAIL:
      return (
        <div
          className={cn('animate-opacity flex h-fit items-center', className)}
          style={{ minHeight: height && height + 'px' }}
        >
          <div className='flex h-full w-full items-center justify-between'>
            <div className='hover:bg-GRAY_100 flex items-center gap-2 rounded-[6px] px-2 py-1.5'>
              <SvgSpriteLoader
                id='alert-triangle'
                iconCategory={ICON_SPRITE_TYPES.ALERTS_AND_FEEDBACK}
                color={COLORS.RED_800}
              />
              <span className='f-13-400 text-GRAY_900'>
                <span className='f-13-400 text-GRAY_900'>Something&rsquo;s wrong</span>
              </span>
            </div>
            <div className='hover:bg-GRAY_100 rounded p-1'>
              <SvgSpriteLoader
                id='refresh-ccw-01'
                iconCategory={ICON_SPRITE_TYPES.ARROWS}
                height={16}
                width={16}
                color={COLORS.GRAY_1000}
              />
            </div>
          </div>
        </div>
      );
    default:
      return null;
  }
};

export default ErrorCard;
