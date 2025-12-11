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

interface PDFViewerAppProps {
  processId: string;
  artifactId: string;
  fileId: string;
  className?: string;
  isArtifactsFetching?: boolean;
  isSearchBarEnabled?: boolean;
  toolBarClassName?: string;
}

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
  fileId,
  className,
  isSearchBarEnabled = false,
  isArtifactsFetching = false,
  toolBarClassName,
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
      fileId,
    },
    {
      skip: !processId || !artifactId || !fileId,
      refetchOnMountOrArgChange: false,
    },
  );

  const { viewerRef, usePDFSlickStore, PDFSlickViewer, isDocumentLoaded, error } = usePDFSlick(
    signedUrl?.signed_url || '',
    { scaleValue: 'page-fit' },
  );

  const isCommonLoading = useMemo(
    () => isSignedUrlLoading || isArtifactsFetching || isSignedUrlUninitialized,
    [isSignedUrlLoading, isArtifactsFetching, isSignedUrlUninitialized],
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
      errorCardStyle='mx-auto'
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
          <PDFSlickViewer {...{ viewerRef, usePDFSlickStore }} className='!pb-40' />
        </div>
      )}
      {isDocumentLoaded && !error && <ToolBar {...{ usePDFSlickStore }} className={toolBarClassName} />}
    </CommonWrapper>
  );
};

export default PdfArtifact;
