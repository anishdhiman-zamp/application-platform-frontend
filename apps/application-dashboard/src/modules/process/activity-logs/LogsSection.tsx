import { type FC, useEffect, useRef } from 'react';
import LogsList from 'modules/process/activity-logs/components/LogsList';
import LogsSkeleton from 'modules/process/activity-logs/loader/LogsSkeleton';
import type { HandleShowArtifactsProps } from 'modules/process/process.types';
import { useGetActivityLogsQuery, useGetReprocessingEventsQuery } from '@/apis/processes';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';

interface LogsSectionProps {
  processId: string;
  activityId: string;
  handleShowArtifacts: (props: HandleShowArtifactsProps) => void;
}

const LogsSection: FC<LogsSectionProps> = ({ handleShowArtifacts, processId, activityId }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    data: logs,
    isLoading: isLoadingLogs,
    isError: isErrorLogs,
    refetch: refetchLogs,
  } = useGetActivityLogsQuery(
    {
      processId: processId,
      activityRunId: activityId,
    },
    {
      skip: !processId || !activityId,
    },
  );

  const {
    data: reprocessingEvents,
    isLoading: isLoadingReprocessingEvents,
    isError: isErrorReprocessingEvents,
    refetch: refetchReprocessingEvents,
  } = useGetReprocessingEventsQuery(
    { processId, activityRunId: activityId },
    {
      skip: !processId || !activityId,
    },
  );

  const handleRefetch = () => {
    if (isErrorLogs) refetchLogs();
    if (isErrorReprocessingEvents) refetchReprocessingEvents();
  };

  useEffect(() => {
    if (logs?.activity_logs?.length && containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [logs?.activity_logs]);

  return (
    <CommonWrapper
      isLoading={isLoadingLogs || isLoadingReprocessingEvents}
      isError={isErrorLogs || isErrorReprocessingEvents}
      refetchFunction={handleRefetch}
      skeletonType={SkeletonTypes.CUSTOM}
      loader={<LogsSkeleton />}
      errorCardStyle='flex-1'
      className='h-full w-full flex-1 overflow-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
    >
      <div
        ref={containerRef}
        className='h-full flex-1 overflow-auto pb-40 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
      >
        {!!logs?.activity_logs?.length && (
          <LogsList
            logs={logs}
            reprocessingEvents={reprocessingEvents}
            processId={processId}
            activityId={activityId}
            handleShowArtifacts={handleShowArtifacts}
          />
        )}
      </div>
    </CommonWrapper>
  );
};

export default LogsSection;
