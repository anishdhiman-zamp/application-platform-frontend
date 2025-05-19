import { FC, useMemo } from 'react';
import { format } from 'date-fns';
import DateSeparator from 'modules/process/activity-logs/components/DateSeparator';
import Log from 'modules/process/activity-logs/components/Log';
import { DATE_FORMATS } from '@/constants/date.constants';
import type { ActivityLogsResponseType } from '@/types/api/processApi.types';

interface LogsListProps {
  logs: ActivityLogsResponseType | undefined;
  handleShowArtifacts: () => void;
}

const LogsList: FC<LogsListProps> = ({ logs, handleShowArtifacts }) => {
  const logsWithSeparators = useMemo(() => {
    let currentDate = '';

    return logs?.activity_logs?.map((log, index) => {
      const logDate = format(new Date(log.updated_at), DATE_FORMATS.YYYYMMDD);
      const showDateSeparator = logDate !== currentDate;
      const isLastLogOfDate =
        index === logs?.activity_logs?.length - 1 ||
        format(new Date(logs?.activity_logs[index + 1]?.updated_at), DATE_FORMATS.YYYYMMDD) !== logDate;

      currentDate = showDateSeparator ? logDate : currentDate;

      return {
        key: log.id,
        showDateSeparator,
        isLastLogOfDate,
        log,
      };
    });
  }, [logs]);

  return (
    <>
      {logsWithSeparators?.map(({ key, showDateSeparator, isLastLogOfDate, log }) => (
        <div key={`${key}${showDateSeparator ? '-separator' : ''}`}>
          {showDateSeparator && <DateSeparator date={log.updated_at} />}
          <Log data={log} isLastLog={isLastLogOfDate} handleShowArtifacts={handleShowArtifacts} />
        </div>
      ))}
    </>
  );
};

export default LogsList;
