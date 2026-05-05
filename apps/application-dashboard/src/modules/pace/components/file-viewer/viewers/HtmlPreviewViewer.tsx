'use client';

import { memo, useMemo } from 'react';
import { cn } from '@zamp-platform/ui/utils';
import FileViewerError from '@/modules/pace/components/file-viewer/FileViewerError';
import { usePaceLayoutContext } from '@/modules/pace/pace.context';

interface HtmlPreviewViewerProps {
  content: string;
}

const HtmlPreviewViewer = memo(({ content }: HtmlPreviewViewerProps) => {
  const { isFilesPanelResizing, isSidebarResizing } = usePaceLayoutContext();

  const srcDoc = useMemo(() => {
    return content;
  }, [content]);

  if (!content) {
    return <FileViewerError title='No content to preview' />;
  }

  const isResizing = isFilesPanelResizing || isSidebarResizing;

  return (
    <iframe
      srcDoc={srcDoc}
      title='HTML Preview'
      className={cn('bg-BG_WHITE h-full w-full border-0', isResizing && 'pointer-events-none')}
      sandbox='allow-scripts'
    />
  );
});

HtmlPreviewViewer.displayName = 'HtmlPreviewViewer';

export default HtmlPreviewViewer;
