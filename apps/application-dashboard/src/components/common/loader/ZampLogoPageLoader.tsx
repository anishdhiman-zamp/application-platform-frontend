import { FC } from 'react';
import { cn } from '@zamp-platform/ui/utils';
import ZampLogoLoader from '@/components/common/loader/ZampLogoLoader';

interface ZampLogoPageLoaderProps {
  className?: string;
}

const ZampLogoPageLoader: FC<ZampLogoPageLoaderProps> = ({ className }) => {
  return (
    <div className={cn('flex h-full w-full items-center justify-center rounded-tl-xl bg-white', className)}>
      <ZampLogoLoader />
    </div>
  );
};

export default ZampLogoPageLoader;
