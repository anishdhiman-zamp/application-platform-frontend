import ImageLoader from '@/components/common/loader/ImageLoader';
import { ZAMP_LOGO_LOADER_SVG } from '@/constants/icons';

export default function Loading() {
  return (
    <div className='flex h-full items-center justify-center'>
      <ImageLoader
        imageSrc={ZAMP_LOGO_LOADER_SVG}
        width={140}
        height={140}
        className='z-50 flex h-[calc(100vh-200px)]'
      />
    </div>
  );
}
