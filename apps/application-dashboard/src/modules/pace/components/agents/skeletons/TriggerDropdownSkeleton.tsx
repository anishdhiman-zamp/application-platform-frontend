import { Skeleton } from '@zamp-platform/ui';

const TriggerDropdownSkeleton = () => (
  <div className='flex flex-col'>
    {Array.from({ length: 3 }).map((_, i) => (
      <div key={i} className='flex items-center justify-between px-2.5 py-2'>
        <Skeleton className='h-3.5 w-32' />
        <Skeleton className='h-3.5 w-6 rounded-full' />
      </div>
    ))}
  </div>
);

export default TriggerDropdownSkeleton;
