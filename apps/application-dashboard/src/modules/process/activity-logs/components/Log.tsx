import { type FC, useEffect, useRef, useState } from 'react';
import { format } from 'date-fns';
import LogCta from 'modules/process/activity-logs/components/LogCta';
import LogStatusIndicator from 'modules/process/activity-logs/components/LogStatusIndicator';
import ReasoningAccordion from 'modules/process/activity-logs/components/ReasoningAccordion';
import SenderInfo from 'modules/process/activity-logs/components/SenderInfo';
import { LOG_STATUS_ICON_COLOR_MAPPING } from 'modules/process/process.constant';
import type { LOG_STATUS } from 'modules/process/process.types';
import type { ActivityLogsItemType } from '@/types/api/processApi.types';

type LogProps = {
  isLastLog?: boolean;
  data: ActivityLogsItemType;
};

const Log: FC<LogProps> = ({ isLastLog = false, data }) => {
  const containerRef = useRef<HTMLDivElement>(null);
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

  return (
    <div className='min-w-max flex justify-start items-start gap-x-5 pt-1'>
      <div className='flex items-start justify-start'>
        <span className='f-12-450 text-GRAY_700'>{format(new Date(data?.updated_at), 'h:mm a')}</span>
      </div>
      <div className='flex flex-col items-center justify-start h-full gap-y-2 pt-[2px]'>
        <LogStatusIndicator
          status={data?.status as LOG_STATUS}
          fillColor={LOG_STATUS_ICON_COLOR_MAPPING[data?.status as LOG_STATUS]?.fillColor}
          strokeColor={LOG_STATUS_ICON_COLOR_MAPPING[data?.status as LOG_STATUS]?.strokeColor}
        />
        {!isLastLog && <div className='w-px bg-GRAY_400' style={{ height: `${containerHeight + 40}px` }} />}
      </div>
      <div className='flex flex-col items-start justify-center' ref={containerRef}>
        <p className='f-13-450 text-GRAY_1000'>{data?.content?.message}</p>
        {data?.content?.thought_steps && <ReasoningAccordion thoughtSteps={data?.content?.thought_steps} />}
        {data?.content?.ctas && <LogCta ctas={data?.content?.ctas} />}
        {data?.content?.sender_type && (
          <SenderInfo senderType={data?.content?.sender_type as 'USER' | 'SYSTEM'} status={data?.status} />
        )}
      </div>
    </div>
  );
};

export default Log;
