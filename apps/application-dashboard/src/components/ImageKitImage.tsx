'use client';

import { Image, ImageKitProvider } from '@imagekit/next';
import { IMAGEKIT_URL_ENDPOINT } from '@/constants/icons';

interface ImageKitImageProps {
  src: string;
  width: number;
  height: number;
  alt: string;
  className?: string;
}

const ImageKitImage = ({
  src,
  width = 150,
  height = 150,
  alt,
  className = 'h-full w-full object-cover object-center',
}: ImageKitImageProps) => {
  // Extract path from full ImageKit URL if needed
  const imagePath = src.startsWith(IMAGEKIT_URL_ENDPOINT) ? src.replace(IMAGEKIT_URL_ENDPOINT, '') : src;

  return (
    <ImageKitProvider urlEndpoint={IMAGEKIT_URL_ENDPOINT}>
      <Image src={imagePath} width={width} height={height} alt={alt} className={className} />
    </ImageKitProvider>
  );
};

export default ImageKitImage;
