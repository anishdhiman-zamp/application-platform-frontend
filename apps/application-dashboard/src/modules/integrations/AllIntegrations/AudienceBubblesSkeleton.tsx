'use client';

import { Skeleton } from '@zamp-platform/ui';

interface AudienceBubblesSkeletonProps {
  count?: number;
}

const AudienceBubblesSkeleton = ({ count = 2 }: AudienceBubblesSkeletonProps) => (
  <div className='flex items-center'>
    {Array.from({ length: count }).map((_, i) => (
      <Skeleton
        key={i}
        style={{ zIndex: count - i }}
        className='border-BG_WHITE relative -ml-1.5 h-5 w-5 rounded-full border first:ml-0'
      />
    ))}
  </div>
);

export default AudienceBubblesSkeleton;
