'use client';

import { useCallback, useState } from 'react';
import ArtifactLoader from 'modules/process/artifacts/components/ArtifactLoader';
import ImageToolBar from 'modules/process/artifacts/components/image-artifact/ImageToolBar';
import Image from 'next/image';
import { useGetSignedUrlByArtifactIdQuery } from '@/apis/processes';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import { ImageArtifactsResponseType } from '@/types/api/processApi.types';

interface ImageArtifactProps {
  imageArtifact: ImageArtifactsResponseType;
  processId: string;
  artifactId: string;
}

const MIN_SCALE = 0.5;
const MAX_SCALE = 3.0;
const ZOOM_STEP = 0.25;

const ImageArtifact = ({ imageArtifact, artifactId, processId }: ImageArtifactProps) => {
  const [scale, setScale] = useState(1);

  const {
    data: signedUrl,
    isLoading: isSignedUrlLoading,
    isError: isSignedUrlError,
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

  return (
    <CommonWrapper
      isLoading={isSignedUrlLoading}
      isError={isSignedUrlError}
      refetchFunction={refetchSignedUrl}
      skeletonType={SkeletonTypes.CUSTOM}
      loader={<ArtifactLoader />}
      className='bg-BG_GRAY_1 relative h-full w-full p-4'
    >
      {/* Inner wrapper for the image with zoom support */}
      <div className='relative h-full w-full overflow-auto'>
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
              src={
                signedUrl?.signed_url || 'https://ik.imagekit.io/forrykorc/default-image.jpg?updatedAt=1763993334439'
              }
              alt={imageArtifact?.display_name || 'Image'}
              fill
              className='object-contain'
              priority
            />
          </div>
        </div>
      </div>

      <ImageToolBar
        scale={scale}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        minScale={MIN_SCALE}
        maxScale={MAX_SCALE}
      />
    </CommonWrapper>
  );
};

export default ImageArtifact;
