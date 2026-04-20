'use client';

import { MarkdownBlock } from '@zamp-platform/chat';
import { Accordion } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import type { MessageStepGroupsSection } from 'modules/pace/module/step-groups.types';
import ResizableSummaryBox from '@/modules/pace/module/ResizableSummaryBox';
import StepGroupItem from '@/modules/pace/module/StepGroupItem';

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
            <div className={cn('bg-BG_WHITE relative z-1 px-2', section.groups.length === 0 && 'mt-4!')}>
              <ResizableSummaryBox borderRadius='rounded-[18px]' contentClassName='px-4 pt-3 pb-1'>
                <MarkdownBlock payload={{ text: section?.lastMarkdownText }} />
              </ResizableSummaryBox>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
};

export default StepGroupsSummaryView;
