import ImageLoader from '@/components/common/loader/ImageLoader';
import { ZAMP_LOGO_LOADER_SVG } from '@/constants/icons';

const CustomLoadingOverlay = () => {
  return (
    <div role='presentation' className='flex h-full w-full items-center justify-center'>
      <ImageLoader imageSrc={ZAMP_LOGO_LOADER_SVG} width={140} height={140} />
    </div>
  );
};

export default CustomLoadingOverlay;
