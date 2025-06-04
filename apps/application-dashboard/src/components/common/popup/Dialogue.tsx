import { FC, MouseEvent, ReactNode, useEffect, useState } from 'react';
import OverlayFooter, { OverlayFooterProps } from '@/components/common/overlay-footer/OverlayFooter';
import OverlayTitle, { OverlayTitleProps } from '@/components/common/overlay-title/OverlayTitle';
import { SIZE_TYPES } from '@/types/common/components';
import { defaultFnType } from '@/types/commonTypes';
import { cn, stopPropagationAction } from '@/utils/common';

const SIZE_CLASSNAMES = {
  [SIZE_TYPES.XSMALL]: 'w-dialogueXSmall',
  [SIZE_TYPES.SMALL]: 'w-dialogueSmall',
  [SIZE_TYPES.MEDIUM]: 'w-dialogueMedium ',
  [SIZE_TYPES.LARGE]: 'w-dialogueLarge',
  [SIZE_TYPES.XLARGE]: 'w-dialogueLarge',
};

export interface DialogueProps extends OverlayTitleProps, OverlayFooterProps {
  isOpen: boolean;
  children: any;
  childrenClassName?: string;
  className?: string;
  parentWrapperClassName?: string;
  wrapperClassName?: string;
  footer?: ReactNode;
  onCancel?: defaultFnType;
  onSubmit?: defaultFnType;
  mixpanelEventOnCancel?: string;
  mixpanelEventOnSubmit?: string;
  mixpanelEventOnClose?: string;
  size?: SIZE_TYPES;
  width?: number;
  hideTopBar?: boolean;
  closeOnClickOutside?: boolean;
}

const Dialogue: FC<DialogueProps> = ({
  isOpen = false,
  children,
  className = '',
  parentWrapperClassName = null,
  wrapperClassName = null,
  childrenClassName = '',
  backButtonTitle = 'Cancel',
  nextButtonTitle = 'Ok',
  bottomBar,
  footer = null,
  onCancel,
  onSubmit,
  topBar,
  title,
  hideCloseButton,
  step,
  subtitle,
  onClose,
  headerClassName,
  closeButtonClassName,
  nextButtonClassName,
  backButtonClassName,
  isBackButtonLoading,
  isNextButtonLoading,
  size = SIZE_TYPES.SMALL,
  width,
  isNextButtonDisabled,
  titleClassName,
  hideTopBar = false,
  closeOnClickOutside = true,
}) => {
  const [isOpenInternal, setIsOpenInternal] = useState(false);

  useEffect(() => {
    setIsOpenInternal(isOpen);
  }, [isOpen]);

  const handleClose = () => {
    // Remove internally for animation to trigger
    setIsOpenInternal(false);
    // Call onClose to unmount the component after animation OR handle any changes in parent
    setTimeout(() => onClose(), 200);
  };

  const onContainerClick = (e: MouseEvent<HTMLDivElement>) => {
    if (!closeOnClickOutside) return;
    e.stopPropagation();

    handleClose();
  };

  if (!isOpen) return null;

  const popupWidthClasses = SIZE_CLASSNAMES[size];

  return (
    <div
      className={cn(
        'z-1001 fixed left-0 top-0 h-screen w-screen bg-[#00000026] opacity-100 backdrop-blur-[1.5px] transition-all duration-150 ease-in',
        parentWrapperClassName ?? 'z-1000',
        {
          'opacity-0!': !isOpenInternal,
        },
      )}
      role='presentation'
      onClick={onContainerClick}
    >
      <div className='flex h-full w-full items-center justify-center'>
        <div
          className={cn(
            'z-1002 shadow-side-drawer-inner block overflow-hidden rounded-xl bg-white transition-all duration-300 ease-in',
            wrapperClassName ?? 'w-[500px]',
            className,
            isOpen ? 'translate-y-0 opacity-100' : 'translate-y-[50px] opacity-0',
            popupWidthClasses,
          )}
          role='presentation'
          onClick={stopPropagationAction}
        >
          {!hideTopBar && (
            <OverlayTitle
              topBar={topBar}
              title={title}
              hideCloseButton={hideCloseButton}
              step={step}
              subtitle={subtitle}
              onClose={handleClose}
              headerClassName={headerClassName}
              closeButtonClassName={closeButtonClassName}
              titleClassName={titleClassName}
            />
          )}
          <div
            className={cn('f-14-300 overflow-hidden px-5 transition-all duration-150', childrenClassName)}
            style={width ? { width: width } : {}}
          >
            {children}
          </div>
          <OverlayFooter
            onBack={onCancel}
            onNext={onSubmit}
            nextButtonClassName={nextButtonClassName}
            backButtonClassName={backButtonClassName}
            nextButtonTitle={nextButtonTitle}
            backButtonTitle={backButtonTitle}
            bottomBar={bottomBar}
            isBackButtonLoading={isBackButtonLoading}
            isNextButtonLoading={isNextButtonLoading}
            isNextButtonDisabled={isNextButtonDisabled}
          />
          {footer ?? null}
        </div>
      </div>
    </div>
  );
};

export default Dialogue;
