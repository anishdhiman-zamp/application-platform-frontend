'use client';

import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { captureException } from '@sentry/nextjs';
import { Presentation } from 'lucide-react';
import { LEGACY_PPT_EXTENSION } from 'modules/pace/components/file-viewer/file-viewer.constants';
import ImageLoader from '@/components/common/loader/ImageLoader';
import { ZAMP_LOGO_LOADER_SVG } from '@/constants/icons';

interface PresentationViewerProps {
  mediaUrl: string;
  fileExtension: string;
  onError?: (message?: string) => void;
}

const UnsupportedPptFormat = ({ fileExtension }: { fileExtension: string }) => (
  <div className='flex h-full w-full flex-col items-center justify-center gap-4 p-8'>
    <Presentation size={48} className='text-muted-foreground' />
    <div className='text-center'>
      <p className='text-foreground text-sm font-medium'>
        .{fileExtension.toUpperCase()} format is not supported for preview
      </p>
      <p className='text-muted-foreground mt-1 text-xs'>
        Only .pptx files can be previewed. Please download the file to view it.
      </p>
    </div>
  </div>
);

const PresentationViewer = memo(({ mediaUrl, fileExtension, onError }: PresentationViewerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<import('@aiden0z/pptx-renderer').PptxViewer | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isResizing, setIsResizing] = useState(false);
  const resizeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLegacyFormat = fileExtension.toLowerCase() === LEGACY_PPT_EXTENSION;

  const loadPresentation = useCallback(
    async (container: HTMLDivElement, signal: AbortSignal) => {
      try {
        setIsLoading(true);

        const response = await fetch(mediaUrl, {
          credentials: 'include',
          signal,
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch presentation: ${response.statusText}`);
        }

        const arrayBuffer = await response.arrayBuffer();

        if (signal.aborted) return;

        const { PptxViewer } = await import('@aiden0z/pptx-renderer');

        if (signal.aborted) return;

        const viewer = await PptxViewer.open(arrayBuffer, container, {
          fitMode: 'contain',
          scrollContainer: container,
          renderMode: 'list',
          listOptions: {
            windowed: true,
            batchSize: 8,
            initialSlides: 4,
            overscanViewport: 1.5,
            showSlideLabels: false,
          },
          signal,
          onSlideError: (index, error) => {
            captureException(error, { extra: { mediaUrl, slideIndex: index } });
          },
        });

        viewerRef.current = viewer;
        setIsLoading(false);
      } catch (err) {
        if (signal.aborted) return;
        const message = err instanceof Error ? err.message : 'Failed to load presentation';

        captureException(err, { extra: { mediaUrl } });
        onError?.(message);
        setIsLoading(false);
      }
    },
    [mediaUrl, onError],
  );

  useEffect(() => {
    if (isLegacyFormat) {
      setIsLoading(false);

      return;
    }

    const container = containerRef.current;

    if (!container) return;

    const controller = new AbortController();

    loadPresentation(container, controller.signal);

    return () => {
      controller.abort();
      viewerRef.current?.destroy();
      viewerRef.current = null;
    };
  }, [isLegacyFormat, loadPresentation]);

  // Show a cover during container resize to hide the viewer's internal
  // re-render flash as the sidebar animates.
  useEffect(() => {
    if (isLoading || isLegacyFormat) return;

    const container = containerRef.current;

    if (!container) return;

    const observer = new ResizeObserver(() => {
      setIsResizing(true);
      if (resizeTimerRef.current) clearTimeout(resizeTimerRef.current);
      resizeTimerRef.current = setTimeout(() => setIsResizing(false), 150);
    });

    observer.observe(container);

    return () => {
      observer.disconnect();
      if (resizeTimerRef.current) clearTimeout(resizeTimerRef.current);
    };
  }, [isLoading, isLegacyFormat]);

  if (isLegacyFormat) {
    return <UnsupportedPptFormat fileExtension={fileExtension} />;
  }

  return (
    <div className='relative h-full w-full overflow-hidden'>
      {isLoading && (
        <div className='absolute inset-0 z-10 flex items-center justify-center'>
          <ImageLoader imageSrc={ZAMP_LOGO_LOADER_SVG} width={140} height={140} />
        </div>
      )}
      {isResizing && <div className='bg-BG_WHITE absolute inset-0 z-10' />}
      <div
        ref={containerRef}
        className='h-full w-full overflow-auto [scrollbar-width:thin]'
        style={{ willChange: 'contents' }}
      />
    </div>
  );
});

PresentationViewer.displayName = 'PresentationViewer';

export default PresentationViewer;
