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
const DocxViewer = clientOnly(() => import('./viewers/DocxViewer'));
const PresentationViewer = clientOnly(() => import('./viewers/PresentationViewer'));

import { MILKDOWN_SIZE_LIMIT } from '@/modules/pace/components/file-viewer/file-viewer.constants';
import type {
  HtmlViewMode,
  MarkdownViewMode,
  SpreadsheetViewMode,
} from '@/modules/pace/components/file-viewer/file-viewer.types';
import FileViewerError from '@/modules/pace/components/file-viewer/FileViewerError';
import AudioViewer from '@/modules/pace/components/file-viewer/viewers/AudioViewer';
import HtmlPreviewViewer from '@/modules/pace/components/file-viewer/viewers/HtmlPreviewViewer';
import ImageViewer from '@/modules/pace/components/file-viewer/viewers/ImageViewer';
import { getMonacoLanguage } from '@/modules/pace/components/file-viewer/viewers/monaco.utils';
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

/**
 * Wrapper that passes isActive to Audio/Video viewers via a ref so the
 * parent useMemo doesn't need isActive as a dependency (which would
 * recreate every viewer's JSX on each tab switch).
 */
const ActiveMediaWrapper = memo(
  ({ isActive, children }: { isActive: boolean; children: (active: boolean) => React.ReactNode }) => {
    return <>{children(isActive)}</>;
  },
);

ActiveMediaWrapper.displayName = 'ActiveMediaWrapper';

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

    const fallbackMediaUrl = getMediaUrl(filePath);
    const effectiveMediaUrl = mediaUrl || fallbackMediaUrl;

    const isTextSpreadsheet =
      fileCategory === FILE_CATEGORY.SPREADSHEET &&
      (TEXT_SPREADSHEET_EXTENSIONS as readonly string[]).includes(fileExtension.toLowerCase());
    const isContentLoading =
      (isLoading && isEditable) ||
      (CONTENT_BASED_CATEGORIES.has(fileCategory) && content === null) ||
      (isTextSpreadsheet && content === null);
    const needsActiveState = fileCategory === FILE_CATEGORY.AUDIO || fileCategory === FILE_CATEGORY.VIDEO;
    const isSpreadsheetTable =
      fileCategory === FILE_CATEGORY.SPREADSHEET && !(isTextSpreadsheet && spreadsheetViewMode === 'raw');

    const handleMediaError = useCallback((message?: string) => {
      setMediaError({ message });
    }, []);

    useEffect(() => {
      setMediaError(null);
    }, [filePath, mediaUrl]);

    const renderContent = useMemo(() => {
      switch (fileCategory) {
        case FILE_CATEGORY.IMAGE:
          return <ImageViewer src={effectiveMediaUrl} alt={fileName} onError={handleMediaError} />;

        case FILE_CATEGORY.AUDIO:
        case FILE_CATEGORY.VIDEO:
          return null;

        case FILE_CATEGORY.PDF:
          return (
            <PdfViewer key={effectiveMediaUrl} src={effectiveMediaUrl} fileName={fileName} onError={handleMediaError} />
          );

        case FILE_CATEGORY.MARKDOWN:
          if (markdownViewMode === 'raw' || (content && content.length > MILKDOWN_SIZE_LIMIT)) {
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

          return null;
        }

        case FILE_CATEGORY.DOCUMENT:
          return (
            <DocxViewer
              key={effectiveMediaUrl}
              mediaUrl={effectiveMediaUrl}
              fileExtension={fileExtension}
              onError={handleMediaError}
            />
          );

        case FILE_CATEGORY.PRESENTATION:
          return (
            <PresentationViewer
              key={effectiveMediaUrl}
              mediaUrl={effectiveMediaUrl}
              fileExtension={fileExtension}
              onError={handleMediaError}
            />
          );

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
      markdownViewMode,
      content,
      onContentChange,
      htmlViewMode,
      fileExtension,
      spreadsheetViewMode,
    ]);

    const mediaContent = needsActiveState ? (
      <ActiveMediaWrapper isActive={isActive}>
        {(active) =>
          fileCategory === FILE_CATEGORY.AUDIO ? (
            <AudioViewer src={effectiveMediaUrl} fileName={fileName} isActive={active} onError={handleMediaError} />
          ) : (
            <VideoViewer src={effectiveMediaUrl} isActive={active} onError={handleMediaError} />
          )
        }
      </ActiveMediaWrapper>
    ) : null;

    const spreadsheetContent = isSpreadsheetTable ? (
      <SpreadsheetViewer
        content={isTextSpreadsheet ? content : undefined}
        mediaUrl={!isTextSpreadsheet ? effectiveMediaUrl : undefined}
        fileExtension={fileExtension}
        isActive={isActive}
        onError={handleMediaError}
      />
    ) : null;

    const resolvedContent = needsActiveState ? mediaContent : isSpreadsheetTable ? spreadsheetContent : renderContent;

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
        {resolvedContent}
      </CommonWrapper>
    );
  },
);

FileViewerContent.displayName = 'FileViewerContent';

export default FileViewerContent;
