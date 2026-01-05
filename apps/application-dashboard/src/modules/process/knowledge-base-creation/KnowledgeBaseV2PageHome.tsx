'use client';

import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import MarkdownSkeleton from 'modules/process/knowledge-base-creation/components/MarkdownSkeleton';
import dynamic from 'next/dynamic';
import { useGetProcessesQuery } from '@/apis/pages';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import { FEATURE_FLAGS } from '@/constants/featureFlags';
import { useAppDispatch } from '@/hooks/toolkit';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { closeSidebar, openSidebar } from '@/store/slices/layout-configs';
import { ProcessStatus } from '@/types/api/processApi.types';
import { cn } from '@/utils/common';

// Dynamic imports for heavy components - not needed for initial paint
const KnowledgeBaseHome = dynamic(() => import('@/modules/knowledge-based/KnowledgeBaseHome'), {
  ssr: false,
});

const KnowledgeBaseChat = dynamic(() => import('@/modules/process/knowledge-base-creation/KnowledgeBaseChat'), {
  ssr: false,
  loading: () => <MarkdownSkeleton />,
});

const ProcessCreationKnowledgeBase = dynamic(
  () => import('@/modules/process/knowledge-base-creation/ProcessCreationKnowledgeBase'),
  {
    ssr: false,
  },
);

interface KnowledgeBaseV2PageHomeProps {
  processId: string;
  conversationId: string | null;
}

const KnowledgeBaseV2PageHome: FC<KnowledgeBaseV2PageHomeProps> = ({ processId, conversationId }) => {
  const dispatch = useAppDispatch();
  const { evaluate, ldClient } = useFeatureFlags();
  const [isChatbotExpanded, setIsChatbotExpanded] = useState(false);
  const [defaultMessage, setDefaultMessage] = useState<string | undefined>(undefined);
  const [isSopCreationEnabled, setIsSopCreationEnabled] = useState<boolean>(false);

  const { data: processes, isLoading: isLoadingProcesses } = useGetProcessesQuery(undefined, {
    refetchOnMountOrArgChange: false,
  });

  const currentProcess = useMemo(() => processes?.find((process) => process.id === processId), [processes, processId]);
  const disableChat = useMemo(
    () => ![ProcessStatus.DRAFT, ProcessStatus.LIVE].includes(currentProcess?.status as ProcessStatus),
    [currentProcess],
  );

  useEffect(() => {
    setTimeout(() => {
      dispatch(closeSidebar());
    }, 300);

    return () => {
      dispatch(openSidebar());
    };
  }, [dispatch]);

  const handleChatSubmit = useCallback((message: string) => {
    if (message?.trim()) {
      setDefaultMessage(message);
      setIsChatbotExpanded(true);
    }
  }, []);

  useEffect(() => {
    if (ldClient) {
      evaluate(FEATURE_FLAGS.SOP_CREATION)
        .then((res) => {
          setIsSopCreationEnabled(res);
        })
        .catch(() => {
          setIsSopCreationEnabled(false);
        });
    }
  }, [evaluate, ldClient, processId]);

  if (!isSopCreationEnabled) {
    return <KnowledgeBaseHome />;
  }

  return (
    <CommonWrapper
      isLoading={isLoadingProcesses}
      skeletonType={SkeletonTypes.CUSTOM}
      loader={<MarkdownSkeleton />}
      className='h-full'
    >
      <div className='flex h-full w-full'>
        <div
          className={cn(
            'overflow-hidden transition-all duration-300',
            isChatbotExpanded || !!conversationId ? 'w-[444px] min-w-[444px]' : 'w-0 min-w-0',
          )}
        >
          <div className='border-GRAY_400 h-full w-[444px] min-w-[444px] border-r'>
            <KnowledgeBaseChat
              key={conversationId || 'new-conversation'}
              conversationId={conversationId || ''}
              processId={processId}
              status={currentProcess?.status}
              defaultMessage={defaultMessage}
              onNewConversation={() => setDefaultMessage(undefined)}
              isDisabled={disableChat}
            />
          </div>
        </div>
        <div className='w-full'>
          <ProcessCreationKnowledgeBase
            onChatSubmit={handleChatSubmit}
            isChatbotExpanded={isChatbotExpanded || !!conversationId}
            processId={processId}
            processName={currentProcess?.display_name ?? ''}
            isDisabled={disableChat}
          />
        </div>
      </div>
    </CommonWrapper>
  );
};

export default KnowledgeBaseV2PageHome;
