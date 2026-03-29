'use client';

import { memo, useCallback, useEffect, useRef, useState } from 'react';
import type { PptxViewer } from '@aiden0z/pptx-renderer';
import { captureException } from '@sentry/nextjs';
import { cn } from '@zamp-platform/ui/utils';
import { LEGACY_PPT_EXTENSION } from 'modules/pace/components/file-viewer/file-viewer.constants';
import UnsupportedPptFormat from 'modules/pace/components/file-viewer/viewers/components/UnsupportedPptFormat';
import ImageLoader from '@/components/common/loader/ImageLoader';
import { ZAMP_LOGO_LOADER_SVG } from '@/constants/icons';

interface PresentationViewerProps {
  mediaUrl: string;
  fileExtension: string;
  onError?: (message?: string) => void;
}

const PresentationViewer = memo(({ mediaUrl, fileExtension, onError }: PresentationViewerProps) => {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<PptxViewer | null>(null);
  const renderWidthRef = useRef<number>(0);

  const [isLoading, setIsLoading] = useState(true);
  const isLegacyFormat = fileExtension.toLowerCase() === LEGACY_PPT_EXTENSION;

  const loadPresentation = useCallback(
    async (outer: HTMLDivElement, inner: HTMLDivElement, signal: AbortSignal) => {
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

        // Fix the render width so the library never re-renders on container resize.
        const fixedWidth = outer.clientWidth || 960;

        renderWidthRef.current = fixedWidth;
        inner.style.width = `${fixedWidth}px`;

        const viewer = await PptxViewer.open(arrayBuffer, inner, {
          width: fixedWidth,
          fitMode: 'contain',
          scrollContainer: outer,
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

    const outer = outerRef.current;
    const inner = innerRef.current;

    if (!outer || !inner) return;

    const controller = new AbortController();

    loadPresentation(outer, inner, controller.signal);

    return () => {
      controller.abort();
      viewerRef.current?.destroy();
      viewerRef.current = null;
    };
  }, [isLegacyFormat, loadPresentation]);

  // Scale the fixed-width inner div to fit the container on resize.
  useEffect(() => {
    if (isLoading || isLegacyFormat) return;

    const outer = outerRef.current;
    const inner = innerRef.current;

    if (!outer || !inner) return;

    const applyScale = () => {
      const containerWidth = outer.clientWidth;

      if (!containerWidth || !renderWidthRef.current) return;

      const scale = containerWidth / renderWidthRef.current;

      inner.style.transform = `scale(${scale})`;
      inner.style.transformOrigin = 'top left';
      // Keep scroll height in sync with the scaled content.
      inner.style.height = `${inner.scrollHeight * scale}px`;
    };

    const observer = new ResizeObserver(applyScale);

    observer.observe(outer);

    return () => observer.disconnect();
  }, [isLoading, isLegacyFormat]);

  if (isLegacyFormat) {
    return <UnsupportedPptFormat fileExtension={fileExtension} />;
  }

  return (
    <div className='relative h-full w-full overflow-hidden'>
      <div
        className={cn(
          'absolute inset-0 z-10 flex items-center justify-center transition-opacity duration-200',
          isLoading ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      >
        <ImageLoader imageSrc={ZAMP_LOGO_LOADER_SVG} width={140} height={140} />
      </div>
      <div ref={outerRef} className='h-full w-full overflow-auto [scrollbar-width:none]'>
        <div ref={innerRef} />
      </div>
    </div>
  );
});

PresentationViewer.displayName = 'PresentationViewer';

export default PresentationViewer;
