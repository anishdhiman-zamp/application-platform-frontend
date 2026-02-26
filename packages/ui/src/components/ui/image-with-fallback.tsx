'use client';

import { cn } from '@zamp-platform/ui/utils';
import { ComponentPropsWithoutRef, FC, SyntheticEvent, useCallback, useState } from 'react';

const DEFAULT_FALLBACK = 'https://ik.imagekit.io/zamp00kit/icons/zamp-icon.svg';

interface ImageWithFallbackProps extends ComponentPropsWithoutRef<'img'> {
  fallbackSrc?: string;
}

export const ImageWithFallback: FC<ImageWithFallbackProps> = ({
  src,
  fallbackSrc = DEFAULT_FALLBACK,
  className,
  onError,
  ...props
}) => {
  const [imgSrc, setImgSrc] = useState(src);

  const handleError = useCallback(
    (e: SyntheticEvent<HTMLImageElement, Event>) => {
      if (imgSrc !== fallbackSrc) {
        setImgSrc(fallbackSrc);
      }
      onError?.(e);
    },
    [imgSrc, fallbackSrc, onError],
  );

  return <img src={imgSrc || fallbackSrc} className={cn(className)} onError={handleError} {...props} />;
};
