import { type FC } from 'react';
import { useSelector } from 'react-redux';
import { Check } from 'lucide-react';
import FeedbackListCard from 'modules/feedback/components/FeedbackListCard';
import { RootState } from '@/store';

const FeedbackStatusSuccessBody: FC = () => {
  const { successFeedbackItems: items } = useSelector((state: RootState) => state?.feedbacks);

  return (
    <div>
      <div className='f-14-400 text-GRAY_700 max-h-[400px] overflow-y-auto'>
        <div className='flex flex-col gap-3 p-4'>
          {items?.map((item) => (
            <FeedbackListCard
              key={item?.id}
              icon={<Check size={12} className='text-ORANGE_1000 mt-0.5' />}
              feedback={item}
              initiatedBy={item?.initiated_by}
            />
          ))}
        </div>
      </div>
      <div className='border-GRAY_400 f-11-400 flex w-full items-center justify-between gap-2 border-t p-4'>
        <div>These feedback have been applied</div>
      </div>
    </div>
  );
};

export default FeedbackStatusSuccessBody;
