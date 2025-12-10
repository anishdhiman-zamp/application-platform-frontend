'use client';

import { useCallback, useMemo, useState } from 'react';
import { captureException } from '@sentry/browser';
import { Skeleton } from '@zamp-platform/ui';
import ArtifactLoader from 'modules/process/artifacts/components/ArtifactLoader';
import ImageToolBar from 'modules/process/artifacts/components/image-artifact/ImageToolBar';
import Image from 'next/image';
import { useGetSignedUrlByArtifactIdQuery } from '@/apis/processes';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import { ImageArtifactsResponseType } from '@/types/api/processApi.types';
import { cn } from '@/utils/common';

const ImageLoadingIndicator = () => (
  <div className='flex h-full w-full items-center justify-center p-4'>
    <div className='aspect-square max-h-full w-full max-w-md rounded-sm border border-gray-200 bg-white shadow-md'>
      <Skeleton className='h-full w-full rounded-sm' />
    </div>
  </div>
);

interface ImageArtifactProps {
  imageArtifact: ImageArtifactsResponseType;
  isArtifactsFetching: boolean;
  processId: string;
  artifactId: string;
}

const MIN_SCALE = 0.5;
const MAX_SCALE = 3.0;
const ZOOM_STEP = 0.25;

const ImageArtifact = ({ imageArtifact, artifactId, processId, isArtifactsFetching }: ImageArtifactProps) => {
  const [scale, setScale] = useState(1);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isImageError, setIsImageError] = useState(false);

  const {
    data: signedUrl,
    isLoading: isSignedUrlLoading,
    isError: isSignedUrlError,
    isUninitialized: isSignedUrlUninitialized,
    refetch: refetchSignedUrl,
  } = useGetSignedUrlByArtifactIdQuery(
    {
      processId,
      artifactId,
      fileId: imageArtifact?.file?.file_id,
    },
    {
      skip: !processId || !artifactId || !imageArtifact?.file?.file_id,
      refetchOnMountOrArgChange: false,
    },
  );

  const handleZoomIn = useCallback(() => {
    setScale((prev) => Math.min(prev + ZOOM_STEP, MAX_SCALE));
  }, []);

  const handleZoomOut = useCallback(() => {
    setScale((prev) => Math.max(prev - ZOOM_STEP, MIN_SCALE));
  }, []);

  const handleImageError = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      setIsImageLoaded(true);
      setIsImageError(true);
      captureException(e, {
        extra: { signedUrl: signedUrl?.signed_url },
      });
    },
    [signedUrl?.signed_url],
  );

  const handleImageLoad = useCallback(() => {
    setIsImageLoaded(true);
  }, []);

  const isCommonLoading = useMemo(() => {
    return isSignedUrlLoading || isArtifactsFetching || isSignedUrlUninitialized;
  }, [isSignedUrlLoading, isArtifactsFetching, isSignedUrlUninitialized]);

  return (
    <CommonWrapper
      isLoading={isCommonLoading}
      isError={isSignedUrlError || isImageError}
      refetchFunction={refetchSignedUrl}
      skeletonType={SkeletonTypes.CUSTOM}
      loader={<ArtifactLoader />}
      className='bg-BG_GRAY_1 relative h-full w-full p-4'
    >
      {!isImageLoaded && <ImageLoadingIndicator />}

      <div className={cn('relative h-full w-full overflow-auto', !isImageLoaded ? 'invisible absolute' : '')}>
        <div
          className='flex h-full w-full items-center justify-center'
          style={{
            minWidth: scale > 1 ? `${scale * 100}%` : '100%',
            minHeight: scale > 1 ? `${scale * 100}%` : '100%',
          }}
        >
          <div
            className='relative'
            style={{
              width: `${scale * 100}%`,
              height: `${scale * 100}%`,
              transition: 'width 0.2s ease, height 0.2s ease',
            }}
          >
            <Image
              src={signedUrl?.signed_url || ''}
              alt={imageArtifact?.display_name || 'Image'}
              fill
              className='object-contain'
              priority
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          </div>
        </div>
      </div>

      {isImageLoaded && (
        <ImageToolBar
          scale={scale}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          minScale={MIN_SCALE}
          maxScale={MAX_SCALE}
        />
      )}
    </CommonWrapper>
  );
};

export default ImageArtifact;
