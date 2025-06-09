import React from 'react';
import SkeletonElement from 'components/skeletons/SkeletonElement';

const OptionsListSkeletonLoader = () => {
  return (
    <div className='pl-1'>
      <SkeletonElement className='bg-GRAY_50 h-4 w-40 rounded-md' />
    </div>
  );
};

export default OptionsListSkeletonLoader;
