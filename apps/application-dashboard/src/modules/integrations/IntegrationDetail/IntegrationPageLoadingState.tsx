import { type FC } from 'react';
import { Skeleton } from '@zamp-platform/ui';

const IntegrationPageLoadingState: FC = () => {
  return (
    <div className='bg-BG_WHITE flex h-full w-full items-center justify-center'>
      <div className='flex h-full w-full max-w-[700px] flex-col pr-4'>
        {/* Back arrow */}
        <div className='flex w-full items-center justify-start py-2'>
          <div className='flex items-center justify-center py-1'>
            <Skeleton className='h-4 w-4 rounded' />
          </div>
        </div>
        <div className='flex h-full w-full flex-col gap-y-8 pt-5.5'>
          <div className='flex flex-col gap-y-5'>
            {/* Header: logo + title + buttons */}
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-x-2'>
                <Skeleton className='h-7 w-7 rounded' />
                <Skeleton className='h-6 w-40 rounded' />
              </div>
              <Skeleton className='h-8 w-30 rounded-md' />
            </div>
            {/* Description */}
            <div className='flex flex-col gap-y-2'>
              <Skeleton className='h-4 w-full rounded' />
              <Skeleton className='h-4 w-3/4 rounded' />
            </div>
            {/* Metadata block */}
            <Skeleton className='mt-4 h-48 w-full rounded-md' />
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntegrationPageLoadingState;
