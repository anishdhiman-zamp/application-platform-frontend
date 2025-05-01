import { FC } from 'react';
import { cn } from '@zamp-platform/ui/lib/utils';

type RecipientCardSkeletonProps = {
  length?: number;
  className?: string;
};

const RecipientCardSkeleton: FC<RecipientCardSkeletonProps> = ({ length = 8, className }) => {
  return (
    <>
      {Array.from({ length }, (_, index) => index).map((index) => (
        <div key={index} className={cn('flex py-1 px-1.5 justify-between mb-2 animate-pulse', className)}>
          <div className='flex items-center gap-1.5'>
            <div className='w-6 h-6 flex items-center justify-center rounded-full bg-GRAY_200'></div>
            <div className='flex flex-col gap-1'>
              <div className='w-24 h-3 bg-GRAY_200 rounded-md'></div>
              <div className='w-24 h-2 bg-GRAY_200 rounded-md'></div>
            </div>
          </div>
          <div className='flex items-center gap-6'>
            <div className='w-24 h-3 bg-GRAY_200 rounded-md'></div>
            <div className='w-4 h-4 rounded bg-GRAY_200'></div>
            <div className='w-4 h-4 rounded bg-GRAY_200'></div>
            <div className='w-4 h-4 rounded bg-GRAY_200'></div>
          </div>
        </div>
      ))}
    </>
  );
};

export default RecipientCardSkeleton;
