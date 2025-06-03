import { FC, useEffect, useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Skeleton } from '@zamp-platform/ui';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { useSearchParams } from 'next/navigation';
import { useGetSignedUrlByArtifactIdQuery } from '@/apis/processes';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import { COLORS } from '@/constants/colors';
import { ZAMP_LOGO_LOADER } from '@/constants/lottie/zamp-logo-loader';
import type { PdfArtifactsResponseType } from '@/types/api/processApi.types';
import type { defaultFnType } from '@/types/commonTypes';
import { cn } from '@/utils/common';
import DynamicLottiePlayer from 'components/DynamicLottiePlayer';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

interface ToolbarProps {
  pageNumber: number;
  numPages: number;
  previousPage: defaultFnType;
  nextPage: defaultFnType;
  zoomOut: defaultFnType;
  zoomIn: defaultFnType;
}

interface PdfArtifactProps {
  pdfArtifact: PdfArtifactsResponseType;
  artifactId: string;
}

const PdfArtifact: FC<PdfArtifactProps> = ({ pdfArtifact, artifactId }) => {
  const searchParams = useSearchParams();
  const processId = searchParams?.get('processId');
  const [pageNumber, setPageNumber] = useState(1);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [scale, setScale] = useState(1);
  const [isPdfLoading, setIsPdfLoading] = useState(true);

  const pageNumberRef = useRef(1);
  const numPagesRef = useRef<number | null>(null);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const observer = useRef<IntersectionObserver | null>(null);

  const {
    data: signedUrl,
    isLoading: isSignedUrlLoading,
    isError: isSignedUrlError,
    refetch: refetchSignedUrl,
  } = useGetSignedUrlByArtifactIdQuery(
    {
      processId: processId as string,
      artifactId,
      fileId: pdfArtifact?.pdf_file?.file_id,
    },
    {
      skip: !processId || !artifactId || !pdfArtifact?.pdf_file?.file_id,
      refetchOnMountOrArgChange: false,
    },
  );

  const zoomIn = () => setScale((prev) => Math.min(prev + 0.2, 2.0));
  const zoomOut = () => setScale((prev) => Math.max(prev - 0.2, 0.5));
  const previousPage = () => changePage(-1);
  const nextPage = () => changePage(1);

  const scrollToPage = (page: number) => {
    const el = pageRefs.current[page - 1];
    const container = containerRef.current;

    if (el && container) {
      const topBarHeight = 54;

      container.scrollTo({
        top: el.offsetTop - topBarHeight,
        behavior: 'smooth',
      });
    }
  };

  const changePage = (offset: number) => {
    const currentNumPages = numPagesRef.current;
    const currentPage = pageNumberRef.current;

    if (!currentNumPages) return;

    const newPage = Math.min(Math.max(currentPage + offset, 1), currentNumPages);

    setPageNumber(newPage);
    pageNumberRef.current = newPage;
    scrollToPage(newPage);
  };

  const createIntersectionObserver = () =>
    new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .map((entry) => ({
            page: Number(entry.target.getAttribute('data-page') || '0'),
            ratio: entry.intersectionRatio,
          }));

        if (visibleEntries.length > 0) {
          const mostVisible = visibleEntries.reduce((max, current) => (current.ratio > max.ratio ? current : max));

          setPageNumber(mostVisible.page);
        }
      },
      { root: null, rootMargin: '0px', threshold: 0.5 },
    );

  const handleLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setIsPdfLoading(false);
    numPagesRef.current = numPages;
  };

  useEffect(() => {
    pageNumberRef.current = pageNumber;
  }, [pageNumber]);

  useEffect(() => {
    numPagesRef.current = numPages;
  }, [numPages]);

  useEffect(() => {
    if (!numPages) return;

    if (observer.current) observer.current.disconnect();

    observer.current = createIntersectionObserver();

    pageRefs.current.forEach((ref) => {
      if (ref) observer.current?.observe(ref);
    });

    return () => observer.current?.disconnect();
  }, [numPages]);

  return (
    <CommonWrapper
      isLoading={isSignedUrlLoading}
      isError={isSignedUrlError}
      refetchFunction={refetchSignedUrl}
      skeletonType={SkeletonTypes.CUSTOM}
      loader={
        <div className='flex h-full w-full items-center justify-center'>
          <DynamicLottiePlayer src={ZAMP_LOGO_LOADER} className='lottie-player h-[140px]' autoplay loop keepLastFrame />
        </div>
      }
      className='bg-BG_GRAY_1 h-full w-full'
    >
      <div
        ref={containerRef}
        className={cn('animate-fade-in h-full w-full overflow-scroll px-4 pb-24 pt-4', {
          'flex flex-col items-center justify-center pb-0': isPdfLoading || (numPages === 1 && !isSignedUrlLoading),
        })}
      >
        <Document
          file={signedUrl?.signed_url}
          loading={
            <div className='animate-fade-in flex h-full w-full justify-center'>
              <Skeleton className='h-[582px] w-[413px]' />
            </div>
          }
          error={
            <div className='animate-fade-in flex h-full w-full justify-center'>
              <span className='f-13-450 text-GRAY_600'>Error loading artifact</span>
            </div>
          }
          noData={
            <div className='animate-fade-in flex h-full w-full justify-center'>
              <span className='f-13-450 text-GRAY_600'>No data</span>
            </div>
          }
          onLoadSuccess={handleLoadSuccess}
          className='animate-fade-in'
        >
          {numPages &&
            Array.from(new Array(numPages), (_, index) => (
              <div
                key={`page_${index + 1}`}
                data-page={index + 1}
                ref={(el) => {
                  pageRefs.current[index] = el;
                }}
                className='flex h-full w-full justify-center'
              >
                <Page width={413} height={582} pageNumber={index + 1} scale={scale} className='my-2.5 shadow-xl' />
              </div>
            ))}
        </Document>
      </div>

      {!isSignedUrlLoading && numPages && (
        <PdfToolbar
          pageNumber={pageNumber}
          numPages={numPages}
          previousPage={previousPage}
          nextPage={nextPage}
          zoomOut={zoomOut}
          zoomIn={zoomIn}
        />
      )}
    </CommonWrapper>
  );
};

const PdfToolbar = ({ pageNumber, numPages, previousPage, nextPage, zoomOut, zoomIn }: ToolbarProps) => {
  return (
    <div className='animate-fade-in absolute bottom-1.5 left-1/2 z-10 flex -translate-x-1/2 transform items-center gap-x-1.5 rounded-md bg-black px-2.5 py-1.5'>
      <SvgSpriteLoader id='chevron-up' color={COLORS.WHITE} size={12} onClick={previousPage} />
      <div className='f-11-500 flex items-center gap-x-1.5 text-white'>
        Page <span className='bg-GRAY_950 rounded px-1 py-[2px]'>{pageNumber}</span> / {numPages || '--'}
      </div>
      <SvgSpriteLoader id='chevron-down' color={COLORS.WHITE} size={12} onClick={nextPage} />
      <SvgSpriteLoader id='zoom-out' color={COLORS.WHITE} size={12} onClick={zoomOut} />
      <SvgSpriteLoader id='zoom-in' color={COLORS.WHITE} size={12} onClick={zoomIn} />
    </div>
  );
};

export default PdfArtifact;
