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
import {
  TaskProvider,
  useLazyGetConversationByIdQuery,
  useTaskActions,
  useTaskState,
} from '@zamp-platform/conversation-stream';
import { ScrollContainer, type ScrollContainerRef, ShimmerText } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { extractTaskUpdateFields } from '@zamp-platform/utils';
import { type BaseEventPayload, EVENT_TYPE } from '@zamp-platform/utils/event-bus';
import { useDynamicTabs } from 'modules/pace/components/dynamic-tabs/useDynamicTabs';
import { useTaskNavigation } from 'modules/pace/hooks/useTaskNavigation';
import { TAB_QUERY_PARAM, TAB_TYPE } from 'modules/pace/pace.types';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { API_ENDPOINTS } from '@/apis/apiEndpoint.constants';
import { useEventBus } from '@/app/_providers/sse-provider';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import { ROUTES_PATH, TASK_QUERY_PARAMS } from '@/constants/routeConfig';
import { useAppSelector } from '@/hooks/toolkit';
import ContentErrorState from '@/modules/pace/components/ContentErrorState';
import { getActiveTabIdFromUrl } from '@/modules/pace/components/dynamic-tabs/tab-type-registry';
import { isChatPanelSurface, type TaskContentChrome } from '@/modules/pace/components/files-panel/files-panel.utils';
import TaskContentSkeleton from '@/modules/pace/components/loaders/TaskContentSkeleton';
import BackToParentButton from '@/modules/pace/components/tasks/components/BackToParentButton';
import InlineSubtaskSection from '@/modules/pace/components/tasks/components/InlineSubtaskSection';
import { HITL_RESPONDED_EVENT } from '@/modules/pace/components/tasks/constants/tasks.constants';
import {
  getDisplayTitle,
  getProcessedMessages,
  getStatusLabel,
  getStepCount,
} from '@/modules/pace/components/tasks/utils/tasks.utils';
import { useHitlQuestions } from '@/modules/pace/hooks/useHitlQuestions';
import ResizableSummaryBox from '@/modules/pace/module/ResizableSummaryBox';
import { resolveMessageStepGroupSections, stepGroupsLegacyToSections } from '@/modules/pace/module/step-groups.utils';
import StepGroupsSummaryView from '@/modules/pace/module/StepGroupsSummaryView';
import { TaskChatExpandedStepsFooter } from '@/modules/pace/module/TaskChatExpandedStepsFooter';
import { TaskChatStepMessage } from '@/modules/pace/module/TaskChatStepMessage';
import { TaskChatStepsToggleHeader } from '@/modules/pace/module/TaskChatStepsToggleHeader';
import { TaskChatTitleHeader } from '@/modules/pace/module/TaskChatTitleHeader';
import TaskNavigation from '@/modules/pace/module/TaskNavigation';
import TaskPanelHeader from '@/modules/pace/module/TaskPanelHeader';
import TaskTopbar from '@/modules/pace/module/TaskTopbar';
import { BrowserViewerDisplayState, SINGLE_VIEWER_TAB_METADATA_KEY } from '@/modules/pace/pace.constants';
import type { RootState } from '@/store';

interface TaskContentInnerProps {
  taskId: string;
  chrome?: TaskContentChrome;
  isActive?: boolean;
  onClosePanel?: () => void;
}

const TaskContentChat = ({
  taskId,
  chrome = 'inline',
  isActive = true,
  onClosePanel,
}: {
  taskId: string;
  chrome?: TaskContentChrome;
  isActive?: boolean;
  onClosePanel?: () => void;
}) => {
  // Refs
  const hadStreamingRef = useRef(false);
  const prevBrowserStreamingRef = useRef(false);
  const summaryScrollRef = useRef<HTMLDivElement>(null);
  const shimmerScrollRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<ScrollContainerRef>(null);

  // Hooks
  const { sseEventBus } = useEventBus();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refetchHistory } = useTaskActions();
  const streamingState = useStreamingState(taskId);
  const { openTab: openFileTab } = useDynamicTabs({ type: TAB_TYPE.FILE });
  const { openTab: openDatasetTab } = useDynamicTabs({ type: TAB_TYPE.DATASET });
  const [triggerGetConversation] = useLazyGetConversationByIdQuery();
  const {
    openTab: openBrowserTab,
    openSingleTab: openSingleBrowserTab,
    updateTab: updateBrowserTab,
  } = useDynamicTabs({
    type: TAB_TYPE.BROWSER,
  });
  const username = useAppSelector((state: RootState) => state.user.user?.username) ?? '';

  const handleFileOpen = useCallback(
    (path: string, name: string) => {
      if (isChatPanelSurface(pathname)) {
        openFileTab(path, name);

        return;
      }

      router.push(`${ROUTES_PATH.CHAT_FILES}?${TAB_QUERY_PARAM.FILE}=${encodeURIComponent(path)}`);
    },
    [openFileTab, pathname, router],
  );

  const handleDatasetOpen = useCallback(
    (datasetId: string, name: string) => {
      if (isChatPanelSurface(pathname)) {
        openDatasetTab(datasetId, name);

        return;
      }

      router.push(`${ROUTES_PATH.CHAT_DATASET}?${TAB_QUERY_PARAM.DATASET}=${encodeURIComponent(datasetId)}`);
    },
    [openDatasetTab, pathname, router],
  );

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
    isBrowserStreamingAvailable,
    browserSessionId,
  } = useTaskState();
  const { hitlQuestions, hitlQuestionsKey } = useHitlQuestions(inputsRequired);

  // constants
  const urlTitle = searchParams?.get('title') ?? null;
  const hasMessages = messages.length > 0;
  const isAnalysing = hasMessages && messages[messages.length - 1]?.sender_type === SenderType.USER;
  const taskStatus = (conversationData as Record<string, unknown> | undefined)?.status as string | undefined;
  const effectiveStatus = (liveStatus as TaskStatus) ?? (taskStatus as TaskStatus) ?? status ?? undefined; // SOT: SSE liveStatus > conversation api > URL param
  const conversationId = searchParams?.get('s') ?? undefined;
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
  const statusLabel = getStatusLabel(effectiveStatus);
  const hasHitlQuestions = hitlQuestions.length > 0;
  const isNeedsInput = taskStatus === TASK_STATUS.NEEDS_INPUT;
  const isAgentActive = Boolean(streamingState?.is_active) || isAnalysing;
  const isTaskDone = taskStatus && !streamingState ? taskStatus === TASK_STATUS.COMPLETED : false;
  const stepGroupsRaw = isTaskDone ? summary?.step_groups : undefined;
  const isStreaming = streamingState && !!streamingState.message_content?.elements?.length;
  const stepCount = useMemo(() => getStepCount(messages, streamingState), [messages, streamingState]);

  const displayedSummary = useDisplayedSummary({
    taskId,
    isAgentActive,
    taskStatus,
    streamingSummaryText: taskSummaryText,
  });

  // State
  const [chatTitle, setChatTitle] = useState(urlTitle ?? '');
  const [showSteps, setShowSteps] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [liveParentStatuses, setLiveParentStatuses] = useState<Map<string, TaskStatus>>(new Map()); // live task status from SSE

  const displayTitle = getDisplayTitle(urlTitle, chatTitle);

  const parentTasks: TaskBreadcrumb[] = useMemo(() => {
    const raw = searchParams?.get('parentTasks');

    if (!raw) return [];
    try {
      return JSON.parse(raw) as TaskBreadcrumb[];
    } catch {
      return [];
    }
  }, [searchParams]);

  const stepGroupSections = useMemo(() => {
    if (!stepGroupsRaw) return [];
    if (Array.isArray(stepGroupsRaw)) {
      return stepGroupsLegacyToSections(stepGroupsRaw, messages);
    }

    return resolveMessageStepGroupSections(stepGroupsRaw, messages);
  }, [stepGroupsRaw, messages]);

  const isSubtask = parentTasks.length > 0;
  const hasStepGroups = stepGroupSections.length > 0;
  const isExpandedStepsView = showSteps && (!hasStepGroups || !showSummary);
  const showPanelHeader = chrome === 'panel';
  const showInlineTopbar = chrome === 'inline';
  const showContentTitleHeader = chrome !== 'panel';

  const parentTaskIds = useMemo(() => new Set(parentTasks.map((p) => p.id)), [parentTasks]);

  const handleToggleSteps = () => setShowSteps((prev) => !prev);

  const handleParentStatusUpdate = useCallback(
    (data: BaseEventPayload) => {
      const { taskId: updatedTaskId, status: rawStatus } = extractTaskUpdateFields(data);
      const newStatus = rawStatus as TaskStatus | undefined;

      if (!updatedTaskId || !newStatus || !parentTaskIds.has(updatedTaskId)) return;

      setLiveParentStatuses((prev) => {
        if (prev.get(updatedTaskId) === newStatus) return prev;

        const next = new Map(prev);

        next.set(updatedTaskId, newStatus);

        return next;
      });
    },
    [parentTaskIds],
  );

  const organizationId = useAppSelector((state: RootState) => state.user.user?.orgs?.[0]?.organization_id) ?? '';

  const fetchParentStatuses = useCallback(async () => {
    if (!isSubtask || parentTasks.length === 0) return;

    for (const parent of parentTasks) {
      try {
        const result = await triggerGetConversation({
          conversationId: parent.id,
          resourceId: organizationId,
          resourceType: ResourceType.ORGANIZATION,
          url: API_ENDPOINTS.TASKS_MESSAGES_GET,
        }).unwrap();

        const freshStatus = (result?.conversation as unknown as Record<string, unknown>)?.status as
          | TaskStatus
          | undefined;

        if (freshStatus && freshStatus !== parent.status) {
          setLiveParentStatuses((prev) => {
            if (prev.get(parent.id) === freshStatus) return prev;

            const next = new Map(prev);

            next.set(parent.id, freshStatus);

            return next;
          });
        }
      } catch {
        // Silently ignore — breadcrumb will use the URL param status as fallback.
      }
    }
  }, [isSubtask, parentTasks, triggerGetConversation, organizationId]);

  const liveParentTasks: TaskBreadcrumb[] = useMemo(() => {
    if (liveParentStatuses.size === 0) return parentTasks;

    return parentTasks.map((p) => {
      const freshStatus = liveParentStatuses.get(p.id);

      return freshStatus ? { ...p, status: freshStatus } : p;
    });
  }, [parentTasks, liveParentStatuses]);

  // Sync live parent statuses back to the parentTasks URL param so reloads show fresh data.
  const handleParentTasksUrlSync = useCallback(() => {
    if (liveParentStatuses.size === 0 || parentTasks.length === 0) return;

    const updated = parentTasks.map((p) => {
      const freshStatus = liveParentStatuses.get(p.id);

      return freshStatus && freshStatus !== p.status ? { ...p, status: freshStatus } : p;
    });

    if (JSON.stringify(updated) === JSON.stringify(parentTasks)) return;

    const currentParams = new URLSearchParams(window.location.search);

    currentParams.set(TASK_QUERY_PARAMS.PARENT_TASKS, JSON.stringify(updated));
    window.history.replaceState(null, '', `${window.location.pathname}?${currentParams.toString()}`);
  }, [liveParentStatuses, parentTasks]);

  const handleWatchStream = useCallback(() => {
    if (conversationId) {
      const browserMetadata = browserSessionId ? { sessionId: browserSessionId } : undefined;

      if (isChatPanelSurface(pathname)) {
        openBrowserTab(conversationId, 'Browser', browserMetadata);

        return;
      }

      openSingleBrowserTab(conversationId, 'Browser', {
        ...browserMetadata,
        [SINGLE_VIEWER_TAB_METADATA_KEY]: true,
      });
    }
  }, [browserSessionId, conversationId, openBrowserTab, openSingleBrowserTab, pathname]);

  const subtaskPanelParents: TaskBreadcrumb[] = useMemo(
    () => [
      ...liveParentTasks,
      {
        id: taskId,
        title: chatTitle || urlTitle || 'Untitled',
        status: effectiveStatus,
        currentIndex,
        totalRows: totalCount,
        conversationId,
      },
    ],
    [liveParentTasks, taskId, chatTitle, urlTitle, effectiveStatus, currentIndex, totalCount, conversationId],
  );

  // Extract subtask info from messages and streaming to detect newly created subtasks
  // before the task list API refetches
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

  if (streamingState) hadStreamingRef.current = true;

  const handleHitlRespondComplete = useCallback(() => {
    refetchHistory();
    sseEventBus.publish(EVENT_TYPE.COMPONENT, { type: EVENT_TYPE.COMPONENT, payload: HITL_RESPONDED_EVENT });
  }, [refetchHistory, sseEventBus]);

  const handleToggleSummary = (checked: boolean) => setShowSummary(checked);

  useEffect(() => {
    const sub = isSubtask ? sseEventBus.subscribe(EVENT_TYPE.TASK_UPDATE, handleParentStatusUpdate) : null;

    return () => sub?.unsubscribe();
  }, [isSubtask, sseEventBus, handleParentStatusUpdate]);

  useEffect(() => {
    fetchParentStatuses();
  }, [fetchParentStatuses]);

  useEffect(() => {
    handleParentTasksUrlSync();
  }, [handleParentTasksUrlSync]);

  useEffect(() => {
    if (streamingState?.is_active) {
      setShowSummary(false);
    }
  }, [streamingState?.is_active]);

  useEffect(() => {
    const title = (conversationData as Record<string, unknown> | undefined)?.title as string | undefined;

    if (title) {
      setChatTitle((prev) => prev || title);
    }
  }, [conversationData]);

  useEffect(() => {
    const wasAvailable = prevBrowserStreamingRef.current;

    prevBrowserStreamingRef.current = isBrowserStreamingAvailable;

    if (wasAvailable && !isBrowserStreamingAvailable && conversationId) {
      updateBrowserTab(conversationId, conversationId, 'Browser', {
        status: BrowserViewerDisplayState.ENDED,
      });
    }
  }, [isBrowserStreamingAvailable, conversationId, updateBrowserTab]);

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

  return (
    <ChatActionsProvider
      onFileOpen={handleFileOpen}
      onDatasetOpen={handleDatasetOpen}
      parentTasks={subtaskPanelParents}
      siblings={siblingsMemo}
      onWatchStream={handleWatchStream}
      isBrowserStreamingAvailable={isBrowserStreamingAvailable}
    >
      <div className='relative flex h-full flex-1 flex-col'>
        {showPanelHeader && (
          <TaskPanelHeader
            isActive={isActive}
            title={displayTitle}
            status={effectiveStatus}
            currentIndex={currentIndex}
            totalCount={totalCount}
            hasNext={hasNext}
            hasPrevious={hasPrevious}
            isLoading={isLoading}
            isBootstrapping={isBootstrapping}
            onGoToNextTask={goToNextTask}
            onGoToPreviousTask={goToPreviousTask}
            onClose={onClosePanel ?? (() => {})}
          />
        )}
        {showInlineTopbar && (
          <TaskTopbar
            className='border-GRAY_100 border-b'
            title={chatTitle || 'Untitled'}
            status={effectiveStatus}
            isSubtask={isSubtask}
            parentTasks={liveParentTasks}
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
        )}
        {showPanelHeader && isSubtask && liveParentTasks.length > 0 && (
          <BackToParentButton
            parent={liveParentTasks[liveParentTasks.length - 1]}
            ancestorsAbove={liveParentTasks.slice(0, -1)}
          />
        )}
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
          {showContentTitleHeader && (
            <div className='mx-auto flex w-full max-w-[656px] flex-col px-6 pt-12 sm:px-12'>
              <TaskChatTitleHeader
                displayTitle={displayTitle}
                statusLabel={statusLabel}
                effectiveStatus={effectiveStatus}
                description={description}
              />
            </div>
          )}

          <ScrollContainer
            className='min-h-0 w-full min-w-0 flex-1'
            showScrollToBottom
            ref={scrollContainerRef}
            showFadeOverlay
            scrollbarStyle='none'
            scrollClassName='!overflow-y-scroll'
          >
            <div className='mx-auto flex w-full max-w-[656px] flex-col px-6 sm:px-12'>
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
                    conversationId={conversationId}
                    onHitlRespondComplete={handleHitlRespondComplete}
                    resultText={lastSummaryText}
                    summaryScrollRef={summaryScrollRef}
                    hideConnector={!showSteps}
                    username={username}
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

const TaskContentInner = ({
  taskId: propTaskId,
  chrome = 'inline',
  isActive = true,
  onClosePanel,
}: TaskContentInnerProps) => {
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
      <TaskContentChat key={taskId} taskId={taskId} chrome={chrome} isActive={isActive} onClosePanel={onClosePanel} />
    </TaskProvider>
  );
};

export default TaskContentInner;
