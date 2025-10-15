import { FC } from 'react';
import { cn } from '@zamp-platform/ui/utils';
import Image from 'next/image';
import { ZAMP_LOGO_LOADER_WEBP_CDN, ZAMP_LOGO_LOADER_WEBP_WITHOUT_CDN } from '@/constants/icons';

interface ZampLogoGifLoaderProps {
  className?: string;
}

const ZampLogoGifLoader: FC<ZampLogoGifLoaderProps> = ({ className }) => {
  return (
    <div className={cn('flex h-full w-full items-center justify-center rounded-tl-xl bg-white', className)}>
      <Image src={ZAMP_LOGO_LOADER_WEBP_CDN} alt='zamp logo loader' width={140} height={140} priority unoptimized />
      <Image
        src={ZAMP_LOGO_LOADER_WEBP_WITHOUT_CDN}
        alt='zamp logo loader'
        width={140}
        height={140}
        priority
        unoptimized
        className='hidden'
      />
    </div>
  );
};

export default ZampLogoGifLoader;
