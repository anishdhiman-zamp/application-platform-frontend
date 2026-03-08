'use client';

import { useCallback, useState } from 'react';
import { captureException } from '@sentry/nextjs';
import { cn } from '@zamp-platform/ui/utils';
import { isImageCached } from 'modules/pace/components/files/file-tree.utils';
import Image from 'next/image';
import ImageLoader from '@/components/common/loader/ImageLoader';
import { ZAMP_LOGO_LOADER_SVG } from '@/constants/icons';

interface ImageViewerProps {
  src: string;
  alt?: string;
  className?: string;
  onError?: (message?: string) => void;
}

const ImageViewer = ({ src, alt = 'Image preview', className = '', onError }: ImageViewerProps) => {
  const [isLoading, setIsLoading] = useState(() => !isImageCached(src));
  const [isError, setIsError] = useState(false);

  const handleImageError = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      setIsLoading(false);
      setIsError(true);
      captureException(e, {
        extra: { src },
      });
      onError?.('The image could not be displayed');
    },
    [src, onError],
  );

  const handleImageLoad = useCallback(() => {
    setIsLoading(false);
    setIsError(false);
  }, []);

  return (
    <div className={cn('relative flex h-full w-full flex-col', className)}>
      <div className='bg-BG_GRAY_1 relative flex-1 overflow-auto'>
        <div
          className={cn(
            'absolute inset-0 z-10 transition-opacity duration-300 ease-in-out',
            isLoading ? 'opacity-100' : 'pointer-events-none opacity-0',
          )}
        >
          <ImageLoader imageSrc={ZAMP_LOGO_LOADER_SVG} width={140} height={140} />
        </div>

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
