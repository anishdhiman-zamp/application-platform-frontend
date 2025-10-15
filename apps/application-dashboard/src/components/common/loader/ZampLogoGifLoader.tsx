import { FC } from 'react';
import { cn } from '@zamp-platform/ui/utils';
import Image from 'next/image';
import { ZAMP_LOGO_LOADER_GIF } from '@/constants/icons';

interface ZampLogoGifLoaderProps {
  className?: string;
}

const ZampLogoGifLoader: FC<ZampLogoGifLoaderProps> = ({ className }) => {
  return (
    <div className={cn('flex h-full w-full items-center justify-center rounded-tl-xl bg-white', className)}>
      <Image src={ZAMP_LOGO_LOADER_GIF} alt='zamp logo loader' width={140} height={140} unoptimized />
    </div>
  );
};

export default ZampLogoGifLoader;
