import { type FC, memo, useMemo } from 'react';
import { format } from 'date-fns';
import LogCta from 'modules/process/activity-logs/components/LogCta';
import LogStatusIndicator from 'modules/process/activity-logs/components/LogStatusIndicator';
import ReasoningAccordion from 'modules/process/activity-logs/components/ReasoningAccordion';
import SenderInfo from 'modules/process/activity-logs/components/SenderInfo';
import { LOG_STATUS_ICON_COLOR_MAPPING } from 'modules/process/process.constant';
import { CONTENT_TYPE, type HandleShowArtifactsProps, LOG_STATUS, SENDER_TYPE } from 'modules/process/process.types';
import { DATE_FORMATS } from '@/constants/date.constants';
import type { ActivityLogsItemType } from '@/types/api/processApi.types';
import { capitalizeFirstLetter, cn } from '@/utils/common';

type LogProps = {
  isLastLog?: boolean;
  data: ActivityLogsItemType;
  handleShowArtifacts: (props: HandleShowArtifactsProps) => void;
  isExpanded?: boolean;
  processId: string;
  activityId: string;
};

const Log: FC<LogProps> = ({ isLastLog = false, data, handleShowArtifacts, processId, activityId }) => {
  const {
    content: { message, thought_steps, ctas, sender_type, sender_details },
    status,
    content_type,
    updated_at,
    log_group_id,
  } = data;

  const isSenderInfoVisible = useMemo(() => {
    return (
      (content_type === CONTENT_TYPE.REPLIED_TO_SECTION && sender_type === SENDER_TYPE.SYSTEM) ||
      (content_type === CONTENT_TYPE.REPLIED_TO_SECTION && sender_type === SENDER_TYPE.USER)
    );
  }, [content_type, sender_type]);

  const statusIndicatorColor = useMemo(() => {
    if (sender_type === SENDER_TYPE.SYSTEM && content_type === CONTENT_TYPE.REPLIED_TO_SECTION) {
      return {
        status: LOG_STATUS.MESSAGE_FROM_ADAM,
        fillColor: LOG_STATUS_ICON_COLOR_MAPPING[LOG_STATUS.MESSAGE_FROM_ADAM]?.fillColor,
        strokeColor: LOG_STATUS_ICON_COLOR_MAPPING[LOG_STATUS.MESSAGE_FROM_ADAM]?.strokeColor,
      };
    }

    if (sender_type === SENDER_TYPE.USER && content_type === CONTENT_TYPE.REPLIED_TO_SECTION) {
      return {
        status: LOG_STATUS.MESSAGE_FROM_USER,
        fillColor: LOG_STATUS_ICON_COLOR_MAPPING[LOG_STATUS.MESSAGE_FROM_USER]?.fillColor,
        strokeColor: LOG_STATUS_ICON_COLOR_MAPPING[LOG_STATUS.MESSAGE_FROM_USER]?.strokeColor,
      };
    }

    return {
      status: status as LOG_STATUS,
      fillColor: LOG_STATUS_ICON_COLOR_MAPPING[status as LOG_STATUS]?.fillColor,
      strokeColor: LOG_STATUS_ICON_COLOR_MAPPING[status as LOG_STATUS]?.strokeColor,
    };
  }, [status, content_type, sender_type]);

  const formattedTime = useMemo(() => {
    return format(new Date(updated_at), DATE_FORMATS.HH_MM_A);
  }, [updated_at]);

  return (
    <div className={cn('flex w-full items-start justify-start gap-x-5 pt-1')} data-log-id={data?.log_group_id}>
      <div className='flex w-14 shrink-0 items-start justify-start'>
        <span className='f-12-450 text-GRAY_700 whitespace-nowrap'>{formattedTime}</span>
      </div>
      <div
        className={cn(
          'border-GRAY_100 relative flex w-full min-w-0 flex-col items-start justify-start border-l pb-10 pl-5',
          {
            'border-white pb-0': isLastLog,
          },
        )}
      >
        <div className={cn('absolute top-0 -left-2.5 flex w-5 items-start justify-center bg-white pt-[2px] pb-2')}>
          <LogStatusIndicator
            status={statusIndicatorColor.status}
            fillColor={statusIndicatorColor.fillColor}
            strokeColor={statusIndicatorColor.strokeColor}
          />
        </div>
        <p
          className={cn('f-13-450 text-GRAY_1000 w-full text-left break-words', {
            'animate-pulse': status === LOG_STATUS.LOADING,
          })}
        >
          {capitalizeFirstLetter(message)}
        </p>
        {thought_steps?.length > 0 && <ReasoningAccordion thoughtSteps={thought_steps} logGroupId={log_group_id} />}
        {ctas && (
          <LogCta
            ctas={ctas}
            logGroupId={log_group_id}
            processId={processId}
            activityId={activityId}
            handleShowArtifacts={handleShowArtifacts}
          />
        )}
        {isSenderInfoVisible && <SenderInfo senderType={sender_type} senderDetails={sender_details} status={status} />}
      </div>
    </div>
  );
};

export default memo(Log);
