import React from 'react';
const PaymentDetailsSkeleton = () => {
  return (
    <div className='overflow-auto pb-10 animate-pulse'>
      <div className='f-12-450 pt-6 pb-5 px-6 border-b border-GRAY_400'>
        <div className=' mb-1 text-GRAY_700 w-50 h-3.5 bg-GRAY_200 rounded-md'></div>
        <div className='f-28-450 w-56 h-9 bg-GRAY_200 rounded-md'></div>
        <div className='mt-5 border rounded-md overflow-hidden  border-GRAY_200'>
          <div className='p-3 flex items-center gap-2'>
            <span className='text-GRAY_700'>From</span> <div className='w-10 h-3.5 bg-GRAY_200 rounded-md'></div>
          </div>
          <div className='p-3 flex justify-between gap-2 border-t border-GRAY_200 bg-GRAY_100'>
            <div className='flex items-center gap-2'>
              <span className='text-GRAY_700'>To</span> <div className='w-10 h-3.5 bg-GRAY_200 rounded-md'></div>
            </div>
            <div className='f-11-500'>
              <div className='w-10 h-3.5 bg-GRAY_200 rounded-md'></div>
            </div>
          </div>
        </div>
      </div>
      {Array.from({ length: 2 }, (_, index) => index).map((index) => (
        <div key={index} className='flex flex-col gap-5 border-b border-GRAY_400 py-5 px-6'>
          <div className='f-14-500 w-56 h-4 bg-GRAY_200 rounded-md' />
          {Array.from({ length: 2 }, (_, index) => index).map((index) => (
            <div key={index} className='grid grid-cols-2 gap-2'>
              <div className='f-12-400 text-GRAY_700 min-w-44 h-3.5 bg-GRAY_200 rounded-md' />
              <div className='f-12-450 h-3.5 bg-GRAY_200 rounded-md' />
            </div>
          ))}
        </div>
      ))}
      <div className='px-6 py-4 flex flex-col gap-6'>
        {Array.from({ length: 2 }, (_, index) => index).map((index) => (
          <div key={index} className=''>
            <div className='f-12-400 text-GRAY_700 w-44 h-3.5 bg-GRAY_200 rounded-md' />
            <div className='f-12-450 h-3.5 bg-GRAY_200 rounded-md mt-3' />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PaymentDetailsSkeleton;
