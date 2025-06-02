import { type FC, useEffect, useRef } from 'react';
import LogsList from 'modules/process/activity-logs/components/LogsList';
import LogsSkeleton from 'modules/process/activity-logs/loader/LogsSkeleton';
import { ARTIFACT_TYPE, CTA_ACTION } from 'modules/process/process.types';
import { useGetActivityLogsQuery } from '@/apis/processes';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';

interface LogsSectionProps {
  processId: string;
  activityId: string;
  handleShowArtifacts: (artifactType: ARTIFACT_TYPE, artifactId: string, action?: CTA_ACTION) => void;
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
      isLoading={isLoadingLogs}
      isError={isErrorLogs}
      refetchFunction={refetchLogs}
      skeletonType={SkeletonTypes.CUSTOM}
      loader={<LogsSkeleton />}
      errorCardStyle='flex-1'
      className='overflow-auto w-full flex-1 px-8 h-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]'
    >
      <div
        ref={containerRef}
        className='h-full flex-1 overflow-auto pb-40 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]'
      >
        {logs?.activity_logs?.length && <LogsList logs={logs} handleShowArtifacts={handleShowArtifacts} />}
      </div>
    </CommonWrapper>
  );
};

export default LogsSection;
