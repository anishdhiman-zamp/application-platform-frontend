'use client';

import { cn } from '@zamp-platform/ui/utils';
import { EVENT_TYPE } from '@zamp-platform/utils/event-bus';
import { Activity, ArrowUpRight } from 'lucide-react';
import { type FC, useCallback, useEffect } from 'react';

import { getChatTaskRoute } from '@/constants/routeConfig';
import { useAppSelector } from '@/hooks/toolkit';
import { preserveSidebarParam } from '@/modules/pace/pace.utils';
import type { RootState } from '@/store';

import { API_ENDPOINTS } from '../../api';
import { useChatActions } from '../../context/ChatActionsContext';
import { useChat } from '../../hooks/useChat';
import { taskStatusStore } from '../../stores/taskStatusStore';
import { TASK_STATUS, type TaskBlockType, type TaskStatus } from '../../types/block.types';
import { ResourceType } from '../../types/chat.types';
import TaskStatusIcon from './TaskStatusIcon';

interface TaskBlockProps {
  payload: TaskBlockType['payload'];
  conversationId?: string;
  className?: string;
}

const TaskBlock: FC<TaskBlockProps> = ({ payload, conversationId, className }) => {
  const organizationId = useAppSelector((state: RootState) => state.user.user?.orgs?.[0]?.organization_id) ?? '';
  const { onTaskOpen, parentTasks, siblings } = useChatActions();

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

  const conversationData = chat?.conversationData;
  const taskStatus = (conversationData as unknown as Record<string, unknown>)?.status as TaskStatus | undefined;
  const effectiveStatus = taskStatus ?? status;

  useEffect(() => {
    if (taskStatus) {
      taskStatusStore.setStatus(task_id, taskStatus);
    }
  }, [task_id, taskStatus]);

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

  return (
    <div
      className={cn(
        'border-GRAY_400 bg-BG_WHITE hover:bg-BG_GRAY_2 group/task-block mt-3 mb-3 h-[52px] w-full cursor-pointer overflow-hidden rounded-[10px] border transition-colors',
        className,
      )}
      onClick={handleOpenTask}
      role='button'
      tabIndex={0}
    >
      <div className='flex h-full items-center px-3'>
        <div className='flex w-full min-w-0 items-center justify-between gap-3'>
          <div className='flex min-w-0 flex-1 items-center gap-2'>
            <Activity size={14} className='text-GRAY_700 shrink-0' />
            <span className='f-13-500 text-GRAY_1000 min-w-0 truncate text-left' title={title}>
              {title}
            </span>
            <ArrowUpRight
              size={14}
              className='text-GRAY_700 shrink-0 opacity-0 transition-opacity group-hover/task-block:opacity-100'
              strokeWidth={1.5}
            />
          </div>

          <span
            data-task-block-activity-indicator
            className='ml-2 flex size-3.5 shrink-0 items-center justify-center'
            aria-label={`${title} status`}
          >
            <TaskStatusIcon status={effectiveStatus} />
          </span>
        </div>
      </div>
    </div>
  );
};

export default TaskBlock;
