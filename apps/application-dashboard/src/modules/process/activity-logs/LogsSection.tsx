import type { FC } from 'react';
import { format } from 'date-fns';
import DateSeparator from 'modules/process/activity-logs/components/DateSeparator';
import Log from 'modules/process/activity-logs/components/Log';
import LogsSkeleton from 'modules/process/activity-logs/loader/LogsSkeleton';
import { useGetActivityLogsQuery } from '@/apis/processes';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import { DATE_FORMATS } from '@/constants/date.constants';

interface LogsSectionProps {
  processId: string;
  activityId: string;
  setShowSummary: (showSummary: boolean) => void;
}

const LogsSection: FC<LogsSectionProps> = ({ setShowSummary, processId, activityId }) => {
  const {
    data: logs,
    isLoading: isLoadingLogs,
    isError: isErrorLogs,
    refetch: refetchLogs,
  } = useGetActivityLogsQuery({
    processId: processId,
    activityRunId: activityId,
  });

  const renderLogs = () => {
    if (!logs?.activity_logs?.length) return null;

    let currentDate = '';

    return logs?.activity_logs?.map((log, index) => {
      const logDate = format(new Date(log?.updated_at), DATE_FORMATS.YYYYMMDD);
      const showDateSeparator = logDate !== currentDate;

      const isLastLogOfDate =
        index === logs.activity_logs.length - 1 ||
        format(new Date(logs.activity_logs[index + 1]?.updated_at), DATE_FORMATS.YYYYMMDD) !== logDate;

      if (showDateSeparator) {
        currentDate = logDate;

        return (
          <div
            key={`${log?.id}-separator`}
            onClick={() => {
              setShowSummary(true);
            }}
          >
            <DateSeparator date={log?.updated_at} />
            <Log data={log} isLastLog={isLastLogOfDate} />
          </div>
        );
      }

      return <Log key={log?.id} data={log} isLastLog={isLastLogOfDate} />;
    });
  };

  return (
    <CommonWrapper
      isLoading={isLoadingLogs}
      isError={isErrorLogs}
      refetchFunction={refetchLogs}
      skeletonType={SkeletonTypes.CUSTOM}
      loader={<LogsSkeleton />}
      className='overflow-auto w-full flex-1 px-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]'
    >
      {renderLogs()}
    </CommonWrapper>
  );
};

export default LogsSection;
