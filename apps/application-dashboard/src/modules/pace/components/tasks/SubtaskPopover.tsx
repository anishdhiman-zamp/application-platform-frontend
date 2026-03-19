'use client';

import { type FC, useCallback, useEffect, useState } from 'react';
import { TaskStatusIcon } from '@zamp-platform/chat';
import { Button, Popover, PopoverContent, PopoverTrigger } from '@zamp-platform/ui';
import { ArrowUpRight, Loader2 } from 'lucide-react';
import type { SubTask } from 'modules/pace/components/tasks/task-listing.types';

interface SubtaskPopoverProps {
  subtasks: SubTask[];
  completedCount: number;
  totalCount: number;
}

interface SubtaskItemProps {
  subtask: SubTask;
}

const SubtaskItem: FC<SubtaskItemProps> = ({ subtask }) => {
  return (
    <div className='hover:bg-BG_GRAY_2 group flex h-10 cursor-pointer items-center justify-between rounded-[6px] px-3'>
      <div className='flex min-w-0 flex-1 items-center gap-2'>
        <TaskStatusIcon status={subtask.status} />
        <span className='f-13-450 text-GRAY_1000 min-w-0 flex-1 truncate leading-[1.4]'>{subtask.title}</span>
      </div>
      <ArrowUpRight size={10} className='text-GRAY_700 shrink-0 opacity-0 group-hover:opacity-100' />
    </div>
  );
};

const SubtaskPopover: FC<SubtaskPopoverProps> = ({ subtasks, completedCount, totalCount }) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const handleScroll = () => setIsOpen(false);

    window.addEventListener('scroll', handleScroll, { capture: true, passive: true });

    return () => window.removeEventListener('scroll', handleScroll, { capture: true });
  }, [isOpen]);

  const handleOpenChange = useCallback((open: boolean) => setIsOpen(open), []);

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant='ghost' size='icon' className='flex h-auto w-auto items-center gap-1.5 p-0'>
          <Loader2 size={14} className='text-GRAY_1000 shrink-0' />
          <span
            className='f-12-450 text-GRAY_1000 w-[21px] leading-[11px]'
            style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}
          >
            {completedCount}/{totalCount}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align='start'
        sideOffset={4}
        className='w-[424px] rounded-[6px] border-[#e6e5e5] p-1 shadow-[1px_2px_10px_0px_rgba(0,0,0,0.05)]'
      >
        <div className='max-h-[500px] overflow-y-auto overscroll-contain [scrollbar-width:thin]'>
          {subtasks.map((subtask) => (
            <SubtaskItem key={subtask.id} subtask={subtask} />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default SubtaskPopover;
