import React from 'react';
import SkeletonElement from 'components/skeletons/SkeletonElement';

const WhoHasAccessSkeletonLoader = () => {
  return (
    <div className='mt-2 flex w-full justify-between pl-2 pr-1'>
      <SkeletonElement className='bg-GRAY_50 h-4 w-32 rounded-md' />
      <SkeletonElement className='bg-GRAY_50 h-4 w-16 rounded-md' />
    </div>
  );
};

export default WhoHasAccessSkeletonLoader;
