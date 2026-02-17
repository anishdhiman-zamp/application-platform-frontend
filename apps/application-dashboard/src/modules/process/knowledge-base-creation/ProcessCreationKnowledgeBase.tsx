'use client';

import { FC, Suspense } from 'react';
import ProcessEmptyState from 'modules/process/activity-runs/components/ProcessEmptyState';
import KnowledgeBaseChatInput from 'modules/process/knowledge-base-creation/components/KnowledgeBaseChatInput';
import { MarkdownContentSkeleton } from 'modules/process/knowledge-base-creation/components/KnowledgeBaseContentSkeleton';
import MarkdownContent from 'modules/process/knowledge-base-creation/components/MarkdownContent';
import { useKnowledgeBaseContent } from 'modules/process/knowledge-base-creation/hooks/useKnowledgeBaseContent';
import KnowledgeBaseConfig from 'modules/process/knowledge-base-creation/KnowldgeBaseConfig';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import { FEATURE_FLAGS } from '@/constants/featureFlags';
import { NEEDS_ATTENTION_EMPTY_STATE } from '@/constants/icons';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';
import { IntegrationType } from '@/modules/integrations/types/integrations.types';
import { defaultFn } from '@/types/commonTypes';
import { cn } from '@/utils/common';

interface ProcessCreationKnowledgeBaseProps {
  processId: string;
  processName: string;
  onChatSubmit?: (message: string) => void;
  isChatbotExpanded?: boolean;
  isDisabled?: boolean;
  integrations: IntegrationType[];
  initialSopFilename?: string;
  conversationId?: string;
  isKnowledgeBaseCreated?: boolean;
}

const ProcessCreationKnowledgeBase: FC<ProcessCreationKnowledgeBaseProps> = ({
  processId,
  processName,
  onChatSubmit = defaultFn,
  isChatbotExpanded,
  isDisabled,
  integrations,
  initialSopFilename,
  conversationId,
  isKnowledgeBaseCreated = false,
}) => {
  const { isEnabled: isKnowledgeBaseConfigEnabled } = useFeatureFlag(FEATURE_FLAGS.ZAMP_INTERNAL);
  const { isEnabled: isAppSecureEnabled } = useFeatureFlag(FEATURE_FLAGS.APP_SECURE);

  const { markdownContent, isLoading, isKnownEmptyState, hasNon404Error, refetch } = useKnowledgeBaseContent({
    processId,
    conversationId,
    initialSopFilename,
    isKnowledgeBaseCreated,
  });

  const hasNoData = (!markdownContent && !isLoading) || isKnownEmptyState;

  return (
    <div>
      <div className='kb-create h-full max-h-[calc(100vh-60px)] overflow-y-auto px-8 py-10 pb-20'>
        <div className='m-auto max-w-[800px]'>
          <CommonWrapper
            skeletonType={SkeletonTypes.CUSTOM}
            isNoData={hasNoData}
            isError={hasNon404Error}
            refetchFunction={isKnowledgeBaseConfigEnabled ? refetch : undefined}
            noDataBanner={
              <ProcessEmptyState
                title=''
                description='Start teaching Pace your workflow and watch it come to life.'
                iconUrl={NEEDS_ATTENTION_EMPTY_STATE}
              />
            }
          >
            <div className={cn({ 'animate-pulse': isLoading })}>
              {markdownContent && <div className='f-26-550 border-GRAY_400 pb-4'>{processName}</div>}
              {(isAppSecureEnabled || isKnowledgeBaseConfigEnabled) && (
                <KnowledgeBaseConfig integrations={integrations} />
              )}
              <Suspense fallback={<MarkdownContentSkeleton />}>
                <MarkdownContent content={markdownContent} />
              </Suspense>
            </div>
          </CommonWrapper>
        </div>

        {!isDisabled && <KnowledgeBaseChatInput onSubmit={onChatSubmit} isChatbotExpanded={isChatbotExpanded} />}
      </div>
    </div>
  );
};

export default ProcessCreationKnowledgeBase;
