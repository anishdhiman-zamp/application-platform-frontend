'use client';

import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useGetProcessesQuery } from '@/apis/pages';
import ImageLoader from '@/components/common/loader/ImageLoader';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import { ZAMP_LOGO_LOADER_SVG } from '@/constants/icons';
import { useAppDispatch } from '@/hooks/toolkit';
import KnowledgeBaseChat from '@/modules/process/knowledge-base-creation/KnowledgeBaseChat';
import ProcessCreationKnowledgeBase from '@/modules/process/knowledge-base-creation/ProcessCreationKnowledgeBase';
import { closeSidebar, openSidebar } from '@/store/slices/layout-configs';
import { ProcessStatus } from '@/types/api/processApi.types';
import { cn } from '@/utils/common';

interface KnowledgeBaseV2PageHomeProps {
  processId: string;
  conversationId: string | null;
}

const KnowledgeBaseV2PageHome: FC<KnowledgeBaseV2PageHomeProps> = ({ processId, conversationId }) => {
  const dispatch = useAppDispatch();
  const [isChatbotExpanded, setIsChatbotExpanded] = useState(false);
  const [defaultMessage, setDefaultMessage] = useState<string | undefined>(undefined);

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

  return (
    <CommonWrapper
      isLoading={isLoadingProcesses}
      skeletonType={SkeletonTypes.CUSTOM}
      loader={
        <div className='flex h-full min-h-[calc(100vh-88px)] w-full items-center justify-center'>
          <ImageLoader imageSrc={ZAMP_LOGO_LOADER_SVG} width={240} height={240} className='rounded-tl-xl' />
        </div>
      }
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
