import { type FC, memo, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { format } from 'date-fns';
import LogCta from 'modules/process/activity-logs/components/LogCta';
import LogMessageAnimation from 'modules/process/activity-logs/components/LogMessageAnimation';
import LogStatusIndicator from 'modules/process/activity-logs/components/LogStatusIndicator';
import ReasoningAccordion from 'modules/process/activity-logs/components/ReasoningAccordion';
import SenderInfo from 'modules/process/activity-logs/components/SenderInfo';
import { LINE_BODY_LOGS_ANIMATION_SEQUENCE, LOG_STATUS_ICON_COLOR_MAPPING } from 'modules/process/process.constant';
import { CONTENT_TYPE, type HandleShowArtifactsProps, LOG_STATUS, SENDER_TYPE } from 'modules/process/process.types';
import { motion } from 'motion/react';
import { DATE_FORMATS } from '@/constants/date.constants';
import type { ActivityLogsItemType } from '@/types/api/processApi.types';
import { cn } from '@/utils/common';

type LogProps = {
  indexNum?: number;
  isFirstLog?: boolean;
  isLastLog?: boolean;
  data: ActivityLogsItemType;
  handleShowArtifacts: (props: HandleShowArtifactsProps) => void;
  isExpanded?: boolean;
  processId: string;
  activityId: string;
};

const Log: FC<LogProps> = ({
  isFirstLog = false,
  isLastLog = false,
  data,
  handleShowArtifacts,
  processId,
  activityId,
}) => {
  const {
    content: { message, thought_steps, ctas, sender_type, sender_details },
    status,
    content_type,
    updated_at,
    log_group_id,
  } = data;
  const lineRef = useRef<HTMLDivElement>(null);
  const shimmerControlRef = useRef<(() => void) | null>(null);
  const showBlueStrokeRef = useRef<((show: boolean) => void) | null>(null);
  const [lineHeight, setLineHeight] = useState(0);

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

  // stroke shimmer sequence loop logic
  const runStrokeShimmerLoop = (
    showBlueStrokeRef: React.MutableRefObject<((show: boolean) => void) | null>,
    shimmerControlRef: React.MutableRefObject<(() => void) | null>,
    cancelledRef: React.MutableRefObject<boolean>,
  ) => {
    const loop = () => {
      if (cancelledRef.current) return;

      // 1. Show blue stroke (this also triggers rotate)
      showBlueStrokeRef.current?.(true);

      // 2. After 300ms, hide stroke and start shimmer
      setTimeout(() => {
        if (cancelledRef.current) return;

        showBlueStrokeRef.current?.(false);
        shimmerControlRef.current?.();

        // 3. After shimmer completes, restart the sequence
        setTimeout(() => {
          if (!cancelledRef.current) loop();
        }, 2000); // shimmer duration
      }, 300); // stroke visible duration
    };

    loop();
  };

  useEffect(() => {
    const stopStrokeShimmerLoopRef = { current: false };

    runStrokeShimmerLoop(showBlueStrokeRef, shimmerControlRef, stopStrokeShimmerLoopRef);

    return () => {
      stopStrokeShimmerLoopRef.current = true;
    };
  }, []);

  // line-height observer logic
  useLayoutEffect(() => {
    if (lineRef.current) {
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          console.log('observed entry height', entry.contentRect.height);
          setLineHeight(entry.contentRect.height);
        }
      });

      resizeObserver.observe(lineRef.current);

      return () => {
        resizeObserver.disconnect();
      };
    }
  }, []);

  // initial y value of indicator logic
  const initialYValue = useMemo(() => {
    if (isFirstLog) return 0;

    return lineHeight > 0 ? -lineHeight : -58;
  }, [isFirstLog, lineHeight]);

  return (
    <div className={cn('flex w-full items-start justify-start gap-x-5 pt-1')} data-log-id={data?.log_group_id}>
      {![LOG_STATUS.LOADING, LOG_STATUS.NEEDS_ATTENTION, LOG_STATUS.FAILED].includes(status as LOG_STATUS) &&
      sender_type === SENDER_TYPE.SYSTEM ? (
        <motion.div
          initial={LINE_BODY_LOGS_ANIMATION_SEQUENCE[1].initial}
          animate={LINE_BODY_LOGS_ANIMATION_SEQUENCE[1].animate}
          style={LINE_BODY_LOGS_ANIMATION_SEQUENCE[1].style}
        >
          <LogMessageAnimation
            text={formattedTime}
            className={cn(
              'f-12-450 text-GRAY_700 flex w-[60px] shrink-0 items-start justify-start text-left break-words whitespace-nowrap',
            )}
            delay={0.2}
          />
        </motion.div>
      ) : [LOG_STATUS.LOADING, LOG_STATUS.NEEDS_ATTENTION, LOG_STATUS.FAILED].includes(status as LOG_STATUS) &&
        sender_type === SENDER_TYPE.SYSTEM ? (
        <div className='flex w-[60px] shrink-0 items-start justify-start'></div>
      ) : (
        <div className='flex w-[60px] shrink-0 items-start justify-start'>
          <motion.div
            className='f-12-450 text-GRAY_700 whitespace-nowrap'
            initial={LINE_BODY_LOGS_ANIMATION_SEQUENCE[1].initial}
            animate={LINE_BODY_LOGS_ANIMATION_SEQUENCE[1].animate}
            style={LINE_BODY_LOGS_ANIMATION_SEQUENCE[1].style}
          >
            {formattedTime}
          </motion.div>
        </div>
      )}

      <div className='flex h-full w-full'>
        {/* Indicator + Line */}
        <div className='relative flex w-5 flex-col items-center gap-[2px] pt-[2px] pr-5'>
          {/* Indicator */}
          <motion.div
            initial={isLastLog ? { y: initialYValue } : false}
            animate={isLastLog ? { y: 0 } : false}
            transition={{
              duration: 0.5,
              ease: 'linear',
            }}
            className='relative z-10 origin-center -translate-y-[5px] transform bg-white pt-1'
          >
            <LogStatusIndicator
              fillColor={statusIndicatorColor.fillColor}
              strokeColor={statusIndicatorColor.strokeColor}
              status={statusIndicatorColor.status}
              shouldRotate={sender_type === SENDER_TYPE.SYSTEM && content_type === CONTENT_TYPE.MESSAGE_SECTION}
              showBlueStrokeRef={showBlueStrokeRef}
            />
          </motion.div>

          {/* Line */}
          <div className='relative h-full'>
            {!isLastLog && (
              <motion.div
                className='absolute inset-0 flex flex-col items-center'
                initial={LINE_BODY_LOGS_ANIMATION_SEQUENCE[0].initial}
                animate={LINE_BODY_LOGS_ANIMATION_SEQUENCE[0].animate}
                style={LINE_BODY_LOGS_ANIMATION_SEQUENCE[0].style}
              >
                <div className='bg-GRAY_100 w-[1px] min-w-[1px] flex-1' ref={lineRef} />
              </motion.div>
            )}
          </div>
        </div>
        {/* body */}
        <motion.div
          className='bg-yellow-10 flex w-full flex-col items-start justify-start pb-10'
          initial={LINE_BODY_LOGS_ANIMATION_SEQUENCE[1].initial}
          animate={LINE_BODY_LOGS_ANIMATION_SEQUENCE[1].animate}
        >
          <LogMessageAnimation
            text={message}
            className={cn('f-13-450 w-full text-left break-words')}
            delay={0.2}
            shimmer={status === LOG_STATUS.LOADING}
            shimmerControlRef={shimmerControlRef}
            isLastLog={isLastLog}
            senderType={sender_type}
          />

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
          {isSenderInfoVisible && (
            <SenderInfo senderType={sender_type} senderDetails={sender_details} status={status} />
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default memo(Log);
