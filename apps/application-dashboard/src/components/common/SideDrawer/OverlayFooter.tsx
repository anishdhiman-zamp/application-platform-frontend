import { FC } from 'react';
import { Button } from '@zamp-platform/ui';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { cn } from 'utils/common';
import { OverlayFooterProps } from 'components/common/SideDrawer/sideDrawer.types';

// TODO: needs to be updated to use the new design system
const OverlayFooter: FC<OverlayFooterProps> = ({
  onBack,
  onNext,
  nextButtonClassName = 'min-w-[106px]',
  backButtonClassName = 'min-w-[106px]',
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
    <div
      className={cn(
        'absolute bottom-12 flex w-full items-center justify-end gap-3 border-t bg-white p-4',
        footerClassName,
      )}
    >
      {bottomBar ? (
        bottomBar
      ) : (
        <>
          {!!onBack && (
            <Button
              size={backButtonSize}
              variant='outline'
              className={backButtonClassName}
              testId='SIDE_DRAWER_BACK_BUTTON'
              onClick={onBack}
              isLoading={isBackButtonLoading}
            >
              {backButtonTitle}
            </Button>
          )}
          {!!onNext && (
            <Button
              size={nextButtonSize}
              className={nextButtonClassName}
              testId='SIDE_DRAWER_NEXT_BUTTON'
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
