'use client';

import { useCallback, useMemo } from 'react';
import type { SiblingTask, TaskBreadcrumb } from '@zamp-platform/chat';
import { TASK_STATUS } from '@zamp-platform/chat';
import { AnimatePresence, motion } from 'framer-motion';
import { preserveSidebarParam } from 'modules/pace/pace.utils';
import { usePathname, useRouter } from 'next/navigation';
import { getChatTaskRoute, ROUTES_PATH } from '@/constants/routeConfig';
import ProgressWheel from '@/modules/pace/components/tasks/components/ProgressWheel';
import SubtaskListItem from '@/modules/pace/components/tasks/components/SubtaskListItem';
import SubtaskPopover from '@/modules/pace/components/tasks/components/SubtaskPopover';
import type { SubTask } from '@/modules/pace/components/tasks/types/tasks.types';
import { markNavAsSubtask } from '@/modules/pace/hooks/useTabRouter';

const SUBTASK_PANEL_WIDTH = 300;

interface SubtaskPanelProps {
  subtasks: SubTask[];
  parentTasks: TaskBreadcrumb[];
}

const SubtaskPanel = ({ subtasks, parentTasks }: SubtaskPanelProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const inChat = pathname === ROUTES_PATH.CHAT;

  const totalCount = subtasks.length;
  const completedCount = useMemo(() => subtasks.filter((s) => s.status === TASK_STATUS.COMPLETED).length, [subtasks]);

  // Hoist shared computations — computed once, passed to all rows
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
    [router, parentTasks, siblings, inChat],
  );

  return (
    <AnimatePresence>
      {totalCount > 0 && (
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: SUBTASK_PANEL_WIDTH, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className='border-GRAY_100 flex h-full shrink-0 flex-col overflow-hidden border-l'
        >
          <div className='flex flex-col overflow-hidden' style={{ minWidth: SUBTASK_PANEL_WIDTH }}>
            {/* Header */}
            <div className='flex items-center gap-2 px-4 pt-4 pb-3'>
              <span className='f-13-550 text-GRAY_1000'>Sub-tasks</span>
              <ProgressWheel completed={completedCount} total={totalCount} />
              <span className='f-12-450 text-GRAY_700 tabular-nums'>
                {completedCount}/{totalCount}
              </span>
            </div>

            {/* Subtask list */}
            <div className='flex flex-1 flex-col overflow-y-auto [scrollbar-width:thin]'>
              {subtasks.map((subtask) => (
                <SubtaskListItem
                  key={subtask.id}
                  subtask={subtask}
                  siblings={siblings}
                  statusIndex={statusIndexMap.get(subtask.id) ?? 0}
                  statusTotal={statusTotalMap.get(subtask.status) ?? 1}
                  parentTasks={parentTasks}
                  variant='panel'
                  onNavigate={handleNavigate}
                  nestedIndicator={
                    (subtask.subtasks?.length ?? 0) > 0 ? (
                      <SubtaskPopover
                        subtasks={subtask.subtasks!}
                        completedCount={subtask.subtasks!.filter((s) => s.status === TASK_STATUS.COMPLETED).length}
                        totalCount={subtask.subtasks!.length}
                        parentTasks={parentTasks}
                      />
                    ) : undefined
                  }
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SubtaskPanel;
