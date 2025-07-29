import { FC, ReactNode } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@zamp-platform/ui';
import { SIDE_OPTIONS } from '@/types/commonTypes';

type TooltipV2Props = {
  children: ReactNode;
  tooltipBody: ReactNode;
  side?: SIDE_OPTIONS;
  className?: string;
  tooltipClassName?: string;
  asChildTrigger?: boolean;
  disabled?: boolean;
  scrollableBody?: boolean;
};

const TooltipV2: FC<TooltipV2Props> = ({
  children,
  tooltipBody,
  side = SIDE_OPTIONS.TOP,
  className,
  tooltipClassName,
  asChildTrigger = false,
  disabled = false,
  scrollableBody = false,
}) => {
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (scrollableBody) {
      e.stopPropagation();
    }
  };

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger className={className} asChild={asChildTrigger} disabled={disabled}>
          {children}
        </TooltipTrigger>
        {tooltipBody && (
          <TooltipContent className={tooltipClassName} side={side} sideOffset={10} onWheel={handleWheel}>
            {tooltipBody}
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
};

export default TooltipV2;
