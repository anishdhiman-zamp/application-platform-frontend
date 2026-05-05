'use client';

import { cn } from '@zamp-platform/ui/utils';
import { EVENT_TYPE } from '@zamp-platform/utils/event-bus/event-bus.types';
import { ArrowUpRight } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { type FC, useCallback } from 'react';

import { getChatTaskRoute } from '@/constants/routeConfig';
import { useAppSelector } from '@/hooks/toolkit';
import { preserveSidebarParam } from '@/modules/pace/pace.utils';
import type { RootState } from '@/store';

import { API_ENDPOINTS } from '../../api';
import { useChatActions } from '../../context/ChatActionsContext';
import { useChat } from '../../hooks/useChat';
import { useDisplayedSummary } from '../../hooks/useDisplayedSummary';
import { TASK_STATUS, type TaskBlockType } from '../../types/block.types';
import { ResourceType, SenderType } from '../../types/chat.types';
import TaskBlockContent from './TaskBlockContent';
import TaskStatusIcon from './TaskStatusIcon';

interface TaskBlockProps {
  payload: TaskBlockType['payload'];
  conversationId?: string;
  className?: string;
}

const TaskBlock: FC<TaskBlockProps> = ({ payload, conversationId, className }) => {
  const organizationId = useAppSelector((state: RootState) => state.user.user?.orgs?.[0]?.organization_id) ?? '';
  const { onTaskOpen, parentTasks, siblings, taskSummaries } = useChatActions();

  const { title, task_id, status = TASK_STATUS.IN_PROGRESS } = payload;

  const chat = useChat({
    resourceId: organizationId,
    resourceType: ResourceType.ORGANIZATION,
    conversationId: task_id,
    eventType: EVENT_TYPE.TASK,
    enableStreaming: true,
    apiConfig: {
      getConversationById: API_ENDPOINTS.TASKS_MESSAGES_GET,
    },
  });

  const isLoading = chat?.isLoadingConversationHistory ?? false;

  const hasMessages = (chat?.messages?.length ?? 0) > 0;
  const isAnalysing = hasMessages && chat?.messages[chat.messages.length - 1]?.sender_type === SenderType.USER;
  const isAgentActive = Boolean(chat?.streamingState?.is_active) || isAnalysing;
  const conversationData = chat?.conversationData;
  const taskStatus = (conversationData as unknown as Record<string, unknown>)?.status as string | undefined;

  const displayedSummary = useDisplayedSummary({
    taskId: task_id,
    isAgentActive,
    taskStatus,
    streamingSummaryText: taskSummaries?.[task_id] ?? payload.summary?.live_summary ?? null,
  });

  const handleOpenTask = useCallback(() => {
    const effectiveStatus = taskStatus ?? status;

    const sameStatusSiblings = siblings?.filter((s) => s.status === effectiveStatus) ?? [];
    const statusIndex = sameStatusSiblings.findIndex((s) => s.id === task_id);

    const route = getChatTaskRoute({
      taskId: task_id,
      conversationId: conversationId ?? '',
      taskTitle: title,
      parentTasks: parentTasks?.length ? parentTasks : undefined,
      siblings: siblings?.length ? siblings : undefined,
      status: siblings?.length ? effectiveStatus : undefined,
      currentIndex: statusIndex !== -1 ? statusIndex : undefined,
      totalRows: sameStatusSiblings.length > 0 ? sameStatusSiblings.length : undefined,
      inChat: true,
    });

    const fullRoute = preserveSidebarParam(route);

    onTaskOpen?.(task_id, title, fullRoute);
  }, [task_id, conversationId, title, status, taskStatus, onTaskOpen, parentTasks, siblings]);

  const isInProgress = status === TASK_STATUS.IN_PROGRESS;

  return (
    <div
      className={cn(
        'border-GRAY_400 bg-BG_WHITE hover:bg-BG_GRAY_2 my-3 w-full cursor-pointer overflow-hidden rounded-[10px] border transition-colors',
        className,
      )}
      onClick={handleOpenTask}
      role='button'
      tabIndex={0}
    >
      <div className='px-4 py-3'>
        <div className='flex w-full min-w-0 items-center gap-3'>
          <TaskStatusIcon status={status} />
          <span className='f-13-550 text-GRAY_1000 min-w-0 flex-1 truncate text-left' title={title}>
            {title}
          </span>
          <ArrowUpRight size={14} className='text-GRAY_700 shrink-0' strokeWidth={1.5} />
        </div>
      </div>

      <AnimatePresence initial={false}>
        {isInProgress && (
          <motion.div
            key='task-content'
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className='overflow-hidden'
          >
            <div className='bg-BG_GRAY_2 border-GRAY_400 f-14-450 min-h-20 border-t px-4 py-3'>
              <TaskBlockContent isLoading={isLoading} isInProgress={isInProgress} displayedSummary={displayedSummary} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TaskBlock;
