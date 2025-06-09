import { FC } from 'react';
import { cn } from '@zamp-platform/ui/utils';

type RecipientCardSkeletonProps = {
  length?: number;
  className?: string;
};

const RecipientCardSkeleton: FC<RecipientCardSkeletonProps> = ({ length = 8, className }) => {
  return (
    <>
      {Array.from({ length }, (_, index) => index).map((index) => (
        <div key={index} className={cn('mb-2 flex animate-pulse justify-between px-1.5 py-1', className)}>
          <div className='flex items-center gap-1.5'>
            <div className='bg-GRAY_200 flex h-6 w-6 items-center justify-center rounded-full'></div>
            <div className='flex flex-col gap-1'>
              <div className='bg-GRAY_200 h-3 w-24 rounded-md'></div>
              <div className='bg-GRAY_200 h-2 w-24 rounded-md'></div>
            </div>
          </div>
          <div className='flex items-center gap-6'>
            <div className='bg-GRAY_200 h-3 w-24 rounded-md'></div>
            <div className='bg-GRAY_200 h-4 w-4 rounded'></div>
            <div className='bg-GRAY_200 h-4 w-4 rounded'></div>
            <div className='bg-GRAY_200 h-4 w-4 rounded'></div>
          </div>
        </div>
      ))}
    </>
  );
};

export default RecipientCardSkeleton;
