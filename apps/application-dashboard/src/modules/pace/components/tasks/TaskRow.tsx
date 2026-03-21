'use client';

import { type FC, useCallback, useMemo } from 'react';
import { TASK_STATUS, TaskStatusIcon } from '@zamp-platform/chat';
import { BookText } from 'lucide-react';
import SubtaskPopover from 'modules/pace/components/tasks/SubtaskPopover';
import type { TaskListItem } from 'modules/pace/components/tasks/task-listing.types';
import { useRouter } from 'next/navigation';
import { ROUTES_PATH } from '@/constants/routeConfig';
import { KEYBOARD_KEYS } from '@/constants/shortcuts';

interface TaskRowProps {
  task: TaskListItem;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 1);
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);

  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
}

const TaskRow: FC<TaskRowProps> = ({ task }) => {
  const router = useRouter();

  const handleRowClick = useCallback(() => {
    router.push(ROUTES_PATH.CHAT_TASK.replace(':taskId', task.id));
  }, [router, task.id]);

  const totalSubtasks = task.subtasks.length;
  const completedSubtasks = useMemo(
    () => task?.subtasks?.filter((s) => s.status === TASK_STATUS.COMPLETED).length || 0,
    [task.subtasks],
  );

  return (
    <div
      role='button'
      tabIndex={0}
      onClick={handleRowClick}
      onKeyDown={(e) => {
        if (e.key === KEYBOARD_KEYS.ENTER || e.key === ' ') handleRowClick();
      }}
      className='hover:bg-BG_GRAY_2 flex h-[42px] w-full cursor-pointer items-center'
    >
      <div className='flex min-w-0 flex-1 items-center gap-3 py-2.5 pr-4 pl-7.5'>
        <div className='flex shrink-0 items-center gap-1.5'>
          <TaskStatusIcon status={task.status} />
          <span className='f-13-500 text-GRAY_1000 truncate whitespace-nowrap'>{task?.title}</span>
        </div>

        {totalSubtasks > 0 && (
          <div
            className='border-GRAY_400 flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-1.5'
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <SubtaskPopover subtasks={task.subtasks} completedCount={completedSubtasks} totalCount={totalSubtasks} />
          </div>
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

        <div
          className='flex size-5 shrink-0 items-center justify-center rounded-full bg-[#fcd579]'
          title={task?.created_by?.name || ''}
        >
          <span className='text-GRAY_1000 text-center text-[9px] leading-normal font-medium'>
            {getInitials(task?.created_by?.name || '')}
          </span>
        </div>

        <span className='f-13-450 text-GRAY_700 w-[52px] text-right whitespace-nowrap'>
          {formatDate(task?.created_at)}
        </span>
      </div>
    </div>
  );
};

export default TaskRow;
