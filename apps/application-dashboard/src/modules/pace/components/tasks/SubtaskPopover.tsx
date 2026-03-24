'use client';

import { useCallback, useEffect, useState } from 'react';
import { TaskStatusIcon } from '@zamp-platform/chat';
import { Button, Popover, PopoverContent, PopoverTrigger } from '@zamp-platform/ui';
import { ArrowUpRight } from 'lucide-react';
import ProgressWheel from 'modules/pace/components/tasks/ProgressWheel';
import type { SubTask } from 'modules/pace/components/tasks/task-listing.types';
import { preserveSidebarParam } from 'modules/pace/pace.utils';
import { useRouter } from 'next/navigation';
import { getChatTaskRoute } from '@/constants/routeConfig';

interface SubtaskPopoverProps {
  subtasks: SubTask[];
  completedCount: number;
  totalCount: number;
}

interface SubtaskItemProps {
  subtask: SubTask;
}

const SubtaskItem = ({ subtask }: SubtaskItemProps) => {
  const router = useRouter();

  const handleClick = useCallback(() => {
    const taskRoute = getChatTaskRoute(subtask?.id || '', '', subtask?.title || '');

    router.push(preserveSidebarParam(taskRoute));
  }, [router, subtask?.id, subtask?.title]);

  return (
    <Button
      variant='ghost'
      onClick={handleClick}
      className='hover:bg-BG_GRAY_2 group flex h-10 w-full cursor-pointer items-center justify-between rounded-md px-3'
    >
      <div className='flex min-w-0 flex-1 items-center gap-2'>
        <TaskStatusIcon status={subtask?.status} />
        <span className='f-13-450 text-GRAY_1000 min-w-0 flex-1 truncate leading-[1.4]'>{subtask?.title}</span>
      </div>
      <ArrowUpRight size={10} className='text-GRAY_700 shrink-0 opacity-0 group-hover:opacity-100' />
    </Button>
  );
};

const SubtaskPopover = ({ subtasks, completedCount, totalCount }: SubtaskPopoverProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenChange = (open: boolean) => setIsOpen(open);

  useEffect(() => {
    if (!isOpen) return;

    const handleScroll = () => setIsOpen(false);

    window.addEventListener('scroll', handleScroll, { capture: true, passive: true });

    return () => window.removeEventListener('scroll', handleScroll, { capture: true });
  }, [isOpen]);

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant='outline' size='xsmall' className='h-auto w-auto gap-1.5 rounded-full px-2 py-1.5'>
          <ProgressWheel completed={completedCount} total={totalCount} />
          <span className='f-12-450 text-GRAY_1000 tabular-nums'>
            {completedCount}/{totalCount}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align='start'
        sideOffset={4}
        className='border-GRAY_300 shadow-menu-shadow w-[424px] rounded-md p-1'
      >
        <div className='max-h-[500px] overflow-y-auto overscroll-contain [scrollbar-width:thin]'>
          {subtasks.map((subtask) => (
            <SubtaskItem key={subtask?.id} subtask={subtask} />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default SubtaskPopover;
