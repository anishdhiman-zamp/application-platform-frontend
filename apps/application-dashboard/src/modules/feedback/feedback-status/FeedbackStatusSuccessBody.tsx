import { type FC } from 'react';
import { Check } from 'lucide-react';
import { FeedbackItemType } from '@/types/api/feedbacks.types';

interface FeedbackStatusSuccessBodyProps {
  items: FeedbackItemType[];
}

const FeedbackStatusSuccessBody: FC<FeedbackStatusSuccessBodyProps> = ({ items }) => {
  return (
    <div>
      <div className='f-14-400 text-GRAY_700'>
        <div className='flex flex-col gap-3 p-4'>
          {items?.map((item) => (
            <div key={item?.id} className='flex items-start gap-2 select-none'>
              <Check size={12} />
              <div className='min-w-0 flex-1'>
                <div className='f-12-450 text-gray-1000 truncate'>{item?.title}</div>
                <div className='f-11-450 mt-1 truncate text-gray-700'>{item?.initiated_by}</div>
              </div>
            </div>
          ))}
        </div>
        <div className='border-GRAY_400 f-11-400 flex w-full items-center justify-between gap-2 border-t p-4'>
          <div>These feedback have been applied and are ready for review</div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackStatusSuccessBody;
