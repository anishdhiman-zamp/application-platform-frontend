import React from 'react';
import SkeletonElement from 'components/skeletons/SkeletonElement';

const SkeletonLoaderListing = () => {
  return (
    <div className='flex flex-col gap-4'>
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className='grid grid-cols-3 gap-4 w-full items-center h-10 border-b-0.5 border-DIVIDER_GRAY'>
          <SkeletonElement key={index} className='h-4 rounded-md bg-GRAY_500 w-1/3' />
          <SkeletonElement key={index} className='h-4 rounded-md bg-GRAY_500 w-3/5' />
          <SkeletonElement key={index} className='h-4 rounded-md bg-GRAY_500 w-1/3' />
        </div>
      ))}
    </div>
  );
};

export default SkeletonLoaderListing;
