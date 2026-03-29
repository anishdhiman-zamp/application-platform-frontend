'use client';

import { useCallback, useMemo, useState } from 'react';
import { ChatActionsProvider, MessageContainer, ResourceType, SenderType, useChat } from '@zamp-platform/chat';
import { ScrollContainer } from '@zamp-platform/ui';
import { EVENT_TYPE } from '@zamp-platform/utils/event-bus/event-bus.types';
import { useDynamicTabs } from 'modules/pace/components/dynamic-tabs/useDynamicTabs';
import { TAB_TYPE } from 'modules/pace/pace.types';
import { API_ENDPOINTS } from '@/apis/apiEndpoint.constants';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import { useAppSelector } from '@/hooks/toolkit';
import ChatTopbar from '@/modules/pace/components/chat/ChatTopbar';
import ChatMessagesSkeleton from '@/modules/pace/components/loaders/ChatMessagesSkeleton';
import type { RootState } from '@/store';

interface TaskContentInnerProps {
  taskId: string;
}

const TaskContentInner = ({ taskId }: TaskContentInnerProps) => {
  const { openTab } = useDynamicTabs({ type: TAB_TYPE.FILE });
  const organizationId = useAppSelector((state: RootState) => state.user.user?.orgs?.[0]?.organization_id) ?? '';
  const [chatTitle, setChatTitle] = useState('');

  const chat = useChat({
    resourceId: organizationId,
    resourceType: ResourceType.ORGANIZATION,
    conversationId: taskId ?? undefined,
    eventType: EVENT_TYPE.TASK,
    enableStreaming: true,
    apiConfig: {
      sendMessage: API_ENDPOINTS.POST_MESSAGE_V4,
      createConversation: API_ENDPOINTS.CREATE_CONVERSATION_V4,
      getConversationById: API_ENDPOINTS.TASKS_MESSAGES_GET,
    },
    setHeader: (header: string) => {
      if (!chatTitle) {
        setChatTitle(header);
      }
    },
  });

  const handleFileOpen = useCallback(
    (path: string, name: string) => {
      openTab(path, name);
    },
    [openTab],
  );

  const hasMessages = useMemo(() => chat.messages.length > 0, [chat.messages]);

  const isAnalysing = useMemo(() => {
    return chat.messages.length > 0 && chat.messages[chat.messages.length - 1]?.sender_type === SenderType.USER;
  }, [chat.messages]);

  const isLoadingConversation =
    Boolean(taskId && chat?.isLoadingConversationHistory) || (!hasMessages && !chat?.streamingState);

  return (
    <ChatActionsProvider onFileOpen={handleFileOpen}>
      <div className='relative flex h-full flex-1 flex-col'>
        <ChatTopbar
          title={chatTitle || 'Untitled'}
          conversationId={taskId ?? chat?.conversationId}
          organizationId={organizationId}
          onTitleChange={setChatTitle}
          showHistory={false}
        />
        <ScrollContainer showFadeOverlay={false} autoScrollToBottom scrollTrigger={chat?.messages?.length}>
          <CommonWrapper
            isLoading={isLoadingConversation}
            isError={chat?.isErrorConversationHistory}
            refetchFunction={chat?.refetchConversationHistory}
            skeletonType={SkeletonTypes.CUSTOM}
            loader={<ChatMessagesSkeleton className='px-0' alignUserRight />}
            className='mx-auto flex w-full max-w-[700px] flex-1 flex-col px-4'
            disableAnimation
          >
            <MessageContainer
              messages={chat?.messages?.filter((message) => message.sender_type === SenderType.ASSISTANT)}
              isAnalysing={isAnalysing}
              streamingState={chat?.streamingState}
              className='gap-4 px-0 [&]:overflow-visible'
              assistantAvatar={<></>}
              showTimestamp
              showFeedback
              showCopy
              alignUserRight
              organizationId={organizationId}
            />
            <div className='bg-BG_WHITE h-12 w-full' />
          </CommonWrapper>
        </ScrollContainer>
      </div>
    </ChatActionsProvider>
  );
};

export default TaskContentInner;
