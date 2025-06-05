import { type FC, useEffect, useMemo, useRef, useState } from 'react';
import { format } from 'date-fns';
import LogCta from 'modules/process/activity-logs/components/LogCta';
import LogStatusIndicator from 'modules/process/activity-logs/components/LogStatusIndicator';
import ReasoningAccordion from 'modules/process/activity-logs/components/ReasoningAccordion';
import SenderInfo from 'modules/process/activity-logs/components/SenderInfo';
import { LOG_STATUS_ICON_COLOR_MAPPING } from 'modules/process/process.constant';
import {
  type ARTIFACT_TYPE,
  CONTENT_TYPE,
  type CTA_ACTION,
  LOG_STATUS,
  SENDER_TYPE,
} from 'modules/process/process.types';
import { DATE_FORMATS } from '@/constants/date.constants';
import type { ActivityLogsItemType } from '@/types/api/processApi.types';
import { cn } from '@/utils/common';

type LogProps = {
  isLastLog?: boolean;
  data: ActivityLogsItemType;
  handleShowArtifacts: (artifactType: ARTIFACT_TYPE, artifactId: string, action?: CTA_ACTION) => void;
  isExpanded?: boolean;
};

const Log: FC<LogProps> = ({ isLastLog = false, data, handleShowArtifacts }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    content: { message, thought_steps, ctas, sender_type, sender_details },
    status,
    content_type,
    updated_at,
  } = data;
  const [containerHeight, setContainerHeight] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerHeight(entry.contentRect.height);
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

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

  return (
    <div className={cn('flex w-full items-start justify-start gap-x-5 pt-1')} data-log-id={data.id}>
      <div className='flex w-14 shrink-0 items-start justify-start'>
        <span className='f-12-450 text-GRAY_700 whitespace-nowrap'>
          {format(new Date(updated_at), DATE_FORMATS.HH_MM_A)}
        </span>
      </div>
      <div className={cn('flex h-full w-2.5 shrink-0 flex-col items-center justify-start gap-y-2 pt-[2px]')}>
        <LogStatusIndicator
          status={statusIndicatorColor.status}
          fillColor={statusIndicatorColor.fillColor}
          strokeColor={statusIndicatorColor.strokeColor}
        />
        {!isLastLog && <div className='bg-GRAY_400 w-px' style={{ height: `${containerHeight + 40}px` }} />}
      </div>
      <div className='flex w-full min-w-0 flex-col items-start justify-center' ref={containerRef}>
        <p
          className={cn('f-13-450 text-GRAY_1000 w-full text-left break-words', {
            'animate-pulse': status === LOG_STATUS.LOADING,
          })}
        >
          {message}
        </p>
        {thought_steps && thought_steps?.length > 0 && <ReasoningAccordion thoughtSteps={thought_steps} />}
        {ctas && <LogCta ctas={ctas} handleShowArtifacts={handleShowArtifacts} />}
        {isSenderInfoVisible && (
          <SenderInfo senderType={sender_type as SENDER_TYPE} senderDetails={sender_details} status={status} />
        )}
      </div>
    </div>
  );
};

export default Log;
