import { FC } from 'react';
import { cn } from '@zamp-platform/ui/utils';
import Image from 'next/image';
import { ZAMP_LOGO_LOADER_WEBP } from '@/constants/icons';

interface ZampLogoWebpLoaderProps {
  className?: string;
}

const ZampLogoWebpLoader: FC<ZampLogoWebpLoaderProps> = ({ className }) => {
  return (
    <div className={cn('flex h-full w-full items-center justify-center rounded-tl-xl bg-white', className)}>
      <Image src={ZAMP_LOGO_LOADER_WEBP} alt='zamp logo loader' width={140} height={140} priority unoptimized />
    </div>
  );
};

export default ZampLogoWebpLoader;
