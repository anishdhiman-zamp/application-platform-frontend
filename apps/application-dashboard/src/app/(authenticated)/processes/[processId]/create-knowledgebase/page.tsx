'use client';

import { useEffect, useMemo, useState } from 'react';
import { captureException } from '@sentry/browser';
import { AnnotationType, ResourceType } from '@zamp-platform/chat';
import { toast } from '@zamp-platform/ui';
import { useParams } from 'next/navigation';
import { useGetProcessesQuery } from '@/apis/pages';
import { useLazyFilterConversationsQuery } from '@/apis/processes';
import ImageLoader from '@/components/common/loader/ImageLoader';
import { KB_TOAST_MESSAGES } from '@/components/common/toast/toast.constants';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import { ZAMP_LOGO_LOADER_SVG } from '@/constants/icons';
import { useAppDispatch } from '@/hooks/toolkit';
import KnowledgeBaseChat from '@/modules/process/knowledge-base-creation/KnowledgeBaseChat';
import ProcessCreationKnowledgeBase from '@/modules/process/knowledge-base-creation/ProcessCreationKnowledgeBase';
import ProcessInProcessBanner from '@/modules/process/knowledge-base-creation/ProcessInProcessBanner';
import { closeSidebar, openSidebar } from '@/store/slices/layout-configs';
import { FilterConversationsResponseType, ProcessStatus } from '@/types/api/processApi.types';

const CreateKnowledgebasePage = () => {
  const dispatch = useAppDispatch();
  const params = useParams();
  const processId = params?.processId as string;
  const [conversationId, setConversationId] = useState<string | undefined>(params?.conversationId as string);
  const [defaultMessage, setDefaultMessage] = useState<string>();

  const { data: processes, isLoading: isLoadingProcesses } = useGetProcessesQuery(undefined, {
    refetchOnMountOrArgChange: false,
  });
  const [filterConversations, { isFetching: isLoadingFilterConversations, isUninitialized }] =
    useLazyFilterConversationsQuery();

  const currentProcess = useMemo(() => processes?.find((process) => process.id === processId), [processes, processId]);

  useEffect(() => {
    setTimeout(() => {
      dispatch(closeSidebar());
    }, 300);

    return () => {
      dispatch(openSidebar());
    };
  }, [dispatch]);

  useEffect(() => {
    if (!conversationId && currentProcess?.status === ProcessStatus.DRAFT) {
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

  if (![ProcessStatus.DRAFT, ProcessStatus.LIVE].includes(currentProcess?.status as ProcessStatus)) {
    return <ProcessInProcessBanner />;
  }

  return (
    <CommonWrapper
      isLoading={isLoadingProcesses}
      skeletonType={SkeletonTypes.CUSTOM}
      loader={
        <div className='flex h-full min-h-[calc(100vh-88px)] w-full items-center justify-center'>
          <ImageLoader imageSrc={ZAMP_LOGO_LOADER_SVG} width={240} height={240} className='rounded-tl-xl' />
        </div>
      }
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

export default CreateKnowledgebasePage;
