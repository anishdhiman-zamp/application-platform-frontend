import { Skeleton } from '@zamp-platform/ui';

const SkillCardSkeletonItem = () => (
  <div className='px-6 py-4'>
    <div className='flex items-start justify-between gap-4'>
      <div className='min-w-0 flex-1'>
        <Skeleton className='h-5 w-32 rounded' />
        <Skeleton className='mt-2 h-4 w-full rounded' />
        <Skeleton className='mt-1 h-4 w-3/4 rounded' />
        <div className='mt-2 flex items-center gap-1.5'>
          <Skeleton className='h-3 w-20 rounded' />
          <Skeleton className='h-3 w-16 rounded' />
        </div>
      </div>
      <div className='flex shrink-0 items-center gap-2'>
        <Skeleton className='h-5 w-9 rounded-full' />
      </div>
    </div>
  </div>
);

const SkillCardSkeleton = () => (
  <div className='w-full'>
    {Array.from({ length: 5 }).map((_, index) => (
      <SkillCardSkeletonItem key={index} />
    ))}
  </div>
);

export default SkillCardSkeleton;
