'use client';

import { useCallback, useMemo } from 'react';
import type { SiblingTask, TaskBreadcrumb } from '@zamp-platform/chat';
import { TASK_STATUS, TaskStatusIcon } from '@zamp-platform/chat';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, Button } from '@zamp-platform/ui';
import { ArrowRight } from 'lucide-react';
import { preserveSidebarParam } from 'modules/pace/pace.utils';
import { usePathname, useRouter } from 'next/navigation';
import { getChatTaskRoute, ROUTES_PATH } from '@/constants/routeConfig';
import ProgressWheel from '@/modules/pace/components/tasks/components/ProgressWheel';
import SubtaskPopover from '@/modules/pace/components/tasks/components/SubtaskPopover';
import type { SubTask } from '@/modules/pace/components/tasks/types/tasks.types';
import { markNavAsSubtask } from '@/modules/pace/hooks/useTabRouter';

interface InlineSubtaskSectionProps {
  subtasks: SubTask[];
  parentTasks: TaskBreadcrumb[];
}

const InlineSubtaskSection = ({ subtasks, parentTasks }: InlineSubtaskSectionProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const inChat = pathname === ROUTES_PATH.CHAT;

  const totalCount = subtasks.length;
  const completedCount = useMemo(() => subtasks.filter((s) => s.status === TASK_STATUS.COMPLETED).length, [subtasks]);

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
    (subtask: SubTask) => {
      const statusIndex = statusIndexMap.get(subtask.id) ?? 0;
      const statusTotal = statusTotalMap.get(subtask.status) ?? 1;
      const route = getChatTaskRoute({
        taskId: subtask.id,
        taskTitle: subtask.title,
        parentTasks,
        status: subtask.status,
        currentIndex: statusIndex,
        totalRows: statusTotal,
        siblings,
        inChat,
      });

      if (inChat) markNavAsSubtask(subtask.id);
      router.push(preserveSidebarParam(route));
    },
    [router, parentTasks, siblings, statusIndexMap, statusTotalMap, inChat],
  );

  if (totalCount === 0) return null;

  return (
    <Accordion type='single' defaultValue='subtasks' collapsible>
      <AccordionItem value='subtasks' className='border-b-0'>
        <AccordionTrigger className='cursor-pointer flex-row-reverse justify-end gap-1.5 py-0 font-normal [&>svg]:h-3 [&>svg]:w-3'>
          <span className='f-13-500 text-GRAY_900'>Sub-tasks</span>
          <div className='flex items-center gap-1.5'>
            <ProgressWheel completed={completedCount} total={totalCount} />
            <span className='f-12-450 text-GRAY_1000 tabular-nums'>
              {completedCount}/{totalCount}
            </span>
          </div>
        </AccordionTrigger>
        <AccordionContent className='pt-2 pb-0'>
          <div className='flex flex-col'>
            {subtasks.map((subtask) => {
              const nestedSubtasks = subtask.subtasks ?? [];
              const hasNested = nestedSubtasks.length > 0;

              return (
                <Button
                  key={subtask.id}
                  variant='ghost'
                  onClick={() => handleNavigate(subtask)}
                  className='group flex h-10 w-full cursor-pointer items-center justify-start gap-2 rounded-md px-4 py-2.5'
                >
                  <TaskStatusIcon status={subtask.status} />
                  <span className='f-13-450 text-GRAY_1000 min-w-0 flex-1 truncate text-left leading-[1.4]'>
                    {subtask.title}
                  </span>
                  {hasNested ? (
                    <div
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onMouseDown={(e) => e.stopPropagation()}
                    >
                      <SubtaskPopover
                        subtasks={nestedSubtasks}
                        completedCount={nestedSubtasks.filter((s) => s.status === TASK_STATUS.COMPLETED).length}
                        totalCount={nestedSubtasks.length}
                        parentTasks={parentTasks}
                      />
                    </div>
                  ) : (
                    <ArrowRight
                      size={14}
                      className='text-GRAY_600 shrink-0 opacity-0 transition-opacity group-hover:opacity-100'
                    />
                  )}
                </Button>
              );
            })}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default InlineSubtaskSection;
