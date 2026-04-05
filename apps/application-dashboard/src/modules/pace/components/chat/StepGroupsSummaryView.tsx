'use client';

import { Accordion } from '@zamp-platform/ui';
import type { MessageStepGroupsSection } from 'modules/pace/components/chat/step-groups.types';
import ResizableSummaryBox from '@/modules/pace/components/chat/ResizableSummaryBox';
import StepGroupItem from '@/modules/pace/components/chat/StepGroupItem';
import SummaryMarkdown from '@/modules/pace/components/chat/SummaryMarkdown';

interface StepGroupsSummaryViewProps {
  sections: MessageStepGroupsSection[];
}

const StepGroupsSummaryView = ({ sections }: StepGroupsSummaryViewProps) => {
  if (sections.length === 0) return null;

  return (
    <div className='flex flex-col gap-1'>
      {sections.map((section, sectionIndex) => (
        <div key={section.messageId} className='flex flex-col'>
          {sectionIndex > 0 && (
            <div className='relative h-4 w-full shrink-0' aria-hidden>
              <div className='bg-border absolute top-0 bottom-0 left-[15px] w-px' />
            </div>
          )}
          <Accordion type='multiple' className='flex flex-col gap-0'>
            {section.groups.map((group) => (
              <StepGroupItem key={group.id} group={group} />
            ))}
          </Accordion>

          {section.lastMarkdownText ? (
            <div className='relative px-2 pt-2'>
              <div className='bg-border pointer-events-none absolute -top-2 left-[14.5px] h-3 w-px' />
              <ResizableSummaryBox borderRadius='rounded-[18px]' contentClassName='px-4 pt-3 pb-1'>
                <SummaryMarkdown text={section.lastMarkdownText} shimmerLast={false} />
              </ResizableSummaryBox>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
};

export default StepGroupsSummaryView;
