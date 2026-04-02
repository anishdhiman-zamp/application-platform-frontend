'use client';

import type { RefObject } from 'react';
import { HITLEntityType, HITLQuestionsBlock, type HITLQuestionWithEntity } from '@zamp-platform/chat';
import { ShimmerText } from '@zamp-platform/ui';
import ResizableSummaryBox from '@/modules/pace/components/chat/ResizableSummaryBox';
import SummaryMarkdown from '@/modules/pace/components/chat/SummaryMarkdown';

export interface TaskChatSummaryContentProps {
  showSteps: boolean;
  isNeedsInput: boolean;
  hasHitlQuestions: boolean;
  hitlQuestions: HITLQuestionWithEntity[];
  hitlQuestionsKey: string;
  taskId: string;
  onHitlRespondComplete: () => void;
  displayedSummary: string;
  isAgentActive: boolean;
  summaryScrollRef: RefObject<HTMLDivElement | null>;
}

export const TaskChatSummaryContent = ({
  showSteps,
  isNeedsInput,
  hasHitlQuestions,
  hitlQuestions,
  hitlQuestionsKey,
  taskId,
  onHitlRespondComplete,
  displayedSummary,
  isAgentActive,
  summaryScrollRef,
}: TaskChatSummaryContentProps) => {
  if (showSteps) return null;

  if (isNeedsInput && hasHitlQuestions) {
    return (
      <HITLQuestionsBlock
        key={hitlQuestionsKey}
        payload={{ questions: hitlQuestions }}
        onSubmit={onHitlRespondComplete}
        sourceEntityId={taskId}
        sourceEntityType={HITLEntityType.TASK}
      />
    );
  }

  if (isAgentActive) {
    return (
      <div className='border-GRAY_400 rounded-[18px] border px-4 py-4'>
        <ShimmerText text={displayedSummary || 'Starting now'} autoAnimate />
      </div>
    );
  }

  if (displayedSummary) {
    return (
      <ResizableSummaryBox borderRadius='rounded-[18px]' contentClassName='px-4 pt-4 pb-1' scrollRef={summaryScrollRef}>
        <SummaryMarkdown text={displayedSummary} />
      </ResizableSummaryBox>
    );
  }

  return null;
};
