import SkeletonElement from '@/components/skeletons/SkeletonElement';

const ArtifactsSkeleton = () => {
  return (
    <>
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className='flex w-full flex-col gap-y-2'>
          <SkeletonElement className='bg-GRAY_400 h-4 w-1/2 rounded' />
          <SkeletonElement className='bg-GRAY_400 h-4 w-3/4 rounded' />
          <SkeletonElement className='bg-GRAY_400 h-4 w-2/3 rounded' />
        </div>
      ))}
    </>
  );
};

export default ArtifactsSkeleton;
