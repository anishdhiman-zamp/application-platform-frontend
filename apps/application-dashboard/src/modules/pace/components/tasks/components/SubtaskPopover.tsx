'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { SiblingTask, TaskBreadcrumb } from '@zamp-platform/chat';
import { Button, Popover, PopoverContent, PopoverTrigger } from '@zamp-platform/ui';
import { preserveSidebarParam } from 'modules/pace/pace.utils';
import { useRouter } from 'next/navigation';
import { getChatTaskRoute } from '@/constants/routeConfig';
import NestedSubtaskCount from '@/modules/pace/components/tasks/components/NestedSubtaskCount';
import ProgressWheel from '@/modules/pace/components/tasks/components/ProgressWheel';
import SubtaskListItem from '@/modules/pace/components/tasks/components/SubtaskListItem';
import type { SubTask } from '@/modules/pace/components/tasks/types/tasks.types';

const POPOVER_WIDTH = 424;
const POPOVER_MAX_HEIGHT = 500;

interface SubtaskPopoverProps {
  subtasks: SubTask[];
  completedCount: number;
  totalCount: number;
  parentTasks?: TaskBreadcrumb[];
}

const HOVER_OPEN_DELAY = 200;
const HOVER_CLOSE_DELAY = 300;

const SubtaskPopover = ({ subtasks, completedCount, totalCount, parentTasks }: SubtaskPopoverProps) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearHoverTimeout = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  };

  const handleMouseEnter = useCallback(() => {
    clearHoverTimeout();
    hoverTimeoutRef.current = setTimeout(() => setIsOpen(true), HOVER_OPEN_DELAY);
  }, [clearHoverTimeout]);

  const handleMouseLeave = useCallback(() => {
    clearHoverTimeout();
    hoverTimeoutRef.current = setTimeout(() => setIsOpen(false), HOVER_CLOSE_DELAY);
  }, [clearHoverTimeout]);

  // Hoist shared computations — computed once, passed to all items
  const siblings: SiblingTask[] = useMemo(
    () => subtasks.map((s) => ({ id: s.id, title: s.title, status: s.status })),
    [subtasks],
  );

  const statusIndexMap = useMemo(() => {
    const counters = new Map<string, number>();
    const result = new Map<string, number>();

    for (const s of subtasks) {
      const count = counters.get(s.status) ?? 0;

      result.set(s.id, count);
      counters.set(s.status, count + 1);
    }

    return result;
  }, [subtasks]);

  const statusTotalMap = useMemo(() => {
    const map = new Map<string, number>();

    for (const s of subtasks) {
      map.set(s.status, (map.get(s.status) ?? 0) + 1);
    }

    return map;
  }, [subtasks]);

  const handleNavigate = useCallback(
    (subtask: SubTask, statusIndex: number, statusTotal: number) => {
      const route = getChatTaskRoute({
        taskId: subtask.id,
        taskTitle: subtask.title,
        parentTasks: parentTasks?.length ? parentTasks : undefined,
        siblings: siblings.length > 0 ? siblings : undefined,
        status: siblings.length > 0 ? subtask.status : undefined,
        currentIndex: statusIndex,
        totalRows: statusTotal,
      });

      router.push(preserveSidebarParam(route));
    },
    [router, parentTasks, siblings],
  );

  useEffect(() => {
    return clearHoverTimeout;
  }, [clearHoverTimeout]);

  useEffect(() => {
    if (!isOpen) return;

    const handleScroll = () => setIsOpen(false);

    window.addEventListener('scroll', handleScroll, { capture: true, passive: true });

    return () => window.removeEventListener('scroll', handleScroll, { capture: true });
  }, [isOpen]);

  return (
    <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
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
          className='border-GRAY_300 shadow-menu-shadow rounded-md p-1'
          style={{ width: POPOVER_WIDTH }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onOpenAutoFocus={(e) => e.preventDefault()}
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <div
            className='overflow-y-auto overscroll-contain [scrollbar-width:thin]'
            style={{ maxHeight: POPOVER_MAX_HEIGHT }}
          >
            {subtasks.map((subtask) => (
              <SubtaskListItem
                key={subtask.id}
                subtask={subtask}
                siblings={siblings}
                statusIndex={statusIndexMap.get(subtask.id) ?? 0}
                statusTotal={statusTotalMap.get(subtask.status) ?? 1}
                parentTasks={parentTasks}
                variant='popover'
                onNavigate={handleNavigate}
                nestedIndicator={
                  (subtask.subtasks?.length ?? 0) > 0 ? <NestedSubtaskCount subtasks={subtask.subtasks!} /> : undefined
                }
              />
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default SubtaskPopover;
