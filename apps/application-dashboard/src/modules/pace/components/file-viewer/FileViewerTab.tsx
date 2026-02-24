'use client';

import { memo, useCallback, useState } from 'react';
import { toast } from '@zamp-platform/ui';
import dynamic from 'next/dynamic';
import ImageLoader from '@/components/common/loader/ImageLoader';
import { ZAMP_LOGO_LOADER_SVG } from '@/constants/icons';
import FileNotFoundError from '@/modules/pace/components/file-viewer/FileNotFoundError';
import FileViewerHeader, { type MarkdownViewMode } from '@/modules/pace/components/file-viewer/FileViewerHeader';
import AudioViewer from '@/modules/pace/components/file-viewer/viewers/AudioViewer';
import ImageViewer from '@/modules/pace/components/file-viewer/viewers/ImageViewer';
import { getMonacoLanguage } from '@/modules/pace/components/file-viewer/viewers/MonacoCodeEditor';
import UnsupportedFileView from '@/modules/pace/components/file-viewer/viewers/UnsupportedFileView';
import VideoViewer from '@/modules/pace/components/file-viewer/viewers/VideoViewer';
import { getMediaUrl } from '@/modules/pace/components/files/file-tree.utils';
import { FILE_CATEGORY, FILE_TOAST_MESSAGES, type FileCategory } from '@/modules/pace/components/files/files.constants';
import { useDynamicTabs } from '@/modules/pace/hooks/useDynamicTabs';
import useFileViewer from '@/modules/pace/hooks/useFileViewer';

const PdfViewer = dynamic(() => import('./viewers/PdfViewer'), {
  ssr: false,
  loading: () => <ImageLoader imageSrc={ZAMP_LOGO_LOADER_SVG} width={140} height={140} />,
});

const MonacoCodeEditor = dynamic(() => import('./viewers/MonacoCodeEditor'), {
  ssr: false,
  loading: () => <ImageLoader imageSrc={ZAMP_LOGO_LOADER_SVG} width={140} height={140} />,
});

const MarkdownPreview = dynamic(() => import('./viewers/MarkdownPreview'), {
  ssr: false,
  loading: () => <ImageLoader imageSrc={ZAMP_LOGO_LOADER_SVG} width={140} height={140} />,
});

interface FileViewerContentProps {
  filePath: string;
  fileName: string;
  fileCategory: FileCategory;
  content: string | null;
  isLoading: boolean;
  isEditable: boolean;
  fileExtension: string;
  isActive: boolean;
  onContentChange: (content: string) => void;
  onClose: () => void;
  markdownViewMode?: MarkdownViewMode;
}

const FileViewerContent = memo(
  ({
    filePath,
    fileName,
    fileCategory,
    content,
    isLoading,
    isEditable,
    fileExtension,
    isActive,
    onContentChange,
    onClose,
    markdownViewMode = 'edit',
  }: FileViewerContentProps) => {
    const mediaUrl = getMediaUrl(filePath);

    if (isLoading && isEditable) {
      return <ImageLoader imageSrc={ZAMP_LOGO_LOADER_SVG} width={140} height={140} />;
    }

    switch (fileCategory) {
      case FILE_CATEGORY.IMAGE:
        return <ImageViewer src={mediaUrl} alt={fileName} fileName={fileName} onClose={onClose} />;

      case FILE_CATEGORY.AUDIO:
        return <AudioViewer src={mediaUrl} fileName={fileName} isActive={isActive} onClose={onClose} />;

      case FILE_CATEGORY.VIDEO:
        return <VideoViewer src={mediaUrl} fileName={fileName} isActive={isActive} onClose={onClose} />;

      case FILE_CATEGORY.PDF:
        return <PdfViewer src={mediaUrl} fileName={fileName} onClose={onClose} />;

      case FILE_CATEGORY.MARKDOWN:
        if (markdownViewMode === 'preview') {
          return <MarkdownPreview content={content || ''} />;
        }

        return <MonacoCodeEditor content={content || ''} language='markdown' onChange={onContentChange} />;

      case FILE_CATEGORY.CODE:
        return (
          <MonacoCodeEditor
            content={content || ''}
            language={getMonacoLanguage(fileExtension)}
            onChange={onContentChange}
          />
        );

      case FILE_CATEGORY.UNKNOWN:
      default:
        return <UnsupportedFileView fileName={fileName} downloadUrl={mediaUrl} />;
    }
  },
);

FileViewerContent.displayName = 'FileViewerContent';

interface FileViewerTabProps {
  filePath: string;
  isActive: boolean;
}

const FileViewerTab = memo(({ filePath, isActive }: FileViewerTabProps) => {
  const [markdownViewMode, setMarkdownViewMode] = useState<MarkdownViewMode>('edit');
  const { handleCloseDynamicTab } = useDynamicTabs();

  const handleSaveError = useCallback(() => {
    toast.error(FILE_TOAST_MESSAGES.FAILED_TO_SAVE_FILE);
  }, []);

  const handleCloseTab = useCallback(
    (e?: React.MouseEvent) => {
      const syntheticEvent = e ?? ({ preventDefault: () => {}, stopPropagation: () => {} } as React.MouseEvent);

      handleCloseDynamicTab(syntheticEvent, filePath);
    },
    [handleCloseDynamicTab, filePath],
  );

  const { content, isLoading, isError, fileCategory, fileExtension, isEditable, updateContent, isSaving, lastSavedAt } =
    useFileViewer({
      filePath,
      onSaveError: handleSaveError,
    });

  const fileName = filePath.split('/').pop() || filePath;
  const isMarkdown = fileCategory === FILE_CATEGORY.MARKDOWN;

  if (isError && isEditable) {
    return <FileNotFoundError fileName={fileName} onClose={handleCloseTab} />;
  }

  return (
    <div className='flex h-full w-full flex-col overflow-hidden'>
      <FileViewerHeader
        filePath={filePath}
        fileName={fileName}
        isSaving={isSaving}
        lastSavedAt={lastSavedAt}
        isMarkdown={isMarkdown}
        viewMode={markdownViewMode}
        onViewModeChange={setMarkdownViewMode}
      />
      <div className='min-h-0 flex-1 overflow-hidden'>
        <FileViewerContent
          filePath={filePath}
          fileName={fileName}
          fileCategory={fileCategory}
          content={content}
          isLoading={isLoading}
          isEditable={isEditable}
          fileExtension={fileExtension}
          isActive={isActive}
          onContentChange={updateContent}
          onClose={handleCloseTab}
          markdownViewMode={markdownViewMode}
        />
      </div>
    </div>
  );
});

FileViewerTab.displayName = 'FileViewerTab';

export default FileViewerTab;
