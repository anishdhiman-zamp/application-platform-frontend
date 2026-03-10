'use client';

import { memo, useCallback, useEffect, useState } from 'react';
import UnsupportedFileView from 'modules/pace/components/file-viewer/viewers/UnsupportedFileView';
import ImageLoader from '@/components/common/loader/ImageLoader';
import { ZAMP_LOGO_LOADER_SVG } from '@/constants/icons';
import {
  MilkdownEditor,
  MonacoCodeEditor,
  PdfViewer,
  SpreadsheetViewer,
} from '@/modules/pace/components/file-viewer/file-viewer.dynamic';
import type {
  HtmlViewMode,
  MarkdownViewMode,
  SpreadsheetViewMode,
} from '@/modules/pace/components/file-viewer/file-viewer.types';
import FileViewerError from '@/modules/pace/components/file-viewer/FileViewerError';
import AudioViewer from '@/modules/pace/components/file-viewer/viewers/AudioViewer';
import HtmlPreviewViewer from '@/modules/pace/components/file-viewer/viewers/HtmlPreviewViewer';
import ImageViewer from '@/modules/pace/components/file-viewer/viewers/ImageViewer';
import { getMonacoLanguage } from '@/modules/pace/components/file-viewer/viewers/MonacoCodeEditor';
import VideoViewer from '@/modules/pace/components/file-viewer/viewers/VideoViewer';
import { getMediaUrl } from '@/modules/pace/components/files/file-tree.utils';
import {
  FILE_CATEGORY,
  type FileCategory,
  TEXT_SPREADSHEET_EXTENSIONS,
} from '@/modules/pace/components/files/files.constants';
import { defaultFnType } from '@/types/commonTypes';

const CONTENT_BASED_CATEGORIES: ReadonlySet<FileCategory> = new Set([
  FILE_CATEGORY.MARKDOWN,
  FILE_CATEGORY.HTML,
  FILE_CATEGORY.CODE,
]);

interface FileViewerContentProps {
  filePath: string;
  fileName: string;
  fileCategory: FileCategory;
  content: string | null;
  mediaUrl: string | null;
  isLoading: boolean;
  isEditable: boolean;
  fileExtension: string;
  isActive: boolean;
  onContentChange: (content: string) => void;
  onClose: defaultFnType;
  markdownViewMode?: MarkdownViewMode;
  htmlViewMode?: HtmlViewMode;
  spreadsheetViewMode?: SpreadsheetViewMode;
}

const FileViewerContent = memo(
  ({
    filePath,
    fileName,
    fileCategory,
    content,
    mediaUrl,
    isLoading,
    isEditable,
    fileExtension,
    isActive,
    onContentChange,
    onClose,
    markdownViewMode = 'milkdown',
    htmlViewMode = 'preview',
    spreadsheetViewMode = 'table',
  }: FileViewerContentProps) => {
    const [mediaError, setMediaError] = useState<{ message?: string } | null>(null);

    const handleMediaError = useCallback((message?: string) => {
      setMediaError({ message });
    }, []);

    const fallbackMediaUrl = getMediaUrl(filePath);
    const effectiveMediaUrl = mediaUrl || fallbackMediaUrl;

    useEffect(() => {
      setMediaError(null);
    }, [filePath, mediaUrl]);

    if (mediaError) {
      return (
        <FileViewerError fileName={fileName} type='load-error' description={mediaError.message} onClose={onClose} />
      );
    }

    if (isLoading && isEditable) {
      return <ImageLoader imageSrc={ZAMP_LOGO_LOADER_SVG} width={140} height={140} />;
    }

    const isTextSpreadsheetRaw =
      fileCategory === FILE_CATEGORY.SPREADSHEET &&
      (TEXT_SPREADSHEET_EXTENSIONS as readonly string[]).includes(fileExtension.toLowerCase()) &&
      spreadsheetViewMode === 'raw';

    if ((CONTENT_BASED_CATEGORIES.has(fileCategory) || isTextSpreadsheetRaw) && content === null) {
      return <ImageLoader imageSrc={ZAMP_LOGO_LOADER_SVG} width={140} height={140} />;
    }

    switch (fileCategory) {
      case FILE_CATEGORY.IMAGE:
        return <ImageViewer src={effectiveMediaUrl} alt={fileName} onError={handleMediaError} />;

      case FILE_CATEGORY.AUDIO:
        return (
          <AudioViewer src={effectiveMediaUrl} fileName={fileName} isActive={isActive} onError={handleMediaError} />
        );

      case FILE_CATEGORY.VIDEO:
        return <VideoViewer src={effectiveMediaUrl} isActive={isActive} onError={handleMediaError} />;

      case FILE_CATEGORY.PDF:
        return (
          <PdfViewer key={effectiveMediaUrl} src={effectiveMediaUrl} fileName={fileName} onError={handleMediaError} />
        );

      case FILE_CATEGORY.MARKDOWN:
        if (markdownViewMode === 'raw') {
          return <MonacoCodeEditor content={content!} language='markdown' onChange={onContentChange} />;
        }

        return <MilkdownEditor content={content!} onChange={onContentChange} />;

      case FILE_CATEGORY.HTML:
        if (htmlViewMode === 'code') {
          return <MonacoCodeEditor content={content!} language='html' onChange={onContentChange} />;
        }

        return <HtmlPreviewViewer content={content!} />;

      case FILE_CATEGORY.SPREADSHEET: {
        const isTextSpreadsheet = (TEXT_SPREADSHEET_EXTENSIONS as readonly string[]).includes(
          fileExtension.toLowerCase(),
        );

        if (isTextSpreadsheet && spreadsheetViewMode === 'raw') {
          return <MonacoCodeEditor content={content!} language='plaintext' onChange={onContentChange} />;
        }

        return (
          <SpreadsheetViewer
            content={isTextSpreadsheet ? content : undefined}
            mediaUrl={!isTextSpreadsheet ? effectiveMediaUrl : undefined}
            fileExtension={fileExtension}
            onError={handleMediaError}
          />
        );
      }

      case FILE_CATEGORY.CODE:
        return (
          <MonacoCodeEditor content={content!} language={getMonacoLanguage(fileExtension)} onChange={onContentChange} />
        );

      case FILE_CATEGORY.UNKNOWN:
      default:
        return <UnsupportedFileView fileName={fileName} />;
    }
  },
);

FileViewerContent.displayName = 'FileViewerContent';

export default FileViewerContent;
