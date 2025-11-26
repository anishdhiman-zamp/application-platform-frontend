import type { FC } from 'react';
import { useGetSignedUrlByArtifactIdQuery } from '@/apis/processes';
import ImageLoader from '@/components/common/loader/ImageLoader';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import { ZAMP_LOGO_LOADER_SVG } from '@/constants/icons';
import VideoPlayer from '@/modules/process/artifacts/components/browser-artifact/VideoPlayer';
import type { BrowserArtifactsResponseType } from '@/types/api/processApi.types';

interface BrowserArtifactProps {
  processId: string;
  artifactId: string;
  browserArtifact: BrowserArtifactsResponseType;
}

const BrowserArtifact: FC<BrowserArtifactProps> = ({ browserArtifact, processId, artifactId }) => {
  const {
    data: signedUrl,
    isLoading: isSignedUrlLoading,
    isError: isSignedUrlError,
    refetch: refetchSignedUrl,
  } = useGetSignedUrlByArtifactIdQuery(
    {
      processId: processId as string,
      artifactId,
      fileId: browserArtifact?.browser_session_recording?.file_id,
    },
    {
      skip: !processId || !artifactId || !browserArtifact?.browser_session_recording?.file_id,
      refetchOnMountOrArgChange: false,
    },
  );

  return (
    <CommonWrapper
      isLoading={isSignedUrlLoading}
      isError={isSignedUrlError}
      refetchFunction={refetchSignedUrl}
      skeletonType={SkeletonTypes.CUSTOM}
      loader={
        <ImageLoader imageSrc={ZAMP_LOGO_LOADER_SVG} width={140} height={140} className='z-50 h-[calc(100vh-200px)]' />
      }
      className='bg-BG_GRAY_2 h-full w-full p-3'
    >
      <div className='flex h-full w-full flex-col items-center justify-center py-8'>
        <div className='w-full max-w-[800px]'>
          <VideoPlayer src={signedUrl?.signed_url || ''} />
        </div>
      </div>
    </CommonWrapper>
  );
};

export default BrowserArtifact;
