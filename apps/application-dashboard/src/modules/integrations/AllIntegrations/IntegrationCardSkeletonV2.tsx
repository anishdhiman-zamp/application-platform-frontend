import type { FC } from 'react';
import { Skeleton } from '@zamp-platform/ui';

const IntegrationCardSkeletonV2: FC = () => (
  <div className='border-GRAY_400 flex h-[170px] flex-col justify-between rounded-md border bg-white p-3.5'>
    <div className='flex flex-col gap-y-2'>
      <Skeleton className='h-8 w-8 rounded-md' />
      <Skeleton className='h-4 w-24' />
      <Skeleton className='h-3 w-full' />
      <Skeleton className='h-3 w-3/4' />
    </div>
    <Skeleton className='ml-auto h-7 w-16 rounded-md' />
  </div>
);

export default IntegrationCardSkeletonV2;
