'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ConversationSummary } from '@zamp-platform/chat';
import {
  ChatActionsProvider,
  ResourceType,
  SenderType,
  SiblingTask,
  StreamingMessage,
  SummaryStatus,
  TASK_STATUS,
  TaskBreadcrumb,
  useDisplayedSummary,
  useStreamingState,
} from '@zamp-platform/chat';
import { TaskProvider, useTaskActions, useTaskState } from '@zamp-platform/conversation-stream';
import { ScrollContainer, type ScrollContainerRef } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { useDynamicTabs } from 'modules/pace/components/dynamic-tabs/useDynamicTabs';
import { useTaskNavigation } from 'modules/pace/hooks/useTaskNavigation';
import { TAB_TYPE } from 'modules/pace/pace.types';
import { usePathname, useSearchParams } from 'next/navigation';
import { API_ENDPOINTS } from '@/apis/apiEndpoint.constants';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import { useAppSelector } from '@/hooks/toolkit';
import ResizableSummaryBox from '@/modules/pace/components/chat/ResizableSummaryBox';
import {
  resolveMessageStepGroupSections,
  stepGroupsLegacyToSections,
} from '@/modules/pace/components/chat/step-groups.utils';
import StepGroupsSummaryView from '@/modules/pace/components/chat/StepGroupsSummaryView';
import SummaryMarkdown from '@/modules/pace/components/chat/SummaryMarkdown';
import { TaskChatExpandedStepsFooter } from '@/modules/pace/components/chat/TaskChatExpandedStepsFooter';
import { TaskChatStepMessage } from '@/modules/pace/components/chat/TaskChatStepMessage';
import { TaskChatStepsToggleHeader } from '@/modules/pace/components/chat/TaskChatStepsToggleHeader';
import { TaskChatSummaryContent } from '@/modules/pace/components/chat/TaskChatSummaryContent';
import { TaskChatTitleHeader } from '@/modules/pace/components/chat/TaskChatTitleHeader';
import TaskNavigation from '@/modules/pace/components/chat/TaskNavigation';
import TaskTopbar from '@/modules/pace/components/chat/TaskTopbar';
import { getActiveTabIdFromUrl } from '@/modules/pace/components/dynamic-tabs/tab-type-registry';
import TaskContentSkeleton from '@/modules/pace/components/loaders/TaskContentSkeleton';
import SubtaskPanel from '@/modules/pace/components/tasks/components/SubtaskPanel';
import {
  getDisplayTitle,
  getProcessedMessages,
  getStatusLabel,
  getStepCount,
} from '@/modules/pace/components/tasks/utils/tasks.utils';
import { useHitlQuestions } from '@/modules/pace/hooks/useHitlQuestions';
import type { RootState } from '@/store';

interface TaskContentInnerProps {
  taskId: string;
}

const TaskContentChat = ({ taskId }: { taskId: string }) => {
  const hadStreamingRef = useRef(false);

  const { openTab } = useDynamicTabs({ type: TAB_TYPE.FILE });
  const searchParams = useSearchParams();
  const urlTitle = searchParams?.get('title') ?? null;
  const [chatTitle, setChatTitle] = useState(urlTitle ?? '');

  const parentTasks: TaskBreadcrumb[] = useMemo(() => {
    const raw = searchParams?.get('parentTasks');

    if (!raw) return [];
    try {
      return JSON.parse(raw) as TaskBreadcrumb[];
    } catch {
      return [];
    }
  }, [searchParams]);

  const isSubtask = parentTasks.length > 0;

  const [showSteps, setShowSteps] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const scrollContainerRef = useRef<ScrollContainerRef>(null);
  const summaryScrollRef = useRef<HTMLDivElement>(null);

  const handleToggleSteps = useCallback(() => {
    setShowSteps((prev) => !prev);
  }, []);

  const {
    currentIndex,
    totalCount,
    status,
    subtasks,
    hasNext,
    hasPrevious,
    isLoading,
    isBootstrapping,
    goToNextTask,
    goToPreviousTask,
  } = useTaskNavigation(taskId);

  const subtaskPanelParents: TaskBreadcrumb[] = useMemo(
    () => [...parentTasks, { id: taskId, title: chatTitle || urlTitle || 'Untitled', status: status ?? undefined }],
    [parentTasks, taskId, chatTitle, urlTitle, status],
  );

  const siblingsMemo: SiblingTask[] = useMemo(
    () => subtasks.map((subtask) => ({ id: subtask?.id, title: subtask?.title, status: subtask?.status })),
    [subtasks],
  );

  const { messages, isLoadingHistory, isErrorHistory, conversationData, inputsRequired, taskSummaryText } =
    useTaskState();
  const { refetchHistory } = useTaskActions();
  const streamingState = useStreamingState(taskId);

  useEffect(() => {
    const title = (conversationData as Record<string, unknown> | undefined)?.title as string | undefined;

    if (title) {
      setChatTitle((prev) => prev || title);
    }
  }, [conversationData]);

  const hasMessages = messages.length > 0;
  const isAnalysing = hasMessages && messages[messages.length - 1]?.sender_type === SenderType.USER;

  if (streamingState) hadStreamingRef.current = true;

  const isLoadingConversation =
    Boolean(taskId && isLoadingHistory) || (!hasMessages && !streamingState && !hadStreamingRef.current);

  const { processedMessages, lastSummaryText } = useMemo(() => getProcessedMessages(messages), [messages]);
  const summary = (conversationData as Record<string, unknown> | undefined)?.summary as
    | ConversationSummary
    | null
    | undefined;
  const taskStatus = (conversationData as Record<string, unknown> | undefined)?.status as string | undefined;
  const isTaskDone = taskStatus && !streamingState ? taskStatus === TASK_STATUS.COMPLETED : false;
  const summaryContent = isTaskDone
    ? summary?.status === SummaryStatus.COMPLETED
      ? (summary?.content ?? lastSummaryText ?? null)
      : null
    : null;
  const isAgentActive = Boolean(streamingState?.is_active) || isAnalysing;

  const displayedSummary = useDisplayedSummary({
    taskId,
    isAgentActive,
    summaryContent,
    streamingSummaryText: taskSummaryText,
  });

  const { hitlQuestions, hitlQuestionsKey } = useHitlQuestions(inputsRequired);

  const handleHitlRespondComplete = useCallback(() => {
    refetchHistory();
  }, [refetchHistory]);

  const isNeedsInput = taskStatus === TASK_STATUS.NEEDS_INPUT;
  const hasHitlQuestions = hitlQuestions.length > 0;

  const displayTitle = getDisplayTitle(urlTitle, chatTitle);
  const statusLabel = getStatusLabel(isAgentActive, taskStatus);

  const stepCount = useMemo(() => getStepCount(messages, streamingState), [messages, streamingState]);
  const stepGroupsRaw = isTaskDone ? summary?.step_groups : undefined;

  const stepGroupSections = useMemo(() => {
    if (!stepGroupsRaw) return [];
    if (Array.isArray(stepGroupsRaw)) {
      return stepGroupsLegacyToSections(stepGroupsRaw, messages);
    }

    return resolveMessageStepGroupSections(stepGroupsRaw, messages);
  }, [stepGroupsRaw, messages]);

  const hasStepGroups = stepGroupSections.length > 0;

  const handleToggleSummary = useCallback((checked: boolean) => {
    setShowSummary(checked);
  }, []);

  useEffect(() => {
    if (streamingState?.is_active) {
      setShowSummary(false);
    }
  }, [streamingState?.is_active]);

  useEffect(() => {
    if (summaryScrollRef.current) {
      summaryScrollRef.current.scrollTop = summaryScrollRef.current.scrollHeight;
    }
  }, [displayedSummary]);

  return (
    <ChatActionsProvider onFileOpen={openTab} parentTasks={subtaskPanelParents} siblings={siblingsMemo}>
      <div className='relative flex h-full flex-1 flex-col'>
        <TaskTopbar
          className='border-GRAY_100 border-b'
          title={chatTitle || 'Untitled'}
          status={status ?? undefined}
          isSubtask={isSubtask}
          parentTasks={parentTasks}
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
        <div className='flex min-h-0 w-full min-w-0 flex-1'>
          <CommonWrapper
            isLoading={isLoadingConversation}
            isError={isErrorHistory}
            refetchFunction={refetchHistory}
            skeletonType={SkeletonTypes.CUSTOM}
            loader={<TaskContentSkeleton />}
            className='flex min-h-0 w-full min-w-0 flex-1 flex-col pt-12'
            disableAnimation
          >
            <div className='mx-auto w-full max-w-[700px] px-4'>
              <TaskChatTitleHeader
                displayTitle={displayTitle}
                statusLabel={statusLabel}
                isAgentActive={isAgentActive}
                taskStatus={taskStatus}
              />
            </div>

            {/* Steps Section */}
            <div className='mt-[30px] flex min-h-0 w-full flex-1 flex-col'>
              <div className='mx-auto w-full max-w-[700px] px-4'>
                <TaskChatStepsToggleHeader
                  showSteps={showSteps}
                  onToggle={handleToggleSteps}
                  stepCount={stepCount}
                  isTaskDone={isTaskDone}
                  taskStatus={taskStatus}
                  showSummaryControl={hasStepGroups && showSteps && !isAgentActive}
                  showSummary={showSummary}
                  onShowSummaryChange={handleToggleSummary}
                />
              </div>

              <ScrollContainer
                className='min-h-0 w-full min-w-0 flex-1'
                showScrollToBottom
                ref={scrollContainerRef}
                showFadeOverlay
                scrollbarStyle='none'
                scrollClassName='!overflow-y-scroll'
              >
                <div className='mx-auto flex min-h-0 w-full max-w-[700px] flex-1 flex-col px-4'>
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

                  {showSteps && hasStepGroups && showSummary && <StepGroupsSummaryView sections={stepGroupSections} />}

                  {/* Expanded: Per-message blocks + summary boxes */}
                  {showSteps && (!hasStepGroups || !showSummary) && (
                    <div className='-mt-1 flex flex-col'>
                      {processedMessages.map(({ message, summaryText }, index) => (
                        <div key={message.id ?? index} className={cn(index !== 0 && 'mt-0')}>
                          <div className='px-2'>
                            <TaskChatStepMessage message={message} />
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
                                  index === 0 || (index > 0 && processedMessages[index - 1].summaryText)
                                    ? '-top-3'
                                    : '-top-2',
                                )}
                              />
                              <ResizableSummaryBox borderRadius='rounded-[18px]' contentClassName='px-4 pt-3 pb-1'>
                                <SummaryMarkdown text={summaryText} shimmerLast={false} />
                              </ResizableSummaryBox>
                            </div>
                          )}
                        </div>
                      ))}

                      {streamingState && !!streamingState.message_content?.elements?.length && (
                        <div className='px-2'>
                          <StreamingMessage
                            streamingState={streamingState}
                            assistantAvatar={<></>}
                            showMarkdownConnectors
                            showConnectorToLastBlock
                            showConnectorToNextBlock
                          />
                        </div>
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
          {subtasks.length > 0 && <SubtaskPanel subtasks={subtasks} parentTasks={subtaskPanelParents} />}
        </div>
      </div>
    </ChatActionsProvider>
  );
};

const TaskContentInner = ({ taskId: propTaskId }: TaskContentInnerProps) => {
  const nextPathname = usePathname();
  const urlTaskId = useMemo(() => getActiveTabIdFromUrl(nextPathname ?? '', '', TAB_TYPE.TASK) ?? '', [nextPathname]);
  const taskId = urlTaskId || propTaskId;
  const organizationId = useAppSelector((state: RootState) => state.user.user?.orgs?.[0]?.organization_id) ?? '';

  return (
    <TaskProvider
      key={taskId}
      taskId={taskId}
      organizationId={organizationId}
      resourceType={ResourceType.ORGANIZATION}
      apiConfig={{ getTaskMessages: API_ENDPOINTS.TASKS_MESSAGES_GET }}
    >
      <TaskContentChat key={taskId} taskId={taskId} />
    </TaskProvider>
  );
};

export default TaskContentInner;
