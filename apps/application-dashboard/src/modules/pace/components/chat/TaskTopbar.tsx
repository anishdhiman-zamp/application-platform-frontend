'use client';

import { type FC, useCallback } from 'react';
import { type TaskBreadcrumb, type TaskStatus, TaskStatusIcon } from '@zamp-platform/chat';
import { cn } from '@zamp-platform/ui/utils';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getChatTaskRoute, ROUTES_PATH } from '@/constants/routeConfig';
import TaskBreadcrumbNav from '@/modules/pace/components/chat/TaskBreadcrumb';
import { preserveSidebarParam } from '@/modules/pace/pace.utils';

interface TaskTopbarProps {
  className?: string;
  title: string;
  status?: TaskStatus;
  isSubtask: boolean;
  parentTasks: TaskBreadcrumb[];
  navigationSlot?: React.ReactNode;
}

const TaskTopbar: FC<TaskTopbarProps> = ({ className, title, status, isSubtask, parentTasks, navigationSlot }) => {
  const router = useRouter();
  const displayTitle = title || 'Untitled';

  const handleBack = useCallback(() => {
    if (isSubtask && parentTasks.length > 0) {
      const lastParent = parentTasks[parentTasks.length - 1];
      const ancestorsAbove = parentTasks.slice(0, -1);
      const route = getChatTaskRoute({
        taskId: lastParent.id,
        taskTitle: lastParent.title,
        parentTasks: ancestorsAbove.length > 0 ? ancestorsAbove : undefined,
      });

      router.push(preserveSidebarParam(route));
    } else {
      router.push(preserveSidebarParam(ROUTES_PATH.CHAT_TASKS));
    }
  }, [isSubtask, parentTasks, router]);

  return (
    <div className={cn('bg-BG_WHITE flex items-center justify-between gap-x-3 p-3', className)}>
      <div className='flex min-w-0 flex-1 items-center gap-x-1'>
        {isSubtask ? (
          <TaskBreadcrumbNav
            currentTitle={displayTitle}
            currentStatus={status}
            parentTasks={parentTasks}
            onBack={handleBack}
          />
        ) : (
          <>
            <div
              className='text-GRAY_700 hover:text-GRAY_1000 h-7 w-7 shrink-0 cursor-pointer rounded p-1'
              onClick={handleBack}
              aria-label='Go back'
              role='button'
            >
              <ArrowLeft size={16} />
            </div>
            <div className='flex h-7 max-w-full items-center gap-x-1.5 px-1'>
              {status && <TaskStatusIcon status={status} />}
              <span className='f-14-550 block min-w-0 truncate first-letter:uppercase'>{displayTitle}</span>
            </div>
          </>
        )}
      </div>
      <div className='flex items-center gap-1.5'>{navigationSlot}</div>
    </div>
  );
};

export default TaskTopbar;
