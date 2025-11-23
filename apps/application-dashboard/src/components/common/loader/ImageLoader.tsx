import { FC } from 'react';
import { cn } from '@zamp-platform/ui/utils';

interface ImageLoaderProps {
  className?: string;
  imageSrc: string;
  imageClassName?: string;
  width?: number;
  height?: number;
}

const ImageLoader: FC<ImageLoaderProps> = ({ className, imageSrc, imageClassName, width, height }) => {
  return (
    <div className={cn('flex h-full w-full items-center justify-center bg-white', className)}>
      <img src={imageSrc} alt='loader' width={width} height={height} className={imageClassName} />
    </div>
  );
};

export default ImageLoader;
