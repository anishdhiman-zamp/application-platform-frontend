'use client';

import { memo, useCallback, useState } from 'react';
import { captureException } from '@sentry/browser';
import { toast } from 'sonner';
import { MILKDOWN_SIZE_LIMIT } from '@/modules/pace/components/file-viewer/file-viewer.constants';
import type {
  HtmlViewMode,
  MarkdownViewMode,
  SpreadsheetViewMode,
} from '@/modules/pace/components/file-viewer/file-viewer.types';
import FileViewerContent from '@/modules/pace/components/file-viewer/FileViewerContent';
import FileViewerError from '@/modules/pace/components/file-viewer/FileViewerError';
import FileViewerHeader from '@/modules/pace/components/file-viewer/FileViewerHeader';
import {
  FILE_CATEGORY,
  FILE_TOAST_MESSAGES,
  TEXT_SPREADSHEET_EXTENSIONS,
} from '@/modules/pace/components/files/files.constants';
import useFileViewer from '@/modules/pace/hooks/useFileViewer';

interface FileViewerTabProps {
  filePath: string;
  isActive: boolean;
  onCloseTab: (e: React.MouseEvent, id: string) => void;
}

const FileViewerTab = memo(({ filePath, isActive, onCloseTab }: FileViewerTabProps) => {
  const [markdownViewMode, setMarkdownViewMode] = useState<MarkdownViewMode>('milkdown');
  const [htmlViewMode, setHtmlViewMode] = useState<HtmlViewMode>('preview');
  const [spreadsheetViewMode, setSpreadsheetViewMode] = useState<SpreadsheetViewMode>('table');

  const handleSaveError = useCallback((error: unknown) => {
    captureException(error instanceof Error ? error : new Error(`File save failed: ${JSON.stringify(error)}`));
    toast.error(FILE_TOAST_MESSAGES.FAILED_TO_SAVE_FILE);
  }, []);

  const handleLoadError = useCallback((error: unknown) => {
    captureException(error instanceof Error ? error : new Error(`File load failed: ${JSON.stringify(error)}`));
    toast.error(FILE_TOAST_MESSAGES.FAILED_TO_LOAD_FILE);
  }, []);

  const handleCloseTab = useCallback(
    (e?: React.MouseEvent) => {
      const syntheticEvent = e ?? ({ preventDefault: () => {}, stopPropagation: () => {} } as React.MouseEvent);

      onCloseTab(syntheticEvent, filePath);
    },
    [onCloseTab, filePath],
  );

  const {
    content,
    isLoading,
    isFileNotFound,
    fileCategory,
    fileExtension,
    isEditable,
    updateContent,
    isSaving,
    lastSavedAt,
    mediaUrl,
  } = useFileViewer({
    filePath,
    isActive,
    onSaveError: handleSaveError,
    onLoadError: handleLoadError,
  });

  const fileName = filePath.split('/').pop() || filePath;
  const isLargeMarkdown = fileCategory === FILE_CATEGORY.MARKDOWN && (content?.length ?? 0) > MILKDOWN_SIZE_LIMIT;
  const isMarkdown = fileCategory === FILE_CATEGORY.MARKDOWN && !isLargeMarkdown;
  const isHtml = fileCategory === FILE_CATEGORY.HTML;
  const isTextSpreadsheet =
    fileCategory === FILE_CATEGORY.SPREADSHEET &&
    (TEXT_SPREADSHEET_EXTENSIONS as readonly string[]).includes(fileExtension.toLowerCase());

  if (isFileNotFound && isEditable) {
    return <FileViewerError fileName={fileName} type='not-found' onClose={handleCloseTab} />;
  }

  return (
    <div className='flex h-full w-full flex-col overflow-hidden'>
      <FileViewerHeader
        filePath={filePath}
        fileName={fileName}
        isSaving={isSaving}
        lastSavedAt={lastSavedAt}
        isMarkdown={isMarkdown}
        isHtml={isHtml}
        isTextSpreadsheet={isTextSpreadsheet}
        viewMode={markdownViewMode}
        htmlViewMode={htmlViewMode}
        spreadsheetViewMode={spreadsheetViewMode}
        onViewModeChange={setMarkdownViewMode}
        onHtmlViewModeChange={setHtmlViewMode}
        onSpreadsheetViewModeChange={setSpreadsheetViewMode}
      />
      <div className='min-h-0 flex-1 overflow-hidden'>
        <FileViewerContent
          filePath={filePath}
          fileName={fileName}
          fileCategory={fileCategory}
          content={content}
          mediaUrl={mediaUrl}
          isLoading={isLoading}
          isEditable={isEditable}
          fileExtension={fileExtension}
          isActive={isActive}
          onContentChange={updateContent}
          onClose={handleCloseTab}
          markdownViewMode={markdownViewMode}
          htmlViewMode={htmlViewMode}
          spreadsheetViewMode={spreadsheetViewMode}
        />
      </div>
    </div>
  );
});

FileViewerTab.displayName = 'FileViewerTab';

export default FileViewerTab;
