import { FC, useEffect, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@zamp-platform/ui';
import { type BaseEventPayload, EventType } from '@zamp-platform/utils/event-bus/event-bus.types';
import { Check, Loader } from 'lucide-react';
import FeedbacksStatusTabs from 'modules/feedback/feedback-status/FeedbacksStatusTabs';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useGetFeedbacksQuery } from '@/apis/feedback';
import { useEventBus } from '@/app/_providers/sse-provider';
import { FEEDBACK_OPEN_ICON, QUEUED_ICON } from '@/constants/icons';
import { FeedbackProvider, useFeedbackContextStore } from '@/modules/feedback/feedback-status/feedback.context';

interface FeedbackStatusButtonProps {
  processId?: string;
}

const FeedbackStatusButtonContent: FC = () => {
  const router = useRouter();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const searchParams = useSearchParams();
  const isFeedbackStatus = searchParams?.get('feedback-status') === 'true';

  const { state } = useFeedbackContextStore();
  const {
    successFeedbackItems,
    processingFeedbackItems,
    queuedFeedbackItems,
    openFeedbackItems,
    isLoading,
    processId,
  } = state;

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

  const totalFeedbackItems =
    openFeedbackItems.length +
    queuedFeedbackItems.length +
    processingFeedbackItems.length +
    successFeedbackItems.length;

  if (isLoading || !totalFeedbackItems) {
    return null;
  }

  return (
    <div className='relative'>
      <Popover open={isPopoverOpen} onOpenChange={handlePopoverOpenChange}>
        <PopoverTrigger asChild>
          <div className='f-12-450 border-GRAY_200 flex h-7 cursor-pointer items-center gap-1 rounded-md border p-1 select-none'>
            {!!openFeedbackItems?.length && (
              <div className='bg-GRAY_200 flex h-full items-center gap-1 rounded px-1'>
                <Image
                  src={FEEDBACK_OPEN_ICON}
                  alt='feedback open'
                  width={12}
                  height={12}
                  className='min-h-3 min-w-3'
                />
                {openFeedbackItems?.length}
              </div>
            )}
            {!!queuedFeedbackItems.length && (
              <div className='bg-GRAY_200 flex h-full w-full items-center gap-1 rounded px-1'>
                <Image src={QUEUED_ICON} alt='menu' width={12} height={12} className='min-h-3 min-w-3' />
                {queuedFeedbackItems?.length}
              </div>
            )}
            {!!processingFeedbackItems?.length && (
              <div className='bg-GRAY_200 flex h-full items-center gap-1 rounded px-1'>
                <Loader size={12} />
                {processingFeedbackItems?.length}
              </div>
            )}
            {!!successFeedbackItems.length && (
              <div className='text-ORANGE_1000 flex h-full items-center gap-1 rounded bg-orange-200 px-1'>
                <Check size={12} />
                {successFeedbackItems?.length}
              </div>
            )}
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
