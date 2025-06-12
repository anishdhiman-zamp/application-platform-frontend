import React from 'react';
import SkeletonElement from 'components/skeletons/SkeletonElement';

const SkeletonLoaderFileHistory = () => {
  return (
    <div className='flex w-full flex-col flex-wrap items-start justify-start'>
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className='border-GRAY_400 grid w-full grid-cols-1 items-center gap-4 border-b py-3.5'>
          <div className='flex w-full flex-col justify-start rounded-md'>
            <div className='flex w-full items-center justify-between'>
              <SkeletonElement key={index} className='bg-GRAY_500 h-7 w-30 rounded-md' />
              <SkeletonElement key={index} className='bg-GRAY_500 h-4 w-4 rounded-sm' />
            </div>
            <SkeletonElement key={index} className='bg-GRAY_500 mt-1 h-3 w-50 rounded-md' />
          </div>
        </div>
      ))}
    </div>
  );
};

export default SkeletonLoaderFileHistory;
