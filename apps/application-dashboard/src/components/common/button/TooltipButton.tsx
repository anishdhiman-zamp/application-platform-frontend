import { FC, ReactNode } from 'react';
import { SvgSpriteLoaderProps } from '@zamp-platform/ui/assets';
import { SIZE_TYPES } from 'types/common/components';
import { defaultFnType, SIDE_OPTIONS } from 'types/commonTypes';
import { BUTTON_TYPES } from 'types/components/button.type';
import { cn } from 'utils/common';
import { Button } from 'components/common/button/Button';
import TooltipV2 from 'components/common/TooltipV2';

interface TooltipButtonPropsType {
  tooltipBodyClassName?: string;
  tooltipBodyOverrideClassName?: string;
  tooltipBody?: string;
  className?: string;
  tooltipPosition?: SIDE_OPTIONS;
  buttonIcon?: SvgSpriteLoaderProps;
  buttonType?: BUTTON_TYPES;
  buttonSize?: SIZE_TYPES;
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
  buttonType = BUTTON_TYPES.SECONDARY,
  buttonSize = SIZE_TYPES.SMALL,
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
        type={buttonType}
        id={id}
        size={buttonSize}
        className={className}
        iconProps={buttonIcon}
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
