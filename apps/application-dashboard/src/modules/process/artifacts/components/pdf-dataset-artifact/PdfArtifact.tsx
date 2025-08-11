import { useEffect, useMemo } from 'react';
import { usePDFSlick } from '@pdfslick/react';
import { captureException } from '@sentry/nextjs';
import { Skeleton } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
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
  isArtifactLoading: boolean;
  pdfArtifact?: PdfDatasetArtifactsResponseType | PdfArtifactsResponseType;
  fileId?: string;
  className?: string;
  isSearchBarEnabled?: boolean;
};

const LoadingIndicator = () => (
  <div className='flex h-full w-full items-center justify-center p-4'>
    <div className='aspect-[8.5/11] max-h-full w-full max-w-md rounded-sm border border-gray-200 bg-white shadow-md'>
      <Skeleton className='h-full w-full rounded-sm' />
    </div>
  </div>
);

const ErrorFallback = ({ message }: { message: string }) => (
  <div className='flex h-full w-full items-center justify-center'>
    <span className='f-13-450 text-GRAY_600'>{message}</span>
  </div>
);

const PdfArtifact = ({
  processId,
  artifactId,
  pdfArtifact,
  fileId,
  isArtifactLoading,
  className,
  isSearchBarEnabled = false,
}: PDFViewerAppProps) => {
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
      fileId: pdfArtifact?.pdf_file?.file_id || fileId || '',
    },
    {
      skip: !processId || !artifactId,
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
      className={cn('bg-BG_GRAY_1 pdfSlick relative h-full w-full px-4', className)}
    >
      {error && <ErrorFallback message={error?.message} />}
      {!error && !isDocumentLoaded && <LoadingIndicator />}

      {isDocumentLoaded && !error && isSearchBarEnabled && <SearchBar {...{ usePDFSlickStore }} />}
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
