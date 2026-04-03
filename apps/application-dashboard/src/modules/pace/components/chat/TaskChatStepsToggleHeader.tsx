'use client';

import { type ReactNode, useMemo } from 'react';
import { TASK_STATUS } from '@zamp-platform/chat';
import { Button } from '@zamp-platform/ui';
import { ChevronsDownUp, ChevronsUpDown, CircleCheck } from 'lucide-react';
import Image from 'next/image';

export interface TaskChatStepsToggleHeaderProps {
  showSteps: boolean;
  onToggle: () => void;
  stepCount: number;
  isTaskDone: boolean;
  taskStatus: string | undefined;
}

const TASK_PROCESS_LABELS = {
  STARTING: 'Starting now',
  ALL_DONE: 'All done!',
  WAITING_FOR_RESPONSE: 'Waiting for response...',
  STEPS_COMPLETED: (count: number) => `${count} steps completed`,
} as const;

export const TaskChatStepsToggleHeader = ({
  showSteps,
  onToggle,
  stepCount,
  isTaskDone,
  taskStatus,
}: TaskChatStepsToggleHeaderProps) => {
  const { taskProcessLabel, taskProcessLabelIcon } = useMemo(() => {
    let label = TASK_PROCESS_LABELS.STEPS_COMPLETED(stepCount);
    let icon: ReactNode = (
      <div className='animate-scale dark:brightness-0 dark:invert'>
        <Image src='/icons/pace/pace-streaming.svg' alt='Pace Avatar' height={20} width={20} />
      </div>
    );

    if (stepCount === 0) label = TASK_PROCESS_LABELS.STARTING;

    if (isTaskDone) {
      label = TASK_PROCESS_LABELS.ALL_DONE;
      icon = <CircleCheck className='text-GREEN_700 size-4' />;
    }

    if (taskStatus === TASK_STATUS.NEEDS_INPUT) {
      label = TASK_PROCESS_LABELS.WAITING_FOR_RESPONSE;
      icon = (
        <div className='animate-scale dark:brightness-0 dark:invert'>
          <Image src='/icons/pace/pace-streaming-orange.svg' alt='Pace Avatar' height={20} width={20} />
        </div>
      );
    }

    return { taskProcessLabel: label, taskProcessLabelIcon: icon };
  }, [isTaskDone, stepCount, taskStatus]);

  return (
    <div className='bg-BG_WHITE z-[3] flex flex-col'>
      <Button
        variant='ghost'
        onClick={onToggle}
        className='flex h-auto w-auto items-center gap-1 self-start px-0 py-0 transition-colors hover:bg-transparent'
      >
        <div className='flex h-5 w-7.5 items-center justify-center'>{taskProcessLabelIcon}</div>
        <div className='flex items-center gap-2'>
          <span className='f-13-450 text-GRAY_800 whitespace-nowrap'>{taskProcessLabel}</span>
          {showSteps ? (
            <ChevronsDownUp size={14} className='text-GRAY_700' />
          ) : (
            <ChevronsUpDown size={14} className='text-GRAY_700' />
          )}
        </div>
      </Button>
      <div className='flex h-[15px] w-7.5 justify-center'>
        <div className='border-GRAY_400 h-full w-0 border-l' />
      </div>
    </div>
  );
};
