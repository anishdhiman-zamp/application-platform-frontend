import { ZAMP_LOGO_LOADER } from 'constants/lottie/zamp-logo-loader';
import DynamicLottiePlayer from 'components/DynamicLottiePlayer';

export default function LoginLoading() {
  return (
    <div className='flex justify-center items-center h-[calc(100vh-200px)] w-full z-50 bg-white'>
      <DynamicLottiePlayer src={ZAMP_LOGO_LOADER} className='lottie-player h-[140px]' autoplay loop keepLastFrame />
    </div>
  );
}
