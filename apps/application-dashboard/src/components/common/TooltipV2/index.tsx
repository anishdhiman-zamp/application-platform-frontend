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
};

const TooltipV2: FC<TooltipV2Props> = ({
  children,
  tooltipBody,
  side = SIDE_OPTIONS.TOP,
  className,
  tooltipClassName,
  asChildTrigger = false,
}) => {
  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger className={className} asChild={asChildTrigger}>
          {children}
        </TooltipTrigger>
        {tooltipBody && (
          <TooltipContent className={tooltipClassName} side={side} sideOffset={10}>
            {tooltipBody}
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
};

export default TooltipV2;
