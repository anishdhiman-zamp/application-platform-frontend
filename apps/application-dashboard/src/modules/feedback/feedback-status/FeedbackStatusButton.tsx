import { FC, useEffect, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@zamp-platform/ui';
import { type BaseEventPayload, EventType } from '@zamp-platform/utils/event-bus/event-bus.types';
import FeedbacksStatusTabs from 'modules/feedback/feedback-status/FeedbacksStatusTabs';
import { useRouter, useSearchParams } from 'next/navigation';
import { useGetFeedbacksQuery } from '@/apis/feedback';
import { useEventBus } from '@/app/_providers/sse-provider';
import { FEEDBACK_BADGE_CONFIG } from '@/modules/feedback/feedback.constants';
import { FeedbackProvider, useFeedbackContextStore } from '@/modules/feedback/feedback-status/feedback.context';
import { FeedbackItemType } from '@/types/api/feedbacks.types';

interface FeedbackStatusButtonProps {
  processId?: string;
}

const FeedbackStatusButtonContent: FC = () => {
  const router = useRouter();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const searchParams = useSearchParams();
  const isFeedbackStatus = searchParams?.get('feedback-status') === 'true';

  const { state } = useFeedbackContextStore();
  const { isLoading, processId, hasFeedback } = state;

  const { sseEventBus } = useEventBus();

  const { refetch: refetchFeedbacks } = useGetFeedbacksQuery({ process_id: processId }, { skip: !processId });

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

  useEffect(() => {
    if (isFeedbackStatus) {
      setTimeout(() => {
        handlePopoverOpenChange(true);
      }, 1000);
    }
  }, [isFeedbackStatus]);

  useEffect(() => {
    const sub = sseEventBus.subscribe(EventType.FEEDBACK, (data: BaseEventPayload) => {
      if (data?.source_id === processId) refetchFeedbacks();
    });

    return () => sub.unsubscribe();
  }, [sseEventBus, refetchFeedbacks, processId]);

  if (isLoading || !hasFeedback) {
    return null;
  }

  const renderBadge = (config: (typeof FEEDBACK_BADGE_CONFIG)[number]) => {
    const items = state[config.stateKey as keyof typeof state] as FeedbackItemType[];
    const count = items?.length || 0;

    if (!count) return null;

    const baseClasses = 'flex h-full items-center gap-1 rounded px-1';
    const className = `${baseClasses} ${config?.bgClassName} ${config?.textClassName}`;

    return (
      <div key={config?.key} className={className}>
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
          <FeedbacksStatusTabs />
        </PopoverContent>
      </Popover>
    </div>
  );
};

const FeedbackStatusButton: FC<FeedbackStatusButtonProps> = ({ processId = '' }) => {
  if (!processId) {
    return null;
  }

  return (
    <FeedbackProvider processId={processId}>
      <FeedbackStatusButtonContent />
    </FeedbackProvider>
  );
};

export default FeedbackStatusButton;
