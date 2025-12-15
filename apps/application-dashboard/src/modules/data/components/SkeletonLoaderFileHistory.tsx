import React from 'react';
import SkeletonElement from 'components/skeletons/SkeletonElement';

const SkeletonLoaderFileHistory = ({ itemCount = 3 }: { itemCount?: number }) => {
  return (
    <div className='flex w-full flex-col flex-wrap items-start justify-start'>
      {Array.from({ length: itemCount }).map((_, index) => (
        <div key={index} className='grid w-full grid-cols-1 items-center gap-4 py-3.5'>
          <div className='flex w-full flex-col justify-start rounded-md'>
            <div className='flex w-full items-center justify-between'>
              <SkeletonElement key={index} className='bg-GRAY_400 h-6 w-30 rounded-md' />
              <SkeletonElement key={index} className='bg-GRAY_400 h-5 w-5 rounded-sm' />
            </div>
            <SkeletonElement key={index} className='bg-GRAY_400 mt-1 h-3 w-50 rounded-md' />
          </div>
        </div>
      ))}
    </div>
  );
};

export default SkeletonLoaderFileHistory;
