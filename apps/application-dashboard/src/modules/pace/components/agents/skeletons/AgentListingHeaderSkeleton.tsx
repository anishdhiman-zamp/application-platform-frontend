import { Skeleton } from '@zamp-platform/ui';

const AgentListingHeaderSkeleton = () => (
  <>
    <div className='flex shrink-0 items-center justify-between pt-6 pr-3 pb-3 pl-4'>
      <Skeleton className='h-6 w-24' />
      <Skeleton className='h-8 w-28 rounded-md' />
    </div>
    <div className='flex flex-col gap-3 px-4 pb-2'>
      <Skeleton className='h-7 w-32' />
      <div className='flex items-center gap-1.5'>
        <Skeleton className='h-7 w-12 rounded-md' />
        <Skeleton className='h-7 w-24 rounded-md' />
        <Skeleton className='h-7 w-28 rounded-md' />
      </div>
    </div>
  </>
);

export default AgentListingHeaderSkeleton;
