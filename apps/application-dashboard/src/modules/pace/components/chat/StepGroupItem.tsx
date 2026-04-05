'use client';

import { AccordionContent, AccordionItem, AccordionTrigger } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { formatPlural } from '@zamp-platform/utils';
import { ChevronDown, Layers } from 'lucide-react';
import type { ResolvedStepGroup } from 'modules/pace/components/chat/step-groups.types';
import { TaskChatStepMessage } from '@/modules/pace/components/chat/TaskChatStepMessage';

interface StepGroupItemProps {
  group: ResolvedStepGroup;
}

const StepGroupItem = ({ group }: StepGroupItemProps) => {
  return (
    <AccordionItem value={group.id} className='relative flex flex-col overflow-x-clip border-none'>
      {/* Fixed gutter: spine never overlaps summary text (content uses pl-[30px]) */}
      <div
        className='pointer-events-none absolute top-0 bottom-0 left-0 z-0 flex w-[30px] flex-col items-center px-1.5'
        aria-hidden
      >
        <div className='flex size-4.5 shrink-0 items-center justify-center pt-4'>
          <Layers className='text-GRAY_600 size-3.5' strokeWidth={1.5} />
        </div>
        <div className='bg-border mt-3 min-h-3 w-px flex-1 self-center' />
      </div>

      <AccordionTrigger
        className={cn(
          'relative z-1 w-full cursor-pointer gap-0 border-0 bg-transparent py-0 pr-2 pl-[30px] text-left hover:no-underline',
          'justify-start!',
          '[&[data-state=open]_.step-chevron]:rotate-180',
        )}
        icon={() => null}
      >
        <div className='flex min-w-0 flex-1 items-start justify-between gap-3 pt-1.5 pb-4.5'>
          <p className='text-GRAY_950 min-w-0 flex-1 self-start pr-2 text-[13px] leading-[1.667] font-[420]'>
            {group.summary}
          </p>
          <div className='flex shrink-0 items-center'>
            <div className='text-GRAY_700 mr-1 text-[13px] leading-[1.667] font-[420] whitespace-nowrap'>
              {formatPlural(group.stepCount, 'Step', 'Steps')}
            </div>
            <ChevronDown className='step-chevron text-GRAY_700 size-3.5 shrink-0 transition-transform duration-200' />
          </div>
        </div>
      </AccordionTrigger>

      <AccordionContent className='relative z-1 w-full border-0 pt-0! pb-0!' disableAnimation>
        <div className='bg-BG_WHITE box-border w-full py-1.5'>
          <div
            className={cn(
              'border-GRAY_400 bg-BG_WHITE max-h-[min(250px,50vh)] w-full overflow-x-clip overflow-y-auto rounded-md border px-2',
            )}
          >
            <div className='flex flex-col'>
              {group.messages.map(({ message }, index) => (
                <div key={message.id ?? index} className='min-w-0'>
                  <TaskChatStepMessage message={message} quietSurface alwaysShowMarkdownTimelineDot />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className='p-1.5' />
      </AccordionContent>
    </AccordionItem>
  );
};

export default StepGroupItem;
