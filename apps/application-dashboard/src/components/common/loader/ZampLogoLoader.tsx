import React, { FC } from 'react';
import { Player } from '@lottiefiles/react-lottie-player';
import { ZAMP_LOGO_LOADER } from 'constants/lottie/zamp-logo-loader';
import { cn } from '@/utils/common';

interface ZampLogoLoaderProps {
  className?: string;
}

const ZampLogoLoader: FC<ZampLogoLoaderProps> = ({ className }) => {
  return (
    <div className={cn('z-1000 flex h-full w-full items-center justify-center overflow-y-auto bg-white', className)}>
      <Player src={ZAMP_LOGO_LOADER} className='lottie-player h-[140px]' autoplay keepLastFrame loop />
    </div>
  );
};

export default ZampLogoLoader;
