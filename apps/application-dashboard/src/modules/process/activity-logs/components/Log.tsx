import { useEffect, useRef, useState } from 'react';
import LogCta from 'modules/process/activity-logs/components/LogCta';
import LogStatusIndicator from 'modules/process/activity-logs/components/LogStatusIndicator';
import ReasoningAccordion from 'modules/process/activity-logs/components/ReasoningAccordion';
import SenderInfo from 'modules/process/activity-logs/components/SenderInfo';
import { LOG_STATUS_ICON_COLOR_MAPPING } from 'modules/process/process.constant';
import { LOG_STATUS } from 'modules/process/process.types';

const Log = ({ isLastLog = false }: { isLastLog?: boolean }) => {
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
        <span className='f-12-450 text-GRAY_700'>10:00</span>
      </div>
      <div className='flex flex-col items-center justify-start h-full gap-y-2 pt-[2px]'>
        <LogStatusIndicator
          status={LOG_STATUS.NEEDS_ATTENTION}
          fillColor={LOG_STATUS_ICON_COLOR_MAPPING[LOG_STATUS.NEEDS_ATTENTION]?.fillColor}
          strokeColor={LOG_STATUS_ICON_COLOR_MAPPING[LOG_STATUS.NEEDS_ATTENTION]?.strokeColor}
        />
        {!isLastLog && <div className='w-px bg-GRAY_400' style={{ height: `${containerHeight + 28}px` }} />}
      </div>
      <div className='flex flex-col items-start justify-center' ref={containerRef}>
        <p className='f-13-450 text-GRAY_1000'>Logged into Visa chargeback portal</p>
        <ReasoningAccordion />
        <LogCta />
        <SenderInfo />
      </div>
    </div>
  );
};

export default Log;
