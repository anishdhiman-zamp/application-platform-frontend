'use client';

import { type FC, useCallback } from 'react';
import { type TaskBreadcrumb, type TaskStatus, TaskStatusIcon } from '@zamp-platform/chat';
import { cn } from '@zamp-platform/ui/utils';
import { ArrowLeft } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { getChatTaskRoute, ROUTES_PATH, TASK_QUERY_PARAMS } from '@/constants/routeConfig';
import { markNavAsSubtask } from '@/modules/pace/hooks/useTabRouter';
import TaskBreadcrumbNav from '@/modules/pace/module/TaskBreadcrumb';
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
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const inChat = pathname === ROUTES_PATH.CHAT;
  const referrer = searchParams?.get(TASK_QUERY_PARAMS.REFERRER);
  const displayTitle = title || 'Untitled';

  const handleBack = useCallback(() => {
    if (isSubtask && parentTasks?.length > 0) {
      const lastParent = parentTasks[parentTasks?.length - 1];
      const ancestorsAbove = parentTasks?.slice(0, -1);
      const route = getChatTaskRoute({
        taskId: lastParent?.id,
        conversationId: lastParent?.conversationId,
        taskTitle: lastParent?.title,
        status: lastParent?.status,
        currentIndex: lastParent?.currentIndex,
        totalRows: lastParent?.totalRows,
        parentTasks: ancestorsAbove?.length > 0 ? ancestorsAbove : undefined,
        inChat,
      });

      if (inChat) markNavAsSubtask(lastParent?.id);
      router.push(preserveSidebarParam(route));
    } else if (referrer && referrer.startsWith(ROUTES_PATH.HOME)) {
      router.push(referrer);
    } else {
      router.push(preserveSidebarParam(ROUTES_PATH.CHAT_TASKS));
    }
  }, [isSubtask, parentTasks, router, referrer, inChat]);

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
              className='text-GRAY_700 hover:text-GRAY_1000 hover:bg-GRAY_200 flex h-[26px] w-[26px] shrink-0 cursor-pointer items-center justify-center rounded-lg p-1'
              onClick={handleBack}
              aria-label='Go back'
              role='button'
            >
              <ArrowLeft size={16} />
            </div>
            <div className='flex h-7 min-w-0 flex-1 items-center gap-x-1.5 px-1'>
              {status && (
                <span className='shrink-0'>
                  <TaskStatusIcon status={status} />
                </span>
              )}
              <span className='f-14-550 block min-w-0 truncate first-letter:uppercase'>{displayTitle}</span>
            </div>
          </>
        )}
      </div>
      <div className='flex shrink-0 items-center gap-1.5 pl-10'>{navigationSlot}</div>
    </div>
  );
};

export default TaskTopbar;
