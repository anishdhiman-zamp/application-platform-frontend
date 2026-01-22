import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@zamp-platform/ui';
import React, { FC } from 'react';

import { formatThinkingDuration } from '../block.utils';
import { StatusLabel } from './StatusLabel';

interface ThinkingBlockProps {
  payload: {
    thinking: string;
  };
  start_timestamp?: string;
  stop_timestamp?: string;
  is_complete: boolean;
}

export const ThinkingBlock: FC<ThinkingBlockProps> = ({
  payload,
  is_complete = true,
  start_timestamp,
  stop_timestamp,
}) => {
  const thinkingDuration = formatThinkingDuration(start_timestamp, stop_timestamp);
  const completedLabelWithDuration = thinkingDuration ? `Thought for ${thinkingDuration}` : 'Thought';

  return (
    <Accordion type='single' collapsible className='border-GRAY_100 w-full overflow-hidden rounded-lg border bg-white'>
      <AccordionItem value='thinking' className='border-none'>
        <AccordionTrigger className='f-12-450 text-GRAY_900 w-full cursor-pointer gap-x-2 px-2 py-2 hover:bg-gray-50 [&[data-state=closed]>svg]:rotate-90 [&[data-state=open]>svg]:-rotate-90'>
          <div className='flex flex-1 flex-col gap-2'>
            <StatusLabel
              isComplete={is_complete}
              loadingText='Thinking...'
              completedText={completedLabelWithDuration}
            />
          </div>
        </AccordionTrigger>
        <AccordionContent className='bg-GRAY_50 f-12-400 text-GRAY_900 flex max-h-60 w-full overflow-y-auto p-2 whitespace-pre-wrap [scrollbar-width:thin] [&::-webkit-scrollbar]:hidden'>
          {payload?.thinking || 'Processing...'}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
