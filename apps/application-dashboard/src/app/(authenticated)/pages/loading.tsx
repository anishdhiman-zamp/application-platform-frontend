import DynamicLottiePlayer from '@/components/DynamicLottiePlayer';
import { ZAMP_LOGO_LOADER } from '@/constants/lottie/zamp-logo-loader';

export default function Loading() {
  return (
    <div className='flex h-full items-center justify-center'>
      <div className='z-50 flex h-[calc(100vh-200px)] w-full items-center justify-center bg-white'>
        <DynamicLottiePlayer src={ZAMP_LOGO_LOADER} className='lottie-player h-[140px]' autoplay loop keepLastFrame />
      </div>
    </div>
  );
}
