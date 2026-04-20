'use client';

import { type ReactNode, useMemo } from 'react';
import { TASK_STATUS } from '@zamp-platform/chat';
import { Button, Switch } from '@zamp-platform/ui';
import { ChevronsDownUp, ChevronsUpDown, CircleCheck } from 'lucide-react';
import Image from 'next/image';

export interface TaskChatStepsToggleHeaderProps {
  showSteps: boolean;
  onToggle: () => void;
  stepCount: number;
  isTaskDone: boolean;
  taskStatus: string | undefined;
  /** When true, shows the "Show Summary" control (step groups summary vs per-message view). */
  showSummaryControl?: boolean;
  showSummary?: boolean;
  onShowSummaryChange?: (checked: boolean) => void;
  showConnector?: boolean;
}

const TASK_PROCESS_LABELS = {
  STARTING: 'Starting now',
  ALL_DONE: 'All done',
  WAITING_FOR_RESPONSE: 'Waiting for response...',
  STEPS_COMPLETED: (count: number) => `${count} steps completed`,
} as const;

export const TaskChatStepsToggleHeader = ({
  showSteps,
  onToggle,
  stepCount,
  isTaskDone,
  taskStatus,
  showSummaryControl = false,
  showSummary = true,
  showConnector = true,
  onShowSummaryChange,
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
      <div className='flex w-full min-w-0 items-center justify-between gap-3'>
        <Button
          variant='ghost'
          onClick={onToggle}
          className='flex h-auto min-w-0 flex-1 items-center justify-start gap-1 self-start px-0 py-0 transition-colors hover:bg-transparent'
        >
          <div className='flex h-5 w-[30px] shrink-0 items-center justify-center'>{taskProcessLabelIcon}</div>
          <div className='flex min-w-0 items-center gap-2'>
            <span className='f-13-450 text-GRAY_700 truncate'>{taskProcessLabel}</span>
            {showSteps ? (
              <ChevronsDownUp size={14} className='text-GRAY_700 shrink-0' />
            ) : (
              <ChevronsUpDown size={14} className='text-GRAY_700 shrink-0' />
            )}
          </div>
        </Button>
        {showSummaryControl && onShowSummaryChange ? (
          <label className='bg-BG_WHITE flex shrink-0 cursor-pointer items-center gap-1 rounded-full py-0.5 pr-1 pl-2'>
            <span className='f-12-500 text-GRAY_1000 whitespace-nowrap'>Summarise</span>
            <Switch size='medium' checked={showSummary} onCheckedChange={onShowSummaryChange} />
          </label>
        ) : null}
      </div>
      {showConnector && (
        <div className='flex h-[15px] w-[30px] shrink-0 justify-center'>
          <div className='bg-border h-full w-px shrink-0' />
        </div>
      )}
    </div>
  );
};
