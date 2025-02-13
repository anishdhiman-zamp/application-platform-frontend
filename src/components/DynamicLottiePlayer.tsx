import React from 'react';
import dynamic from 'next/dynamic';
import { MapAny } from 'types/commonTypes';

const Player = dynamic(() => import('@lottiefiles/react-lottie-player').then((mod) => mod.Player), {
  ssr: false,
});

const DynamicLottiePlayer = ({ src, autoplay, style = {}, keepLastFrame }: MapAny) => {
  return src ? <Player src={src} style={style} autoplay={autoplay} keepLastFrame={keepLastFrame} loop /> : null;
};

export default DynamicLottiePlayer;
