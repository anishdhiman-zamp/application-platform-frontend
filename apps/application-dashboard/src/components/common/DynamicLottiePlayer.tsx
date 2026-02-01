'use client';

import { FC } from 'react';
import type { LottieComponentProps } from 'lottie-react';
import dynamic from 'next/dynamic';

const LottiePlayer = dynamic(() => import('lottie-react'), {
  ssr: false,
});

const DynamicLottiePlayer: FC<LottieComponentProps> = (props) => {
  return <LottiePlayer {...props} />;
};

export default DynamicLottiePlayer;
