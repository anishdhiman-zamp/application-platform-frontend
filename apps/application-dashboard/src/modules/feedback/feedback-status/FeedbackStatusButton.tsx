import { FC, useEffect, useMemo, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@zamp-platform/ui';
import { type BaseEventPayload, EventType } from '@zamp-platform/utils/event-bus/event-bus.types';
import { Check, Loader } from 'lucide-react';
import FeedbacksStatusTabs from 'modules/feedback/feedback-status/FeedbacksStatusTabs';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useGetFeedbacksQuery } from '@/apis/feedback';
import { useEventBus } from '@/app/_providers/sse-provider';
import { MESSAGE_ICON, QUEUED_ICON } from '@/constants/icons';
import { FEEDBACK_STATUS } from '@/modules/feedback/feedback.constants';

interface FeedbackStatusButtonProps {
  processId?: string;
}

const FeedbackStatusButton: FC<FeedbackStatusButtonProps> = ({ processId = '' }) => {
  const router = useRouter();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const searchParams = useSearchParams();
  const isFeedbackStatus = searchParams?.get('feedback-status') === 'true';

  const { sseEventBus } = useEventBus();

  const {
    data: feedbacksList,
    refetch: refetchFeedbacks,
    isLoading: isLoadingFeedbacks,
  } = useGetFeedbacksQuery({ process_id: processId }, { skip: !processId });

  const {
    successFeedbackItems,
    processingFeedbackItems,
    queuedFeedbackItems,
    archivedFeedbackItems,
    openFeedbackItems,
  } = useMemo(() => {
    const items = feedbacksList?.feedbacks ?? [];
    const itemsWithStatus: Partial<Record<FEEDBACK_STATUS, typeof items>> = {};

    for (const item of items) {
      const statusKey = item.status as FEEDBACK_STATUS;

      (itemsWithStatus[statusKey] ||= []).push(item);
    }

    return {
      openFeedbackItems: itemsWithStatus[FEEDBACK_STATUS.OPEN] ?? [],
      queuedFeedbackItems: itemsWithStatus[FEEDBACK_STATUS.QUEUED] ?? [],
      processingFeedbackItems: itemsWithStatus[FEEDBACK_STATUS.PROCESSING] ?? [],
      successFeedbackItems: itemsWithStatus[FEEDBACK_STATUS.APPLIED] ?? [],
      archivedFeedbackItems: itemsWithStatus[FEEDBACK_STATUS.ARCHIVED] ?? [],
    };
  }, [feedbacksList]);

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

  if (isLoadingFeedbacks || !feedbacksList?.feedbacks?.length) {
    return null;
  }

  return (
    <div className='relative'>
      <Popover open={isPopoverOpen} onOpenChange={handlePopoverOpenChange}>
        <PopoverTrigger asChild>
          <div className='f-12-450 border-GRAY_200 flex h-7 cursor-pointer items-center gap-1 rounded-md border p-1 select-none'>
            <Image src={MESSAGE_ICON} alt='message' width={20} height={20} className='min-h-[20px] min-w-[20px]' />
            {!!openFeedbackItems?.length && (
              <div className='bg-GRAY_200 flex h-full items-center gap-1 rounded px-1'>
                <div className='h-3 w-3 rounded-full border-3 border-blue-400 bg-blue-700'></div>
                {processingFeedbackItems?.length}
              </div>
            )}
            {!!processingFeedbackItems?.length && (
              <div className='bg-GRAY_200 flex h-full items-center gap-1 rounded px-1'>
                <Loader size={12} />
                {processingFeedbackItems?.length}
              </div>
            )}
            {!!successFeedbackItems.length && (
              <div className='flex h-full items-center gap-1 rounded bg-orange-200 px-1 text-[#BC5910]'>
                <Check size={12} />
                {successFeedbackItems?.length}
              </div>
            )}
            {!!queuedFeedbackItems.length && (
              <div className='bg-GRAY_200 flex h-full w-full items-center gap-1 rounded px-1'>
                <Image src={QUEUED_ICON} alt='menu' width={12} height={12} className='min-h-3 min-w-3' />
                {queuedFeedbackItems?.length}
              </div>
            )}
          </div>
        </PopoverTrigger>
        <PopoverContent align='end' className='w-[466px] max-w-[90vw] border-none bg-transparent p-0 shadow-none'>
          <FeedbacksStatusTabs
            processId={processId}
            successFeedbackItems={successFeedbackItems}
            processingFeedbackItems={processingFeedbackItems}
            queuedFeedbackItems={queuedFeedbackItems}
            archivedFeedbackItems={archivedFeedbackItems}
            openFeedbackItems={openFeedbackItems}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default FeedbackStatusButton;
