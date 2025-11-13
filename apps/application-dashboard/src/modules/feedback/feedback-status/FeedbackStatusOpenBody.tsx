import { type FC } from 'react';
import FeedbackListCard from 'modules/feedback/components/FeedbackListCard';
import Image from 'next/image';
import { FEEDBACK_OPEN_ICON } from '@/constants/icons';
import { useFeedbackContextStore } from '@/modules/feedback/feedback-status/feedback.context';

const FeedbackStatusOpenBody: FC = () => {
  const { state } = useFeedbackContextStore();
  const { openFeedbackItems: items, processId } = state;

  return (
    <div>
      <div className='f-14-400 text-GRAY_1000 max-h-[400px] overflow-y-auto'>
        <div className='flex flex-col gap-3 p-4'>
          {items?.map((item) => (
            <FeedbackListCard
              key={item?.id}
              icon={<Image src={FEEDBACK_OPEN_ICON} alt='feedback open' width={12} height={12} className='mt-0.5' />}
              feedback={item}
              initiatedBy={item?.initiated_by}
              processId={processId}
              allowDelete
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeedbackStatusOpenBody;
