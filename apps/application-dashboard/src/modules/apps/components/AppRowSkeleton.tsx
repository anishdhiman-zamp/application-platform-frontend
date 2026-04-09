import { Skeleton } from '@zamp-platform/ui';

const AppRowSkeleton = () => (
  <div className='bg-BG_WHITE border-GRAY_400 flex h-14 items-center gap-3 rounded-xl border px-4'>
    <Skeleton className='h-4 w-4' />
    <Skeleton className='h-5 w-5 rounded-[5px]' />
    <Skeleton className='h-4 w-32' />
    <div className='flex-1' />
    <Skeleton className='h-3 w-20' />
    <Skeleton className='h-5 w-12' />
  </div>
);

export default AppRowSkeleton;
