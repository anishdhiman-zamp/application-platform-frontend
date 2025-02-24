import React from 'react';
import SkeletonElement from 'components/skeletons/SkeletonElement';

const SkeletonLoaderSidebarPages = () => {
  return (
    <div className='flex flex-col gap-3 w-full'>
      <SkeletonElement className='h-4 rounded bg-GRAY_500 w-1/3' />
      <SkeletonElement className='h-4 rounded bg-GRAY_500 w-1/2' />
      <SkeletonElement className='h-4 rounded bg-GRAY_500 w-2/5' />
    </div>
  );
};

export default SkeletonLoaderSidebarPages;
