import { Skeleton } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';

const TriggerListSkeleton = ({ rowCount = 3 }: { rowCount?: number }) => (
  <div className='border-GRAY_400 flex h-full flex-col rounded-xl border'>
    {Array.from({ length: rowCount }).map((_, i) => (
      <div
        key={i}
        className={cn(
          'flex items-center justify-between px-3.5 py-3.5',
          i < rowCount - 1 && 'border-GRAY_400 border-b',
        )}
      >
        <Skeleton className='h-4 w-48' />
        <Skeleton className='h-5 w-9 rounded-full' />
      </div>
    ))}
  </div>
);

export default TriggerListSkeleton;
