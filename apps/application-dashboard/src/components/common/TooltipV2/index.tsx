import { FC, ReactNode } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@zamp-platform/ui';
import { SIDE_OPTIONS } from '@/types/commonTypes';

type TooltipV2Props = {
  children: ReactNode;
  tooltipBody: ReactNode;
  side?: SIDE_OPTIONS;
};

const TooltipV2: FC<TooltipV2Props> = ({ children, tooltipBody, side = SIDE_OPTIONS.TOP }) => {
  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger>{children}</TooltipTrigger>
        <TooltipContent side={side} sideOffset={10}>
          {tooltipBody}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default TooltipV2;
