'use client';

import { useCallback, useMemo } from 'react';
import { TASK_STATUS, TaskStatusIcon } from '@zamp-platform/chat';
import { CSS_VARS } from '@zamp-platform/ui';
import { format } from 'date-fns';
import { BookText } from 'lucide-react';
import SubtaskPopover from 'modules/pace/components/tasks/SubtaskPopover';
import type { TaskListItem } from 'modules/pace/components/tasks/task-listing.types';
import { preserveSidebarParam } from 'modules/pace/pace.utils';
import { useRouter } from 'next/navigation';
import Avatar from '@/components/common/avatar';
import { getChatTaskRoute } from '@/constants/routeConfig';
import { KEYBOARD_KEYS } from '@/constants/shortcuts';

interface TaskRowProps {
  task: TaskListItem;
}

const TaskRow = ({ task }: TaskRowProps) => {
  const router = useRouter();

  const handleRowClick = useCallback(() => {
    const taskRoute = getChatTaskRoute({ taskId: task?.id || '', taskTitle: task?.title || '' });

    router.push(preserveSidebarParam(taskRoute));
  }, [router, task?.id, task?.title]);

  const totalSubtasks = task.subtasks.length;
  const completedSubtasks = useMemo(
    () => task?.subtasks?.filter((s) => s?.status === TASK_STATUS.COMPLETED).length || 0,
    [task?.subtasks],
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
          <SubtaskPopover subtasks={task.subtasks} completedCount={completedSubtasks} totalCount={totalSubtasks} />
        )}
        <div className='bg-GRAY_400 h-px w-[5px] shrink-0' />

        {task?.description && <p className='f-13-450 text-GRAY_700 min-w-0 flex-1 truncate'>{task?.description}</p>}
      </div>

      <div className='flex shrink-0 items-center gap-3.5 px-4 py-2.5'>
        <div className='border-GRAY_400 hidden items-center gap-1.5 rounded-full border px-2 py-1.5'>
          <BookText size={14} className='text-GRAY_700 shrink-0' />
          <span className='f-12-450 text-GRAY_1000 min-w-[12px] text-center whitespace-nowrap'>
            {task?.subtasks?.length || 0}
          </span>
        </div>

        <Avatar
          name={task?.created_by?.name || ''}
          backgroundColor={CSS_VARS.ORANGE_400}
          className='f-12-300 text-GRAY_1000 h-5 min-w-5 text-[9px]! font-medium!'
        />
        <span className='f-13-450 text-GRAY_700 w-[52px] text-right whitespace-nowrap'>
          {format(new Date(task?.created_at), 'MMM d')}
        </span>
      </div>
    </div>
  );
};

export default TaskRow;
