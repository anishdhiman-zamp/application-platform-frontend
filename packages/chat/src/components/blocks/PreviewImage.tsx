import { Skeleton } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import React, { useCallback, useEffect, useState } from 'react';

import IconFallback from './IconFallback';

const IMAGE_STATUS = {
  LOADING: 'loading',
  LOADED: 'loaded',
  ERROR: 'error',
} as const;

type ImageStatus = (typeof IMAGE_STATUS)[keyof typeof IMAGE_STATUS];

interface PreviewImageProps {
  src: string;
  alt: string;
  className?: string;
  children?: React.ReactNode;
}

const PreviewImage = ({ src, alt, className, children }: PreviewImageProps) => {
  const [status, setStatus] = useState<ImageStatus>(IMAGE_STATUS.LOADING);

  const handleLoad = useCallback(() => setStatus(IMAGE_STATUS.LOADED), []);
  const handleError = useCallback(() => setStatus(IMAGE_STATUS.ERROR), []);

  useEffect(() => {
    setStatus(IMAGE_STATUS.LOADING);
  }, [src]);

  if (status === IMAGE_STATUS.ERROR) return <IconFallback fileName={alt} />;

  return (
    <div className='relative size-full'>
      {status === IMAGE_STATUS.LOADING && <Skeleton className='absolute inset-0 size-full rounded-none' />}
      <img
        src={src}
        alt={alt}
        className={cn(status === IMAGE_STATUS.LOADING && 'invisible absolute inset-0', className)}
        draggable={false}
        onLoad={handleLoad}
        onError={handleError}
      />
      {status === IMAGE_STATUS.LOADED && children}
    </div>
  );
};

PreviewImage.displayName = 'PreviewImage';

export default PreviewImage;
