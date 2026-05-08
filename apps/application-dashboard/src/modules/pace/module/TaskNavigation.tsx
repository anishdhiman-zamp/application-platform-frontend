import { memo } from 'react';
import { TooltipV2 } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { ArrowDown, ArrowUp } from 'lucide-react';

interface TaskNavigationProps {
  currentIndex: number;
  totalCount: number;
  hasNext: boolean;
  hasPrevious: boolean;
  isLoading: boolean;
  isBootstrapping: boolean;
  onGoToNextTask: () => void;
  onGoToPreviousTask: () => void;
  tone?: 'light' | 'dark';
}

const TaskNavigation = memo(
  ({
    currentIndex,
    totalCount,
    hasNext,
    hasPrevious,
    isLoading,
    isBootstrapping,
    onGoToNextTask,
    onGoToPreviousTask,
    tone = 'light',
  }: TaskNavigationProps) => {
    const isDark = tone === 'dark';

    if (isBootstrapping) {
      return (
        <div className='flex animate-pulse items-center'>
          <div className='bg-GRAY_200 mr-3 h-4 w-10 rounded' />
          <div
            className={cn(
              'h-8 w-8 rounded-lg border',
              isDark ? 'border-GRAY_300 bg-GRAY_100' : 'border-GRAY_400 bg-GRAY_100',
            )}
          />
          <div
            className={cn(
              'h-8 w-8 rounded-lg border',
              isDark ? 'border-GRAY_300 bg-GRAY_100' : 'border-GRAY_400 bg-GRAY_100',
            )}
          />
        </div>
      );
    }

    if (totalCount === 0 || currentIndex === -1) return null;

    return (
      <div className='flex shrink-0 items-center'>
        <span className={cn('f-13-450 mr-3 whitespace-nowrap', isDark ? 'text-GRAY_1000/80' : 'text-GRAY_900')}>
          {currentIndex + 1} / {totalCount}
        </span>

        <TooltipV2 tooltipBody='Go to next task'>
          <ArrowDown
            id='arrow-down'
            size={16}
            className={cn(
              'box-content shrink-0 rounded-lg p-2 transition-opacity',
              isDark ? 'text-GRAY_1000' : 'text-GRAY_900',
              isLoading || !hasNext
                ? 'cursor-not-allowed opacity-40'
                : isDark
                  ? 'hover:bg-GRAY_100 cursor-pointer'
                  : 'hover:bg-GRAY_200 cursor-pointer',
            )}
            onClick={() => {
              if (isLoading || !hasNext) return;
              onGoToNextTask();
            }}
          />
        </TooltipV2>

        <TooltipV2 tooltipBody='Go to previous task'>
          <ArrowUp
            id='arrow-up'
            size={16}
            className={cn(
              'box-content shrink-0 rounded-lg p-2 transition-opacity',
              isDark ? 'text-GRAY_1000' : 'text-GRAY_900',
              isLoading || !hasPrevious
                ? 'cursor-not-allowed opacity-40'
                : isDark
                  ? 'hover:bg-GRAY_100 cursor-pointer'
                  : 'hover:bg-GRAY_200 cursor-pointer',
            )}
            onClick={() => {
              if (isLoading || !hasPrevious) return;
              onGoToPreviousTask();
            }}
          />
        </TooltipV2>
      </div>
    );
  },
);

TaskNavigation.displayName = 'TaskNavigation';

export default TaskNavigation;
