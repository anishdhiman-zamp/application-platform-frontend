'use client';

import { useCallback, useState } from 'react';
import { captureException } from '@sentry/nextjs';
import { cn } from '@zamp-platform/ui/utils';
import Image from 'next/image';
import ImageLoader from '@/components/common/loader/ImageLoader';
import { ZAMP_LOGO_LOADER_SVG } from '@/constants/icons';
import FileNotFoundError from '@/modules/pace/components/file-viewer/FileNotFoundError';

interface ImageViewerProps {
  src: string;
  alt?: string;
  className?: string;
  fileName?: string;
  onClose?: () => void;
}

const ImageViewer = ({ src, alt = 'Image preview', className = '', fileName, onClose }: ImageViewerProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const displayFileName = fileName || decodeURIComponent(src.split('/').pop() || 'image');

  const handleImageError = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      setIsLoading(false);
      setIsError(true);
      captureException(e, {
        extra: { src },
      });
    },
    [src],
  );

  const handleImageLoad = useCallback(() => {
    setIsLoading(false);
    setIsError(false);
  }, []);

  if (isError && onClose) {
    return <FileNotFoundError fileName={displayFileName} onClose={onClose} />;
  }

  return (
    <div className={cn('relative flex h-full w-full flex-col', className)}>
      <div className='bg-BG_GRAY_1 relative flex-1 overflow-auto'>
        <div
          className={cn(
            'absolute inset-0 z-10 transition-opacity duration-300 ease-in-out',
            isLoading ? 'opacity-100' : 'pointer-events-none opacity-0',
          )}
        >
          <ImageLoader imageSrc={ZAMP_LOGO_LOADER_SVG} width={140} height={140} className='bg-BG_GRAY_1' />
        </div>

        {isError && !onClose && (
          <div className='flex h-full w-full items-center justify-center'>
            <div className='text-center'>
              <p className='f-14-500 text-GRAY_700'>Failed to load image</p>
              <p className='f-12-400 text-GRAY_500 mt-1'>The image could not be displayed</p>
            </div>
          </div>
        )}

        {!isError && (
          <div
            className={cn(
              'absolute inset-0 flex items-center justify-center p-4 transition-opacity duration-300 ease-in-out',
              isLoading ? 'opacity-0' : 'opacity-100',
            )}
          >
            <Image
              src={src}
              alt={alt}
              width={800}
              height={600}
              className='max-h-[80%] max-w-[80%] object-contain'
              onLoad={handleImageLoad}
              onError={handleImageError}
              unoptimized
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageViewer;
