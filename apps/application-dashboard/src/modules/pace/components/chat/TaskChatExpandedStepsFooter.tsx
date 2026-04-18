'use client';

import type { RefObject } from 'react';
import { HITLEntityType, HITLQuestionsBlock, type HITLQuestionWithEntity, MarkdownBlock } from '@zamp-platform/chat';
import { cn } from '@zamp-platform/ui/utils';
import ResizableSummaryBox from '@/modules/pace/components/chat/ResizableSummaryBox';

export interface TaskChatExpandedStepsFooterProps {
  isFirst: boolean;
  isNeedsInput: boolean;
  hasHitlQuestions: boolean;
  hitlQuestions: HITLQuestionWithEntity[];
  hitlQuestionsKey: string;
  taskId: string;
  conversationId?: string;
  onHitlRespondComplete: () => void;
  resultText: string | null;
  summaryScrollRef: RefObject<HTMLDivElement | null>;
  /** When true, suppresses the per-element connector segment (parent provides a continuous line). */
  hideConnector?: boolean;
  username?: string;
}

export const TaskChatExpandedStepsFooter = ({
  isFirst = false,
  isNeedsInput,
  hasHitlQuestions,
  hitlQuestions,
  hitlQuestionsKey,
  taskId,
  conversationId,
  onHitlRespondComplete,
  resultText,
  summaryScrollRef,
  hideConnector = false,
  username,
}: TaskChatExpandedStepsFooterProps) => {
  if (isNeedsInput && hasHitlQuestions) {
    return (
      <div className={cn('relative px-2', hideConnector ? 'bg-BG_WHITE z-1 pt-2' : 'pt-4')}>
        {!hideConnector && <div className='bg-border absolute top-0 left-[14.5px] h-3 w-px' />}
        <HITLQuestionsBlock
          key={hitlQuestionsKey}
          payload={{ questions: hitlQuestions }}
          onSubmit={onHitlRespondComplete}
          sourceEntityId={taskId}
          sourceEntityType={HITLEntityType.TASK}
          conversationId={conversationId}
          username={username}
        />
      </div>
    );
  }

  if (resultText) {
    return (
      <div className={cn('relative px-2', hideConnector ? 'bg-BG_WHITE z-1 py-1' : cn('pt-4', isFirst && '-mt-3'))}>
        {!hideConnector && <div className='bg-border absolute top-0 left-[14.5px] h-3 w-px' />}
        <ResizableSummaryBox borderRadius='rounded-[18px]!' contentClassName='p-4 pb-1' scrollRef={summaryScrollRef}>
          <MarkdownBlock payload={{ text: resultText }} />
        </ResizableSummaryBox>
      </div>
    );
  }

  return null;
};
