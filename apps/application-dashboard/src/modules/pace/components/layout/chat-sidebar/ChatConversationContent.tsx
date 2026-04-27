'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { isNotFoundError } from '@zamp-platform/api';
import {
  type AgentBlockType,
  BLOCK_TYPE,
  ChatActionsProvider,
  createConversationPayload,
  createUserMessagePayload,
  MessageContainer,
  ResourceType,
  ScopeType,
  useStreamingState,
} from '@zamp-platform/chat';
import {
  type MentionInsertPayload,
  useConversationActions,
  useConversationState,
} from '@zamp-platform/conversation-stream';
import { ScrollContainer, type ScrollContainerRef } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import AgentPill from 'modules/pace/components/agents/components/AgentPill';
import TaskStatusCounts from 'modules/pace/module/TaskStatusCounts';
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
import ContentErrorState from '@/modules/pace/components/ContentErrorState';
import { buildTabRoute } from '@/modules/pace/components/dynamic-tabs/tab-type-registry';
import { useDynamicTabs } from '@/modules/pace/components/dynamic-tabs/useDynamicTabs';
import ChatMessagesSkeleton from '@/modules/pace/components/loaders/ChatMessagesSkeleton';
import { type ActiveAgentInfo, usePaceContext } from '@/modules/pace/pace.context';
import { CHAT_SIDEBAR_STATE, TAB_TYPE } from '@/modules/pace/pace.types';
import { preserveSidebarParam } from '@/modules/pace/pace.utils';
import { baseApi } from '@/services/baseApi';

export interface ChatConversationContentProps {
  conversationId: string | null;
  organizationId: string;
  onFileOpen: (path: string, name: string) => void;
  onDatasetOpen?: (datasetId: string, name: string) => void;
  onTaskOpen?: (taskId: string, name: string, path: string) => void;
  onBrowserOpen?: (conversationId: string, sessionId?: string) => void;
  onBrowserStreamingEnd?: (conversationId: string) => void;
  onTaskPopoverOpenChange?: (open: boolean) => void;
  onConversationNotFound?: (notFound: boolean) => void;
  addFileReferenceRef: React.RefObject<((ref: { path: string; name: string }) => void) | null>;
  addMentionRef: React.RefObject<((payload: MentionInsertPayload) => void) | null>;
  currentUserName: string;
  scrollContainerRef?: React.RefObject<ScrollContainerRef | null>;
}

const ChatConversationContent = ({
  conversationId,
  organizationId,
  onFileOpen,
  onDatasetOpen,
  onTaskOpen,
  onBrowserOpen,
  onBrowserStreamingEnd,
  onTaskPopoverOpenChange,
  onConversationNotFound,
  addFileReferenceRef,
  addMentionRef,
  currentUserName,
  scrollContainerRef,
}: ChatConversationContentProps) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const intentConsumedRef = useRef(false);
  const consumedIntentRef = useRef<unknown>(null);
  const taskStatusContainerRef = useRef<HTMLDivElement>(null);
  const prevAgentInfoRef = useRef<ActiveAgentInfo | null>(null);
  const prevBrowserStreamingRef = useRef(false);

  const {
    pendingFileReferences,
    clearPendingFileReferences,
    pendingMentionInserts,
    clearPendingMentionInserts,
    chatMessageIntent,
    setChatMessageIntent,
    activeAgentInfo,
    setActiveAgentInfo,
    startNewChat,
    setChatSidebarState,
  } = usePaceContext();

  const { openTab } = useDynamicTabs({ type: TAB_TYPE.AGENT });

  const {
    messages,
    hasMessages,
    conversationId: ctxConversationId,
    isLoadingConversationHistory,
    isErrorConversationHistory,
    errorConversationHistory,
    isUninitializedConversationHistory,
    isBrowserStreamingAvailable,
    browserSessionId,
    taskSummaries,
    isAnalysing,
    inputsRequired,
  } = useConversationState();
  const { createConversationV2, sendMessage, refetchConversationHistory } = useConversationActions();
  const streamingState = useStreamingState(conversationId ?? ctxConversationId);

  const [isTaskPopoverOpen, setIsTaskPopoverOpen] = useState(false);

  const isInConversation = Boolean(conversationId || ctxConversationId || hasMessages || streamingState?.is_active);
  const lastMessageSenderType = useMemo(() => messages[messages.length - 1]?.sender_type, [messages]);
  const lastUserMessageKey = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i];

      if (msg?.sender_type === 'USER') return msg.id ?? msg.timestamp ?? `idx-${i}`;
    }

    return null;
  }, [messages]);
  const isLoadingConversation =
    !isErrorConversationHistory &&
    !streamingState?.is_active &&
    (!hasMessages || Boolean(conversationId && isLoadingConversationHistory && !hasMessages));
  const isConversationNotFound = isErrorConversationHistory && isNotFoundError(errorConversationHistory);

  const agentAvatarMap = useMemo(() => {
    const map = new Map<string, string>();

    for (const msg of messages) {
      const elements = msg?.message_content?.elements;

      if (!elements) continue;

      for (const el of elements) {
        if (el.type === BLOCK_TYPE.AGENT && 'payload' in el) {
          const payload = (el as AgentBlockType).payload;

          if (payload.avatar && !map.has(payload.agent_id)) {
            map.set(payload.agent_id, payload.avatar);
          }
        }
      }
    }

    return map;
  }, [messages]);

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
            avatar: payload.avatar || agentAvatarMap.get(payload.agent_id),
          };
        }
      }
    }

    return null;
  }, [messages, agentAvatarMap]);

  const handleWatchStream = useCallback(() => {
    const activeConversationId = conversationId ?? ctxConversationId;

    if (activeConversationId) {
      onBrowserOpen?.(activeConversationId, browserSessionId);
    }
  }, [conversationId, ctxConversationId, onBrowserOpen, browserSessionId]);

  const handleTaskPopoverOpenChange = (open: boolean) => {
    setIsTaskPopoverOpen(open);
    onTaskPopoverOpenChange?.(open);
  };

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

      setChatSidebarState(CHAT_SIDEBAR_STATE.SIDEBAR);
      openTab(agentId, agentName, Object.keys(metadata).length > 0 ? metadata : undefined);
      router.push(preserveSidebarParam(cleanPath));
    },
    [openTab, router, setChatSidebarState],
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
      const avatarKey = payload.avatar || agentAvatarMap.get(payload.agent_id);
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
    [handleAgentClick, agentAvatarMap],
  );

  // Refresh agents list when an agent block appears in chat
  const handleAgentInfoChange = useCallback(() => {
    if (agentInfoFromMessages && agentInfoFromMessages !== prevAgentInfoRef.current) {
      prevAgentInfoRef.current = agentInfoFromMessages;
      dispatch(baseApi.util.invalidateTags([APITags.GET_AGENTS_LIST]));
    }
  }, [agentInfoFromMessages, dispatch]);

  // Send message to existing conversation via intent
  const handleSendIntentToExistingConversation = useCallback(() => {
    if (chatMessageIntent && conversationId && consumedIntentRef.current !== chatMessageIntent) {
      consumedIntentRef.current = chatMessageIntent;
      const messagePayload = createUserMessagePayload({
        inputValue: chatMessageIntent.message,
        resourceId: organizationId,
        resourceType: ResourceType.ORGANIZATION,
        senderName: currentUserName,
        fileReferences: chatMessageIntent.fileReferences,
        llmModel: chatMessageIntent.llmModel,
        metadata: chatMessageIntent.metadata,
        references: chatMessageIntent.references,
      });

      setChatMessageIntent(null);
      sendMessage(messagePayload);
    }
  }, [chatMessageIntent, conversationId, organizationId, currentUserName, sendMessage, setChatMessageIntent]);

  // Create new conversation via intent (e.g. home screen input)
  const handleCreateConversationFromIntent = useCallback(() => {
    if (chatMessageIntent && !intentConsumedRef.current && !conversationId) {
      intentConsumedRef.current = true;
      const payload = createConversationPayload({
        resourceId: organizationId,
        resourceType: ResourceType.ORGANIZATION,
        scopeId: organizationId,
        messageText: chatMessageIntent.message,
        senderName: currentUserName,
        fileReferences: chatMessageIntent.fileReferences,
        scope: ScopeType.ORGANIZATION,
        llmModel: chatMessageIntent.llmModel,
        metadata: chatMessageIntent.metadata,
        autoLoopEnabled: chatMessageIntent.autoLoopEnabled,
        references: chatMessageIntent.references,
      });

      setChatMessageIntent(null);
      createConversationV2(payload);
    }
  }, [chatMessageIntent, conversationId, organizationId, currentUserName, createConversationV2, setChatMessageIntent]);

  const drainPendingMentions = useCallback(() => {
    if (pendingMentionInserts.length === 0 || !addMentionRef.current) return;
    pendingMentionInserts.forEach((payload) => addMentionRef.current?.(payload));
    clearPendingMentionInserts();
  }, [pendingMentionInserts, clearPendingMentionInserts, addMentionRef]);

  useEffect(() => {
    handleCreateConversationFromIntent();
  }, [handleCreateConversationFromIntent]);

  useEffect(() => {
    handleAgentInfoChange();
  }, [handleAgentInfoChange]);

  useEffect(() => {
    onConversationNotFound?.(isConversationNotFound);
  }, [isConversationNotFound, onConversationNotFound]);

  useEffect(() => {
    if (pendingFileReferences.length > 0 && addFileReferenceRef.current) {
      pendingFileReferences.forEach((ref) => addFileReferenceRef.current?.(ref));
      clearPendingFileReferences();
    }
  }, [pendingFileReferences, clearPendingFileReferences, addFileReferenceRef]);

  useEffect(() => {
    drainPendingMentions();
  }, [drainPendingMentions]);

  useEffect(() => {
    if (agentInfoFromMessages) {
      setActiveAgentInfo(agentInfoFromMessages);
    }
  }, [agentInfoFromMessages, setActiveAgentInfo]);

  useEffect(() => {
    const wasAvailable = prevBrowserStreamingRef.current;

    prevBrowserStreamingRef.current = isBrowserStreamingAvailable;

    if (wasAvailable && !isBrowserStreamingAvailable) {
      const activeConversationId = conversationId ?? ctxConversationId;

      if (activeConversationId) {
        onBrowserStreamingEnd?.(activeConversationId);
      }
    }
  }, [isBrowserStreamingAvailable, conversationId, ctxConversationId, onBrowserStreamingEnd]);

  useEffect(() => {
    handleSendIntentToExistingConversation();
  }, [handleSendIntentToExistingConversation]);

  return (
    <ChatActionsProvider
      onFileOpen={onFileOpen}
      onDatasetOpen={onDatasetOpen}
      onTaskOpen={onTaskOpen}
      onAgentClick={handleAgentClick}
      onAgentTest={handleAgentTest}
      renderAgentBlock={renderAgentBlock}
      onWatchStream={handleWatchStream}
      isBrowserStreamingAvailable={isBrowserStreamingAvailable}
      taskSummaries={taskSummaries}
    >
      <div className='relative flex min-h-0 w-full flex-1 flex-col overflow-hidden'>
        <ScrollContainer
          ref={scrollContainerRef}
          showScrollToBottom
          showFadeOverlay={!isTaskPopoverOpen}
          enableAnchorScroll
          lastMessageSenderType={lastMessageSenderType}
          isLoading={isLoadingConversation}
          streamingState={streamingState}
          conversationKey={conversationId ?? ctxConversationId ?? null}
          lastUserMessageKey={lastUserMessageKey}
          scrollTrigger={messages?.length}
          scrollbarStyle='none'
          scrollClassName={cn(
            'bg-BG_WHITE',
            isTaskPopoverOpen ? 'overflow-y-hidden pointer-events-none' : 'overflow-y-scroll',
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
              renderError={
                isConversationNotFound ? (
                  <ContentErrorState
                    title='Conversation not found'
                    description="This conversation may have been deleted or you don't have access to it."
                  />
                ) : undefined
              }
            >
              <MessageContainer
                messages={messages}
                isAnalysing={isAnalysing}
                streamingState={streamingState}
                className='gap-6 px-0 [scrollbar-width:none]'
                conversationId={conversationId ?? ctxConversationId ?? ''}
                assistantAvatar={<ZampIcon />}
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
        className={cn(
          'bg-BG_WHITE/80 sticky bottom-0 mx-auto w-full max-w-[700px] px-3 backdrop-blur-md',
          isTaskPopoverOpen ? 'z-50' : 'z-10',
        )}
      >
        <div className='flex flex-wrap items-center gap-2 pb-2'>
          {activeAgentInfo && (
            <AgentPill
              agentId={activeAgentInfo.id}
              agentName={activeAgentInfo.name}
              avatarKey={activeAgentInfo.avatar}
              containerRef={taskStatusContainerRef}
              onOpenChange={handleTaskPopoverOpenChange}
            />
          )}
          {!inputsRequired?.length && (
            <TaskStatusCounts
              messages={messages}
              streamingState={streamingState}
              conversationId={conversationId ?? ctxConversationId ?? ''}
              containerRef={taskStatusContainerRef}
              onOpenChange={handleTaskPopoverOpenChange}
              onVisibleStatusesChange={!isUninitializedConversationHistory ? refetchConversationHistory : undefined}
            />
          )}
        </div>
      </div>
    </ChatActionsProvider>
  );
};

export default ChatConversationContent;
