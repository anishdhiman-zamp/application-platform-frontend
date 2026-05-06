'use client';

const AgentCardSkeleton = () => {
  return (
    <div className='bg-BG_WHITE border-GRAY_400 flex h-[150px] animate-pulse flex-col items-start justify-between rounded-lg border p-3.5'>
      <div className='flex w-full flex-col gap-2'>
        <div className='flex items-center gap-1.5'>
          <div className='bg-GRAY_200 size-[22px] rounded-[5px]' />
          <div className='bg-GRAY_200 h-3.5 w-32 rounded' />
        </div>
        <div className='flex flex-col gap-1'>
          <div className='bg-GRAY_200 h-3 w-full rounded' />
          <div className='bg-GRAY_200 h-3 w-3/4 rounded' />
          <div className='bg-GRAY_200 h-3 w-1/2 rounded' />
        </div>
      </div>
      <div className='flex w-full items-center justify-between'>
        <div className='bg-GRAY_200 h-4 w-12 rounded' />
        <div className='bg-GRAY_200 h-4 w-8 rounded' />
      </div>
    </div>
  );
};

export default AgentCardSkeleton;
