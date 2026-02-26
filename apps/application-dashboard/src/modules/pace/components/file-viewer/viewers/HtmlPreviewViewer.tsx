'use client';

import { memo, useMemo } from 'react';

interface HtmlPreviewViewerProps {
  content: string;
}

const HtmlPreviewViewer = memo(({ content }: HtmlPreviewViewerProps) => {
  const srcDoc = useMemo(() => {
    return content;
  }, [content]);

  return (
    <iframe
      srcDoc={srcDoc}
      title='HTML Preview'
      className='h-full w-full border-0 bg-white'
      sandbox='allow-scripts allow-same-origin'
    />
  );
});

HtmlPreviewViewer.displayName = 'HtmlPreviewViewer';

export default HtmlPreviewViewer;
