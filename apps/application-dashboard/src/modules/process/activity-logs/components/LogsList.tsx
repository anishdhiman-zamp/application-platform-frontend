import { FC, useEffect, useMemo, useRef } from 'react';
import { format } from 'date-fns';
import DateSeparator from 'modules/process/activity-logs/components/DateSeparator';
import Log from 'modules/process/activity-logs/components/Log';
import { type HandleShowArtifactsProps } from 'modules/process/process.types';
import { DATE_FORMATS } from '@/constants/date.constants';
import type { ActivityLogsResponseType } from '@/types/api/processApi.types';

interface LogsListProps {
  logs: ActivityLogsResponseType;
  handleShowArtifacts: (props: HandleShowArtifactsProps) => void;
  processId: string;
  activityId: string;
}

const LogsList: FC<LogsListProps> = ({ logs, handleShowArtifacts, processId, activityId }) => {
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const logsWithSeparators = useMemo(() => {
    let currentDate = '';

    return logs?.activity_logs?.map((log, index) => {
      const logDate = format(new Date(log.updated_at), DATE_FORMATS.YYYYMMDD);
      const showDateSeparator = logDate !== currentDate;

      const isLastLog = index === logs?.activity_logs?.length - 1;
      const isLastLogOfDate =
        index === logs?.activity_logs?.length - 1 ||
        format(new Date(logs?.activity_logs[index + 1]?.updated_at), DATE_FORMATS.YYYYMMDD) !== logDate;

      currentDate = showDateSeparator ? logDate : currentDate;

      return {
        key: log?.log_group_id,
        showDateSeparator,
        isLastLogOfDate,
        isLastLog,
        log,
      };
    });
  }, [logs]);

  useEffect(() => {
    if (bottomRef.current) {
      setTimeout(() => {
        if (bottomRef.current) {
          bottomRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  }, [bottomRef, logsWithSeparators]);

  return (
    <>
      {logsWithSeparators?.map(({ key, showDateSeparator, isLastLogOfDate, isLastLog, log }, index) => {
        const isOverallLastLog = index === logsWithSeparators?.length - 1;

        return (
          <div key={`${key}${showDateSeparator ? '-separator' : ''}`}>
            {showDateSeparator && <DateSeparator date={log?.updated_at} />}
            {isOverallLastLog && <div ref={bottomRef} />}
            <Log
              data={log}
              isLastLogOfDate={isLastLogOfDate}
              isLastLog={isLastLog}
              handleShowArtifacts={handleShowArtifacts}
              processId={processId}
              activityId={activityId}
            />
          </div>
        );
      })}
    </>
  );
};

export default LogsList;
