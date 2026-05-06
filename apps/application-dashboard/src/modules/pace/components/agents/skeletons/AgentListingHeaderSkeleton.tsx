import { Skeleton } from '@zamp-platform/ui';

const AgentListingHeaderSkeleton = () => (
  <div className='border-GRAY_400 bg-BG_WHITE flex h-[54px] shrink-0 items-center gap-3 overflow-hidden border-b px-4'>
    <div className='flex h-[54px] min-w-0 shrink items-center gap-5 overflow-hidden'>
      <Skeleton className='h-4 w-16 shrink-0 rounded' />
      <Skeleton className='h-4 w-24 shrink-0 rounded' />
      <Skeleton className='h-4 w-28 shrink-0 rounded' />
    </div>
    <Skeleton className='h-8 w-24 shrink-0 rounded-md min-[460px]:w-40 sm:w-56' />
  </div>
);

export default AgentListingHeaderSkeleton;
