'use client';

import { FC, useEffect, useMemo, useState } from 'react';
import { captureException } from '@sentry/browser';
import { AnnotationType, ResourceType } from '@zamp-platform/chat';
import { toast } from '@zamp-platform/ui';
import MarkdownSkeleton from 'modules/process/knowledge-base-creation/components/MarkdownSkeleton';
import dynamic from 'next/dynamic';
import { useGetProcessesQuery } from '@/apis/pages';
import { useLazyFilterConversationsQuery } from '@/apis/processes';
import { KB_TOAST_MESSAGES } from '@/components/common/toast/toast.constants';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import ChatMessagesSkeleton from '@/modules/pace/components/loaders/ChatMessagesSkeleton';
import { FilterConversationsResponseType, ProcessStatus } from '@/types/api/processApi.types';

// Dynamic imports for heavy components
const KnowledgeBaseChat = dynamic(() => import('@/modules/process/knowledge-base-creation/KnowledgeBaseChat'), {
  ssr: false,
  loading: () => <ChatMessagesSkeleton count={2} className='px-0 py-0' />,
});

const ProcessCreationKnowledgeBase = dynamic(
  () => import('@/modules/process/knowledge-base-creation/ProcessCreationKnowledgeBase'),
);

interface CreateKnowledgeBasePageHomeProps {
  processId: string;
  conversationId?: string;
}

const CreateKnowledgeBasePageHome: FC<CreateKnowledgeBasePageHomeProps> = ({
  processId,
  conversationId: initialConversationId,
}) => {
  const [conversationId, setConversationId] = useState<string | undefined>(initialConversationId);
  const [defaultMessage, setDefaultMessage] = useState<string>();

  const { data: processes, isLoading: isLoadingProcesses } = useGetProcessesQuery(undefined, {
    refetchOnMountOrArgChange: false,
  });
  const [filterConversations, { isFetching: isLoadingFilterConversations, isUninitialized }] =
    useLazyFilterConversationsQuery();

  const currentProcess = useMemo(() => processes?.find((process) => process.id === processId), [processes, processId]);

  useEffect(() => {
    if (!conversationId) {
      filterConversations({
        resource_id: processId,
        resource_type: ResourceType.PROCESS,
        annotation_types: AnnotationType.PROCESS_SOP,
      })
        .unwrap()
        .then((res: FilterConversationsResponseType) => {
          if (res?.conversations?.length > 0) {
            setConversationId(res?.conversations?.[0]?.id);
          } else {
            setDefaultMessage(`I want to automate ${currentProcess?.display_name}`);
          }
        })
        .catch((err: unknown) => {
          toast.error(KB_TOAST_MESSAGES.FAILED_CONVERSATION_CREATION);
          captureException(err);
        });
    }
  }, [processId, conversationId, currentProcess, filterConversations]);

  return (
    <CommonWrapper
      isLoading={isLoadingProcesses}
      skeletonType={SkeletonTypes.CUSTOM}
      loader={<MarkdownSkeleton />}
      className='flex h-full w-full'
    >
      <div className='border-GRAY_400 h-full w-[444px] min-w-[444px] border-r'>
        <KnowledgeBaseChat
          key={conversationId}
          setConversationId={setConversationId}
          conversationId={conversationId || ''}
          processId={processId}
          status={currentProcess?.status}
          isLoadingFilterConversations={
            currentProcess?.status === ProcessStatus.DRAFT && (isLoadingFilterConversations || isUninitialized)
          }
          defaultMessage={defaultMessage}
          isDisabled={currentProcess?.status !== ProcessStatus.DRAFT}
        />
      </div>
      <div className='w-full'>
        <ProcessCreationKnowledgeBase
          isChatbotExpanded
          processId={processId}
          processName={currentProcess?.display_name ?? ''}
        />
      </div>
    </CommonWrapper>
  );
};

export default CreateKnowledgeBasePageHome;
