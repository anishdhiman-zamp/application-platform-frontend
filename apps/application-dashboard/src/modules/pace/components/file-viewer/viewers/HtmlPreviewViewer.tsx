'use client';

import { memo, useMemo } from 'react';
import FileViewerError from '@/modules/pace/components/file-viewer/FileViewerError';

interface HtmlPreviewViewerProps {
  content: string;
}

const HtmlPreviewViewer = memo(({ content }: HtmlPreviewViewerProps) => {
  const srcDoc = useMemo(() => {
    return content;
  }, [content]);

  if (!content) {
    return <FileViewerError title='No content to preview' />;
  }

  return (
    <iframe
      srcDoc={srcDoc}
      title='HTML Preview'
      className='bg-BG_WHITE h-full w-full border-0'
      sandbox='allow-scripts allow-same-origin'
    />
  );
});

HtmlPreviewViewer.displayName = 'HtmlPreviewViewer';

export default HtmlPreviewViewer;
