import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, AnimatedDot, CSS_VARS } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { FC, useState } from 'react';

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
  embedded?: boolean;
  /** Flat transparent shell (e.g. nested in a muted panel); keeps dots/connectors unlike `embedded`. */
  quietSurface?: boolean;
  /** First block in a consecutive thinking/tool-call group — adds top padding. */
  isFirstInGroup?: boolean;
  /** Last block in a consecutive thinking/tool-call group — adds bottom padding. */
  isLastInGroup?: boolean;
  /** Remove bottom padding — use on the last ThinkingBlock when it is also the last block in the message. */
  isLastThinkingBlock?: boolean;
  isStreaming?: boolean;
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
  embedded = false,
  quietSurface = false,
  isFirstInGroup = false,
  isLastInGroup = false,
  isLastThinkingBlock = false,
  isStreaming = false,
}) => {
  const flatShell = embedded || quietSurface;
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
      className={cn(
        'w-full overflow-hidden',
        flatShell ? 'rounded-none border-none bg-transparent shadow-none' : 'bg-BG_WHITE rounded-lg',
        isLastInGroup && !flatShell && 'mb-1',
        isFirstInGroup && !flatShell && 'mt-1',
        isLastThinkingBlock && !isStreaming && 'mb-0',
      )}
    >
      <AccordionItem value='thinking' className='relative border-none'>
        {showConnectorFromPrevious && (
          <div className='bg-border pointer-events-none absolute top-0 left-[6.5px] h-2 w-px' style={{ zIndex: 0 }} />
        )}
        <AccordionTrigger
          className={cn(
            'f-12-450 w-full cursor-pointer gap-x-2 text-[13px] [&[data-state=closed]>svg]:rotate-90 [&[data-state=open]>svg]:-rotate-90',
            flatShell ? 'text-GRAY_1000' : 'text-GRAY_700',
            embedded ? 'py-1.5' : 'py-2',
          )}
        >
          <div className='flex flex-1 items-center gap-2'>
            {!embedded && (
              <div className={cn('flex h-3.5 w-3.5 items-center justify-center', flatShell ? 'bg-BG_WHITE' : '')}>
                <AnimatedDot showAnimation={!is_complete} size={4} completeColor={CSS_VARS.GRAY_700} />
              </div>
            )}
            <StatusLabel
              isComplete={is_complete}
              loadingText='Thinking...'
              className={cn(
                'font-420 text-[13px]',
                flatShell ? (resolvedIsAccordionOpen ? 'text-GRAY_1000' : 'text-GRAY_950') : 'text-GRAY_700',
              )}
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
        <AccordionContent
          className={cn(
            'f-13-400 text-GRAY_900 flex max-h-60 w-full overflow-y-auto whitespace-pre-wrap [scrollbar-width:thin] [&::-webkit-scrollbar]:hidden',
            embedded ? 'p-2 pt-0 pl-3' : 'p-2 pt-0 pl-6',
          )}
        >
          {payload?.thinking || 'Processing...'}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
