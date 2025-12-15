import { type FC, memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { LocationType } from '@zamp-platform/chat';
import { FormBuilder, type FormBuilderRef } from '@zamp-platform/form-builder';
import { DATE_FORMATS } from '@zamp-platform/utils';
import { format } from 'date-fns';
import ActionComment from 'modules/process/activity-logs/components/ActionComment';
import LogCta, { type LogCtaRef } from 'modules/process/activity-logs/components/LogCta';
import LogMessageAnimation from 'modules/process/activity-logs/components/LogMessageAnimation';
import LogStatusIndicator from 'modules/process/activity-logs/components/LogStatusIndicator';
import ReasoningAccordion from 'modules/process/activity-logs/components/ReasoningAccordion';
import SenderInfo from 'modules/process/activity-logs/components/SenderInfo';
import { LINE_BODY_LOGS_ANIMATION_SEQUENCE, LOG_STATUS_ICON_COLOR_MAPPING } from 'modules/process/process.constant';
import {
  CONTENT_TYPE,
  CTA_ACTION,
  type HandleShowArtifactsProps,
  LOG_STATUS,
  SENDER_TYPE,
} from 'modules/process/process.types';
import { handleStrokeShimmerSequence } from 'modules/process/process.utils';
import { motion } from 'motion/react';
import ChatbotWrapper from '@/modules/chatbot';
import CommentButton from '@/modules/chatbot/CommentButton';
import useIsFeedbackEnabled from '@/modules/feedback/useIsFeedbackEnabled';
import type { ActivityLogsItemType } from '@/types/api/processApi.types';
import { defaultFnType } from '@/types/commonTypes';
import { cn, ensureUTCTimestamp } from '@/utils/common';

type LogProps = {
  isLastLogOfDate?: boolean;
  isLastLog?: boolean;
  data: ActivityLogsItemType;
  handleShowArtifacts: (props: HandleShowArtifactsProps) => void;
  isExpanded?: boolean;
  processId: string;
  activityId: string;
};

// const feedbackFormClassNames: FormBuilderClassNames = {
//   form: 'gap-2 pb-0 mt-2',
//   radioGroup: 'gap-3',
//   radioItem: 'space-y-0',
//   radio: 'h-3 w-3 border-GRAY_1000',
//   radioInput: 'h-8 border-GRAY_400 bg-white rounded-lg placeholder:text-GRAY_500 f-12-450 rounded-md p-3 w-[300px]',
//   label: 'f-12-450 text-GRAY_1000',
// };

const Log: FC<LogProps> = ({
  isLastLogOfDate = false,
  isLastLog = false,
  data,
  handleShowArtifacts,
  processId,
  activityId,
}) => {
  const {
    content: { message, thought_steps, ctas, sender_type, sender_details, action_comment },
    status,
    content_type,
    updated_at,
    log_group_id,
  } = data;
  const isLogsLoading = status === LOG_STATUS.LOADING;
  const staggerCompleteRef = useRef(false);
  const lineRef = useRef<HTMLDivElement>(null);
  const shimmerControlRef = useRef<defaultFnType | null>(null);
  const showBlueStrokeRef = useRef<((show: boolean) => void) | null>(null);
  const [lineHeight, setLineHeight] = useState(0);
  const [staggerAnimationBegin, setStaggerAnimationBegin] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const formBuilderRef = useRef<FormBuilderRef>(null);
  const logCtaRef = useRef<LogCtaRef>(null);
  const isFeedbackEnabled = useIsFeedbackEnabled();

  const submitFormCta = useMemo(() => ctas?.find((cta) => cta?.cta_action === CTA_ACTION.SUBMIT_FORM), [ctas]);

  // sender info visibility
  const isSenderInfoVisible = useMemo(() => {
    return (
      content_type === CONTENT_TYPE.REPLIED_TO_SECTION &&
      (sender_type === SENDER_TYPE.SYSTEM || sender_type === SENDER_TYPE.USER)
    );
  }, [content_type, sender_type]);

  // status indicator color
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

  // formatted time
  const formattedTime = useMemo(() => {
    return format(new Date(ensureUTCTimestamp(updated_at)), DATE_FORMATS.HH_MM_A);
  }, [updated_at]);

  // indicator-stroke and shimmer loop
  const runStrokeShimmerSequenceLoop = (
    showBlueStrokeRef: React.MutableRefObject<((show: boolean) => void) | null>,
    shimmerControlRef: React.MutableRefObject<(() => void) | null>,
    cancelledRef: React.MutableRefObject<boolean>,
  ) => {
    handleStrokeShimmerSequence({ showBlueStrokeRef, shimmerControlRef, cancelledRef });
  };

  const handleLineHeightUpdate = () => {
    setLineHeight((prev) => prev + 1);
  };

  const handleFeedbackSubmit = useCallback((data: Record<string, unknown>) => {
    logCtaRef.current?.submitFormData(data);
  }, []);

  const handleSubmitForm = useCallback(() => {
    formBuilderRef.current?.submit();
  }, []);

  useEffect(() => {
    const stopStrokeShimmerSequenceLoopRef = { current: false };

    runStrokeShimmerSequenceLoop(showBlueStrokeRef, shimmerControlRef, stopStrokeShimmerSequenceLoopRef);

    return () => {
      stopStrokeShimmerSequenceLoopRef.current = true;
    };
  }, []);

  return (
    <div className={cn('flex w-full items-start justify-start gap-x-5 pt-1')} data-log-id={data?.log_group_id}>
      {isLogsLoading && sender_type === SENDER_TYPE.SYSTEM ? (
        <div className='w-[60px] shrink-0' />
      ) : (
        <div
          className={cn('flex w-[60px] shrink-0 items-start justify-start', {
            'mt-0.5': isFeedbackEnabled,
          })}
        >
          <motion.div
            className='f-12-450 text-GRAY_700 origin-top whitespace-nowrap'
            initial={LINE_BODY_LOGS_ANIMATION_SEQUENCE[1].initial}
            animate={{
              ...LINE_BODY_LOGS_ANIMATION_SEQUENCE[1].animate,
              opacity: !isLastLog || staggerAnimationBegin ? 1 : 0,
            }}
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
            initial={{ opacity: 0 }}
            animate={{ opacity: !isLastLog || staggerAnimationBegin ? 1 : 0 }}
            transition={{
              duration: 0.5,
              ease: 'linear',
            }}
            className={cn('relative z-10 origin-center -translate-y-[5px] transform bg-white pt-1', {
              'pt-1.5': isFeedbackEnabled,
            })}
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
          <div className='relative h-full' id={`line-${lineHeight}`}>
            {!isLastLogOfDate && (
              <motion.div
                className='absolute inset-0 flex origin-top flex-col items-center'
                initial={LINE_BODY_LOGS_ANIMATION_SEQUENCE[0].initial}
                animate={LINE_BODY_LOGS_ANIMATION_SEQUENCE[0].animate}
              >
                <div className='bg-GRAY_100 w-[1px] min-w-[1px] flex-1' ref={lineRef} />
              </motion.div>
            )}
          </div>
        </div>
        {/* body */}
        <motion.div
          className='group flex w-full origin-top flex-col items-start justify-start pb-10'
          initial={LINE_BODY_LOGS_ANIMATION_SEQUENCE[1].initial}
          animate={LINE_BODY_LOGS_ANIMATION_SEQUENCE[1].animate}
          onAnimationComplete={() => setStaggerAnimationBegin(true)}
        >
          <div className='flex items-center gap-2'>
            <LogMessageAnimation
              text={message}
              className={cn('f-13-450 w-full text-left break-words', {
                'bg-blue-300': isChatbotOpen,
              })}
              delay={0.2}
              shimmer={isLogsLoading}
              shimmerControlRef={shimmerControlRef}
              isLastLog={isLastLog}
              showAnimation={staggerAnimationBegin}
              onStaggerComplete={() => {
                staggerCompleteRef.current = true;
                handleLineHeightUpdate();
              }}
            />
            <ChatbotWrapper
              annotationLocation={{
                type: LocationType.LOG,
                data: {
                  process_id: processId,
                  activity_run_id: activityId,
                  log_id: log_group_id,
                },
              }}
              className='flex h-5 items-start self-baseline'
              onChatbotStateChange={setIsChatbotOpen}
            >
              <CommentButton />
            </ChatbotWrapper>
          </div>

          {thought_steps?.length > 0 && (
            <ReasoningAccordion
              thoughtSteps={thought_steps}
              logGroupId={log_group_id}
              isLastLog={isLastLog}
              status={statusIndicatorColor.status}
            />
          )}

          {submitFormCta?.form_builder_config && (
            <FormBuilder
              schema={submitFormCta.form_builder_config}
              onSubmit={handleFeedbackSubmit}
              ref={formBuilderRef}
              animated={false}
            />
          )}

          {!!ctas?.length && (
            <LogCta
              ref={logCtaRef}
              ctas={ctas}
              logGroupId={log_group_id}
              processId={processId}
              activityId={activityId}
              handleShowArtifacts={handleShowArtifacts}
              isLastLog={isLastLog}
              onSubmitForm={handleSubmitForm}
            />
          )}
          {action_comment?.comment && (
            <ActionComment
              action_comment={action_comment}
              isLastLog={isLastLog}
              staggerCompleteRef={staggerCompleteRef}
              ctasLength={ctas?.length ?? 0}
            />
          )}
          <motion.div
            initial={{ opacity: isLastLog && !staggerCompleteRef.current ? 0 : 1 }}
            animate={{ opacity: isLastLog && !staggerCompleteRef.current ? 0 : 1 }}
          >
            {isSenderInfoVisible && (
              <SenderInfo senderType={sender_type} senderDetails={sender_details} status={status} />
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default memo(Log);
