import { useState } from 'react';
import { Button } from '@zamp-platform/ui';
import { Ban, Loader } from 'lucide-react';
import FeedbackListCard from 'modules/feedback/components/FeedbackListCard';
import { FEEDBACK_STATUS } from 'modules/feedback/feedback.constants';
import { useRouter } from 'next/navigation';
import { useLazyGetFeedbacksQuery, useStopProcessingFeedbackMutation } from '@/apis/feedback';
import { useFeedbackContextStore } from '@/modules/feedback/feedback-status/feedback.context';

const FeedbackStatusProcessingBody = () => {
  const router = useRouter();
  const { state } = useFeedbackContextStore();
  const { processingFeedbackItems: items, processId } = state;
  const [isStopProcess, setIsStopProcess] = useState<boolean>(false);

  const [stopProcessingFeedback, { isLoading: isStoppingProcessing }] = useStopProcessingFeedbackMutation();
  const [getFeedbacks, { isFetching: isGettingFeedbacks }] = useLazyGetFeedbacksQuery();

  const handleStopProcessing = () => {
    stopProcessingFeedback({ process_id: processId })
      .unwrap()
      .then(() => {
        getFeedbacks({ process_id: processId })
          .unwrap()
          .then(() => {
            router.push(`${window.location.pathname}?tab=${FEEDBACK_STATUS.QUEUED}`);
          });
      });
  };

  return (
    <div>
      <div className='f-14-400 text-GRAY_1000 max-h-[400px] overflow-y-auto'>
        <div className='flex flex-col gap-3 p-4'>
          {items?.map((item) => (
            <FeedbackListCard
              key={item?.id}
              icon={<Loader size={12} className='mt-1' />}
              feedback={item}
              initiatedBy={item?.initiated_by}
              processId={processId}
            />
          ))}
        </div>
        <div className='border-GRAY_400 f-11-400 flex w-full items-center justify-between gap-2 border-t p-4'>
          {isStopProcess ? (
            <div className='flex w-full items-center justify-between gap-2'>
              <div className='f-11-450 text-gray-1000 flex-grow'>Are you sure you want to stop processing?</div>
              <Button
                disabled={isStoppingProcessing || isGettingFeedbacks}
                variant='outline'
                size='small'
                onClick={() => setIsStopProcess(false)}
              >
                Cancel
              </Button>
              <Button
                size='small'
                isLoading={isStoppingProcessing || isGettingFeedbacks}
                onClick={handleStopProcessing}
                className='min-w-[50px]'
              >
                Yes
              </Button>
            </div>
          ) : (
            <div className='flex w-full items-center justify-between gap-2'>
              <div className='f-11-400 flex-grow text-gray-700'>Feedback is being processed</div>
              <Button variant='outline' size='small' onClick={() => setIsStopProcess(true)}>
                <div className='f-11-500 flex items-center gap-1'>
                  <Ban size={12} />
                  Stop
                </div>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedbackStatusProcessingBody;
