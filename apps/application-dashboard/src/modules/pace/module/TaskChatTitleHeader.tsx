'use client';

import { type TaskStatus, TaskStatusIcon } from '@zamp-platform/chat';

export interface TaskChatTitleHeaderProps {
  displayTitle: string;
  statusLabel: string;
  effectiveStatus: TaskStatus | undefined;
  description?: string | null;
}

export const TaskChatTitleHeader = ({
  displayTitle,
  statusLabel,
  effectiveStatus,
  description,
}: TaskChatTitleHeaderProps) => {
  return (
    <div className='flex flex-col gap-1.5'>
      <div className='flex items-start gap-2.5'>
        <h1 className='f-18-550 text-GRAY_1000'>{displayTitle}</h1>
        {statusLabel && effectiveStatus && (
          <div className='bg-BG_GRAY_2 border-GRAY_400 flex h-6 shrink-0 items-center gap-1.5 rounded-full border px-2 py-1'>
            <div className='flex size-3 items-center justify-center'>
              <TaskStatusIcon status={effectiveStatus} />
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
      {description && <p className='f-13-450 text-GRAY_700 leading-[1.4]'>{description}</p>}
    </div>
  );
};
