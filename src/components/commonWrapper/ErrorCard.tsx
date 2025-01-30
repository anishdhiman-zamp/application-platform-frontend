import { FC } from 'react';
import { ICON_SPRITE_TYPES } from 'constants/icons';
import { SIZE_TYPES } from 'types/common/components';
import { defaultFn } from 'types/commonTypes';
import { BUTTON_TYPES } from 'types/components/button.type';
import { cn } from 'utils/common';
import { Button } from 'components/common/button/Button';
import { ErrorCardPropTypes, ErrorCardTypes } from 'components/commonWrapper/commonWrapper.types';
import SvgSpriteLoader from 'components/SvgSpriteLoader';

const ErrorCard: FC<ErrorCardPropTypes> = ({
  className,
  onClose = defaultFn,
  type = ErrorCardTypes.API_FAIL,
  isLoading = false,
  height,
  subtitle = 'Something went wrong please try again...',
  refetchButtonId = '',
  contentClassName = '',
}) => {
  switch (type) {
    case ErrorCardTypes.API_FAIL: {
      return (
        <div
          className={cn('tw-animate-opacity tw-flex tw-items-center', className)}
          style={{ minHeight: height && height + 'px' }}
        >
          <div className={cn('tw-w-full tw-flex tw-justify-center tw-py-6', contentClassName)}>
            <div>
              <SvgSpriteLoader id='alert-circle' iconCategory={ICON_SPRITE_TYPES.ALERTS_AND_FEEDBACK} />
            </div>
            <div className='tw-ml-2.5 '>
              <div className='f-16-400 tw-mb-4'>{subtitle}</div>
              <div>
                <Button
                  type={BUTTON_TYPES.SECONDARY}
                  isLoading={isLoading}
                  size={SIZE_TYPES.SMALL}
                  onClick={onClose}
                  id={refetchButtonId}
                >
                  <span className='f-12-400'>Try again</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    }
    default:
      return null;
  }
};

export default ErrorCard;
