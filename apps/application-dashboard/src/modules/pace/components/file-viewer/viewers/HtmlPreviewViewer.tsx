'use client';

import { memo, useMemo } from 'react';
import { FileCode2 } from 'lucide-react';

interface HtmlPreviewViewerProps {
  content: string;
}

const HtmlPreviewViewer = memo(({ content }: HtmlPreviewViewerProps) => {
  const srcDoc = useMemo(() => {
    return content;
  }, [content]);

  if (!content) {
    return (
      <div className='flex h-full w-full flex-col items-center justify-center gap-y-3 bg-white'>
        <FileCode2 className='text-GRAY_500 h-12 w-12' />
        <p className='f-14-400 text-GRAY_600'>No content to preview</p>
      </div>
    );
  }

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
