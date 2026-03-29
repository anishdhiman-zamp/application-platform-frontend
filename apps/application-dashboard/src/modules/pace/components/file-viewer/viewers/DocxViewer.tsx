'use client';

import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { captureException } from '@sentry/nextjs';
import { FileText } from 'lucide-react';
import { LEGACY_DOC_EXTENSION } from 'modules/pace/components/file-viewer/file-viewer.constants';
import { fixSymbolFonts } from 'modules/pace/components/file-viewer/viewers/docx/docx.utils';
import ImageLoader from '@/components/common/loader/ImageLoader';
import { ZAMP_LOGO_LOADER_SVG } from '@/constants/icons';
import '@/styles/docx-viewer.css';

interface DocxViewerProps {
  mediaUrl: string;
  fileExtension: string;
  onError?: (message?: string) => void;
}

const UnsupportedDocFormat = ({ fileExtension }: { fileExtension: string }) => (
  <div className='flex h-full w-full flex-col items-center justify-center gap-4 p-8'>
    <FileText size={48} className='text-muted-foreground' />
    <div className='text-center'>
      <p className='text-foreground text-sm font-medium'>
        .{fileExtension.toUpperCase()} format is not supported for preview
      </p>
      <p className='text-muted-foreground mt-1 text-xs'>
        Only .docx files can be previewed. Please download the file to view it.
      </p>
    </div>
  </div>
);

const DocxViewer = memo(({ mediaUrl, fileExtension, onError }: DocxViewerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const styleRef = useRef<HTMLDivElement>(null);

  const [isLoading, setIsLoading] = useState(true);

  const isLegacyFormat = fileExtension.toLowerCase() === LEGACY_DOC_EXTENSION;

  const loadDocument = useCallback(
    async (container: HTMLDivElement, styleContainer: HTMLDivElement, signal: { aborted: boolean }) => {
      try {
        setIsLoading(true);

        const response = await fetch(mediaUrl, { credentials: 'include' });

        if (!response.ok) {
          throw new Error(`Failed to fetch document: ${response.statusText}`);
        }

        const blob = await response.blob();

        if (signal.aborted) return;

        const { renderAsync } = await import('docx-preview');

        if (signal.aborted) return;

        container.innerHTML = '';
        styleContainer.innerHTML = '';

        await renderAsync(blob, container, styleContainer, {
          className: 'docx-preview',
          inWrapper: true,
          ignoreWidth: false,
          ignoreHeight: false,
          ignoreFonts: false,
          breakPages: true,
          renderHeaders: true,
          renderFooters: true,
          renderFootnotes: true,
          renderEndnotes: true,
          useBase64URL: true,
        });

        if (!signal.aborted) {
          fixSymbolFonts(styleContainer, container);
          setIsLoading(false);
        }
      } catch (err) {
        if (!signal.aborted) {
          const message = err instanceof Error ? err.message : 'Failed to load document';

          captureException(err, { extra: { mediaUrl } });
          onError?.(message);
          setIsLoading(false);
        }
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
    const styleContainer = styleRef.current;

    if (!container || !styleContainer) return;

    const signal = { aborted: false };

    loadDocument(container, styleContainer, signal);

    return () => {
      signal.aborted = true;
    };
  }, [isLegacyFormat, loadDocument]);

  if (isLegacyFormat) {
    return <UnsupportedDocFormat fileExtension={fileExtension} />;
  }

  return (
    <div className='bg-BG_GRAY_2 relative h-full w-full overflow-hidden'>
      {isLoading && (
        <div className='bg-BG_GRAY_2 absolute inset-0 z-10 flex items-center justify-center'>
          <ImageLoader imageSrc={ZAMP_LOGO_LOADER_SVG} width={140} height={140} />
        </div>
      )}
      <div ref={styleRef} />
      <div
        ref={containerRef}
        className='docx-viewer-container bg-BG_GRAY_2 h-full w-full overflow-auto [scrollbar-width:thin]'
      />
    </div>
  );
});

DocxViewer.displayName = 'DocxViewer';

export default DocxViewer;
