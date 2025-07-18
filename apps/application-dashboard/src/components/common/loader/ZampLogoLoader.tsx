import React, { FC } from 'react';
import { ZAMP_LOGO_LOADER } from 'constants/lottie/zamp-logo-loader';
import DynamicLottiePlayer from 'components/DynamicLottiePlayer';

const ZampLogoLoader: FC = () => {
  return (
    <div className='z-1000 flex h-full w-full items-center justify-center overflow-y-auto bg-white'>
      <DynamicLottiePlayer src={ZAMP_LOGO_LOADER} className='lottie-player h-[140px]' autoplay loop keepLastFrame />
    </div>
  );
};

export default ZampLogoLoader;
