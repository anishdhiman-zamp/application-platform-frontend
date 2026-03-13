import { FC, HTMLAttributes } from 'react';
import { cn } from '@zamp-platform/ui/utils';

interface ImageLoaderProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
  imageSrc: string;
  imageClassName?: string;
  width?: number;
  height?: number;
}

const ImageLoader: FC<ImageLoaderProps> = ({ className, imageSrc, imageClassName, width, height, ...props }) => {
  return (
    <div className={cn('bg-BG_WHITE flex h-full w-full items-center justify-center', className)} {...props}>
      <img
        src={imageSrc}
        alt='loader'
        width={width}
        height={height}
        className={cn('dark:opacity-50', imageClassName)}
      />
    </div>
  );
};

export default ImageLoader;
