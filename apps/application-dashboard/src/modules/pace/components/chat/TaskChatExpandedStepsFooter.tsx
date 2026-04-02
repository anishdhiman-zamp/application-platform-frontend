'use client';

import type { RefObject } from 'react';
import { HITLEntityType, HITLQuestionsBlock, type HITLQuestionWithEntity } from '@zamp-platform/chat';
import { ShimmerText } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import ResizableSummaryBox from '@/modules/pace/components/chat/ResizableSummaryBox';
import SummaryMarkdown from '@/modules/pace/components/chat/SummaryMarkdown';

export interface TaskChatExpandedStepsFooterProps {
  isFirst: boolean;
  isNeedsInput: boolean;
  hasHitlQuestions: boolean;
  hitlQuestions: HITLQuestionWithEntity[];
  hitlQuestionsKey: string;
  taskId: string;
  onHitlRespondComplete: () => void;
  isAgentActive: boolean;
  displayedSummary: string;
  summaryScrollRef: RefObject<HTMLDivElement | null>;
}

export const TaskChatExpandedStepsFooter = ({
  isFirst = false,
  isNeedsInput,
  hasHitlQuestions,
  hitlQuestions,
  hitlQuestionsKey,
  taskId,
  onHitlRespondComplete,
  isAgentActive,
  displayedSummary,
  summaryScrollRef,
}: TaskChatExpandedStepsFooterProps) => {
  if (isNeedsInput && hasHitlQuestions) {
    return (
      <div className='relative pt-4'>
        <div className='bg-border absolute top-0 left-[14.5px] h-3 w-px' />
        <HITLQuestionsBlock
          key={hitlQuestionsKey}
          payload={{ questions: hitlQuestions }}
          onSubmit={onHitlRespondComplete}
          sourceEntityId={taskId}
          sourceEntityType={HITLEntityType.TASK}
        />
      </div>
    );
  }

  if (!isAgentActive) return null;

  if (displayedSummary) {
    return (
      <div className={cn('relative pt-4', displayedSummary && isFirst && '-mt-3')}>
        <div className='bg-border absolute top-0 left-[14.5px] h-3 w-px' />
        <ResizableSummaryBox borderRadius='rounded-[18px]!' contentClassName='p-4 pb-1' scrollRef={summaryScrollRef}>
          <SummaryMarkdown text={displayedSummary} shimmerLast={isAgentActive} />
        </ResizableSummaryBox>
      </div>
    );
  }

  return (
    <div className='border-GRAY_400 mt-2 rounded-[18px]! border px-4 py-3'>
      <ShimmerText text='Starting now' autoAnimate />
    </div>
  );
};
