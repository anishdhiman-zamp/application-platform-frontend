import type { FC } from 'react';
import SkeletonElement from '@/components/skeletons/SkeletonElement';

const LogsSkeleton: FC = () => {
  return (
    <div className='w-full space-y-6 px-8'>
      {/* Date Separator Skeleton */}
      <div className='flex min-w-max items-center justify-center gap-x-4 pt-5 pb-6'>
        <div className='bg-GRAY_100 h-px w-full' />
        <SkeletonElement className='h-4 w-24 rounded' />
        <div className='bg-GRAY_100 h-px w-full' />
      </div>

      {/* Log Items Skeleton */}
      {[1, 2].map((index) => (
        <div key={index} className='flex gap-x-4'>
          {/* Status Icon Skeleton */}
          <SkeletonElement className='h-4 w-12 rounded' />

          <div className='flex flex-col items-center justify-start gap-y-2'>
            <SkeletonElement className='h-2.5 w-2.5 rounded-[2px]' />
            {index === 1 && <div className='bg-GRAY_100 h-36 w-px' />}
          </div>

          {/* Content Skeleton */}
          <div className='flex-1 space-y-2'>
            {/* Header Skeleton */}
            <div className='flex flex-col items-start justify-center gap-y-2'>
              <SkeletonElement className='h-4 w-3/4 rounded' />
              <SkeletonElement className='h-7 w-3/4 rounded' />
            </div>

            {/* Message Skeleton */}
            <div className='flex items-center justify-start gap-x-2'>
              <SkeletonElement className='h-6 w-1/4 rounded' />
              <SkeletonElement className='h-6 w-1/5 rounded' />
            </div>

            <SkeletonElement className='h-6 w-1/4 rounded' />
          </div>
        </div>
      ))}
    </div>
  );
};

export default LogsSkeleton;
