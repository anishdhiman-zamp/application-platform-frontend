import React, { FC } from 'react';
import { DASHBOARD_LOADER } from 'constants/lottie/dashboard_loader';
import { cn } from 'utils/common';
import SkeletonElement from 'components/common/skeletons/SkeletonElement';
import DynamicLottiePlayer from 'components/DynamicLottiePlayer';

type DashboardLoaderPropsType = {
  isFadingOut: boolean;
};

const DashboardLoader: FC<DashboardLoaderPropsType> = ({ isFadingOut }) => {
  return (
    <div
      className={cn(
        'z-1000 bg-BACKGROUND_GRAY_1 fixed inset-0 flex flex-col items-center justify-between transition duration-500 ease-out',
        isFadingOut ? 'pointer-events-none translate-x-40 opacity-100' : 'translate-x-0 opacity-100',
      )}
    >
      <div className='border-GRAY_400 flex h-12 w-full items-center justify-between border-2 bg-white px-8 py-4'>
        <div className='flex gap-4'>
          <SkeletonElement elementCount={3} className='bg-GRAY_400 h-4 w-4 rounded-sm' />
          <SkeletonElement elementCount={1} className='bg-GRAY_400 h-4 w-20 rounded-sm' />
        </div>
        <span className='bg-GRAY_400 before:bg-linear-to-r relative h-5 w-60 overflow-hidden rounded-sm before:absolute before:inset-0 before:h-full before:w-full before:animate-[shimmer-skeleton_1.5s_infinite] before:from-transparent before:via-white/60 before:to-transparent'></span>

        <div className='flex gap-4'>
          <SkeletonElement elementCount={1} className='bg-GRAY_400 h-5 w-8 rounded-sm' />
          <SkeletonElement elementCount={1} className='bg-GRAY_400 h-5 w-12 rounded-sm' />
        </div>
      </div>
      <div className={cn('transition-transform delay-150 duration-500', isFadingOut ? 'scale-150' : 'scale-100')}>
        <DynamicLottiePlayer
          src={DASHBOARD_LOADER}
          className='lottie-player'
          autoplay
          keepLastFrame
          style={{ height: '400px' }}
        />
      </div>
      <div></div>
    </div>
  );
};

export default DashboardLoader;
