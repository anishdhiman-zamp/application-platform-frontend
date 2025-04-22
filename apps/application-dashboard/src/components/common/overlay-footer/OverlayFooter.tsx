import { FC, ReactElement } from 'react';
import { SvgSpriteLoaderProps } from '@/components/SvgSpriteLoader';
import { SIZE_TYPES } from '@/types/common/components';
import { defaultFnType } from '@/types/commonTypes';
import { BUTTON_TYPES, ICON_POSITION_TYPES } from '@/types/components/button.type';
import { cn } from '@/utils/common';
import { Button } from 'components/common/button/Button';

export interface OverlayFooterProps {
  bottomBar?: ReactElement;
  onBack?: defaultFnType;
  onNext?: defaultFnType;
  isNextButtonDisabled?: boolean;
  nextButtonClassName?: string;
  backButtonClassName?: string;
  nextButtonTitle?: string | ReactElement;
  backButtonTitle?: string | ReactElement;
  isBackButtonLoading?: boolean;
  isNextButtonLoading?: boolean;
  nextButtonIconProps?: SvgSpriteLoaderProps;
  nextButtonIconPosition?: ICON_POSITION_TYPES;
  footerClassName?: string;
  nextButtonSize?: SIZE_TYPES;
  backButtonSize?: SIZE_TYPES;
}

const OverlayFooter: FC<OverlayFooterProps> = ({
  onBack,
  onNext,
  nextButtonClassName = '',
  backButtonClassName = '',
  nextButtonTitle = 'Next',
  backButtonTitle = 'Back',
  bottomBar,
  isBackButtonLoading,
  isNextButtonLoading,
  isNextButtonDisabled,
  nextButtonIconProps,
  nextButtonIconPosition,
  footerClassName = '',
  nextButtonSize = SIZE_TYPES.SMALL,
  backButtonSize = SIZE_TYPES.SMALL,
}) =>
  (bottomBar || onBack || onNext) && (
    <div className={cn('border-t p-4 border-GRAY_400 flex justify-end items-center gap-3 bg-white', footerClassName)}>
      {bottomBar ? (
        bottomBar
      ) : (
        <>
          {!!onBack && (
            <Button
              id='SIDE_DRAWER_BACK_BUTTON'
              size={backButtonSize}
              type={BUTTON_TYPES.SECONDARY}
              className={backButtonClassName}
              onClick={onBack}
              isLoading={isBackButtonLoading}
            >
              {backButtonTitle}
            </Button>
          )}
          {!!onNext && (
            <Button
              id='SIDE_DRAWER_NEXT_BUTTON'
              size={nextButtonSize}
              className={nextButtonClassName}
              onClick={onNext}
              isLoading={isNextButtonLoading}
              disabled={isNextButtonDisabled}
              iconProps={nextButtonIconProps}
              iconPosition={nextButtonIconPosition}
            >
              {nextButtonTitle}
            </Button>
          )}
        </>
      )}
    </div>
  );

export default OverlayFooter;
