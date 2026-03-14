'use client';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@zamp-platform/ui';
import { FC } from 'react';

export interface MessageTimestampProps {
  formattedTimestamp: string;
  tooltipTimestamp: string;
}

const MessageTimestamp: FC<MessageTimestampProps> = ({ formattedTimestamp, tooltipTimestamp }) => {
  if (!formattedTimestamp) return null;

  return (
    <TooltipProvider delayDuration={500}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className='text-GRAY_600 f-10-450 ml-1.5 w-fit cursor-default'>{formattedTimestamp}</div>
        </TooltipTrigger>
        <TooltipContent side='bottom' align='center' className='f-10-450 p-1.5' sideOffset={12}>
          <p>{tooltipTimestamp}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default MessageTimestamp;
