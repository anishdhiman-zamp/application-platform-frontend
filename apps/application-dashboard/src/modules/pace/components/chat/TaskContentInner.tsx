'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ChatActionsProvider,
  type ConversationSummary,
  Message,
  ResourceType,
  SenderType,
  StreamingMessage,
  SummaryStatus,
  type TaskStatus,
  TaskStatusIcon,
  useChat,
} from '@zamp-platform/chat';
import { useDisplayedSummary } from '@zamp-platform/chat';
import { Button, ScrollContainer, type ScrollContainerRef, ShimmerText } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { EVENT_TYPE } from '@zamp-platform/utils/event-bus/event-bus.types';
import { ChevronsDownUp, ChevronsUpDown, CircleCheck } from 'lucide-react';
import { useDynamicTabs } from 'modules/pace/components/dynamic-tabs/useDynamicTabs';
import { COMPLETED_STATUSES } from 'modules/pace/components/tasks/task-listing.constants';
import { useTaskNavigation } from 'modules/pace/hooks/useTaskNavigation';
import { TAB_TYPE } from 'modules/pace/pace.types';
import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { API_ENDPOINTS } from '@/apis/apiEndpoint.constants';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import { ROUTES_PATH } from '@/constants/routeConfig';
import { useAppSelector } from '@/hooks/toolkit';
import ChatTopbar from '@/modules/pace/components/chat/ChatTopbar';
import ResizableSummaryBox from '@/modules/pace/components/chat/ResizableSummaryBox';
import SummaryMarkdown from '@/modules/pace/components/chat/SummaryMarkdown';
import TaskNavigation from '@/modules/pace/components/chat/TaskNavigation';
import { getActiveTabIdFromUrl } from '@/modules/pace/components/dynamic-tabs/tab-type-registry';
import ChatMessagesSkeleton from '@/modules/pace/components/loaders/ChatMessagesSkeleton';
import {
  getDisplayTitle,
  getProcessedMessages,
  getStatusLabel,
  getStepCount,
} from '@/modules/pace/components/tasks/task.utils';
import { preserveSidebarParam } from '@/modules/pace/pace.utils';
import type { RootState } from '@/store';

interface TaskContentInnerProps {
  taskId: string;
}

const TaskContentChat = ({ taskId }: { taskId: string }) => {
  // Track whether streaming has ever been active to avoid re-showing the loader after stream ends
  const hadStreamingRef = useRef(false);

  const { openTab } = useDynamicTabs({ type: TAB_TYPE.FILE });
  const organizationId = useAppSelector((state: RootState) => state.user.user?.orgs?.[0]?.organization_id) ?? '';
  const searchParams = useSearchParams();
  const urlTitle = searchParams?.get('title') ?? null;
  const [chatTitle, setChatTitle] = useState('');
  const [showSteps, setShowSteps] = useState(false);
  const scrollContainerRef = useRef<ScrollContainerRef>(null);
  const summaryScrollRef = useRef<HTMLDivElement>(null);

  const handleToggleSteps = useCallback(() => {
    setShowSteps((prev) => !prev);
  }, []);

  const handleSetHeader = useCallback((header: string) => {
    setChatTitle((prev) => prev || header);
  }, []);
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
    setHeader: handleSetHeader,
  });

  const hasMessages = chat.messages.length > 0;
  const isAnalysing = hasMessages && chat.messages[chat.messages.length - 1]?.sender_type === SenderType.USER;

  if (chat.streamingState) hadStreamingRef.current = true;

  const isLoadingConversation =
    Boolean(taskId && chat?.isLoadingConversationHistory) ||
    (!hasMessages && !chat?.streamingState && !hadStreamingRef.current);

  const { processedMessages, lastSummaryText } = useMemo(() => getProcessedMessages(chat.messages), [chat.messages]);
  const conversationData = chat.conversationData;
  const summary = conversationData?.summary as ConversationSummary | null | undefined;
  const taskStatus = (conversationData as unknown as Record<string, unknown>)?.status as string | undefined;
  const isTaskDone = taskStatus && !chat.streamingState ? COMPLETED_STATUSES.has(taskStatus) : false;
  const summaryContent = isTaskDone ? (summary?.status === SummaryStatus.COMPLETED ? lastSummaryText : null) : null;
  const isAgentActive = Boolean(chat.streamingState?.is_active) || isAnalysing;

  const displayedSummary = useDisplayedSummary({
    taskId,
    sourceId: organizationId,
    isAgentActive,
    summaryContent,
    taskStatus,
  });

  const displayTitle = getDisplayTitle(urlTitle, chatTitle);

  const statusLabel = getStatusLabel(isAgentActive, taskStatus);

  const stepCount = useMemo(
    () => getStepCount(chat.messages, chat.streamingState),
    [chat.messages, chat.streamingState],
  );

  useEffect(() => {
    if (summaryScrollRef.current) {
      summaryScrollRef.current.scrollTop = summaryScrollRef.current.scrollHeight;
    }
  }, [displayedSummary]);

  return (
    <ChatActionsProvider onFileOpen={openTab}>
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
          onBack={() => router.push(preserveSidebarParam(ROUTES_PATH.CHAT_TASKS))}
          titleIcon={status ? <TaskStatusIcon status={status} /> : undefined}
          navigationSlot={
            <TaskNavigation
              currentIndex={currentIndex}
              totalCount={totalCount}
              hasNext={hasNext}
              hasPrevious={hasPrevious}
              isLoading={isLoading}
              isBootstrapping={isBootstrapping}
              onGoToNextTask={goToNextTask}
              onGoToPreviousTask={goToPreviousTask}
            />
          }
        />
        <CommonWrapper
          isLoading={isLoadingConversation}
          isError={chat?.isErrorConversationHistory}
          refetchFunction={chat?.refetchConversationHistory}
          skeletonType={SkeletonTypes.CUSTOM}
          loader={<ChatMessagesSkeleton className='px-0' alignUserRight />}
          className='mx-auto flex min-h-0 w-full max-w-[700px] flex-1 flex-col px-4 pt-12'
          disableAnimation
        >
          {/* Title + Status Pill */}
          <div className='flex flex-col gap-1.5'>
            <div className='flex items-center gap-2.5'>
              <h1 className='f-18-550 text-GRAY_1000 whitespace-nowrap'>{displayTitle}</h1>
              {statusLabel && (
                <div className='bg-BG_GRAY_2 border-GRAY_400 flex h-6 shrink-0 items-center gap-1.5 rounded-full border px-2 py-1'>
                  <div className='flex size-3 items-center justify-center'>
                    <TaskStatusIcon
                      status={(isAgentActive ? 'IN_PROGRESS' : (taskStatus ?? 'IN_PROGRESS')) as TaskStatus}
                    />
                  </div>
                  <span
                    className='f-12-450 text-GRAY_1000 whitespace-nowrap'
                    style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}
                  >
                    {statusLabel}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Steps Section */}
          <div className='mt-[30px] flex min-h-0 flex-1 flex-col'>
            {/* Steps toggle header with fade */}
            <div className='bg-BG_WHITE z-[3] flex flex-col'>
              <Button
                variant='ghost'
                onClick={handleToggleSteps}
                className='flex h-auto w-auto items-center gap-1 self-start px-0 py-0 transition-colors hover:bg-transparent'
              >
                <div className='flex h-5 w-[30px] items-center justify-center'>
                  {isTaskDone ? (
                    <CircleCheck size={14} className='text-GREEN_700' />
                  ) : (
                    <div className='animate-scale dark:brightness-0 dark:invert'>
                      <Image src='/icons/pace/pace-streaming.svg' alt='Pace Avatar' height={20} width={20} />
                    </div>
                  )}
                </div>
                <div className='flex items-center gap-2'>
                  <span className='f-13-450 text-GRAY_800 whitespace-nowrap'>
                    {isTaskDone ? 'All done!' : stepCount === 0 ? 'Starting now' : `${stepCount} steps completed`}
                  </span>
                  {showSteps ? (
                    <ChevronsDownUp size={14} className='text-GRAY_700' />
                  ) : (
                    <ChevronsUpDown size={14} className='text-GRAY_700' />
                  )}
                </div>
              </Button>
              {/* Timeline connector */}
              <div className='flex h-[15px] w-[30px] justify-center'>
                <div className='border-GRAY_400 h-full w-0 border-l' />
              </div>
            </div>

            <ScrollContainer ref={scrollContainerRef} showFadeOverlay scrollClassName='!overflow-y-scroll'>
              {/* Collapsed: Summary Box or Analysing shimmer */}
              {!showSteps &&
                (displayedSummary ? (
                  <ResizableSummaryBox
                    borderRadius='rounded-[18px]'
                    contentClassName='px-4 pt-4 pb-1'
                    scrollRef={summaryScrollRef}
                  >
                    <SummaryMarkdown text={displayedSummary} shimmerLast={isAgentActive} />
                  </ResizableSummaryBox>
                ) : isAgentActive ? (
                  <div className='border-GRAY_400 rounded-[18px] border px-4 py-4'>
                    <ShimmerText text='Starting now' autoAnimate />
                  </div>
                ) : null)}

              {/* Expanded: Per-message blocks + summary boxes */}
              {showSteps && (
                <div className='-mt-1 flex flex-col px-2'>
                  {processedMessages.map(({ message, summaryText }, index) => (
                    <div key={message.id ?? index} className={cn(index !== 0 && 'mt-2')}>
                      <Message
                        message={message}
                        assistantAvatar={<></>}
                        showTimestamp
                        alignUserRight
                        organizationId={organizationId}
                        isLastMessage={index === processedMessages.length - 1}
                        showMarkdownConnectors
                        showConnectorToLastBlock
                        showConnectorToNextBlock
                      />
                      {summaryText && (
                        <div className='relative pt-2'>
                          <div className='bg-border pointer-events-none absolute -top-3 left-[6.5px] h-3 w-px' />
                          <ResizableSummaryBox borderRadius='rounded-[12px]' contentClassName='px-4 pt-3 pb-1'>
                            <SummaryMarkdown text={summaryText} shimmerLast={false} />
                          </ResizableSummaryBox>
                        </div>
                      )}
                    </div>
                  ))}

                  {chat.streamingState && !!chat.streamingState.message_content?.elements?.length && (
                    <StreamingMessage
                      streamingState={chat.streamingState}
                      assistantAvatar={<></>}
                      showMarkdownConnectors
                      showConnectorToLastBlock
                      showConnectorToNextBlock
                    />
                  )}
                  {isAgentActive &&
                    (displayedSummary ? (
                      <div className='relative pt-4'>
                        <div className='bg-border absolute -top-0 left-[6.5px] h-3 w-px' />
                        <ResizableSummaryBox
                          borderRadius='rounded-[12px]'
                          contentClassName='px-4 pt-3 pb-1'
                          scrollRef={summaryScrollRef}
                        >
                          <SummaryMarkdown text={displayedSummary} shimmerLast={isAgentActive} />
                        </ResizableSummaryBox>
                      </div>
                    ) : (
                      <div className='border-GRAY_400 mt-2 rounded-[12px] border px-4 py-3'>
                        <ShimmerText text='Analysing...' autoAnimate />
                      </div>
                    ))}
                </div>
              )}
              <div className='bg-BG_WHITE h-12 w-full shrink-0' />
            </ScrollContainer>
          </div>
        </CommonWrapper>
      </div>
    </ChatActionsProvider>
  );
};

const TaskContentInner = ({ taskId: propTaskId }: TaskContentInnerProps) => {
  const nextPathname = usePathname();
  const urlTaskId = useMemo(() => getActiveTabIdFromUrl(nextPathname ?? '', '', TAB_TYPE.TASK) ?? '', [nextPathname]);
  const taskId = urlTaskId || propTaskId;

  return <TaskContentChat key={taskId} taskId={taskId} />;
};

export default TaskContentInner;
