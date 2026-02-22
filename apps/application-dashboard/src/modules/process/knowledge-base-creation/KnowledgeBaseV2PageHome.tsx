'use client';

import { FC, useCallback, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import ImageLoader from '@/components/common/loader/ImageLoader';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import { ZAMP_LOGO_LOADER_SVG } from '@/constants/icons';
import { useProcesses } from '@/contexts/ProcessesContext';
import { IntegrationType } from '@/modules/integrations/types/integrations.types';
import MarkdownSkeleton from '@/modules/process/knowledge-base-creation/components/MarkdownSkeleton';
import { cn } from '@/utils/common';

const KnowledgeBaseChat = dynamic(() => import('@/modules/process/knowledge-base-creation/KnowledgeBaseChat'), {});

const ProcessCreationKnowledgeBase = dynamic(
  () => import('@/modules/process/knowledge-base-creation/ProcessCreationKnowledgeBase'),
  {
    ssr: false,
  },
);

interface KnowledgeBaseV2PageHomeProps {
  processId: string;
  conversationId: string | null;
  integrations: IntegrationType[];
}

const KnowledgeBaseV2PageHome: FC<KnowledgeBaseV2PageHomeProps> = ({ processId, conversationId, integrations }) => {
  const [isChatbotExpanded, setIsChatbotExpanded] = useState(false);
  const [defaultMessage, setDefaultMessage] = useState<string | undefined>(undefined);

  const { processes, isLoadingProcesses } = useProcesses();

  const currentProcess = useMemo(
    () => processes?.find((process) => process?.process_id === processId),
    [processes, processId],
  );

  const handleChatSubmit = useCallback((message: string) => {
    if (message?.trim()) {
      setDefaultMessage(message);
      setIsChatbotExpanded(true);
    }
  }, []);

  if (!processes?.length) {
    return <ImageLoader imageSrc={ZAMP_LOGO_LOADER_SVG} width={140} height={140} className='rounded-tl-xl' />;
  }

  return (
    <CommonWrapper
      isLoading={isLoadingProcesses || !processes?.length}
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
            />
          </div>
        </div>
        <div className='w-full'>
          <ProcessCreationKnowledgeBase
            onChatSubmit={handleChatSubmit}
            isChatbotExpanded={isChatbotExpanded || !!conversationId}
            processId={processId}
            processName={currentProcess?.display_name ?? ''}
            integrations={integrations}
            isKnowledgeBaseCreated
          />
        </div>
      </div>
    </CommonWrapper>
  );
};

export default KnowledgeBaseV2PageHome;
