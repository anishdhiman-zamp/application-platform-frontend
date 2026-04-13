import { Skeleton } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';

const FolderListSkeleton = ({ rowCount = 12 }: { rowCount?: number }) => (
  <div className='border-GRAY_400 flex h-full flex-col overflow-hidden rounded-xl border'>
    {Array.from({ length: rowCount }).map((_, i) => (
      <div
        key={i}
        className={cn(
          'flex items-center justify-between px-3.5 py-3.5',
          i < rowCount - 1 && 'border-GRAY_400 border-b',
        )}
      >
        <div className='flex items-center gap-3'>
          <Skeleton className='size-4 rounded' />
          <Skeleton className='h-4 w-40' />
        </div>
        <Skeleton className='h-5 w-9 rounded-full' />
      </div>
    ))}
  </div>
);

export default FolderListSkeleton;
