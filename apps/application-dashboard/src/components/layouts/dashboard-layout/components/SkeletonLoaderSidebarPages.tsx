import SkeletonElement from 'components/skeletons/SkeletonElement';

const SkeletonLoaderSidebarPages = () => {
  return (
    <div className='ml-1 flex w-full flex-col gap-3'>
      <SkeletonElement className='bg-GRAY_400 h-4 w-1/3 rounded' />
      <SkeletonElement className='bg-GRAY_400 h-4 w-1/2 rounded' />
      <SkeletonElement className='bg-GRAY_400 h-4 w-2/5 rounded' />
    </div>
  );
};

export default SkeletonLoaderSidebarPages;
