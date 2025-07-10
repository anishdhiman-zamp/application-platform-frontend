import type { FC } from 'react';
import { useGetSignedUrlByArtifactIdQuery } from '@/apis/processes';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import DynamicLottiePlayer from '@/components/DynamicLottiePlayer';
import { ZAMP_LOGO_LOADER } from '@/constants/lottie/zamp-logo-loader';
import VideoPlayer from '@/modules/process/artifacts/components/browser-artifact/VideoPlayer';
import type { BrowserArtifactsResponseType } from '@/types/api/processApi.types';

interface BrowserArtifactProps {
  browserArtifact: BrowserArtifactsResponseType;
  artifactId: string;
  processId: string;
}

const BrowserArtifact: FC<BrowserArtifactProps> = ({ browserArtifact, artifactId, processId }) => {
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
        <div className='z-50 flex h-[calc(100vh-200px)] w-full items-center justify-center'>
          <DynamicLottiePlayer src={ZAMP_LOGO_LOADER} className='lottie-player h-[140px]' autoplay loop keepLastFrame />
        </div>
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
