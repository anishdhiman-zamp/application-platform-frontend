'use client';

import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { AnnotationType, ResourceType } from '@zamp-platform/chat';
import MarkdownSkeleton from 'modules/process/knowledge-base-creation/components/MarkdownSkeleton';
import dynamic from 'next/dynamic';
import { useFilterConversationsQuery } from '@/apis/processes';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import { useProcesses } from '@/contexts/ProcessesContext';
import { IntegrationType } from '@/modules/integrations/types/integrations.types';
import ChatMessagesSkeleton from '@/modules/pace/components/loaders/ChatMessagesSkeleton';
import { ProcessResponseType, ProcessStatus } from '@/types/api/processApi.types';
import { PROCESS_CREATED_EVENT, ProcessCreatedEventDetail } from '@/utils/events';

// Dynamic imports for heavy components
const KnowledgeBaseChat = dynamic(() => import('@/modules/process/knowledge-base-creation/KnowledgeBaseChat'), {
  ssr: false,
  loading: () => <ChatMessagesSkeleton count={1} className='px-4' alignUserRight hideSenderName />,
});

const ProcessCreationKnowledgeBase = dynamic(
  () => import('@/modules/process/knowledge-base-creation/ProcessCreationKnowledgeBase'),
);

interface CreateKnowledgeBasePageHomeProps {
  processId: string;
  conversationId?: string;
  integrations: IntegrationType[];
  source?: string;
}

const CreateKnowledgeBasePageHome: FC<CreateKnowledgeBasePageHomeProps> = ({
  processId,
  conversationId: initialConversationId,
  integrations,
  source,
}) => {
  const isFromProcessCreation = source === 'process-creation';

  const [conversationId, setConversationId] = useState<string | undefined>(initialConversationId);
  const [outputSopFilename, setOutputSopFilename] = useState<string | undefined>();
  const [markdownSopFilename, setMarkdownSopFilename] = useState<string | undefined>();
  const [markdownSopFetchKey, setMarkdownSopFetchKey] = useState(0);
  const [isCreated, setIsCreated] = useState(isFromProcessCreation);
  const { processes, isLoadingProcesses } = useProcesses();

  const skipFilterConversations = useMemo(() => {
    return isFromProcessCreation;
  }, []);

  const {
    data: filterConversationsData,
    isFetching: isLoadingFilterConversations,
    refetch: refetchFilterConversations,
  } = useFilterConversationsQuery(
    {
      resource_id: processId,
      resource_type: ResourceType.PROCESS,
      annotation_types: AnnotationType.PROCESS_SOP,
    },
    {
      skip: !!initialConversationId || isCreated || skipFilterConversations,
      refetchOnMountOrArgChange: false,
    },
  );

  const currentProcess = useMemo(
    () => processes?.find((process: ProcessResponseType) => process?.process_id === processId),
    [processes, processId],
  );

  const handleProcessCreated = useCallback(
    (event: CustomEvent<ProcessCreatedEventDetail>) => {
      if (event.detail.processId === processId) {
        setIsCreated(false);
        // Remove only the source query param from URL
        const url = new URL(window.location.href);

        url.searchParams.delete('source');

        // Update URL immediately using history API to avoid race conditions
        const newUrl = `${url.pathname}${url.search}`;

        window.history.replaceState(window.history.state, '', newUrl);
      }
    },
    [processId, refetchFilterConversations, setIsCreated],
  );

  // Derive conversationId from fetched data
  const fetchedConversationId = useMemo(
    () => filterConversationsData?.conversations?.[0]?.id,
    [filterConversationsData],
  );

  // Determine the default message when there are no existing conversations
  const defaultMessage = useMemo(() => {
    if (initialConversationId || fetchedConversationId) {
      return undefined;
    }
    // Only show default message after query has completed (not fetching) and no conversations exist
    if (
      (!isLoadingFilterConversations &&
        filterConversationsData &&
        filterConversationsData.conversations?.length === 0) ||
      (skipFilterConversations && !isCreated)
    ) {
      return `I want to create SOP for ${currentProcess?.display_name}`;
    }

    return undefined;
  }, [
    initialConversationId,
    fetchedConversationId,
    isLoadingFilterConversations,
    filterConversationsData,
    currentProcess?.display_name,
    skipFilterConversations,
    isCreated,
  ]);

  // Update local conversationId when fetched data changes
  useEffect(() => {
    if (fetchedConversationId && !conversationId) {
      setConversationId(fetchedConversationId);
    }
  }, [fetchedConversationId, conversationId]);

  useEffect(() => {
    if (!isFromProcessCreation) return;

    window.addEventListener(PROCESS_CREATED_EVENT, handleProcessCreated as EventListener);

    return () => {
      window.removeEventListener(PROCESS_CREATED_EVENT, handleProcessCreated as EventListener);
    };
  }, [handleProcessCreated, isFromProcessCreation]);

  return (
    <CommonWrapper
      isLoading={isLoadingProcesses}
      skeletonType={SkeletonTypes.CUSTOM}
      loader={<MarkdownSkeleton />}
      className='flex h-full w-full'
    >
      <div className='border-GRAY_400 h-full w-[444px] min-w-[444px] border-r'>
        <KnowledgeBaseChat
          setConversationId={setConversationId}
          conversationId={conversationId || ''}
          processId={processId}
          status={currentProcess?.status}
          isLoadingFilterConversations={
            (currentProcess?.status === ProcessStatus.DRAFT && isLoadingFilterConversations) || isCreated
          }
          defaultMessage={defaultMessage}
          processName={currentProcess?.display_name ?? ''}
          isDraftProcess={currentProcess?.status === ProcessStatus.DRAFT}
          showDefaultMessage={skipFilterConversations}
          onOutputSopFileFound={setOutputSopFilename}
          onMarkdownSopFileFound={(filename) => {
            setMarkdownSopFilename(filename);
            setMarkdownSopFetchKey((prev) => prev + 1);
          }}
          streamingEnabled
        />
      </div>
      <div className='w-full'>
        <ProcessCreationKnowledgeBase
          isChatbotExpanded
          processId={processId}
          processName={currentProcess?.display_name ?? ''}
          integrations={integrations}
          outputSopFilename={outputSopFilename}
          markdownSopFilename={markdownSopFilename}
          markdownSopFetchKey={markdownSopFetchKey}
          conversationId={conversationId}
        />
      </div>
    </CommonWrapper>
  );
};

export default CreateKnowledgeBasePageHome;
