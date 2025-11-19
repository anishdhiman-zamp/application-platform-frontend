import { FC } from 'react';
import { ZAMP_LOGO_LOADER_SVG } from '@/constants/icons';

interface ZampLogoLoaderProps {
  className?: string;
  width?: number;
  height?: number;
}

const ZampLogoLoader: FC<ZampLogoLoaderProps> = ({ className, width = 140, height = 140 }) => {
  return <img src={ZAMP_LOGO_LOADER_SVG} alt='zamp logo loader' width={width} height={height} className={className} />;
};

export default ZampLogoLoader;
