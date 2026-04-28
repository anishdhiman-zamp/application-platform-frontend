import { Skeleton } from '@zamp-platform/ui';

const DEFAULT_ROW_COUNT = 2;

interface CredentialDialogSkeletonPropsType {
  rowCount?: number;
  showDeleteSection?: boolean;
}

const CredentialDialogSkeleton = ({
  rowCount = DEFAULT_ROW_COUNT,
  showDeleteSection = false,
}: CredentialDialogSkeletonPropsType) => (
  <div className='flex flex-col gap-6'>
    <div className='flex flex-col gap-2 px-5'>
      <Skeleton className='h-3 w-24' />
      <Skeleton className='h-10 w-full' />
    </div>
    <div className='flex flex-col gap-3 pl-5'>
      {Array.from({ length: rowCount }).map((_, idx) => (
        <div key={idx} className='flex items-end gap-4 pr-5'>
          <div className='flex min-w-0 flex-1 flex-col gap-2'>
            <Skeleton className='h-3 w-16' />
            <Skeleton className='h-10 w-full' />
          </div>
          <div className='flex min-w-0 flex-1 flex-col gap-2'>
            <Skeleton className='h-3 w-16' />
            <Skeleton className='h-10 w-full' />
          </div>
          <Skeleton className='mb-2 h-6 w-6 shrink-0' />
        </div>
      ))}
    </div>
    {showDeleteSection && (
      <div className='flex flex-col px-5'>
        <div className='border-GRAY_400 border-b' />
        <div className='flex items-start justify-between gap-4 pt-4'>
          <div className='flex min-w-0 flex-col gap-2'>
            <Skeleton className='h-3 w-32' />
            <Skeleton className='h-3 w-72' />
          </div>
          <Skeleton className='h-8 w-32 shrink-0' />
        </div>
      </div>
    )}
  </div>
);

export default CredentialDialogSkeleton;
