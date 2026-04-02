'use client';

import { useMemo } from 'react';
import { TASK_STATUS } from '@zamp-platform/chat';
import ProgressWheel from '@/modules/pace/components/tasks/components/ProgressWheel';
import type { SubTask } from '@/modules/pace/components/tasks/types/tasks.types';

interface NestedSubtaskCountProps {
  subtasks: SubTask[];
}

const NestedSubtaskCount = ({ subtasks }: NestedSubtaskCountProps) => {
  const completed = useMemo(() => subtasks.filter((s) => s.status === TASK_STATUS.COMPLETED).length, [subtasks]);

  return (
    <div className='flex shrink-0 items-center gap-1.5'>
      <ProgressWheel completed={completed} total={subtasks.length} />
      <span className='f-12-450 text-GRAY_1000 tabular-nums'>
        {completed}/{subtasks.length}
      </span>
    </div>
  );
};

export default NestedSubtaskCount;
