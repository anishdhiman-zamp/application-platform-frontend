'use client';

import { memo, useCallback, useEffect, useRef, useState } from 'react';
import type { PptxViewer } from '@aiden0z/pptx-renderer';
import { captureException } from '@sentry/nextjs';
import { cn } from '@zamp-platform/ui/utils';
import { LEGACY_PPT_EXTENSION } from 'modules/pace/components/file-viewer/file-viewer.constants';
import UnsupportedPptFormat from 'modules/pace/components/file-viewer/viewers/components/UnsupportedPptFormat';
import ImageLoader from '@/components/common/loader/ImageLoader';
import { ZAMP_LOGO_LOADER_SVG } from '@/constants/icons';

// Must outlast the longest sidebar animation (spring ~400ms) to avoid firing mid-transition.
const RESIZE_SETTLE_MS = 500;
// Minimum pixel change that warrants a slide re-render; filters out sub-pixel jitter.
const RESIZE_WIDTH_THRESHOLD_PX = 2;

interface PresentationViewerProps {
  mediaUrl: string;
  fileExtension: string;
  onError?: (message?: string) => void;
}

type ViewerInternals = Record<string, unknown> & {
  resizeObserver?: ResizeObserver;
  windowResizeHandler?: EventListener;
  lastMeasuredContainerWidth?: number;
  handleContainerResize?: () => void;
};

/**
 * Disconnect the library's built-in ResizeObserver so it never triggers a
 * destructive re-render (innerHTML = "") on every frame during continuous
 * resize (e.g. sidebar animation). We replace it with our own debounced
 * observer that triggers a single re-render after resizing settles.
 */
const disableBuiltInResize = (viewer: PptxViewer) => {
  const viewerInternals = viewer as unknown as ViewerInternals;

  if (viewerInternals.resizeObserver instanceof ResizeObserver) {
    viewerInternals.resizeObserver.disconnect();
    viewerInternals.resizeObserver = undefined;
  }

  if (typeof viewerInternals.windowResizeHandler === 'function') {
    window.removeEventListener('resize', viewerInternals.windowResizeHandler);
    viewerInternals.windowResizeHandler = undefined;
  }
};

const triggerResize = (viewer: PptxViewer) => {
  const viewerInternals = viewer as unknown as ViewerInternals;

  viewerInternals.lastMeasuredContainerWidth = 0;
  viewerInternals.handleContainerResize?.();
};

const PresentationViewer = memo(({ mediaUrl, fileExtension, onError }: PresentationViewerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<PptxViewer | null>(null);
  const resizeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastWidthRef = useRef<number>(0);

  const [isLoading, setIsLoading] = useState(true);
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

        disableBuiltInResize(viewer);
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

  // Debounced resize: re-render slides only once after resizing settles.
  useEffect(() => {
    if (isLoading || isLegacyFormat) return;

    const container = containerRef.current;

    if (!container) return;

    lastWidthRef.current = container.offsetWidth;

    const observer = new ResizeObserver(() => {
      const newWidth = container.offsetWidth;

      // Skip sub-pixel and height-only changes — they don't need a slide re-render.
      if (Math.abs(newWidth - lastWidthRef.current) < RESIZE_WIDTH_THRESHOLD_PX) return;

      if (resizeTimerRef.current) clearTimeout(resizeTimerRef.current);
      resizeTimerRef.current = setTimeout(() => {
        const settledWidth = container.offsetWidth;

        // Re-check after debounce — skip if width ended up the same (e.g. sidebar snapped back).
        if (Math.abs(settledWidth - lastWidthRef.current) < RESIZE_WIDTH_THRESHOLD_PX) return;

        lastWidthRef.current = settledWidth;

        if (viewerRef.current) triggerResize(viewerRef.current);
      }, RESIZE_SETTLE_MS);
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
      <div
        className={cn(
          'absolute inset-0 z-10 flex items-center justify-center transition-opacity duration-200',
          isLoading ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      >
        <ImageLoader imageSrc={ZAMP_LOGO_LOADER_SVG} width={140} height={140} />
      </div>
      <div ref={containerRef} className='h-full w-full overflow-auto [scrollbar-width:none]' />
    </div>
  );
});

PresentationViewer.displayName = 'PresentationViewer';

export default PresentationViewer;
