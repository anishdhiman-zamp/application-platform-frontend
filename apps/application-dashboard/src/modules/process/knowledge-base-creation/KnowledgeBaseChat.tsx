'use client';
import { FC, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  AnnotationType,
  BLOCK_TYPE,
  ButtonBlockType,
  ChatMessageType,
  ConnectedChatInput,
  DisplayLayerActionType,
  LocationType,
  MessageContainer,
  PlainTextBlockType,
  ResourceType,
  ScopeType,
  SenderType,
  useChat,
} from '@zamp-platform/chat';
import { cn } from '@zamp-platform/ui/utils';
import { CirclePlus, EllipsisVertical } from 'lucide-react';
import ProcessInProcessBanner from 'modules/process/knowledge-base-creation/ProcessInProcessBanner';
import { useLazyGetOpenFeedbackQuery } from '@/apis/feedback';
import SkeletonElement from '@/components/skeletons/SkeletonElement';
import useActionHub from '@/modules/chatbot/actionHub';
import StopProcessingFeedback from '@/modules/chatbot/StopProcessingFeedback';
import ChatMessagesSkeleton from '@/modules/pace/components/loaders/ChatMessagesSkeleton';
import { RootState } from '@/store';
import { ProcessStatus } from '@/types/api/processApi.types';
import { MapAny } from '@/types/commonTypes';
import { getUserNameFromEmail } from '@/utils/common';

interface KnowledgeBaseChatProps {
  status?: ProcessStatus;
  processId: string;
  conversationId?: string;
  isLoadingFilterConversations?: boolean;
  defaultMessage?: string;
  onNewConversation?: () => void;
  setConversationId?: (conversationId: string) => void;
  isDraftProcess?: boolean;
  processName?: string;
  showDefaultMessage?: boolean;
}

const KnowledgeBaseChat: FC<KnowledgeBaseChatProps> = ({
  status,
  processId,
  conversationId,
  isLoadingFilterConversations = false,
  defaultMessage,
  onNewConversation,
  setConversationId,
  isDraftProcess,
  processName,
  showDefaultMessage,
}) => {
  const currentUserName = useSelector((state: RootState) => state?.user?.user?.user_name);
  const organizationId = useSelector((state: RootState) => state?.user?.user?.orgs?.[0]?.organization_id ?? '');
  const currentUserEmail = useSelector((state: RootState) => state?.user?.user?.user_email);
  const [header, setHeader] = useState('');
  const [isNewConversation, setIsNewConversation] = useState(false);
  const [chatInputKey, setChatInputKey] = useState(0);
  const [stopProcessingConfig, setStopProcessingConfig] = useState<{
    blockConfig: ButtonBlockType;
    payload: MapAny;
  }>();

  const [getOpenFeedback] = useLazyGetOpenFeedbackQuery();

  const defaultMessageObject = {
    resource_type: ResourceType.PROCESS,
    resource_id: processId,
    message_type: ChatMessageType.TEXT,
    metadata: {},
    id: '1',
    sender_type: SenderType.USER,
    sender_name: currentUserName,
    message_content: {
      text: ``,
      text_type: 'plain_text',
      elements: [
        {
          id: '1',
          type: BLOCK_TYPE.PLAIN_TEXT,
          order: 0,
          payload: {
            text: `I want to automate ${processName}`,
          },
        },
      ] as PlainTextBlockType[],
    },
    timestamp: new Date().toISOString(),
  };

  const { runAction } = useActionHub();

  const chat = useChat({
    resourceId: processId,
    resourceType: ResourceType.PROCESS,
    conversationId: conversationId,
    setHeader: setHeader,
  });

  const isSkeletonLoading =
    status === ProcessStatus.LIVE
      ? chat?.isLoadingConversationHistory
      : chat?.messages?.length === 0 && !showDefaultMessage;

  const isAnalysing = useMemo(() => {
    return (
      chat?.messages[chat?.messages?.length - 1]?.sender_type === SenderType.USER ||
      (!!showDefaultMessage && chat?.messages?.length < 2)
    );
  }, [chat?.messages?.length]);

  const handleStopProcessing = () => {
    if (stopProcessingConfig) {
      runAction(stopProcessingConfig.blockConfig, stopProcessingConfig.payload, chat);
      setStopProcessingConfig(undefined);
    }
  };

  const handleAction = (blockConfig: ButtonBlockType, payload: MapAny) => {
    const updatedPayload = {
      ...payload,
      resourceId: processId,
      resourceType: ResourceType.PROCESS,
      senderName: currentUserName || getUserNameFromEmail(currentUserEmail || '') || '',
    };

    if (blockConfig.action?.display_layer_action === DisplayLayerActionType.SEND_BUTTON_TEXT_WITH_STOP_PROCESSING) {
      setStopProcessingConfig({ blockConfig, payload: updatedPayload });

      return;
    }
    runAction(blockConfig, updatedPayload, chat);
  };

  const handleOpenChangeForStopProcessing = (open: boolean) => {
    if (!open) {
      setStopProcessingConfig(undefined);
    }
  };

  const handleNewConversation = () => {
    if (isDraftProcess) return;

    chat.clearMessages();
    onNewConversation?.();
    setConversationId?.('');
    setHeader('');
    setIsNewConversation(true);
    setChatInputKey((prev) => prev + 1);
  };

  useEffect(() => {
    if (chat?.conversationId) {
      setConversationId?.(chat?.conversationId);
      getOpenFeedback({ processId });
    }
  }, [chat?.conversationId, setConversationId, getOpenFeedback, processId]);

  // Reset isNewConversation when switching to a different conversation
  useEffect(() => {
    if (conversationId) {
      setIsNewConversation(false);
      getOpenFeedback({ processId });
    }
  }, [conversationId, getOpenFeedback, processId]);
  return (
    <div className='flex h-full w-full flex-col'>
      <div
        className={cn(
          'border-GRAY_400 hidden w-full items-center gap-3 border-b px-3.5 py-3',
          status === ProcessStatus.LIVE ? 'flex' : 'hidden',
        )}
      >
        {isSkeletonLoading ? (
          <SkeletonElement elementCount={1} className='h-4 w-full' />
        ) : header ? (
          <div className='f-14-500 text-GRAY_1000 grow'>{header}</div>
        ) : (
          <div className='f-12-550 text-GRAY_700 grow'>Ask or give feedback</div>
        )}
        <EllipsisVertical size={12} className='text-GRAY_700 hidden cursor-pointer' />
        <CirclePlus
          size={12}
          className={cn('text-GRAY_700 cursor-pointer', {
            'cursor-not-allowed opacity-50': isDraftProcess,
          })}
          onClick={handleNewConversation}
        />
      </div>

      {(!chat.isLoadingConversationHistory || !isLoadingFilterConversations) && !isSkeletonLoading && (
        <MessageContainer
          messages={
            showDefaultMessage ? [defaultMessageObject, ...(chat?.messages?.slice(1) ?? [])] : chat?.messages || []
          }
          handleAction={handleAction}
          isAnalysing={isAnalysing}
          className='overflow-y-auto [scrollbar-width:thin]'
        >
          {status === ProcessStatus.BUILDING && (
            <ProcessInProcessBanner shouldRedirect={false} className='h-[400px] pb-4' />
          )}
        </MessageContainer>
      )}
      {isSkeletonLoading && (
        <div className='animate-opacity flex h-full w-full justify-center overflow-y-auto pt-4'>
          <ChatMessagesSkeleton count={1} className='px-4 py-0' />
        </div>
      )}

      {status !== ProcessStatus.BUILDING && (
        <div className='border-GRAY_400 w-full border-t p-3'>
          <div className='flex shrink-0'>
            <ConnectedChatInput
              key={chatInputKey}
              chat={chat}
              placeholder='Ask anything or give feedback...'
              annotationLocation={{
                type: LocationType.SOP,
                data: {
                  process_id: processId,
                },
              }}
              conversationId={chat?.conversationId || ''}
              scopeId={processId}
              annotationType={status === ProcessStatus.DRAFT ? AnnotationType.PROCESS_SOP : undefined}
              scope={ScopeType.PROCESS}
              autoFocus={true}
              currentUserName={currentUserName || ''}
              resourceId={processId}
              organizationId={organizationId}
              setHeader={setHeader}
              defaultMessage={isNewConversation ? undefined : defaultMessage}
            />
          </div>
        </div>
      )}
      <StopProcessingFeedback
        isOpen={!!stopProcessingConfig}
        onOpenChange={handleOpenChangeForStopProcessing}
        onStopProcessing={handleStopProcessing}
      />
    </div>
  );
};

export default KnowledgeBaseChat;
