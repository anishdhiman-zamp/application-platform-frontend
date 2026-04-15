'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { isNotFoundError } from '@zamp-platform/api';
import {
  BLOCK_TYPE,
  ChatActionsProvider,
  ConversationSummary,
  MarkdownBlock,
  ResourceType,
  SenderType,
  SiblingTask,
  StreamingMessage,
  TASK_STATUS,
  type TaskBlockType,
  TaskBreadcrumb,
  TaskStatus,
  useDisplayedSummary,
  useStreamingState,
} from '@zamp-platform/chat';
import { TaskProvider, useTaskActions, useTaskState } from '@zamp-platform/conversation-stream';
import { ScrollContainer, type ScrollContainerRef, ShimmerText } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { EVENT_TYPE } from '@zamp-platform/utils/event-bus';
import { useDynamicTabs } from 'modules/pace/components/dynamic-tabs/useDynamicTabs';
import { useTaskNavigation } from 'modules/pace/hooks/useTaskNavigation';
import { TAB_TYPE } from 'modules/pace/pace.types';
import { usePathname, useSearchParams } from 'next/navigation';
import { API_ENDPOINTS } from '@/apis/apiEndpoint.constants';
import { useEventBus } from '@/app/_providers/sse-provider';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import { useAppSelector } from '@/hooks/toolkit';
import ResizableSummaryBox from '@/modules/pace/components/chat/ResizableSummaryBox';
import {
  resolveMessageStepGroupSections,
  stepGroupsLegacyToSections,
} from '@/modules/pace/components/chat/step-groups.utils';
import StepGroupsSummaryView from '@/modules/pace/components/chat/StepGroupsSummaryView';
import { TaskChatExpandedStepsFooter } from '@/modules/pace/components/chat/TaskChatExpandedStepsFooter';
import { TaskChatStepMessage } from '@/modules/pace/components/chat/TaskChatStepMessage';
import { TaskChatStepsToggleHeader } from '@/modules/pace/components/chat/TaskChatStepsToggleHeader';
import { TaskChatTitleHeader } from '@/modules/pace/components/chat/TaskChatTitleHeader';
import TaskNavigation from '@/modules/pace/components/chat/TaskNavigation';
import TaskTopbar from '@/modules/pace/components/chat/TaskTopbar';
import ContentErrorState from '@/modules/pace/components/ContentErrorState';
import { getActiveTabIdFromUrl } from '@/modules/pace/components/dynamic-tabs/tab-type-registry';
import TaskContentSkeleton from '@/modules/pace/components/loaders/TaskContentSkeleton';
import InlineSubtaskSection from '@/modules/pace/components/tasks/components/InlineSubtaskSection';
import { HITL_RESPONDED_EVENT } from '@/modules/pace/components/tasks/constants/tasks.constants';
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
  const shimmerScrollRef = useRef<HTMLDivElement>(null);

  const handleToggleSteps = useCallback(() => {
    setShowSteps((prev) => !prev);
  }, []);

  const {
    currentIndex,
    totalCount,
    status,
    liveStatus,
    subtasks,
    hasNext,
    hasPrevious,
    isLoading,
    isBootstrapping,
    goToNextTask,
    goToPreviousTask,
  } = useTaskNavigation(taskId);

  const {
    messages,
    isLoadingHistory,
    isErrorHistory,
    errorHistory,
    conversationData,
    inputsRequired,
    taskSummaryText,
  } = useTaskState();
  const { refetchHistory } = useTaskActions();
  const { sseEventBus } = useEventBus();
  const streamingState = useStreamingState(taskId);

  const taskStatus = (conversationData as Record<string, unknown> | undefined)?.status as string | undefined;

  // Priority: SSE liveStatus (most real-time) > conversationData (server truth) > URL param (stale)
  const effectiveStatus = (liveStatus as TaskStatus) ?? (taskStatus as TaskStatus) ?? status ?? undefined;

  const conversationId = searchParams?.get('s') ?? undefined;

  const subtaskPanelParents: TaskBreadcrumb[] = useMemo(
    () => [
      ...parentTasks,
      {
        id: taskId,
        title: chatTitle || urlTitle || 'Untitled',
        status: effectiveStatus,
        currentIndex,
        totalRows: totalCount,
        conversationId,
      },
    ],
    [parentTasks, taskId, chatTitle, urlTitle, effectiveStatus, currentIndex, totalCount, conversationId],
  );

  // Extract subtask info from messages and streaming to detect newly created subtasks
  // before the task list API refetches (no BE event for subtask creation during streaming).
  const mergedSubtasks = useMemo(() => {
    const apiSubtaskIds = new Set(subtasks.map((s) => s?.id));
    const newSubtasks: typeof subtasks = [];
    // Collect latest status from message task blocks (SSE updates task block statuses in messages)
    const messageStatusMap = new Map<string, TaskStatus>();

    for (const msg of messages) {
      for (const el of msg.message_content?.elements ?? []) {
        if (el.type === BLOCK_TYPE.TASK) {
          const payload = (el as TaskBlockType)?.payload ?? {};

          if (payload?.task_id) {
            const blockStatus = (payload?.status as TaskStatus) ?? TASK_STATUS.IN_PROGRESS;

            messageStatusMap.set(payload.task_id, blockStatus);

            if (!apiSubtaskIds.has(payload.task_id)) {
              newSubtasks.push({ id: payload.task_id, title: payload.title, status: blockStatus });
            }
          }
        }
      }
    }

    for (const el of streamingState?.message_content?.elements ?? []) {
      if (el.type === BLOCK_TYPE.TASK) {
        const payload = (el as TaskBlockType)?.payload ?? {};

        if (payload?.task_id) {
          const blockStatus = (payload?.status as TaskStatus) ?? TASK_STATUS.IN_PROGRESS;

          messageStatusMap.set(payload.task_id, blockStatus);

          if (!apiSubtaskIds.has(payload.task_id) && !newSubtasks.some((s) => s?.id === payload.task_id)) {
            newSubtasks.push({ id: payload.task_id, title: payload.title, status: blockStatus });
          }
        }
      }
    }

    // Update existing subtask statuses from messages (SSE keeps these fresh)
    const updated = subtasks.map((s) => {
      const freshStatus = messageStatusMap.get(s.id);

      return freshStatus && freshStatus !== s.status ? { ...s, status: freshStatus } : s;
    });

    return newSubtasks.length > 0 ? [...updated, ...newSubtasks] : updated;
  }, [subtasks, messages, streamingState]);

  const siblingsMemo: SiblingTask[] = useMemo(
    () => mergedSubtasks.map((subtask) => ({ id: subtask?.id, title: subtask?.title, status: subtask?.status })),
    [mergedSubtasks],
  );

  useEffect(() => {
    const title = (conversationData as Record<string, unknown> | undefined)?.title as string | undefined;

    if (title) {
      setChatTitle((prev) => prev || title);
    }
  }, [conversationData]);

  const hasMessages = messages.length > 0;
  const isAnalysing = hasMessages && messages[messages.length - 1]?.sender_type === SenderType.USER;

  if (streamingState) hadStreamingRef.current = true;

  // When navigating back to a previously visited task, RTK Query serves cached data
  const hasCachedData = Boolean(conversationData);
  const isLoadingConversation =
    !isErrorHistory &&
    (Boolean(taskId && isLoadingHistory) ||
      (!hasMessages && !streamingState && !hadStreamingRef.current && !hasCachedData));
  const isTaskNotFound = isErrorHistory && isNotFoundError(errorHistory);

  const { processedMessages, lastSummaryText } = useMemo(() => getProcessedMessages(messages), [messages]);
  const summary = (conversationData as Record<string, unknown> | undefined)?.summary as
    | ConversationSummary
    | null
    | undefined;
  const description = (conversationData as Record<string, unknown> | undefined)?.description as
    | string
    | null
    | undefined;
  const isTaskDone = taskStatus && !streamingState ? taskStatus === TASK_STATUS.COMPLETED : false;
  const isAgentActive = Boolean(streamingState?.is_active) || isAnalysing;

  const displayedSummary = useDisplayedSummary({
    taskId,
    isAgentActive,
    taskStatus,
    streamingSummaryText: taskSummaryText,
  });

  const { hitlQuestions, hitlQuestionsKey } = useHitlQuestions(inputsRequired);

  const handleHitlRespondComplete = useCallback(() => {
    refetchHistory();
    sseEventBus.publish(EVENT_TYPE.COMPONENT, { type: EVENT_TYPE.COMPONENT, payload: HITL_RESPONDED_EVENT });
  }, [refetchHistory, sseEventBus]);

  const isNeedsInput = taskStatus === TASK_STATUS.NEEDS_INPUT;
  const hasHitlQuestions = hitlQuestions.length > 0;

  const displayTitle = getDisplayTitle(urlTitle, chatTitle);
  const statusLabel = getStatusLabel(isAgentActive, taskStatus);

  const stepCount = useMemo(() => getStepCount(messages, streamingState), [messages, streamingState]);
  const stepGroupsRaw = isTaskDone ? summary?.step_groups : undefined;
  const isStreaming = streamingState && !!streamingState.message_content?.elements?.length;

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
    if (hasStepGroups && !isAgentActive && !showSteps) {
      setShowSummary(true);
    }
  }, [hasStepGroups, isAgentActive]);

  useEffect(() => {
    if (shimmerScrollRef.current) {
      shimmerScrollRef.current.scrollTop = shimmerScrollRef.current.scrollHeight;
    }
  }, [displayedSummary]);

  const isExpandedStepsView = showSteps && (!hasStepGroups || !showSummary);

  return (
    <ChatActionsProvider onFileOpen={openTab} parentTasks={subtaskPanelParents} siblings={siblingsMemo}>
      <div className='relative flex h-full flex-1 flex-col'>
        <TaskTopbar
          className='border-GRAY_100 border-b'
          title={chatTitle || 'Untitled'}
          status={effectiveStatus}
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
        <CommonWrapper
          isLoading={isLoadingConversation}
          isError={isErrorHistory}
          refetchFunction={refetchHistory}
          skeletonType={SkeletonTypes.CUSTOM}
          loader={<TaskContentSkeleton />}
          className='flex min-h-0 w-full min-w-0 flex-1 flex-col'
          disableAnimation
          renderError={
            isTaskNotFound ? (
              <ContentErrorState
                title='Task not found'
                description="This task may have been deleted or you don't have access to it."
              />
            ) : undefined
          }
        >
          <div className='mx-auto flex w-full max-w-[700px] flex-col px-4 pt-12'>
            <TaskChatTitleHeader
              displayTitle={displayTitle}
              statusLabel={statusLabel}
              isAgentActive={isAgentActive}
              taskStatus={taskStatus}
              description={description}
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
            <div className='mx-auto flex w-full max-w-[700px] flex-col px-4'>
              <div
                className={cn(
                  'overflow-hidden transition-all duration-300',
                  effectiveStatus === TASK_STATUS.IN_PROGRESS || isAgentActive
                    ? 'mt-[30px] max-h-[500px]'
                    : 'mt-0 max-h-0',
                )}
              >
                <div className='border-GRAY_400 flex min-h-[80px] flex-col rounded-[18px] border p-4'>
                  <ShimmerText text={displayedSummary || 'Starting now'} autoAnimate />
                </div>
              </div>

              <div className='mt-[30px]'>
                <TaskChatStepsToggleHeader
                  showSteps={showSteps}
                  onToggle={handleToggleSteps}
                  stepCount={stepCount}
                  isTaskDone={isTaskDone}
                  taskStatus={taskStatus}
                  showSummaryControl={hasStepGroups && showSteps && !isAgentActive}
                  showSummary={showSummary}
                  onShowSummaryChange={handleToggleSummary}
                  showConnector={showSteps || taskStatus !== TASK_STATUS.IN_PROGRESS}
                />
              </div>
              {/* 5b. Steps open: Summary view (step groups) */}
              {showSteps && hasStepGroups && showSummary && <StepGroupsSummaryView sections={stepGroupSections} />}

              {/* 5c. Steps open: Expanded per-message blocks + footer in a single connected thread */}
              <div className='relative'>
                <div
                  className={cn(
                    'bg-border pointer-events-none absolute top-0 bottom-0 left-[14.5px] z-0 w-px',
                    isStreaming && 'mb-5',
                  )}
                  aria-hidden
                />
                {isExpandedStepsView && (
                  <div className='relative flex flex-col'>
                    {processedMessages.map(({ message, summaryText }, index) => (
                      <div key={message.id ?? index} className='relative'>
                        <div className='px-2'>
                          <TaskChatStepMessage
                            message={message}
                            showConnectorToLastBlock={index > 0}
                            showConnectorToNextBlock
                          />
                        </div>
                        {summaryText && (
                          <div className='bg-BG_WHITE relative z-1 mt-2 px-2 py-1'>
                            <ResizableSummaryBox borderRadius='rounded-[18px]' contentClassName='px-4 pt-3 pb-1'>
                              <MarkdownBlock payload={{ text: summaryText }} />
                            </ResizableSummaryBox>
                          </div>
                        )}
                      </div>
                    ))}

                    {isStreaming && (
                      <div className='px-2'>
                        <StreamingMessage
                          streamingState={streamingState}
                          assistantAvatar={<></>}
                          showMarkdownConnectors
                          showConnectorToLastBlock
                          showConnectorToNextBlock={true}
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Footer when steps are collapsed or in summary view */}
                {(taskStatus === TASK_STATUS.NEEDS_INPUT || (!showSteps && taskStatus !== TASK_STATUS.IN_PROGRESS)) && (
                  <TaskChatExpandedStepsFooter
                    isFirst={processedMessages.length === 0}
                    isNeedsInput={isNeedsInput}
                    hasHitlQuestions={hasHitlQuestions}
                    hitlQuestions={hitlQuestions}
                    hitlQuestionsKey={hitlQuestionsKey}
                    taskId={taskId}
                    onHitlRespondComplete={handleHitlRespondComplete}
                    resultText={lastSummaryText}
                    summaryScrollRef={summaryScrollRef}
                    hideConnector={!showSteps}
                  />
                )}
              </div>

              {/* 3. Inline subtasks (toggleable) */}
              {mergedSubtasks.length > 0 && (
                <div className='mt-[30px] px-2'>
                  <InlineSubtaskSection subtasks={mergedSubtasks} parentTasks={subtaskPanelParents} />
                </div>
              )}

              <div className='bg-BG_WHITE h-12 w-full shrink-0' />
            </div>
          </ScrollContainer>
        </CommonWrapper>
      </div>
    </ChatActionsProvider>
  );
};

const TaskContentInner = ({ taskId: propTaskId }: TaskContentInnerProps) => {
  const nextPathname = usePathname();
  const nextSearchParams = useSearchParams();
  const urlTaskId = useMemo(
    () => getActiveTabIdFromUrl(nextPathname ?? '', nextSearchParams?.toString() ?? '', TAB_TYPE.TASK) ?? '',
    [nextPathname, nextSearchParams],
  );
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
