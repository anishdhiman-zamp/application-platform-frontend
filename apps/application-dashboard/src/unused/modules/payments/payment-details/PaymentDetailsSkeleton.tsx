import React from 'react';
const PaymentDetailsSkeleton = () => {
  return (
    <div className='animate-pulse overflow-auto pb-10'>
      <div className='f-12-450 border-GRAY_400 border-b px-6 pt-6 pb-5'>
        <div className='text-GRAY_700 bg-GRAY_200 mb-1 h-3.5 w-50 rounded-md'></div>
        <div className='f-28-450 bg-GRAY_200 h-9 w-56 rounded-md'></div>
        <div className='border-GRAY_200 mt-5 overflow-hidden rounded-md border'>
          <div className='flex items-center gap-2 p-3'>
            <span className='text-GRAY_700'>From</span> <div className='bg-GRAY_200 h-3.5 w-10 rounded-md'></div>
          </div>
          <div className='border-GRAY_200 bg-GRAY_100 flex justify-between gap-2 border-t p-3'>
            <div className='flex items-center gap-2'>
              <span className='text-GRAY_700'>To</span> <div className='bg-GRAY_200 h-3.5 w-10 rounded-md'></div>
            </div>
            <div className='f-11-500'>
              <div className='bg-GRAY_200 h-3.5 w-10 rounded-md'></div>
            </div>
          </div>
        </div>
      </div>
      {Array.from({ length: 2 }, (_, index) => index).map((index) => (
        <div key={index} className='border-GRAY_400 flex flex-col gap-5 border-b px-6 py-5'>
          <div className='f-14-500 bg-GRAY_200 h-4 w-56 rounded-md' />
          {Array.from({ length: 2 }, (_, index) => index).map((index) => (
            <div key={index} className='grid grid-cols-2 gap-2'>
              <div className='f-12-400 text-GRAY_700 bg-GRAY_200 h-3.5 min-w-44 rounded-md' />
              <div className='f-12-450 bg-GRAY_200 h-3.5 rounded-md' />
            </div>
          ))}
        </div>
      ))}
      <div className='flex flex-col gap-6 px-6 py-4'>
        {Array.from({ length: 2 }, (_, index) => index).map((index) => (
          <div key={index} className=''>
            <div className='f-12-400 text-GRAY_700 bg-GRAY_200 h-3.5 w-44 rounded-md' />
            <div className='f-12-450 bg-GRAY_200 mt-3 h-3.5 rounded-md' />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PaymentDetailsSkeleton;
