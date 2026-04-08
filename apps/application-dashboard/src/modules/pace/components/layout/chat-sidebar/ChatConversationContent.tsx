'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  type AgentBlockType,
  BLOCK_TYPE,
  ChatActionsProvider,
  createConversationPayload,
  createUserMessagePayload,
  DropOverlay,
  MessageContainer,
  ResourceType,
  ScopeType,
  useFileDragDrop,
  useStreamingState,
} from '@zamp-platform/chat';
import { useConversationActions, useConversationState } from '@zamp-platform/conversation-stream';
import { ScrollContainer } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import AgentPill from 'modules/pace/components/agents/components/AgentPill';
import TaskStatusCounts from 'modules/pace/components/chat/TaskStatusCounts';
import { useRouter } from 'next/navigation';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import { APITags } from '@/constants/api.constants';
import { useAppDispatch } from '@/hooks/toolkit';
import ZampIcon from '@/modules/chatbot/ZampIcon';
import AgentTestCard from '@/modules/pace/components/agents/components/AgentTestCard';
import {
  getAgentAvatar,
  getAgentAvatarByKey,
  PrefixMessage,
} from '@/modules/pace/components/agents/constants/agents.constants';
import { buildTabRoute } from '@/modules/pace/components/dynamic-tabs/tab-type-registry';
import { useDynamicTabs } from '@/modules/pace/components/dynamic-tabs/useDynamicTabs';
import ChatMessagesSkeleton from '@/modules/pace/components/loaders/ChatMessagesSkeleton';
import { type ActiveAgentInfo, usePaceContext } from '@/modules/pace/pace.context';
import { TAB_TYPE } from '@/modules/pace/pace.types';
import { preserveSidebarParam } from '@/modules/pace/pace.utils';
import { addAutoLoopLockedConversation } from '@/modules/pace/utils/autoLoopStorage';
import { baseApi } from '@/services/baseApi';

export interface ChatConversationContentProps {
  conversationId: string | null;
  organizationId: string;
  onFileOpen: (path: string, name: string) => void;
  onTaskOpen?: (name: string, path: string) => void;
  onBrowserOpen?: (conversationId: string) => void;
  onTaskPopoverOpenChange?: (open: boolean) => void;
  fileDropHandlerRef: React.RefObject<((files: FileList) => void) | null>;
  addFileReferenceRef: React.RefObject<((ref: { path: string; name: string }) => void) | null>;
  currentUserName: string;
}

const ChatConversationContent = ({
  conversationId,
  organizationId,
  onFileOpen,
  onTaskOpen,
  onBrowserOpen,
  onTaskPopoverOpenChange,
  fileDropHandlerRef,
  addFileReferenceRef,
  currentUserName,
}: ChatConversationContentProps) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const intentConsumedRef = useRef(false);
  const consumedIntentRef = useRef<unknown>(null);
  const taskStatusContainerRef = useRef<HTMLDivElement>(null);
  const prevAgentInfoRef = useRef<ActiveAgentInfo | null>(null);

  const {
    pendingFileReference,
    clearPendingFileReference,
    chatMessageIntent,
    setChatMessageIntent,
    activeAgentInfo,
    setActiveAgentInfo,
    startNewChat,
  } = usePaceContext();

  const { openTab } = useDynamicTabs({ type: TAB_TYPE.AGENT });

  const {
    messages,
    hasMessages,
    conversationId: ctxConversationId,
    isCreatingConversationV2,
    isLoadingConversationHistory,
    isErrorConversationHistory,
    isStreaming,
    isBrowserStreamingAvailable,
    taskSummaries,
    isAnalysing,
  } = useConversationState();
  const { createConversationV2, sendMessage, refetchConversationHistory } = useConversationActions();
  const streamingState = useStreamingState(conversationId ?? ctxConversationId);

  const [isTaskPopoverOpen, setIsTaskPopoverOpen] = useState(false);

  const isInConversation = Boolean(conversationId || ctxConversationId || hasMessages || streamingState?.is_active);
  const lastMessageSenderType = useMemo(() => messages[messages.length - 1]?.sender_type, [messages]);
  const isLoadingConversation =
    !streamingState?.is_active &&
    (!hasMessages || Boolean(conversationId && isLoadingConversationHistory && !hasMessages));

  const { isDragOver, dropZoneProps } = useFileDragDrop({
    onFileDrop: (files) => fileDropHandlerRef.current?.(files),
    disabled: isStreaming || isCreatingConversationV2,
  });

  const agentInfoFromMessages = useMemo((): ActiveAgentInfo | null => {
    for (let i = messages.length - 1; i >= 0; i--) {
      const elements = messages[i]?.message_content?.elements;

      if (!elements) continue;

      for (const el of elements) {
        if (el.type === BLOCK_TYPE.AGENT && 'payload' in el) {
          const payload = (el as AgentBlockType).payload;

          return {
            id: payload.agent_id,
            name: payload.name,
            avatar: payload.avatar,
          };
        }
      }
    }

    return null;
  }, [messages]);

  const currentAgentInfo = activeAgentInfo ?? agentInfoFromMessages;

  const handleWatchStream = useCallback(() => {
    const activeConversationId = conversationId ?? ctxConversationId;

    if (activeConversationId) {
      onBrowserOpen?.(activeConversationId);
    }
  }, [conversationId, ctxConversationId, onBrowserOpen]);

  const handleTaskPopoverOpenChange = (open: boolean) => {
    setIsTaskPopoverOpen(open);
    onTaskPopoverOpenChange?.(open);
  };

  useEffect(() => {
    if (pendingFileReference && addFileReferenceRef.current) {
      addFileReferenceRef.current(pendingFileReference);
      clearPendingFileReference();
    }
  }, [pendingFileReference, clearPendingFileReference, addFileReferenceRef]);

  useEffect(() => {
    if (agentInfoFromMessages && !activeAgentInfo) {
      setActiveAgentInfo(agentInfoFromMessages);
    }
  }, [agentInfoFromMessages, activeAgentInfo, setActiveAgentInfo]);

  const handleAgentClick = useCallback(
    (agentId: string, agentName: string, agentDescription?: string, avatarKey?: string) => {
      const tabPath = buildTabRoute(agentId, TAB_TYPE.AGENT);
      const params = new URLSearchParams({ title: agentName });

      if (agentDescription && agentDescription !== 'None') {
        params.set('description', agentDescription);
      }

      const cleanPath = `${tabPath}?${params.toString()}`;

      const metadata: Record<string, string> = {};

      if (agentDescription && agentDescription !== 'None') metadata.description = agentDescription;
      if (avatarKey) metadata.avatarKey = avatarKey;

      openTab(agentId, agentName, Object.keys(metadata).length > 0 ? metadata : undefined);
      router.push(preserveSidebarParam(cleanPath));
    },
    [openTab, router],
  );

  const handleAgentTest = useCallback(
    (agentId: string, agentName: string) => {
      setChatMessageIntent({
        message: `${PrefixMessage.TEST_AGENT} **${agentName}**`,
        metadata: { agent_id: agentId },
      });

      if (!conversationId) {
        startNewChat();
      }
    },
    [conversationId, startNewChat, setChatMessageIntent],
  );

  const renderAgentBlock = useCallback(
    (payload: { agent_id: string; name: string; description: string; avatar?: string }) => {
      const avatarKey = payload.avatar;
      const avatar = (avatarKey && getAgentAvatarByKey(avatarKey)) || getAgentAvatar(payload.name);

      return (
        <AgentTestCard
          agentId={payload.agent_id}
          agentName={payload.name}
          avatar={avatar}
          className='border-GRAY_400 bg-GRAY_100 overflow-hidden rounded-xl border'
          onClick={() => handleAgentClick(payload.agent_id, payload.name, payload.description, payload.avatar)}
        />
      );
    },
    [handleAgentClick],
  );

  // Refresh agents list when an agent block appears in chat
  const handleAgentInfoChange = useCallback(() => {
    if (agentInfoFromMessages && agentInfoFromMessages !== prevAgentInfoRef.current) {
      prevAgentInfoRef.current = agentInfoFromMessages;
      dispatch(baseApi.util.invalidateTags([APITags.GET_AGENTS_LIST]));
    }
  }, [agentInfoFromMessages, dispatch]);

  useEffect(() => {
    handleAgentInfoChange();
  }, [handleAgentInfoChange]);

  // Send message to existing conversation via intent
  const handleSendIntentToExistingConversation = useCallback(() => {
    if (chatMessageIntent && conversationId && consumedIntentRef.current !== chatMessageIntent) {
      consumedIntentRef.current = chatMessageIntent;
      const messagePayload = createUserMessagePayload(
        chatMessageIntent.message,
        organizationId,
        ResourceType.ORGANIZATION,
        currentUserName,
        chatMessageIntent.fileReferences,
        chatMessageIntent.llmModel,
      );

      setChatMessageIntent(null);
      sendMessage(messagePayload);
    }
  }, [chatMessageIntent, conversationId, organizationId, currentUserName, sendMessage, setChatMessageIntent]);

  useEffect(() => {
    handleSendIntentToExistingConversation();
  }, [handleSendIntentToExistingConversation]);

  // Create new conversation via intent (e.g. home screen input)
  const handleCreateConversationFromIntent = useCallback(() => {
    if (chatMessageIntent && !intentConsumedRef.current && !conversationId) {
      intentConsumedRef.current = true;
      const payload = createConversationPayload(
        organizationId,
        ResourceType.ORGANIZATION,
        organizationId,
        chatMessageIntent.message,
        currentUserName,
        chatMessageIntent.fileReferences,
        ScopeType.ORGANIZATION,
        undefined,
        undefined,
        chatMessageIntent.llmModel,
        chatMessageIntent.metadata,
        chatMessageIntent.autoLoopEnabled,
      );

      const shouldLockAutoLoop = chatMessageIntent.autoLoopEnabled;

      setChatMessageIntent(null);
      createConversationV2(payload).then((response: { conversation_id?: string } | undefined) => {
        if (shouldLockAutoLoop && response?.conversation_id) {
          addAutoLoopLockedConversation(response.conversation_id);
        }
      });
    }
  }, [chatMessageIntent, conversationId, organizationId, currentUserName, createConversationV2, setChatMessageIntent]);

  useEffect(() => {
    handleCreateConversationFromIntent();
  }, [handleCreateConversationFromIntent]);

  return (
    <ChatActionsProvider
      onFileOpen={onFileOpen}
      onTaskOpen={onTaskOpen}
      onAgentClick={handleAgentClick}
      onAgentTest={handleAgentTest}
      renderAgentBlock={renderAgentBlock}
      onWatchStream={handleWatchStream}
      isBrowserStreamingAvailable={isBrowserStreamingAvailable}
      taskSummaries={taskSummaries}
    >
      <div className='relative flex min-h-0 w-full flex-1 flex-col overflow-hidden' {...dropZoneProps}>
        <DropOverlay isVisible={isDragOver} />
        <ScrollContainer
          showScrollToBottom
          enableAnchorScroll
          lastMessageSenderType={lastMessageSenderType}
          isLoading={isLoadingConversation}
          streamingState={streamingState}
          scrollTrigger={messages?.length}
          scrollbarStyle='none'
          scrollClassName={cn(
            'bg-BG_WHITE transition-[filter] duration-200',
            isTaskPopoverOpen ? 'overflow-y-hidden blur-sm pointer-events-none' : 'overflow-y-scroll',
          )}
        >
          {isInConversation ? (
            <CommonWrapper
              isLoading={isLoadingConversation}
              isError={isErrorConversationHistory}
              refetchFunction={refetchConversationHistory}
              skeletonType={SkeletonTypes.CUSTOM}
              loader={<ChatMessagesSkeleton className='px-0' />}
              className='mx-auto flex w-full max-w-[700px] flex-1 flex-col px-3'
            >
              <MessageContainer
                messages={messages}
                isAnalysing={isAnalysing}
                streamingState={streamingState}
                className='gap-4 px-0 [scrollbar-width:none]'
                conversationId={conversationId ?? ctxConversationId ?? ''}
                assistantAvatar={<ZampIcon />}
                showTimestamp
                showFeedback
                showCopy
                alignUserRight
              />
              <div className='bg-BG_WHITE h-12 w-full' />
            </CommonWrapper>
          ) : (
            <div className='flex flex-1 items-center justify-center'>
              <div className='flex flex-col items-center gap-4'>
                <ZampIcon size={40} className='opacity-50' />
                <p className='f-13-400 text-GRAY_600'>Ask Pace anything</p>
              </div>
            </div>
          )}
        </ScrollContainer>
      </div>
      <div
        ref={taskStatusContainerRef}
        className='bg-BG_WHITE/80 sticky bottom-0 z-10 mx-auto w-full max-w-[700px] px-3 backdrop-blur-md'
      >
        <div className='flex flex-wrap items-center gap-2 pb-2'>
          {currentAgentInfo && (
            <AgentPill
              agentId={currentAgentInfo.id}
              agentName={currentAgentInfo.name}
              avatarKey={currentAgentInfo.avatar}
              containerRef={taskStatusContainerRef}
              onOpenChange={handleTaskPopoverOpenChange}
            />
          )}
          <TaskStatusCounts
            messages={messages}
            streamingState={streamingState}
            conversationId={conversationId ?? ctxConversationId ?? ''}
            containerRef={taskStatusContainerRef}
            onOpenChange={handleTaskPopoverOpenChange}
          />
        </div>
      </div>
    </ChatActionsProvider>
  );
};

export default ChatConversationContent;
