import { FC, ReactNode } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@zamp-platform/ui';

type TooltipV2Props = {
  children: ReactNode;
  tooltipBody: ReactNode;
};

const TooltipV2: FC<TooltipV2Props> = ({ children, tooltipBody }) => {
  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger>{children}</TooltipTrigger>
        <TooltipContent side='top' sideOffset={10}>
          {tooltipBody}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default TooltipV2;
