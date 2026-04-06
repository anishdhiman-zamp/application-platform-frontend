'use client';

import { TASK_STATUS, type TaskStatus, TaskStatusIcon } from '@zamp-platform/chat';

export interface TaskChatTitleHeaderProps {
  displayTitle: string;
  statusLabel: string;
  isAgentActive: boolean;
  taskStatus: string | undefined;
}

export const TaskChatTitleHeader = ({
  displayTitle,
  statusLabel,
  isAgentActive,
  taskStatus,
}: TaskChatTitleHeaderProps) => {
  return (
    <div className='flex flex-col gap-1.5'>
      <div className='flex items-start gap-2.5'>
        <h1 className='f-18-550 text-GRAY_1000'>{displayTitle}</h1>
        {statusLabel && (
          <div className='bg-BG_GRAY_2 border-GRAY_400 flex h-6 shrink-0 items-center gap-1.5 rounded-full border px-2 py-1'>
            <div className='flex size-3 items-center justify-center'>
              <TaskStatusIcon
                status={
                  isAgentActive
                    ? TASK_STATUS.IN_PROGRESS
                    : ((taskStatus as TaskStatus | undefined) ?? TASK_STATUS.IN_PROGRESS)
                }
              />
            </div>
            <span
              className='f-12-450 text-GRAY_1000 whitespace-nowrap'
              style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}
            >
              {statusLabel}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
