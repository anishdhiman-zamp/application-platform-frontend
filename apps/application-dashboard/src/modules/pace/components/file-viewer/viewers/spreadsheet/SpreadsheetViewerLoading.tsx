import { Skeleton } from '@zamp-platform/ui';

const SpreadsheetViewerLoading = () => {
  return (
    <div className='flex h-full w-full flex-col'>
      <div className='border-GRAY_400 flex items-center justify-between border-b px-4 py-3'>
        <Skeleton className='h-8 w-64' />
        <Skeleton className='h-4 w-32' />
      </div>
      <div className='flex-1 p-4'>
        <div className='flex flex-col gap-2'>
          <Skeleton className='h-10 w-full' />
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className='h-8 w-full' />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SpreadsheetViewerLoading;
