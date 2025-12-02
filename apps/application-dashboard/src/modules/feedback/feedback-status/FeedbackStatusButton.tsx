import { FC, useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { captureException } from '@sentry/nextjs';
import { ResourceType, useLazyGetConversationByIdQuery } from '@zamp-platform/chat';
import { Popover, PopoverContent, PopoverTrigger } from '@zamp-platform/ui';
import { type BaseEventPayload, EVENT_TYPE } from '@zamp-platform/utils/event-bus/event-bus.types';
import FeedbacksStatusTabs from 'modules/feedback/feedback-status/FeedbacksStatusTabs';
import { useFeedbacksProvider } from 'modules/feedback/feedback-status/useFeedbacks';
import { useRouter, useSearchParams } from 'next/navigation';
import { useGetFeedbacksQuery } from '@/apis/feedback';
import { useEventBus } from '@/app/_providers/sse-provider';
import { FEEDBACK_BADGE_CONFIG, FEEDBACK_STATUS } from '@/modules/feedback/feedback.constants';
import { RootState } from '@/store';
import { FeedbackItemType } from '@/types/api/feedbacks.types';

interface FeedbackStatusButtonProps {
  processId?: string;
}

const FeedbackStatusButtonContent: FC = () => {
  const router = useRouter();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const searchParams = useSearchParams();
  const isFeedbackStatus = searchParams?.get('feedback-status') === 'true';
  const defaultTab = (searchParams?.get('tab') as FEEDBACK_STATUS) || FEEDBACK_STATUS.OPEN;
  const [activeTab, setActiveTab] = useState<FEEDBACK_STATUS>(defaultTab);

  const feedbackState = useSelector((state: RootState) => state?.feedbacks);
  const { isLoading, processId, hasFeedback, openFeedbackItems = [], queuedFeedbackItems = [] } = feedbackState;

  const { sseEventBus } = useEventBus();

  const { refetch: refetchFeedbacks } = useGetFeedbacksQuery({ process_id: processId }, { skip: !processId });
  const [getConversationById] = useLazyGetConversationByIdQuery();

  const handlePopoverOpenChange = (open: boolean) => {
    if (open) {
      setIsPopoverOpen(true);
    } else {
      setIsPopoverOpen(false);

      const url = new URL(window.location.href);

      url.searchParams.delete('feedback-status');
      url.searchParams.delete('tab');

      setTimeout(() => {
        router.replace(url.pathname + url.search);
      }, 1000);
    }
  };

  const prefetchAllOpenAndQueuedFeedbackConversations = useCallback(async () => {
    try {
      await Promise.all(
        [...openFeedbackItems, ...queuedFeedbackItems].map((item) =>
          getConversationById({
            conversationId: item.conversation_id,
            resourceId: item.process_id,
            resourceType: ResourceType.PROCESS,
          }),
        ),
      );
    } catch (error) {
      captureException(error);
    }
  }, [openFeedbackItems, queuedFeedbackItems, getConversationById]);

  useEffect(() => {
    if (isFeedbackStatus) {
      setTimeout(() => {
        handlePopoverOpenChange(true);
      }, 1000);
    }
  }, [isFeedbackStatus]);

  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);

  useEffect(() => {
    const sub = sseEventBus.subscribe(EVENT_TYPE.FEEDBACK, (data: BaseEventPayload) => {
      if (data?.source_id === processId) refetchFeedbacks();
    });

    return () => sub.unsubscribe();
  }, [sseEventBus, refetchFeedbacks, processId]);

  useEffect(() => {
    prefetchAllOpenAndQueuedFeedbackConversations();
  }, [openFeedbackItems, queuedFeedbackItems]);

  if (isLoading || !hasFeedback) {
    return null;
  }

  const handleBadgeClick = (config: (typeof FEEDBACK_BADGE_CONFIG)[number]) => {
    if (config.key) {
      setActiveTab(config.key);
      setIsPopoverOpen(true);
    }
  };

  const renderBadge = (config: (typeof FEEDBACK_BADGE_CONFIG)[number]) => {
    const items = feedbackState[config.stateKey] as FeedbackItemType[];

    const count = items?.length || 0;

    if (!count) return null;

    const baseClasses = 'flex h-full items-center gap-1 rounded px-1 cursor-pointer';
    const className = `${baseClasses} ${config?.bgClassName} ${config?.textClassName}`;

    return (
      <div
        key={config?.key}
        className={className}
        onClick={(e) => {
          e.stopPropagation();
          handleBadgeClick(config);
        }}
      >
        {config?.icon}
        {count}
      </div>
    );
  };

  return (
    <div className='relative'>
      <Popover open={isPopoverOpen} onOpenChange={handlePopoverOpenChange}>
        <PopoverTrigger asChild>
          <div className='f-12-450 border-GRAY_200 flex h-7 cursor-pointer items-center gap-1.5 rounded-md border p-1 select-none'>
            {FEEDBACK_BADGE_CONFIG.map(renderBadge)}
          </div>
        </PopoverTrigger>
        <PopoverContent align='end' className='w-[466px] max-w-[90vw] border-none bg-transparent p-0 shadow-none'>
          <FeedbacksStatusTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        </PopoverContent>
      </Popover>
    </div>
  );
};

const FeedbackStatusButton: FC<FeedbackStatusButtonProps> = ({ processId = '' }) => {
  useFeedbacksProvider(processId);

  if (!processId) {
    return null;
  }

  return <FeedbackStatusButtonContent />;
};

export default FeedbackStatusButton;
