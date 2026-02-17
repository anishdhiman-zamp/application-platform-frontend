import { type FC, memo, useState } from 'react';
import { Button, toast } from '@zamp-platform/ui';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { cn } from '@zamp-platform/ui/utils';
import { Trash2 } from 'lucide-react';
import DeleteActivityDialog from 'modules/process/activity-logs/components/DeleteActivityDialog';
import TopbarStatusIcon from 'modules/process/common/TopbarStatusIcon';
import { useActivityNavigation } from 'modules/process/hooks/useActivityNavigation';
import { STATUS_ICON_COLOR_MAPPING } from 'modules/process/process.constant';
import { ACTIVITY_RUN_STATUS } from 'modules/process/process.types';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useDeleteActivityRunMutation, useGetActivitySummaryQuery } from '@/apis/processes';
import TooltipV2 from '@/components/common/TooltipV2';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import SkeletonElement from '@/components/skeletons/SkeletonElement';
import { getProcessRouteById } from '@/constants/routeConfig';

interface ActivityNavigationProps {
  processId: string;
  className?: string;
}

const LogTopbar: FC = () => {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const activityId = params?.activityId as string;
  const processId = params?.processId as string;
  const status = searchParams?.get('status');

  const [deleteActivityRun, { isLoading: isDeletingActivityRun }] = useDeleteActivityRunMutation();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleDeleteActivityRun = () => {
    deleteActivityRun({ processId, activityRunId: activityId })
      .unwrap()
      .then(() => {
        toast.success('Activity deleted successfully');
        setIsDeleteDialogOpen(false);
        router.replace(getProcessRouteById(processId, status as string));
      })
      .catch(() => {
        toast.error('Failed to delete activity');
      });
  };

  const {
    data: summaryData,
    isLoading: isLoadingSummary,
    isError: isErrorSummary,
  } = useGetActivitySummaryQuery({
    activityRunId: activityId as string,
    processId: processId as string,
  });

  return (
    <div className='border-GRAY_100 flex h-15 w-full items-center justify-between gap-x-6 overflow-x-auto border-b p-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
      <CommonWrapper
        className='flex items-center gap-x-2'
        isLoading={isLoadingSummary || isErrorSummary}
        loader={
          <div className='flex items-center gap-x-2'>
            <SkeletonElement className='h-6 w-20 rounded-full' />
            <SkeletonElement className='h-6 w-20 rounded-full' />
          </div>
        }
        skeletonType={SkeletonTypes.CUSTOM}
      >
        {summaryData?.summary?.header && (
          <div className='flex items-center gap-x-1'>
            <span className='f-13-550 text-GRAY_700 flex-shrink-0 capitalize'>{summaryData?.summary?.header?.key}</span>
            <span
              className='f-13-550 text-GRAY_1000 max-w-[200px] truncate'
              title={summaryData?.summary?.header?.value}
            >
              {summaryData?.summary?.header?.value || '---'}
            </span>
          </div>
        )}

        {summaryData?.summary?.status && (
          <div className='border-GRAY_400 bg-BG_GRAY_2 flex items-center gap-x-1.5 rounded-full border px-2 py-1'>
            <TopbarStatusIcon
              status={summaryData?.summary?.status as ACTIVITY_RUN_STATUS}
              fillColor={
                STATUS_ICON_COLOR_MAPPING[summaryData?.summary?.status as ACTIVITY_RUN_STATUS]?.tabStatusIcon?.fillColor
              }
              strokeColor={
                STATUS_ICON_COLOR_MAPPING[summaryData?.summary?.status as ACTIVITY_RUN_STATUS]?.tabStatusIcon
                  ?.strokeColor
              }
            />
            <span className='f-12-450 text-GRAY_1000 whitespace-nowrap'>
              {STATUS_ICON_COLOR_MAPPING[summaryData?.summary?.status as ACTIVITY_RUN_STATUS]?.label}
            </span>
          </div>
        )}
        <TooltipV2 tooltipBody='Delete activity' asChildTrigger>
          <Button
            variant='ghost'
            size='icon'
            className='text-GRAY_700 hover:text-GRAY_1000 h-8 w-8 [&_svg]:size-3.5'
            onClick={() => setIsDeleteDialogOpen(true)}
            leadingIcon={<Trash2 size={14} />}
            aria-label='Delete activity'
          />
        </TooltipV2>
        <DeleteActivityDialog
          isOpen={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          onDelete={handleDeleteActivityRun}
          isDeleting={isDeletingActivityRun}
        />
      </CommonWrapper>

      <ActivityNavigation processId={processId} />
    </div>
  );
};

const ActivityNavigation = memo(({ processId, className }: ActivityNavigationProps) => {
  const { currentIndex, totalCount, hasNext, hasPrevious, isLoading, goToNextActivity, goToPreviousActivity } =
    useActivityNavigation(processId);

  if (totalCount === 0 || currentIndex === -1) return null;

  return (
    <div className={cn('flex items-center', className)}>
      <span className='f-13-450 text-GRAY_900 mr-3 whitespace-nowrap'>
        {currentIndex + 1} / {totalCount}
      </span>

      <TooltipV2 tooltipBody='Go to next activity'>
        <SvgSpriteLoader
          id='arrow-down'
          size={16}
          className={cn(
            'border-GRAY_400 mr-1.5 rounded-lg border p-1 transition-opacity',
            isLoading || !hasNext ? 'opacity-50' : 'cursor-pointer',
          )}
          onClick={() => {
            if (isLoading || !hasNext) return;
            goToNextActivity();
          }}
        />
      </TooltipV2>

      <TooltipV2 tooltipBody='Go to previous activity'>
        <SvgSpriteLoader
          id='arrow-up'
          size={16}
          className={cn(
            'border-GRAY_400 rounded-lg border p-1 transition-opacity',
            isLoading || !hasPrevious ? 'opacity-50' : 'cursor-pointer',
          )}
          onClick={() => {
            if (isLoading || !hasPrevious) return;
            goToPreviousActivity();
          }}
        />
      </TooltipV2>
    </div>
  );
});

ActivityNavigation.displayName = 'ActivityNavigation';

export default memo(LogTopbar);
