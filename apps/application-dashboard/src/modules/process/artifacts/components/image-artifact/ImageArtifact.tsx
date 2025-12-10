'use client';

import ArtifactLoader from 'modules/process/artifacts/components/ArtifactLoader';
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

const ImageArtifact = ({ imageArtifact, artifactId, processId }: ImageArtifactProps) => {
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

  return (
    <CommonWrapper
      isLoading={isSignedUrlLoading}
      isError={isSignedUrlError}
      refetchFunction={refetchSignedUrl}
      skeletonType={SkeletonTypes.CUSTOM}
      loader={<ArtifactLoader />}
      className='bg-BG_GRAY_1 h-full w-full p-4'
    >
      {/* Inner wrapper for the image to fill */}
      <div className='relative h-full w-full overflow-hidden'>
        <Image
          src={signedUrl?.signed_url || 'https://ik.imagekit.io/forrykorc/default-image.jpg?updatedAt=1763993334439'}
          alt={imageArtifact?.display_name || 'Image'}
          fill
          className='object-contain'
          priority
        />
      </div>
    </CommonWrapper>
  );
};

export default ImageArtifact;
