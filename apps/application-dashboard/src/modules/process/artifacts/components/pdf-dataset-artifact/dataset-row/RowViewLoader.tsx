import { type FC } from 'react';

const RowViewLoader: FC = () => (
  <div className='absolute inset-0 z-20 flex h-[calc(100vh-210px)] w-full flex-col'>
    <div className='bg-BG_GRAY_1 border-GRAY_400 flex w-full shrink-0 items-center justify-between border-[0.5px] border-b-0 px-4 py-2'>
      <div className='flex items-center gap-1'>
        <div className='bg-GRAY_300 h-3 w-8 animate-pulse rounded' />
        <div className='bg-GRAY_300 h-3 w-4 animate-pulse rounded' />
        <div className='bg-GRAY_300 h-3 w-8 animate-pulse rounded' />
      </div>
      <div className='flex items-center gap-1.5'>
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className='border-GRAY_400 flex size-5 items-center justify-center rounded-md border bg-white'>
            <div className='bg-GRAY_300 h-3 w-3 animate-pulse rounded' />
          </div>
        ))}
      </div>
    </div>
    <div className='border-GRAY_400 h-full w-full flex-1 overflow-y-scroll border-t-[0.5px] [scrollbar-width:none]'>
      <div className='flex w-full flex-col'>
        {Array.from({ length: 10 }).map((_, index) => (
          <div key={index} className='border-GRAY_100 flex w-full flex-col gap-y-2 border-b-[0.5px] px-6 pt-3 pb-4'>
            <div className='bg-GRAY_300 h-3 w-24 animate-pulse rounded' />
            {index % 2 === 0 ? (
              <div className='bg-GRAY_300 h-6 w-full animate-pulse rounded-md' />
            ) : (
              <div className='bg-GRAY_100 flex h-6 w-fit max-w-full items-center rounded-md px-1.5 py-1'>
                <div className='bg-GRAY_300 h-3 w-20 animate-pulse rounded' />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default RowViewLoader;
