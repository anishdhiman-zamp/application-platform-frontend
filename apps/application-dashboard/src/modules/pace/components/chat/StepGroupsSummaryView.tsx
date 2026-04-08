'use client';

import { Accordion } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import type { MessageStepGroupsSection } from 'modules/pace/components/chat/step-groups.types';
import ResizableSummaryBox from '@/modules/pace/components/chat/ResizableSummaryBox';
import StepGroupItem from '@/modules/pace/components/chat/StepGroupItem';
import SummaryMarkdown from '@/modules/pace/components/chat/SummaryMarkdown';

interface StepGroupsSummaryViewProps {
  sections: MessageStepGroupsSection[];
}

const StepGroupsSummaryView = ({ sections }: StepGroupsSummaryViewProps) => {
  if (sections.length === 0) return null;

  const hasAnyGroups = sections.some((s) => s.groups.length > 0);

  return (
    <div className='relative flex flex-col'>
      {hasAnyGroups && (
        <div className='bg-border pointer-events-none absolute top-5 bottom-0 left-[14.5px] z-0 w-px' aria-hidden />
      )}

      {sections.map((section) => (
        <div key={section.messageId} className='relative flex flex-col'>
          {section.groups.length > 0 && (
            <Accordion type='multiple' className='flex flex-col gap-0'>
              {section.groups.map((group) => (
                <StepGroupItem key={group.id} group={group} />
              ))}
            </Accordion>
          )}

          {section.lastMarkdownText ? (
            <div className={cn('bg-BG_WHITE relative z-1 py-1', section.groups.length === 0 && 'mt-4!')}>
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
