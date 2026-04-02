'use client';

import { useCallback, useState } from 'react';
import { TaskBreadcrumb as TaskBreadcrumbType, type TaskStatus, TaskStatusIcon } from '@zamp-platform/chat';
import { Button, Popover, PopoverContent, PopoverTrigger } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { ArrowLeft, ArrowUpRight, ChevronRight, Ellipsis } from 'lucide-react';
import { preserveSidebarParam } from 'modules/pace/pace.utils';
import { useRouter } from 'next/navigation';
import { getChatTaskRoute } from '@/constants/routeConfig';

interface TaskBreadcrumbNavProps {
  currentTitle: string;
  currentStatus?: string;
  parentTasks: TaskBreadcrumbType[];
  onBack: () => void;
}

const TaskBreadcrumbNav = ({ currentTitle, currentStatus, parentTasks, onBack }: TaskBreadcrumbNavProps) => {
  const router = useRouter();
  const [isMiddlePopoverOpen, setIsMiddlePopoverOpen] = useState(false);

  const handleNavigateToParent = useCallback(
    (parent: TaskBreadcrumbType, index: number) => {
      const ancestorsAbove = parentTasks?.slice(0, index);
      const taskRoute = getChatTaskRoute({
        taskId: parent.id,
        taskTitle: parent.title,
        parentTasks: ancestorsAbove?.length > 0 ? ancestorsAbove : undefined,
      });

      router.push(preserveSidebarParam(taskRoute));
    },
    [router, parentTasks],
  );

  if (parentTasks?.length === 0) return null;

  const firstParent = parentTasks?.[0];
  const middleParents = parentTasks?.slice(1);

  return (
    <div className='flex min-w-0 items-center gap-1'>
      <Button variant='ghost' size='icon' onClick={onBack} className='h-6 w-6 shrink-0' aria-label='Go to parent task'>
        <ArrowLeft size={16} className='text-GRAY_700' />
      </Button>

      <div
        role='button'
        onClick={() => handleNavigateToParent(firstParent, 0)}
        className='f-14-550 text-GRAY_700 hover:text-GRAY_1000 flex h-auto min-w-0 shrink cursor-pointer items-center gap-1.5 truncate px-1 py-0 transition-colors'
      >
        {firstParent?.status && <TaskStatusIcon status={firstParent?.status as TaskStatus} />}
        <span className='truncate'>{firstParent?.title}</span>
      </div>

      <ChevronRight size={12} className='text-GRAY_600 shrink-0' />

      {middleParents?.length > 0 && (
        <>
          {middleParents?.length === 1 ? (
            <>
              <Button
                variant='ghost'
                onClick={() => handleNavigateToParent(middleParents[0], 1)}
                className='f-14-550 text-GRAY_700 hover:text-GRAY_1000 flex h-auto min-w-0 shrink items-center gap-1.5 truncate px-1 py-0 transition-colors'
              >
                {middleParents[0]?.status && <TaskStatusIcon status={middleParents[0]?.status as TaskStatus} />}
                <span className='truncate'>{middleParents[0]?.title}</span>
              </Button>
              <ChevronRight size={12} className='text-GRAY_600 shrink-0' />
            </>
          ) : (
            <>
              <Popover open={isMiddlePopoverOpen} onOpenChange={setIsMiddlePopoverOpen}>
                <PopoverTrigger asChild>
                  <Button variant='ghost' className='h-6 w-6 shrink-0 px-0' aria-label='Show intermediate tasks'>
                    <Ellipsis size={14} className='text-GRAY_700' />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  align='start'
                  sideOffset={4}
                  className='border-GRAY_300 shadow-menu-shadow w-auto max-w-[320px] min-w-[200px] rounded-md p-1'
                >
                  {middleParents?.map((parent, idx) => (
                    <Button
                      key={parent?.id}
                      variant='ghost'
                      onClick={() => {
                        setIsMiddlePopoverOpen(false);
                        handleNavigateToParent(parent, idx + 1);
                      }}
                      className={cn(
                        'hover:bg-BG_GRAY_2 group flex h-10 w-full cursor-pointer items-center justify-start gap-2 rounded-md px-3',
                      )}
                    >
                      {parent?.status && <TaskStatusIcon status={parent?.status as TaskStatus} />}
                      <span className='f-13-450 text-GRAY_1000 min-w-0 flex-1 truncate text-left'>{parent?.title}</span>
                      <ArrowUpRight size={10} className='text-GRAY_700 shrink-0 opacity-0 group-hover:opacity-100' />
                    </Button>
                  ))}
                </PopoverContent>
              </Popover>
              <ChevronRight size={12} className='text-GRAY_600 shrink-0' />
            </>
          )}
        </>
      )}

      <div className='flex min-w-0 shrink items-center gap-1.5'>
        {currentStatus && <TaskStatusIcon status={currentStatus as TaskStatus} />}
        <span className='f-14-550 text-GRAY_1000 truncate'>{currentTitle}</span>
      </div>
    </div>
  );
};

export default TaskBreadcrumbNav;
