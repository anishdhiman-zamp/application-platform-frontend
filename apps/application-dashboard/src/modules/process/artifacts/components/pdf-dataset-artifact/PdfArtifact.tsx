import { useEffect, useMemo } from 'react';
import { usePDFSlick } from '@pdfslick/react';
import { captureException } from '@sentry/nextjs';
import { Skeleton } from '@zamp-platform/ui';
import ArtifactLoader from 'modules/process/artifacts/components/ArtifactLoader';
import SearchBar from 'modules/process/artifacts/components/pdf-dataset-artifact/SearchBar';
import ToolBar from 'modules/process/artifacts/components/pdf-dataset-artifact/ToolBar';
import { useGetSignedUrlByArtifactIdQuery } from '@/apis/processes';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import type { PdfArtifactsResponseType, PdfDatasetArtifactsResponseType } from '@/types/api/processApi.types';

type PDFViewerAppProps = {
  processId: string;
  artifactId: string;
  pdfArtifact: PdfDatasetArtifactsResponseType | PdfArtifactsResponseType;
  isArtifactLoading: boolean;
};

const LoadingIndicator = () => (
  <div className='flex h-full w-full items-center justify-center'>
    <Skeleton className='h-[582px] w-[413px]' />
  </div>
);

const ErrorFallback = ({ message }: { message: string }) => (
  <div className='flex h-full w-full items-center justify-center'>
    <span className='f-13-450 text-GRAY_600'>{message}</span>
  </div>
);

const PdfArtifact = ({ processId, artifactId, pdfArtifact, isArtifactLoading }: PDFViewerAppProps) => {
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
      fileId: pdfArtifact?.pdf_file?.file_id,
    },
    {
      skip: !processId || !artifactId || !pdfArtifact?.pdf_file?.file_id,
      refetchOnMountOrArgChange: false,
    },
  );

  const { viewerRef, usePDFSlickStore, PDFSlickViewer, isDocumentLoaded, error } = usePDFSlick(
    signedUrl?.signed_url || '',
    { scaleValue: 'page-fit' },
  );

  const isCommonLoading = useMemo(
    () => isSignedUrlLoading || isArtifactLoading || isSignedUrlUninitialized,
    [isSignedUrlLoading, isArtifactLoading, isSignedUrlUninitialized],
  );

  useEffect(() => {
    if (error) {
      captureException(error, {
        extra: { signedUrl: signedUrl?.signed_url },
      });
    }
  }, [error, signedUrl]);

  return (
    <CommonWrapper
      isLoading={isCommonLoading}
      isError={isSignedUrlError}
      refetchFunction={refetchSignedUrl}
      skeletonType={SkeletonTypes.CUSTOM}
      loader={<ArtifactLoader />}
      className='bg-BG_GRAY_1 pdfSlick h-full w-full px-4'
    >
      {error && <ErrorFallback message={error?.message} />}
      {!error && !isDocumentLoaded && <LoadingIndicator />}

      {isDocumentLoaded && !error && <SearchBar {...{ usePDFSlickStore }} />}
      {!error && (
        <div className='relative h-full flex-1'>
          <PDFSlickViewer {...{ viewerRef, usePDFSlickStore }} className='!pb-26' />
        </div>
      )}
      {isDocumentLoaded && !error && <ToolBar {...{ usePDFSlickStore }} />}
    </CommonWrapper>
  );
};

export default PdfArtifact;
