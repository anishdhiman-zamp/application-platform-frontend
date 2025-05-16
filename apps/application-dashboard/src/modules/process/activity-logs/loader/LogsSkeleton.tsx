import type { FC } from 'react';
import SkeletonElement from '@/components/skeletons/SkeletonElement';

const LogsSkeleton: FC = () => {
  return (
    <div className='w-full space-y-6'>
      {/* Date Separator Skeleton */}
      <div className='min-w-max flex justify-center items-center gap-x-4 pt-5 pb-6'>
        <div className='w-full h-px bg-GRAY_100' />
        <SkeletonElement className='w-24 h-4 rounded' />
        <div className='w-full h-px bg-GRAY_100' />
      </div>

      {/* Log Items Skeleton */}
      {[1, 2].map((index) => (
        <div key={index} className='flex gap-x-4'>
          {/* Status Icon Skeleton */}
          <SkeletonElement className='w-12 h-4 rounded' />

          <div className='flex flex-col items-center justify-start gap-y-2'>
            <SkeletonElement className='w-2.5 h-2.5 rounded-[2px]' />
            {index === 1 && <div className='w-px h-36 bg-GRAY_100' />}
          </div>

          {/* Content Skeleton */}
          <div className='flex-1 space-y-2'>
            {/* Header Skeleton */}
            <div className='flex flex-col items-start justify-center gap-y-2'>
              <SkeletonElement className='w-3/4 h-4 rounded' />
              <SkeletonElement className='w-3/4 h-7 rounded' />
            </div>

            {/* Message Skeleton */}
            <div className='flex items-center justify-start gap-x-2'>
              <SkeletonElement className='w-1/4 h-6 rounded' />
              <SkeletonElement className='w-1/5 h-6 rounded' />
            </div>

            <SkeletonElement className='w-1/4 h-6 rounded' />
          </div>
        </div>
      ))}
    </div>
  );
};

export default LogsSkeleton;
