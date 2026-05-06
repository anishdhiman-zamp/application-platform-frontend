import { Skeleton } from '@zamp-platform/ui';

const AgentListingHeaderSkeleton = () => (
  <>
    <div className='mb-4 flex shrink-0 items-center justify-between gap-3'>
      <Skeleton className='h-6 w-24' />
      <Skeleton className='h-8 w-28 rounded-md' />
    </div>
    <div className='flex flex-col gap-3 pb-2'>
      <Skeleton className='h-7 w-full' />
      <div className='flex items-center gap-1.5'>
        <Skeleton className='h-7 w-12 rounded-md' />
        <Skeleton className='h-7 w-24 rounded-md' />
        <Skeleton className='h-7 w-28 rounded-md' />
      </div>
    </div>
  </>
);

export default AgentListingHeaderSkeleton;
