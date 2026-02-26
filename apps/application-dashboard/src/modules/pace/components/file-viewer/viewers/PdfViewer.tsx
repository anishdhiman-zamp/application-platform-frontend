'use client';

import { useEffect, useState } from 'react';
import { usePDFSlick } from '@pdfslick/react';
import { captureException } from '@sentry/nextjs';
import { cn } from '@zamp-platform/ui/utils';
import { ChevronDown, ChevronUp, Download, ZoomIn, ZoomOut } from 'lucide-react';
import ImageLoader from '@/components/common/loader/ImageLoader';
import { ZAMP_LOGO_LOADER_SVG } from '@/constants/icons';
import FileNotFoundError from '@/modules/pace/components/file-viewer/FileNotFoundError';

interface PdfViewerProps {
  src: string;
  className?: string;
  fileName?: string;
  onClose?: () => void;
}

const PdfToolbar = ({ usePDFSlickStore }: { usePDFSlickStore: ReturnType<typeof usePDFSlick>['usePDFSlickStore'] }) => {
  const { pageNumber, numPages, scale, pdfSlick } = usePDFSlickStore();

  return (
    <div className='absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 transform items-center rounded-md bg-black whitespace-nowrap'>
      <Download
        size={14}
        onClick={() => pdfSlick?.downloadOrSave()}
        className='box-content cursor-pointer rounded px-2.5 py-1.5 text-white'
      />

      <div className='border-GRAY_950 flex items-center justify-center gap-x-1.5 border-l px-2.5 py-1.5'>
        <ChevronUp
          size={12}
          onClick={() => pdfSlick?.viewer?.previousPage()}
          className={cn(
            'box-content cursor-pointer rounded p-0.5',
            pageNumber <= 1 ? 'cursor-not-allowed text-gray-600 opacity-50' : 'text-white',
          )}
        />

        <div className='f-11-500 flex items-center gap-x-1.5 text-white select-none'>
          <span>Page</span>
          <span className='bg-GRAY_950 rounded px-2 py-0.5'>{pageNumber}</span>
          <span>/</span>
          <span>{numPages ?? '--'}</span>
        </div>

        <ChevronDown
          size={12}
          onClick={() => pdfSlick?.viewer?.nextPage()}
          className={cn(
            'box-content cursor-pointer rounded p-0.5',
            pageNumber >= numPages ? 'cursor-not-allowed text-gray-600 opacity-50' : 'text-white',
          )}
        />

        <ZoomOut
          size={12}
          onClick={() => pdfSlick?.viewer?.decreaseScale()}
          className={cn(
            'box-content cursor-pointer rounded p-0.5',
            scale <= 0.1 ? 'cursor-not-allowed text-gray-600 opacity-50' : 'text-white',
          )}
        />
        <ZoomIn
          size={12}
          onClick={() => pdfSlick?.viewer?.increaseScale()}
          className={cn(
            'box-content cursor-pointer rounded p-0.5',
            scale >= 5.0 ? 'cursor-not-allowed text-gray-600 opacity-50' : 'text-white',
          )}
        />
      </div>
    </div>
  );
};

const LoadingIndicator = ({ isLoading }: { isLoading: boolean }) => (
  <div
    className={cn(
      'absolute inset-0 z-10 transition-opacity duration-300 ease-in-out',
      isLoading ? 'opacity-100' : 'pointer-events-none opacity-0',
    )}
  >
    <ImageLoader imageSrc={ZAMP_LOGO_LOADER_SVG} width={140} height={140} className='bg-BG_GRAY_2' />
  </div>
);

const ErrorFallback = ({ message }: { message: string }) => (
  <div className='flex h-full w-full items-center justify-center'>
    <div className='text-center'>
      <p className='f-14-500 text-GRAY_700'>Failed to load PDF</p>
      <p className='f-12-400 text-GRAY_500 mt-1'>{message}</p>
    </div>
  </div>
);

const PdfViewer = ({ src, className = '', fileName, onClose }: PdfViewerProps) => {
  const [isLoading, setIsLoading] = useState(true);

  const displayFileName = fileName || decodeURIComponent(src.split('/').pop() || 'document.pdf');

  const { viewerRef, usePDFSlickStore, PDFSlickViewer, isDocumentLoaded, error } = usePDFSlick(src, {
    scaleValue: 'page-fit',
    getDocumentParams: {
      withCredentials: true,
    },
  });

  useEffect(() => {
    if (isDocumentLoaded) {
      setIsLoading(false);
    }
  }, [isDocumentLoaded]);

  useEffect(() => {
    if (error) {
      setIsLoading(false);
      captureException(error, {
        extra: { src },
      });
    }
  }, [error, src]);

  if (error && onClose) {
    return <FileNotFoundError fileName={displayFileName} onClose={onClose} />;
  }

  return (
    <div className={cn('pdfSlick bg-BG_GRAY_2 relative h-full w-full', className)}>
      {error && !onClose && <ErrorFallback message={error.message || 'Unknown error'} />}
      {!error && <LoadingIndicator isLoading={isLoading} />}

      {!error && (
        <div
          className={cn(
            'relative h-full flex-1 transition-opacity duration-300 ease-in-out',
            isLoading ? 'opacity-0' : 'opacity-100',
          )}
        >
          <PDFSlickViewer {...{ viewerRef, usePDFSlickStore }} />
        </div>
      )}

      {isDocumentLoaded && !error && <PdfToolbar usePDFSlickStore={usePDFSlickStore} />}
    </div>
  );
};

export default PdfViewer;
