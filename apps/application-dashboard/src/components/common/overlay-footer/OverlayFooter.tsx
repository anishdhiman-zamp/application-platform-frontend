import { FC, ReactElement } from 'react';
import { Button, ButtonSize } from '@zamp-platform/ui';
import { SvgSpriteLoader, SvgSpriteLoaderProps } from '@zamp-platform/ui/assets';
import { cn } from '@/utils/common';

export interface OverlayFooterProps {
  bottomBar?: ReactElement;
  onBack?: () => void;
  onNext?: () => void;
  isNextButtonDisabled?: boolean;
  nextButtonClassName?: string;
  backButtonClassName?: string;
  nextButtonTitle?: string | ReactElement;
  backButtonTitle?: string | ReactElement;
  isBackButtonLoading?: boolean;
  isNextButtonLoading?: boolean;
  nextButtonIconProps?: SvgSpriteLoaderProps;
  nextButtonIconPosition?: 'LEFT' | 'RIGHT';
  footerClassName?: string;
  nextButtonSize?: ButtonSize;
  backButtonSize?: ButtonSize;
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
  nextButtonSize = 'small',
  backButtonSize = 'small',
}) =>
  (bottomBar || onBack || onNext) && (
    <div className={cn('border-GRAY_400 flex items-center justify-end gap-3 border-t bg-white p-4', footerClassName)}>
      {bottomBar ? (
        bottomBar
      ) : (
        <>
          {!!onBack && (
            <Button
              testId='SIDE_DRAWER_BACK_BUTTON'
              size={backButtonSize}
              variant='outline'
              className={backButtonClassName}
              onClick={onBack}
              isLoading={isBackButtonLoading}
            >
              {backButtonTitle}
            </Button>
          )}
          {!!onNext && (
            <Button
              testId='SIDE_DRAWER_NEXT_BUTTON'
              size={nextButtonSize}
              className={nextButtonClassName}
              onClick={onNext}
              isLoading={isNextButtonLoading}
              disabled={isNextButtonDisabled}
              leadingIcon={
                nextButtonIconPosition === 'LEFT' && nextButtonIconProps ? (
                  <SvgSpriteLoader
                    id={nextButtonIconProps.id}
                    iconCategory={nextButtonIconProps.iconCategory}
                    width={nextButtonIconProps.width ?? 14}
                    height={nextButtonIconProps.height ?? 14}
                    color={nextButtonIconProps.color}
                  />
                ) : undefined
              }
              trailingIcon={
                nextButtonIconPosition !== 'LEFT' && nextButtonIconProps ? (
                  <SvgSpriteLoader
                    id={nextButtonIconProps.id}
                    iconCategory={nextButtonIconProps.iconCategory}
                    width={nextButtonIconProps.width ?? 14}
                    height={nextButtonIconProps.height ?? 14}
                    color={nextButtonIconProps.color}
                  />
                ) : undefined
              }
            >
              {nextButtonTitle}
            </Button>
          )}
        </>
      )}
    </div>
  );

export default OverlayFooter;
