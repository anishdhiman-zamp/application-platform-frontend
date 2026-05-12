'use client';

import { useCallback, useState } from 'react';
import { captureException } from '@sentry/browser';
import { Button, FileIcon } from '@zamp-platform/ui';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { getChatFileRoute } from '@/constants/routeConfig';
import ChatButtonZampLogo from '@/modules/pace/components/chat/ChatButtonZampLogo';
import {
  HTML_VIEW_OPTIONS,
  MARKDOWN_VIEW_OPTIONS,
  MILKDOWN_SIZE_LIMIT,
  SPREADSHEET_VIEW_OPTIONS,
} from '@/modules/pace/components/file-viewer/file-viewer.constants';
import type {
  HtmlViewMode,
  MarkdownViewMode,
  SpreadsheetViewMode,
} from '@/modules/pace/components/file-viewer/file-viewer.types';
import FilePathBreadcrumb from '@/modules/pace/components/file-viewer/FilePathBreadcrumb';
import FileViewerContent from '@/modules/pace/components/file-viewer/FileViewerContent';
import FileViewerError from '@/modules/pace/components/file-viewer/FileViewerError';
import { getFileExtension } from '@/modules/pace/components/files/file-tree.utils';
import {
  FILE_CATEGORY,
  FILE_TOAST_MESSAGES,
  TEXT_SPREADSHEET_EXTENSIONS,
} from '@/modules/pace/components/files/files.constants';
import { setNewChatDraft } from '@/modules/pace/hooks/useChatDraftInput';
import useFileViewerData from '@/modules/pace/hooks/useFileViewer';
import { usePaceConversationContext, usePaceLayoutContext } from '@/modules/pace/pace.context';
import { CHAT_SIDEBAR_STATE } from '@/modules/pace/pace.types';

interface FileListingDetailPanelProps {
  filePath: string;
  onClose: () => void;
}

const FileListingDetailPanel = ({ filePath, onClose }: FileListingDetailPanelProps) => {
  const [markdownViewMode] = useState<MarkdownViewMode>(MARKDOWN_VIEW_OPTIONS[0].value);
  const [htmlViewMode] = useState<HtmlViewMode>(HTML_VIEW_OPTIONS[0].value);
  const [spreadsheetViewMode] = useState<SpreadsheetViewMode>(SPREADSHEET_VIEW_OPTIONS[0].value);
  const router = useRouter();
  const { setActiveFileInfo } = usePaceConversationContext();
  const { setChatSidebarState, requestInstantFilesPanelTransition } = usePaceLayoutContext();

  const handleSaveError = useCallback((error: unknown) => {
    captureException(error instanceof Error ? error : new Error(`File save failed: ${JSON.stringify(error)}`));
    toast.error(FILE_TOAST_MESSAGES.FAILED_TO_SAVE_FILE);
  }, []);

  const handleLoadError = useCallback((error: unknown) => {
    captureException(error instanceof Error ? error : new Error(`File load failed: ${JSON.stringify(error)}`));
  }, []);

  const { content, isLoading, isFileNotFound, fileCategory, fileExtension, isEditable, updateContent, mediaUrl } =
    useFileViewerData({
      filePath,
      isActive: true,
      onSaveError: handleSaveError,
      onLoadError: handleLoadError,
    });

  const fileName = filePath.split('/').pop() || filePath;
  const extension = getFileExtension(fileName);
  const isLargeMarkdown = fileCategory === FILE_CATEGORY.MARKDOWN && (content?.length ?? 0) > MILKDOWN_SIZE_LIMIT;
  const effectiveMarkdownViewMode = isLargeMarkdown ? 'raw' : markdownViewMode;
  const effectiveSpreadsheetViewMode =
    fileCategory === FILE_CATEGORY.SPREADSHEET &&
    !(TEXT_SPREADSHEET_EXTENSIONS as readonly string[]).includes(fileExtension.toLowerCase())
      ? 'table'
      : spreadsheetViewMode;

  const handleChatWithFile = () => {
    if (!filePath || !fileName) return;

    setNewChatDraft(`Let's discuss ${fileName} `);
    setActiveFileInfo({ path: filePath, name: fileName });
    setChatSidebarState(CHAT_SIDEBAR_STATE.SIDEBAR);
    requestInstantFilesPanelTransition();
    router.push(getChatFileRoute(filePath));
  };

  if (isFileNotFound && isEditable) {
    return <FileViewerError fileName={fileName} type='not-found' onClose={onClose} />;
  }

  return (
    <div className='flex h-full min-h-0 flex-col overflow-hidden'>
      <div className='border-GRAY_300 bg-BG_WHITE flex h-[54px] shrink-0 items-center justify-between gap-4 border-b px-4'>
        <div className='flex min-w-0 shrink items-center gap-x-1'>
          <FilePathBreadcrumb
            filePath={filePath}
            fileName={fileName}
            fileIcon={
              <FileIcon extension={extension || 'txt'} className='size-4 rounded-sm' iconClassName='size-3.5' />
            }
          />
        </div>
        <div className='flex shrink-0 items-center gap-x-2'>
          <Button variant='default' size='small' leadingIcon={<ChatButtonZampLogo />} onClick={handleChatWithFile}>
            Chat with File
          </Button>
          <Button type='button' variant='secondary' size='small' onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
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
          isActive
          onContentChange={updateContent}
          onClose={onClose}
          markdownViewMode={effectiveMarkdownViewMode}
          htmlViewMode={htmlViewMode}
          spreadsheetViewMode={effectiveSpreadsheetViewMode}
        />
      </div>
    </div>
  );
};

export default FileListingDetailPanel;
