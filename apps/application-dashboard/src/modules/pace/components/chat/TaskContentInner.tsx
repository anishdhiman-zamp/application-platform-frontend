'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ConversationSummary } from '@zamp-platform/chat';
import {
  ChatActionsProvider,
  ResourceType,
  SenderType,
  StreamingMessage,
  SummaryStatus,
  TASK_STATUS,
  TaskStatusIcon,
  useChat,
  useDisplayedSummary,
} from '@zamp-platform/chat';
import { ScrollContainer, type ScrollContainerRef } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { EVENT_TYPE } from '@zamp-platform/utils/event-bus/event-bus.types';
import { useDynamicTabs } from 'modules/pace/components/dynamic-tabs/useDynamicTabs';
import { useTaskNavigation } from 'modules/pace/hooks/useTaskNavigation';
import { TAB_TYPE } from 'modules/pace/pace.types';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { API_ENDPOINTS } from '@/apis/apiEndpoint.constants';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import { ROUTES_PATH } from '@/constants/routeConfig';
import { useAppSelector } from '@/hooks/toolkit';
import ChatTopbar from '@/modules/pace/components/chat/ChatTopbar';
import ResizableSummaryBox from '@/modules/pace/components/chat/ResizableSummaryBox';
import SummaryMarkdown from '@/modules/pace/components/chat/SummaryMarkdown';
import { TaskChatExpandedStepsFooter } from '@/modules/pace/components/chat/TaskChatExpandedStepsFooter';
import { TaskChatStepMessage } from '@/modules/pace/components/chat/TaskChatStepMessage';
import { TaskChatStepsToggleHeader } from '@/modules/pace/components/chat/TaskChatStepsToggleHeader';
import { TaskChatSummaryContent } from '@/modules/pace/components/chat/TaskChatSummaryContent';
import { TaskChatTitleHeader } from '@/modules/pace/components/chat/TaskChatTitleHeader';
import TaskNavigation from '@/modules/pace/components/chat/TaskNavigation';
import { getActiveTabIdFromUrl } from '@/modules/pace/components/dynamic-tabs/tab-type-registry';
import ChatMessagesSkeleton from '@/modules/pace/components/loaders/ChatMessagesSkeleton';
import {
  getDisplayTitle,
  getProcessedMessages,
  getStatusLabel,
  getStepCount,
} from '@/modules/pace/components/tasks/task.utils';
import { useHitlQuestions } from '@/modules/pace/hooks/useHitlQuestions';
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
  const isTaskDone = taskStatus && !chat.streamingState ? taskStatus === TASK_STATUS.COMPLETED : false;
  const summaryContent = isTaskDone ? (summary?.status === SummaryStatus.COMPLETED ? lastSummaryText : null) : null;
  const isAgentActive = Boolean(chat.streamingState?.is_active) || isAnalysing;

  const displayedSummary = useDisplayedSummary({
    taskId,
    sourceId: organizationId,
    isAgentActive,
    summaryContent,
    taskStatus,
  });

  const { hitlQuestions, hitlQuestionsKey } = useHitlQuestions(chat.inputsRequired);

  const handleHitlRespondComplete = useCallback(() => {
    void chat.refetchConversationHistory?.();
  }, [chat]);

  const isNeedsInput = taskStatus === TASK_STATUS.NEEDS_INPUT;
  const hasHitlQuestions = hitlQuestions.length > 0;

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

  console.log('cprocessedMessages', processedMessages);

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
          className='flex min-h-0 w-full flex-1 flex-col px-4 pt-12'
          disableAnimation
        >
          <div className='mx-auto w-full max-w-[700px]'>
            <TaskChatTitleHeader
              displayTitle={displayTitle}
              statusLabel={statusLabel}
              isAgentActive={isAgentActive}
              taskStatus={taskStatus}
            />
          </div>

          {/* Steps Section */}
          <div className='mt-[30px] flex min-h-0 w-full flex-1 flex-col'>
            <div className='mx-auto w-full max-w-[700px]'>
              <TaskChatStepsToggleHeader
                showSteps={showSteps}
                onToggle={handleToggleSteps}
                stepCount={stepCount}
                isTaskDone={isTaskDone}
                taskStatus={taskStatus}
              />
            </div>

            <ScrollContainer
              className='min-h-0 w-full flex-1'
              showScrollToBottom
              ref={scrollContainerRef}
              showFadeOverlay
              scrollbarStyle='none'
              scrollClassName='!overflow-y-scroll'
            >
              <div className='mx-auto flex min-h-0 w-full max-w-[700px] flex-1 flex-col'>
                <div className='px-2'>
                  <TaskChatSummaryContent
                    showSteps={showSteps}
                    isNeedsInput={isNeedsInput}
                    hasHitlQuestions={hasHitlQuestions}
                    hitlQuestions={hitlQuestions}
                    hitlQuestionsKey={hitlQuestionsKey}
                    taskId={taskId}
                    onHitlRespondComplete={handleHitlRespondComplete}
                    displayedSummary={displayedSummary}
                    isAgentActive={isAgentActive}
                    summaryScrollRef={summaryScrollRef}
                  />
                </div>

                {/* Expanded: Per-message blocks + summary boxes */}
                {showSteps && (
                  <div className='-mt-1 flex flex-col'>
                    {processedMessages.map(({ message, summaryText }, index) => (
                      <div key={message.id ?? index} className={cn(index !== 0 && 'mt-0')}>
                        <div className='px-2'>
                          <TaskChatStepMessage
                            message={message}
                            isLastMessage={index === processedMessages.length - 1}
                          />
                        </div>
                        {summaryText && (
                          <div
                            className={cn(
                              'relative px-2 pt-2',
                              index > 0 ? (processedMessages[index - 1].summaryText ? 'mt-5' : 'mt-3') : null,
                            )}
                          >
                            <div
                              className={cn(
                                'bg-border pointer-events-none absolute left-[14.5px] h-3 w-px',
                                index > 0 && processedMessages[index - 1].summaryText ? '-top-3' : '-top-2',
                              )}
                            />
                            <ResizableSummaryBox borderRadius='rounded-[18px]' contentClassName='px-4 pt-3 pb-1'>
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
                    <TaskChatExpandedStepsFooter
                      isFirst={processedMessages.length === 0}
                      isNeedsInput={isNeedsInput}
                      hasHitlQuestions={hasHitlQuestions}
                      hitlQuestions={hitlQuestions}
                      hitlQuestionsKey={hitlQuestionsKey}
                      taskId={taskId}
                      onHitlRespondComplete={handleHitlRespondComplete}
                      isAgentActive={isAgentActive}
                      displayedSummary={displayedSummary}
                      summaryScrollRef={summaryScrollRef}
                    />
                  </div>
                )}
                <div className='bg-BG_WHITE h-12 w-full shrink-0' />
              </div>
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
