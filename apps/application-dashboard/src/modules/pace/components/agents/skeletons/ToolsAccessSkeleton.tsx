import { Skeleton } from '@zamp-platform/ui';

const ToolsAccessSkeleton = () => (
  <div className='bg-BG_GRAY_2 flex h-full rounded-xl'>
    <div className='flex flex-2 flex-col gap-1 p-1.5'>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className='flex items-center gap-2 rounded-md p-1.5'>
          <Skeleton className='size-4 rounded-[2.5px]' />
          <Skeleton className='h-4 w-24' />
          <div className='ml-auto flex items-center gap-1'>
            <Skeleton className='size-5 rounded' />
            <Skeleton className='size-5 rounded' />
            <Skeleton className='size-5 rounded' />
          </div>
        </div>
      ))}
    </div>
    <div className='border-GRAY_200 flex flex-5 flex-col border-l p-4'>
      <div className='mb-4 flex items-center gap-2'>
        <Skeleton className='size-5 rounded-[2.5px]' />
        <Skeleton className='h-5 w-28' />
      </div>
      <div className='bg-GRAY_50 flex flex-col gap-3 rounded-lg p-4'>
        <div className='flex items-center gap-2'>
          <Skeleton className='h-4 w-4 rounded' />
          <Skeleton className='h-4 w-40' />
          <Skeleton className='ml-auto h-4 w-20' />
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className='flex items-center justify-between py-1'>
            <Skeleton className='h-4 w-36' />
            <div className='flex gap-1.5'>
              <Skeleton className='size-5 rounded-full' />
              <Skeleton className='size-5 rounded-full' />
              <Skeleton className='size-5 rounded-full' />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default ToolsAccessSkeleton;
