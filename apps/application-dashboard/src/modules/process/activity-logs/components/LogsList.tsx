import { FC, useEffect, useMemo, useRef } from 'react';
import { format } from 'date-fns';
import DateSeparator from 'modules/process/activity-logs/components/DateSeparator';
import Log from 'modules/process/activity-logs/components/Log';
import { ARTIFACT_TYPE, CTA_ACTION } from 'modules/process/process.types';
import { DATE_FORMATS } from '@/constants/date.constants';
import type { ActivityLogsResponseType } from '@/types/api/processApi.types';
import type { MapAny } from '@/types/commonTypes';

interface LogsListProps {
  logs: ActivityLogsResponseType;
  handleShowArtifacts: (artifactType: ARTIFACT_TYPE, artifactId: string, action?: CTA_ACTION, filters?: MapAny) => void;
}

const LogsList: FC<LogsListProps> = ({ logs, handleShowArtifacts }) => {
  const bottomRef = useRef<HTMLDivElement | null>(null);
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
      {logsWithSeparators?.map(({ key, showDateSeparator, isLastLogOfDate, log }, index) => {
        const isOverallLastLog = index === logsWithSeparators?.length - 1;

        return (
          <div key={`${key}${showDateSeparator ? '-separator' : ''}`}>
            {showDateSeparator && <DateSeparator date={log?.updated_at} />}
            {isOverallLastLog && <div ref={bottomRef} />}
            <Log data={log} isLastLog={isLastLogOfDate} handleShowArtifacts={handleShowArtifacts} />
          </div>
        );
      })}
    </>
  );
};

export default LogsList;
