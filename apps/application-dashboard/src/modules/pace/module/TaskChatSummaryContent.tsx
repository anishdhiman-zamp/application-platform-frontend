'use client';

import type { RefObject } from 'react';
import { HITLEntityType, HITLQuestionsBlock, type HITLQuestionWithEntity, MarkdownBlock } from '@zamp-platform/chat';
import ResizableSummaryBox from '@/modules/pace/module/ResizableSummaryBox';

export interface TaskChatSummaryContentProps {
  isNeedsInput: boolean;
  hasHitlQuestions: boolean;
  hitlQuestions: HITLQuestionWithEntity[];
  hitlQuestionsKey: string;
  taskId: string;
  onHitlRespondComplete: () => void;
  resultText: string | null;
  summaryScrollRef: RefObject<HTMLDivElement | null>;
}

export const TaskChatSummaryContent = ({
  isNeedsInput,
  hasHitlQuestions,
  hitlQuestions,
  hitlQuestionsKey,
  taskId,
  onHitlRespondComplete,
  resultText,
  summaryScrollRef,
}: TaskChatSummaryContentProps) => {
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

  if (resultText) {
    return (
      <ResizableSummaryBox borderRadius='rounded-[18px]' contentClassName='px-4 pt-4 pb-1' scrollRef={summaryScrollRef}>
        <MarkdownBlock payload={{ text: resultText }} />
      </ResizableSummaryBox>
    );
  }

  return null;
};
