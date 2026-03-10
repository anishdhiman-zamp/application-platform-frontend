'use client';

import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import UnsupportedFileView from 'modules/pace/components/file-viewer/viewers/UnsupportedFileView';
import ImageLoader from '@/components/common/loader/ImageLoader';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import { ZAMP_LOGO_LOADER_SVG } from '@/constants/icons';
import { clientOnly } from '@/utils/clientOnly';

const PdfViewer = clientOnly(() => import('./viewers/PdfViewer'));
const MonacoCodeEditor = clientOnly(() => import('./viewers/MonacoCodeEditor'));
const MilkdownEditor = clientOnly(() => import('./viewers/MilkdownEditor'));
const SpreadsheetViewer = clientOnly(() => import('./viewers/spreadsheet/SpreadsheetViewer'));

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
  FILE_CATEGORY.SPREADSHEET,
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
    const isContentLoading =
      (isLoading && isEditable) || (CONTENT_BASED_CATEGORIES.has(fileCategory) && content === null);

    useEffect(() => {
      setMediaError(null);
    }, [filePath, mediaUrl]);

    const renderContent = useMemo(() => {
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
            <MonacoCodeEditor
              content={content!}
              language={getMonacoLanguage(fileExtension)}
              onChange={onContentChange}
            />
          );

        case FILE_CATEGORY.UNKNOWN:
        default:
          return <UnsupportedFileView fileName={fileName} />;
      }
    }, [
      fileCategory,
      effectiveMediaUrl,
      fileName,
      handleMediaError,
      isActive,
      markdownViewMode,
      content,
      onContentChange,
      htmlViewMode,
      fileExtension,
      spreadsheetViewMode,
    ]);

    return (
      <CommonWrapper
        isLoading={isContentLoading}
        isError={!!mediaError}
        renderError={
          <FileViewerError fileName={fileName} type='load-error' description={mediaError?.message} onClose={onClose} />
        }
        skeletonType={SkeletonTypes.CUSTOM}
        loader={<ImageLoader imageSrc={ZAMP_LOGO_LOADER_SVG} width={140} height={140} />}
        className='flex h-full w-full items-center justify-center'
        disableAnimation
      >
        {renderContent}
      </CommonWrapper>
    );
  },
);

FileViewerContent.displayName = 'FileViewerContent';

export default FileViewerContent;
