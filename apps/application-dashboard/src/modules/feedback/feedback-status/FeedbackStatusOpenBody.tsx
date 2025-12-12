import { type FC } from 'react';
import { useSelector } from 'react-redux';
import FeedbackListCard from 'modules/feedback/components/FeedbackListCard';
import Image from 'next/image';
import { FEEDBACK_OPEN_ICON } from '@/constants/icons';
import { RootState } from '@/store';

const FeedbackStatusOpenBody: FC = () => {
  const { openFeedbackItems: items, processId } = useSelector((state: RootState) => state?.feedbacks);

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
      <div className='border-GRAY_400 f-11-400 flex w-full items-center justify-between gap-2 border-t p-4'>
        <div className='text-GRAY_700'>Questions are still unanswered, click to continue chat</div>
      </div>
    </div>
  );
};

export default FeedbackStatusOpenBody;
