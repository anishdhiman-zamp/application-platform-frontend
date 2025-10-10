import { ZAMP_LOGO_LOADER } from 'constants/lottie/zamp-logo-loader';
import DynamicLottiePlayer from 'components/DynamicLottiePlayer';

export default function Loading() {
  console.log('Loading');

  return (
    <div className='z-50 flex h-[calc(100vh-200px)] w-full items-center justify-center bg-white'>
      <DynamicLottiePlayer src={ZAMP_LOGO_LOADER} className='lottie-player h-[140px]' autoplay loop keepLastFrame />
    </div>
  );
}
