import SkeletonElement from '@/components/skeletons/SkeletonElement';

const ArtifactsSkeleton = () => {
  return (
    <>
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className='flex flex-col gap-y-2 w-full'>
          <SkeletonElement className='h-4 rounded bg-GRAY_400 w-1/2' />
          <SkeletonElement className='h-4 rounded bg-GRAY_400 w-3/4' />
          <SkeletonElement className='h-4 rounded bg-GRAY_400 w-2/3' />
        </div>
      ))}
    </>
  );
};

export default ArtifactsSkeleton;
