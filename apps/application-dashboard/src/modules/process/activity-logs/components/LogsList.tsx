import { FC, useEffect, useMemo, useRef } from 'react';
import { DATE_FORMATS } from '@zamp-platform/utils';
import { format } from 'date-fns';
import DateSeparator from 'modules/process/activity-logs/components/DateSeparator';
import Log from 'modules/process/activity-logs/components/Log';
import ReprocessBanner from 'modules/process/activity-logs/components/ReprocessBanner';
import { ACTIVITY_LOG_TYPE, type HandleShowArtifactsProps } from 'modules/process/process.types';
import type {
  ActivityLogsItemType,
  ActivityLogsResponseType,
  ReprocessingEventsResponseType,
  ReprocessingEventType,
} from '@/types/api/processApi.types';
import { ensureUTCTimestamp } from '@/utils/common';

interface LogsListProps {
  logs: ActivityLogsResponseType;
  reprocessingEvents?: ReprocessingEventsResponseType;
  handleShowArtifacts: (props: HandleShowArtifactsProps) => void;
  processId: string;
  activityId: string;
}

type LogItem = {
  type: ACTIVITY_LOG_TYPE.LOG;
  key: string;
  showDateSeparator: boolean;
  isLastLogOfDate: boolean;
  isLastLog: boolean;
  isNextItemReprocess: boolean;
  log: ActivityLogsItemType;
};

type ReprocessItem = {
  type: ACTIVITY_LOG_TYPE.REPROCESS;
  key: string;
  showDateSeparator: boolean;
  reprocessingEvent: ReprocessingEventType;
};

type MergedItem = LogItem | ReprocessItem;

const LogsList: FC<LogsListProps> = ({ logs, reprocessingEvents, handleShowArtifacts, processId, activityId }) => {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const mergedItems = useMemo(() => {
    const activityLogs = logs?.activity_logs ?? [];
    const reprocessEvents = reprocessingEvents?.reprocessing_events ?? [];

    // Create combined list with timestamps for sorting
    const combined: Array<{ timestamp: Date; item: MergedItem }> = [];

    // Add logs
    activityLogs.forEach((log, index) => {
      const timestamp = new Date(ensureUTCTimestamp(log.updated_at));
      const isLastLog = index === activityLogs.length - 1;

      combined.push({
        timestamp,
        item: {
          type: ACTIVITY_LOG_TYPE.LOG,
          key: log.log_group_id,
          showDateSeparator: false,
          isLastLogOfDate: false,
          isLastLog,
          isNextItemReprocess: false,
          log,
        },
      });
    });

    // Add reprocessing events
    reprocessEvents.forEach((event) => {
      const timestamp = new Date(ensureUTCTimestamp(event.created_at));

      combined.push({
        timestamp,
        item: {
          type: ACTIVITY_LOG_TYPE.REPROCESS,
          key: event.id,
          showDateSeparator: false,
          reprocessingEvent: event,
        },
      });
    });

    // Sort by timestamp
    combined.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    // Add date separators and update isLastLogOfDate
    let currentDate = '';
    const result: MergedItem[] = [];

    combined.forEach((entry, index) => {
      const itemDate = format(entry.timestamp, DATE_FORMATS.YYYYMMDD);
      const showDateSeparator = itemDate !== currentDate;

      currentDate = itemDate;

      // Calculate isLastLogOfDate and isNextItemReprocess for log items
      if (entry.item.type === ACTIVITY_LOG_TYPE.LOG) {
        const nextLogIndex = combined.slice(index + 1).findIndex((e) => e.item.type === ACTIVITY_LOG_TYPE.LOG);
        const nextLogEntry = nextLogIndex !== -1 ? combined[index + 1 + nextLogIndex] : null;
        const isLastLogOfDate = !nextLogEntry || format(nextLogEntry.timestamp, DATE_FORMATS.YYYYMMDD) !== itemDate;
        const isNextItemReprocess = combined[index + 1]?.item.type === ACTIVITY_LOG_TYPE.REPROCESS;

        result.push({
          ...entry.item,
          showDateSeparator,
          isLastLogOfDate,
          isNextItemReprocess,
        });
      } else {
        result.push({
          ...entry.item,
          showDateSeparator,
        });
      }
    });

    return result;
  }, [logs, reprocessingEvents]);

  useEffect(() => {
    if (bottomRef.current) {
      setTimeout(() => {
        if (bottomRef.current) {
          bottomRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  }, [bottomRef, mergedItems]);

  return (
    <>
      {mergedItems.map((item, index) => {
        const isOverallLastItem = index === mergedItems.length - 1;

        if (item.type === ACTIVITY_LOG_TYPE.REPROCESS) {
          return (
            <div key={`reprocess-${item.key}`}>
              {item.showDateSeparator && (
                <div className='px-8'>
                  <DateSeparator date={item.reprocessingEvent.created_at} />
                </div>
              )}
              {isOverallLastItem && <div ref={bottomRef} />}
              <ReprocessBanner reprocessingEvent={item.reprocessingEvent} />
            </div>
          );
        }

        return (
          <div key={`${item.log.id}${item.showDateSeparator ? '-separator' : ''}`} className='px-8'>
            {item.showDateSeparator && <DateSeparator date={item.log.updated_at} />}
            {isOverallLastItem && <div ref={bottomRef} />}
            <Log
              data={item.log}
              isLastLogOfDate={item.isLastLogOfDate}
              isLastLog={item.isLastLog}
              isNextItemReprocess={item.isNextItemReprocess}
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
