import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, AnimatedDot } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import React, { FC, useState } from 'react';

import { formatThinkingDuration } from '../block.utils';
import { StatusLabel } from './StatusLabel';

interface ThinkingBlockProps {
  payload: {
    thinking: string;
  };
  start_timestamp?: string;
  stop_timestamp?: string;
  is_complete: boolean;
  isAccordionOpen?: boolean;
  onAccordionOpenChange?: (isOpen: boolean) => void;
  showConnectorFromPrevious?: boolean;
  showConnectorToNext?: boolean;
}

export const ThinkingBlock: FC<ThinkingBlockProps> = ({
  payload,
  is_complete = true,
  start_timestamp,
  stop_timestamp,
  isAccordionOpen,
  onAccordionOpenChange,
  showConnectorFromPrevious = false,
  showConnectorToNext = false,
}) => {
  const [internalAccordionOpen, setInternalAccordionOpen] = useState<boolean>(false);
  const isControlled = typeof isAccordionOpen === 'boolean';
  const resolvedIsAccordionOpen = isControlled ? isAccordionOpen : internalAccordionOpen;
  const thinkingDuration = formatThinkingDuration(start_timestamp, stop_timestamp);
  const completedLabelWithDuration = thinkingDuration ? `Thought for ${thinkingDuration}` : 'Thought';

  const handleValueChange = (value: string) => {
    const nextIsOpen = value === 'thinking';
    onAccordionOpenChange?.(nextIsOpen);

    if (!isControlled) {
      setInternalAccordionOpen(nextIsOpen);
    }
  };

  return (
    <Accordion
      type='single'
      collapsible
      value={resolvedIsAccordionOpen ? 'thinking' : ''}
      onValueChange={handleValueChange}
      className='bg-BG_WHITE w-full overflow-hidden rounded-lg'
    >
      <AccordionItem value='thinking' className='relative border-none'>
        {showConnectorFromPrevious && (
          <div className='bg-border pointer-events-none absolute top-0 left-[6.5px] h-2 w-px' style={{ zIndex: 0 }} />
        )}
        <AccordionTrigger className='f-12-450 text-GRAY_1000 w-full cursor-pointer gap-x-2 py-2 [&[data-state=closed]>svg]:rotate-90 [&[data-state=open]>svg]:-rotate-90'>
          <div className='flex flex-1 items-center gap-2'>
            <div className='flex h-3.5 w-3.5 items-center justify-center'>
              <AnimatedDot showAnimation={!is_complete} size={4} />
            </div>
            <StatusLabel
              isComplete={is_complete}
              loadingText='Thinking...'
              className={cn('font-420 text-[13px]', resolvedIsAccordionOpen ? 'text-GRAY_1000' : 'text-GRAY_950')}
              completedText={completedLabelWithDuration}
            />
          </div>
        </AccordionTrigger>
        {showConnectorToNext && (
          <div
            className={cn(
              'bg-border pointer-events-none absolute left-[6.5px] z-0 w-px',
              resolvedIsAccordionOpen ? 'top-[24px] bottom-0' : 'top-[24px] h-[14px]',
            )}
          />
        )}
        <AccordionContent className='f-13-400 text-GRAY_900 flex max-h-60 w-full overflow-y-auto p-2 pt-0 pl-5 whitespace-pre-wrap [scrollbar-width:thin] [&::-webkit-scrollbar]:hidden'>
          {payload?.thinking || 'Processing...'}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
