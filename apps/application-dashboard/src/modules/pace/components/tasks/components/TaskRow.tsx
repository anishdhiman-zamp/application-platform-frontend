'use client';

import { useCallback, useMemo } from 'react';
import { TASK_STATUS, TaskStatusIcon } from '@zamp-platform/chat';
import { CSS_VARS, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@zamp-platform/ui';
import { format } from 'date-fns';
import { BookText } from 'lucide-react';
import { preserveSidebarParam } from 'modules/pace/pace.utils';
import { useRouter } from 'next/navigation';
import Avatar from '@/components/common/avatar';
import { getChatTaskRoute } from '@/constants/routeConfig';
import { KEYBOARD_KEYS } from '@/constants/shortcuts';
import SubtaskPopover from '@/modules/pace/components/tasks/components/SubtaskPopover';
import type { TaskListItem } from '@/modules/pace/components/tasks/types/tasks.types';

interface TaskRowProps {
  task: TaskListItem;
  index?: number;
  totalCount?: number;
  status?: string;
}

const TaskRow = ({ task, index, totalCount, status }: TaskRowProps) => {
  const router = useRouter();

  const handleRowClick = useCallback(() => {
    const taskRoute = getChatTaskRoute({
      taskId: task.id,
      taskTitle: task.title,
      status,
      currentIndex: index,
      totalRows: totalCount,
    });

    router.push(preserveSidebarParam(taskRoute));
  }, [router, task.id, task.title, status, index, totalCount]);

  const totalSubtasks = task.subtasks.length;
  const completedSubtasks = useMemo(
    () => task?.subtasks.filter((s) => s.status === TASK_STATUS.COMPLETED).length,
    [task.subtasks],
  );

  return (
    <div
      role='button'
      tabIndex={0}
      onClick={handleRowClick}
      onKeyDown={(e) => {
        if (e.key === KEYBOARD_KEYS.ENTER || e.key === KEYBOARD_KEYS.SPACE) handleRowClick();
      }}
      className='hover:bg-BG_GRAY_2 flex h-[42px] w-full cursor-pointer items-center'
    >
      <div className='flex min-w-0 flex-1 items-center gap-3 py-2.5 pr-4 pl-6.5'>
        <div className='flex shrink-0 items-center gap-2'>
          <TaskStatusIcon status={task?.status} />
          <span className='f-13-500 text-GRAY_1000 truncate whitespace-nowrap'>{task?.title}</span>
        </div>

        {totalSubtasks > 0 && (
          // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
          <div
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <SubtaskPopover
              subtasks={task.subtasks}
              completedCount={completedSubtasks}
              totalCount={totalSubtasks}
              parentTasks={[{ id: task.id, title: task.title, status: task.status }]}
            />
          </div>
        )}
        {task?.description && (
          <>
            <div className='bg-GRAY_400 h-px w-[5px] shrink-0' />
            <p className='f-13-450 text-GRAY_700 min-w-0 flex-1 truncate'>{task.description}</p>
          </>
        )}
      </div>

      <div className='flex shrink-0 items-center gap-3.5 px-4 py-2.5'>
        <div className='border-GRAY_400 hidden items-center gap-1.5 rounded-full border px-2 py-1.5'>
          <BookText size={14} className='text-GRAY_700 shrink-0' />
          <span className='f-12-450 text-GRAY_1000 min-w-[12px] text-center whitespace-nowrap'>
            {task?.subtasks?.length || 0}
          </span>
        </div>

        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger>
              <Avatar
                name={task?.created_by?.name || ''}
                backgroundColor={CSS_VARS.ORANGE_400}
                className='f-12-300 text-GRAY_1000 h-5 min-w-5 text-[9px]! font-medium!'
              />
            </TooltipTrigger>
            <TooltipContent side='top' sideOffset={8}>
              Created by {task?.created_by?.name}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <span className='f-13-450 text-GRAY_700 w-[52px] text-right whitespace-nowrap'>
          {format(new Date(task?.created_at), 'MMM d')}
        </span>
      </div>
    </div>
  );
};

export default TaskRow;
