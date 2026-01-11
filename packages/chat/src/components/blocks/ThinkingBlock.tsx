import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, ShimmerText } from '@zamp-platform/ui';
import { AnimatePresence, motion } from 'motion/react';
import React, { FC, useEffect, useRef, useState } from 'react';

import { formatThinkingDuration } from '../block.utils';

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
  const wasCompleteRef = useRef(is_complete);

  const [accordionValue, setAccordionValue] = useState<string>(is_complete ? '' : 'thinking');

  useEffect(() => {
    // Auto-close accordion when is_complete transitions from false to true
    if (is_complete && !wasCompleteRef.current) {
      setAccordionValue('');
    }
    wasCompleteRef.current = is_complete;
  }, [is_complete]);

  return (
    <Accordion
      type='single'
      collapsible
      value={accordionValue}
      onValueChange={setAccordionValue}
      className='border-GRAY_100 w-full overflow-hidden rounded-lg border bg-white'
    >
      <AccordionItem value='thinking' className='border-none'>
        <AccordionTrigger className='f-12-450 text-GRAY_900 w-full cursor-pointer gap-x-2 p-1.5 [&[data-state=closed]>svg]:rotate-90 [&[data-state=open]>svg]:-rotate-90'>
          <div className='flex flex-1 flex-col gap-2'>
            <AnimatePresence mode='wait' initial={false}>
              {!is_complete ? (
                <div key='thinking'>
                  <ShimmerText text='Thinking...' autoAnimate={true} />
                </div>
              ) : (
                <motion.span
                  key='completed'
                  className='f-12-450 text-GRAY_700 text-left'
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                >
                  {completedLabelWithDuration}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </AccordionTrigger>
        <AccordionContent className='f-12-400 border-GRAY_100 text-GRAY_900 flex w-full overflow-y-auto border-t px-2 py-2 whitespace-pre-wrap [&::-webkit-scrollbar]:hidden'>
          {payload?.thinking || 'Processing...'}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
