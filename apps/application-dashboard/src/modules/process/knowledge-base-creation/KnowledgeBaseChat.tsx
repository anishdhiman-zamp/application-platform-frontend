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
  OutputFilesBlockType,
  PlainTextBlockType,
  ResourceType,
  ScopeType,
  SenderType,
  useChat,
} from '@zamp-platform/chat';
import { ArrowDownIcon, Button } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { CirclePlus, EllipsisVertical } from 'lucide-react';
import ProcessInProcessBanner from 'modules/process/knowledge-base-creation/ProcessInProcessBanner';
import { SOP_CREATION_FILENAME } from 'modules/process/knowledge-base-creation/sop-creation.constants';
import { API_ENDPOINTS } from '@/apis/apiEndpoint.constants';
import { useLazyGetOpenFeedbackQuery } from '@/apis/feedback';
import SkeletonElement from '@/components/skeletons/SkeletonElement';
import useActionHub from '@/modules/chatbot/actionHub';
import { CHATBOT_LOCATION_PARAMS } from '@/modules/chatbot/constants';
import NewPaceAvatar from '@/modules/chatbot/NewPaceAvatar';
import StopProcessingFeedback from '@/modules/chatbot/StopProcessingFeedback';
import ChatMessagesSkeleton from '@/modules/pace/components/loaders/ChatMessagesSkeleton';
import { useChatScroll } from '@/modules/pace/hooks/useChatScroll';
import { ACCEPTED_FILE_TYPES } from '@/modules/pace/pace.constants';
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
  onCreatorSopFileFound?: (filename: string) => void;
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
  onCreatorSopFileFound,
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
            text: `I want to create SOP for ${processName}`,
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
    enableStreaming: true,
    setHeader: setHeader,
    apiConfig: {
      sendMessage: API_ENDPOINTS.POST_MESSAGE_V3,
      createConversation: API_ENDPOINTS.CREATE_CONVERSATION_V3,
    },
  });

  const { scrollContainerRef, showScrollButton, handleScroll, handleScrollToBottomClick } = useChatScroll({
    messagesLength: chat.messages?.length ?? 0,
    isLoading: chat?.isLoadingConversationHistory || isLoadingFilterConversations,
    streamingState: chat.streamingState,
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

  const isNewConversationDisabled = isDraftProcess || !chat?.conversationId;

  const handleNewConversation = () => {
    if (isNewConversationDisabled) return;

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

      const url = new URL(window.location.href);

      url.searchParams.set(CHATBOT_LOCATION_PARAMS.CHATBOT_CONVERSATION_ID, chat.conversationId);
      const newUrl = url.search ? `${url.pathname}${url.search}` : url.pathname;

      window.history.replaceState(window.history.state, '', newUrl);
    }
  }, [chat?.conversationId, setConversationId, getOpenFeedback, processId]);

  // Reset isNewConversation when switching to a different conversation
  useEffect(() => {
    if (conversationId) {
      setIsNewConversation(false);
      getOpenFeedback({ processId });
    }
  }, [conversationId, getOpenFeedback, processId]);

  // Check for creator-sop.md file in the latest assistant message with output files
  useEffect(() => {
    if (!chat?.messages?.length || !onCreatorSopFileFound || !conversationId) return;

    // Find the latest assistant message that has an output files block with creator-sop.md
    for (let i = chat.messages.length - 1; i >= 0; i--) {
      const message = chat.messages[i];

      if (message?.sender_type !== SenderType.ASSISTANT) continue;

      const elements = message?.message_content?.elements;

      if (!elements?.length) continue;

      const outputFilesBlock = elements.find(
        (element): element is OutputFilesBlockType => element.type === BLOCK_TYPE.OUTPUT_FILES,
      );

      if (!outputFilesBlock?.payload?.output_files?.length) continue;

      const creatorSopFile = outputFilesBlock.payload.output_files.find(
        (file) => file.filename === SOP_CREATION_FILENAME,
      );

      if (creatorSopFile) {
        onCreatorSopFileFound(creatorSopFile.filename);
        break;
      }
    }
  }, [chat?.messages, onCreatorSopFileFound, conversationId]);

  return (
    <div className='relative flex h-full w-full flex-col'>
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
            'cursor-not-allowed opacity-50': isNewConversationDisabled,
          })}
          onClick={handleNewConversation}
        />
      </div>
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className='relative flex min-h-0 w-full flex-1 flex-col overflow-x-hidden overflow-y-auto [scrollbar-width:thin]'
      >
        {(!chat.isLoadingConversationHistory || !isLoadingFilterConversations) && !isSkeletonLoading && (
          <MessageContainer
            messages={
              showDefaultMessage ? [defaultMessageObject, ...(chat?.messages?.slice(1) ?? [])] : chat?.messages || []
            }
            handleAction={handleAction}
            isAnalysing={isAnalysing}
            streamingState={chat.streamingState}
            assistantAvatar={<NewPaceAvatar />}
            showTimestamp
            showCopy
            alignUserRight
            hideSenderName
            className='flex-1'
          >
            {status === ProcessStatus.BUILDING && (
              <ProcessInProcessBanner shouldRedirect={false} className='h-[400px] pb-4' />
            )}
          </MessageContainer>
        )}
        {isSkeletonLoading && (
          <div className='animate-opacity flex h-full w-full justify-center pt-4'>
            <ChatMessagesSkeleton count={1} className='px-4 py-0' alignUserRight hideSenderName />
          </div>
        )}

        {status !== ProcessStatus.BUILDING && (
          <div className={cn('border-GRAY_400 sticky bottom-0 z-10 w-full shrink-0 border-t bg-[#fcfcfc] p-3')}>
            <ConnectedChatInput
              key={chatInputKey}
              chat={chat}
              autoFocus
              className='bg-white'
              placeholder='Ask anything or give feedback...'
              annotationLocation={{
                type: LocationType.SOP,
                data: {
                  process_id: processId,
                },
              }}
              isDisabled={isAnalysing}
              conversationId={chat?.conversationId || ''}
              scopeId={processId}
              annotationType={status === ProcessStatus.DRAFT ? AnnotationType.PROCESS_SOP : undefined}
              scope={ScopeType.PROCESS}
              currentUserName={currentUserName || ''}
              resourceId={processId}
              organizationId={organizationId}
              defaultMessage={isNewConversation ? undefined : defaultMessage}
              acceptedFileTypes={ACCEPTED_FILE_TYPES}
            />
            <Button
              onClick={handleScrollToBottomClick}
              variant='ghost'
              className={cn(
                'bg-gray-1000 hover:bg-gray-1000 absolute -top-10 left-1/2 z-20 h-6 w-6 -translate-x-1/2 !rounded-full p-3',
                'transition-all duration-200 ease-out',
                showScrollButton ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-2 opacity-0',
              )}
              aria-label='Scroll to bottom'
            >
              <ArrowDownIcon size={14} className='p-[2px] text-white' />
            </Button>
          </div>
        )}
      </div>
      <StopProcessingFeedback
        isOpen={!!stopProcessingConfig}
        onOpenChange={handleOpenChangeForStopProcessing}
        onStopProcessing={handleStopProcessing}
      />
    </div>
  );
};

export default KnowledgeBaseChat;
