import { FC, ReactNode } from 'react';
import { Button, ButtonSize, ButtonVariant } from '@zamp-platform/ui';
import { SvgSpriteLoader, SvgSpriteLoaderProps } from '@zamp-platform/ui/assets';
import { defaultFnType, SIDE_OPTIONS } from 'types/commonTypes';
import { cn } from 'utils/common';
import TooltipV2 from 'components/common/TooltipV2';

interface TooltipButtonPropsType {
  tooltipBodyClassName?: string;
  tooltipBodyOverrideClassName?: string;
  tooltipBody?: string;
  className?: string;
  tooltipPosition?: SIDE_OPTIONS;
  buttonIcon?: SvgSpriteLoaderProps;
  buttonType?: ButtonVariant;
  buttonSize?: ButtonSize;
  id: string;
  onClick?: defaultFnType;
  isLoading?: boolean;
  disabled?: boolean;
  buttonDisabled?: boolean;
  tooltipClassName?: string;
  children?: ReactNode;
}

const TooltipButton: FC<TooltipButtonPropsType> = ({
  tooltipBodyClassName = '',
  tooltipBodyOverrideClassName = 'f-12-300 tw-py-1 tw-px-2 tw-rounded-sm tw-whitespace-nowrap',
  tooltipBody = '',
  className = '',
  tooltipPosition = SIDE_OPTIONS.BOTTOM,
  buttonIcon,
  buttonType = 'outline',
  buttonSize = 'small',
  id = '',
  onClick,
  isLoading = false,
  disabled = false,
  buttonDisabled = false,
  tooltipClassName,
  children,
}) => {
  return (
    <TooltipV2
      tooltipBody={tooltipBody}
      side={tooltipPosition}
      className={tooltipClassName}
      disabled={disabled}
      tooltipClassName={cn(tooltipBodyOverrideClassName, tooltipBodyClassName)}
    >
      <Button
        variant={buttonType}
        testId={id}
        size={buttonSize}
        className={className}
        trailingIcon={
          buttonIcon ? (
            <SvgSpriteLoader
              id={buttonIcon.id}
              iconCategory={buttonIcon.iconCategory}
              width={buttonIcon.width ?? 14}
              height={buttonIcon.height ?? 14}
              color={buttonIcon.color}
              className={buttonIcon.className}
            />
          ) : undefined
        }
        onClick={onClick}
        isLoading={isLoading}
        disabled={buttonDisabled}
      >
        {children}
      </Button>
    </TooltipV2>
  );
};

export default TooltipButton;
