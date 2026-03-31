import { memo } from 'react';
import { cn } from '@zamp-platform/ui/utils';
import { ArrowDown, ArrowUp } from 'lucide-react';
import TooltipV2 from '@/components/common/TooltipV2';

interface TaskNavigationProps {
  currentIndex: number;
  totalCount: number;
  hasNext: boolean;
  hasPrevious: boolean;
  isLoading: boolean;
  isBootstrapping: boolean;
  onGoToNextTask: () => void;
  onGoToPreviousTask: () => void;
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
  }: TaskNavigationProps) => {
    if (isBootstrapping) {
      return (
        <div className='flex animate-pulse items-center'>
          <div className='bg-GRAY_200 mr-3 h-4 w-10 rounded' />
          <div className='border-GRAY_400 bg-GRAY_100 mr-1.5 h-6 w-6 rounded-lg border' />
          <div className='border-GRAY_400 bg-GRAY_100 h-6 w-6 rounded-lg border' />
        </div>
      );
    }

    if (totalCount === 0 || currentIndex === -1) return null;

    return (
      <div className='flex items-center'>
        <span className='f-13-450 text-GRAY_900 mr-3 whitespace-nowrap'>
          {currentIndex + 1} / {totalCount}
        </span>

        <TooltipV2 tooltipBody='Go to next task'>
          <ArrowDown
            id='arrow-down'
            size={26}
            className={cn(
              'border-GRAY_400 text-GRAY_900 mr-1.5 rounded-lg border p-1 transition-opacity',
              isLoading || !hasNext ? '!cursor-not-allowed opacity-50' : 'cursor-pointer',
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
            size={26}
            className={cn(
              'border-GRAY_400 text-GRAY_900 rounded-lg border p-1 transition-opacity',
              isLoading || !hasPrevious ? '!cursor-not-allowed opacity-50' : 'cursor-pointer',
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
