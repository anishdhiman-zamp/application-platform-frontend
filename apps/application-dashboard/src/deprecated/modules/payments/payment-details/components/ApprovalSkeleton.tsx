const ApprovalSkeleton = () => {
  return (
    <div className='flex flex-col gap-4'>
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className='border-GRAY_500 flex h-[100px] w-full overflow-hidden rounded-lg border'>
          <div className='bg-GRAY_100'>
            <div className='bg-GRAY_1000 f-12-500 flex h-6 w-6 items-center justify-center text-white'>
              <div className='bg-BG_GRAY_1 h-4 w-2 rounded-md opacity-40' />
            </div>
          </div>
          <div className='w-full p-5'>
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index}>
                <div className='f-12-500 text-GRAY_700 bg-GRAY_200 mb-1.5 h-4 w-10 animate-pulse rounded-md capitalize' />
                <div className='flex flex-wrap gap-1.5'>
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className='bg-GRAY_200 h-4 w-10 animate-pulse rounded-md' />
                  ))}
                </div>
                {index !== 2 && (
                  <div className='f-11-600 text-GRAY_1000 my-4 flex items-center gap-1.5'>
                    <div className='bg-GRAY_200 h-4 w-10 animate-pulse rounded-md' />
                    <div className='border-GRAY_400 w-full border-b border-dashed' />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ApprovalSkeleton;
