'use client';

import { memo, useCallback, useState } from 'react';
import { toast } from '@zamp-platform/ui';
import UnsupportedFileView from 'modules/pace/components/file-viewer/viewers/UnsupportedFileView';
import dynamic from 'next/dynamic';
import ImageLoader from '@/components/common/loader/ImageLoader';
import { ZAMP_LOGO_LOADER_SVG } from '@/constants/icons';
import FileNotFoundError from '@/modules/pace/components/file-viewer/FileNotFoundError';
import FileViewerHeader, {
  type HtmlViewMode,
  type MarkdownViewMode,
} from '@/modules/pace/components/file-viewer/FileViewerHeader';
import AudioViewer from '@/modules/pace/components/file-viewer/viewers/AudioViewer';
import HtmlPreviewViewer from '@/modules/pace/components/file-viewer/viewers/HtmlPreviewViewer';
import ImageViewer from '@/modules/pace/components/file-viewer/viewers/ImageViewer';
import { getMonacoLanguage } from '@/modules/pace/components/file-viewer/viewers/MonacoCodeEditor';
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

const MilkdownEditor = dynamic(() => import('./viewers/MilkdownEditor'), {
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
  htmlViewMode?: HtmlViewMode;
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
    markdownViewMode = 'milkdown',
    htmlViewMode = 'preview',
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
        if (markdownViewMode === 'raw') {
          return <MonacoCodeEditor content={content || ''} language='markdown' onChange={onContentChange} />;
        }

        return <MilkdownEditor content={content || ''} onChange={onContentChange} />;

      case FILE_CATEGORY.HTML:
        if (htmlViewMode === 'code') {
          return <MonacoCodeEditor content={content || ''} language='html' onChange={onContentChange} />;
        }

        return <HtmlPreviewViewer content={content || ''} />;

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
        return <UnsupportedFileView fileName={fileName} />;
    }
  },
);

FileViewerContent.displayName = 'FileViewerContent';

interface FileViewerTabProps {
  filePath: string;
  isActive: boolean;
}

const FileViewerTab = memo(({ filePath, isActive }: FileViewerTabProps) => {
  const [markdownViewMode, setMarkdownViewMode] = useState<MarkdownViewMode>('milkdown');
  const [htmlViewMode, setHtmlViewMode] = useState<HtmlViewMode>('preview');
  const { closeTab } = useDynamicTabs();

  const handleSaveError = useCallback(() => {
    toast.error(FILE_TOAST_MESSAGES.FAILED_TO_SAVE_FILE);
  }, []);

  const handleCloseTab = useCallback(
    (e?: React.MouseEvent) => {
      const syntheticEvent = e ?? ({ preventDefault: () => {}, stopPropagation: () => {} } as React.MouseEvent);

      closeTab(syntheticEvent, filePath);
    },
    [closeTab, filePath],
  );

  const { content, isLoading, isError, fileCategory, fileExtension, isEditable, updateContent, isSaving, lastSavedAt } =
    useFileViewer({
      filePath,
      onSaveError: handleSaveError,
    });

  const fileName = filePath.split('/').pop() || filePath;
  const isMarkdown = fileCategory === FILE_CATEGORY.MARKDOWN;
  const isHtml = fileCategory === FILE_CATEGORY.HTML;

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
        isHtml={isHtml}
        viewMode={markdownViewMode}
        htmlViewMode={htmlViewMode}
        onViewModeChange={setMarkdownViewMode}
        onHtmlViewModeChange={setHtmlViewMode}
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
          htmlViewMode={htmlViewMode}
        />
      </div>
    </div>
  );
});

FileViewerTab.displayName = 'FileViewerTab';

export default FileViewerTab;
