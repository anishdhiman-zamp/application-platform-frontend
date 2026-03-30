'use client';

import { memo, useCallback, useMemo, useState } from 'react';
import {
  ChatActionsProvider,
  MessageContainer,
  ResourceType,
  SenderType,
  TaskStatusIcon,
  useChat,
} from '@zamp-platform/chat';
import { ScrollContainer } from '@zamp-platform/ui';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { cn } from '@zamp-platform/ui/utils';
import { EVENT_TYPE } from '@zamp-platform/utils/event-bus/event-bus.types';
import { useDynamicTabs } from 'modules/pace/components/dynamic-tabs/useDynamicTabs';
import { useTaskNavigation } from 'modules/pace/hooks/useTaskNavigation';
import { TAB_TYPE } from 'modules/pace/pace.types';
import { usePathname, useRouter } from 'next/navigation';
import { API_ENDPOINTS } from '@/apis/apiEndpoint.constants';
import TooltipV2 from '@/components/common/TooltipV2';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import { ROUTES_PATH } from '@/constants/routeConfig';
import { useAppSelector } from '@/hooks/toolkit';
import ChatTopbar from '@/modules/pace/components/chat/ChatTopbar';
import ChatMessagesSkeleton from '@/modules/pace/components/loaders/ChatMessagesSkeleton';
import type { RootState } from '@/store';

const TASK_BASE_PATH = '/chat/task/';

function extractTaskIdFromPath(pathname: string): string {
  if (!pathname.startsWith(TASK_BASE_PATH)) return '';

  const segment = pathname.slice(TASK_BASE_PATH.length).split('/')[0];

  return segment ? decodeURIComponent(segment) : '';
}

interface TaskContentInnerProps {
  taskId: string;
}

interface TaskNavigationProps {
  currentIndex: number;
  totalCount: number;
  hasNext: boolean;
  hasPrevious: boolean;
  isLoading: boolean;
  isBootstrapping: boolean;
  goToNextTask: () => void;
  goToPreviousTask: () => void;
}

const TaskNavigation = memo(
  ({
    currentIndex,
    totalCount,
    hasNext,
    hasPrevious,
    isLoading,
    isBootstrapping,
    goToNextTask,
    goToPreviousTask,
  }: TaskNavigationProps) => {
    if (isBootstrapping) {
      return (
        <div className='flex animate-pulse items-center'>
          <div className='bg-GRAY_200 mr-3 h-4 w-10 rounded' />
          <div className='border-GRAY_400 bg-GRAY_100 mr-1.5 h-6 w-6 rounded-lg border' />
          <div className='border-GRAY_400 bg-GRAY_100 h-6 w-6 rounded-lg border' />
        </div>
      );
    }

    if (totalCount === 0 || currentIndex === -1) return null;

    return (
      <div className='flex items-center'>
        <span className='f-13-450 text-GRAY_900 mr-3 whitespace-nowrap'>
          {currentIndex + 1} / {totalCount}
        </span>

        <TooltipV2 tooltipBody='Go to next task'>
          <SvgSpriteLoader
            id='arrow-down'
            size={16}
            className={cn(
              'border-GRAY_400 mr-1.5 rounded-lg border p-1 transition-opacity',
              isLoading || !hasNext ? '!cursor-not-allowed opacity-50' : 'cursor-pointer',
            )}
            onClick={() => {
              if (isLoading || !hasNext) return;
              goToNextTask();
            }}
          />
        </TooltipV2>

        <TooltipV2 tooltipBody='Go to previous task'>
          <SvgSpriteLoader
            id='arrow-up'
            size={16}
            className={cn(
              'border-GRAY_400 rounded-lg border p-1 transition-opacity',
              isLoading || !hasPrevious ? '!cursor-not-allowed opacity-50' : 'cursor-pointer',
            )}
            onClick={() => {
              if (isLoading || !hasPrevious) return;
              goToPreviousTask();
            }}
          />
        </TooltipV2>
      </div>
    );
  },
);

TaskNavigation.displayName = 'TaskNavigation';

const TaskContentChat = ({ taskId }: { taskId: string }) => {
  const { openTab } = useDynamicTabs({ type: TAB_TYPE.FILE });
  const organizationId = useAppSelector((state: RootState) => state.user.user?.orgs?.[0]?.organization_id) ?? '';
  const [chatTitle, setChatTitle] = useState('');
  const router = useRouter();

  const {
    currentIndex,
    totalCount,
    status,
    hasNext,
    hasPrevious,
    isLoading,
    isBootstrapping,
    goToNextTask,
    goToPreviousTask,
  } = useTaskNavigation(taskId);

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
          className='border-GRAY_100 border-b'
          title={chatTitle || 'Untitled'}
          conversationId={taskId ?? chat?.conversationId}
          organizationId={organizationId}
          onTitleChange={setChatTitle}
          showHistory={false}
          showBackButton
          showActions={false}
          onBack={() => router.push(ROUTES_PATH.CHAT_TASKS)}
          titleIcon={status ? <TaskStatusIcon status={status} /> : undefined}
          navigationSlot={
            <TaskNavigation
              currentIndex={currentIndex}
              totalCount={totalCount}
              hasNext={hasNext}
              hasPrevious={hasPrevious}
              isLoading={isLoading}
              isBootstrapping={isBootstrapping}
              goToNextTask={goToNextTask}
              goToPreviousTask={goToPreviousTask}
            />
          }
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
              showMarkdownConnectors
            />
            <div className='bg-BG_WHITE h-12 w-full' />
          </CommonWrapper>
        </ScrollContainer>
      </div>
    </ChatActionsProvider>
  );
};

const TaskContentInner = ({ taskId: propTaskId }: TaskContentInnerProps) => {
  const nextPathname = usePathname();
  const urlTaskId = useMemo(() => extractTaskIdFromPath(nextPathname ?? ''), [nextPathname]);
  const taskId = urlTaskId || propTaskId;

  return <TaskContentChat key={taskId} taskId={taskId} />;
};

export default TaskContentInner;
