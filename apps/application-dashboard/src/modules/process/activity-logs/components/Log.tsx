import { type FC, useEffect, useMemo, useRef, useState } from 'react';
import { format } from 'date-fns';
import LogCta from 'modules/process/activity-logs/components/LogCta';
import LogStatusIndicator from 'modules/process/activity-logs/components/LogStatusIndicator';
import ReasoningAccordion from 'modules/process/activity-logs/components/ReasoningAccordion';
import SenderInfo from 'modules/process/activity-logs/components/SenderInfo';
import { LOG_STATUS_ICON_COLOR_MAPPING } from 'modules/process/process.constant';
import { CONTENT_TYPE, LOG_STATUS, SENDER_TYPE } from 'modules/process/process.types';
import { DATE_FORMATS } from '@/constants/date.constants';
import type { ActivityLogsItemType } from '@/types/api/processApi.types';
import { cn } from '@/utils/common';

type LogProps = {
  isLastLog?: boolean;
  data: ActivityLogsItemType;
  handleShowArtifacts: () => void;
  isExpanded?: boolean;
};

const Log: FC<LogProps> = ({ isLastLog = false, data, handleShowArtifacts }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    content: { message, thought_steps, ctas, sender_type },
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
      (content_type === CONTENT_TYPE.REPLY_SECTION && sender_type === SENDER_TYPE.SYSTEM) ||
      (content_type === CONTENT_TYPE.REPLY_SECTION && sender_type === SENDER_TYPE.USER)
    );
  }, [content_type, sender_type]);

  return (
    <div className={cn('w-full flex justify-start items-start gap-x-5 pt-1')} data-log-id={data.id}>
      <div className='flex items-start justify-start shrink-0'>
        <span className='f-12-450 text-GRAY_700 whitespace-nowrap'>
          {format(new Date(updated_at), DATE_FORMATS.HH_MM_A)}
        </span>
      </div>
      <div className={cn('flex flex-col items-center justify-start h-full gap-y-2 pt-[2px] shrink-0')}>
        <LogStatusIndicator
          status={status as LOG_STATUS}
          fillColor={LOG_STATUS_ICON_COLOR_MAPPING[status as LOG_STATUS]?.fillColor}
          strokeColor={LOG_STATUS_ICON_COLOR_MAPPING[status as LOG_STATUS]?.strokeColor}
        />
        {!isLastLog && <div className='w-px bg-GRAY_400' style={{ height: `${containerHeight + 40}px` }} />}
        {!isLastLog && <div className='w-px bg-GRAY_400' style={{ height: `${containerHeight + 40}px` }} />}
      </div>
      <div className='flex flex-col items-start justify-center w-full min-w-0' ref={containerRef}>
        <p
          className={cn('f-13-450 text-GRAY_1000 break-words w-full', {
            'animate-pulse': status === LOG_STATUS.LOADING,
          })}
        >
          {message}
        </p>
        {thought_steps && thought_steps?.length > 0 && <ReasoningAccordion thoughtSteps={thought_steps} />}
        {ctas && <LogCta ctas={ctas} handleShowArtifacts={handleShowArtifacts} />}
        {isSenderInfoVisible && <SenderInfo senderType={sender_type as SENDER_TYPE} status={status} />}
      </div>
    </div>
  );
};

export default Log;
