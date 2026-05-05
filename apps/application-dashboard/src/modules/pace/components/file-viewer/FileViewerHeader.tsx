'use client';

import { memo } from 'react';
import { Button, FileIcon, toast } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { FolderOpen } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ROUTES_PATH } from '@/constants/routeConfig';
import {
  HTML_VIEW_OPTIONS,
  MARKDOWN_VIEW_OPTIONS,
  SPREADSHEET_VIEW_OPTIONS,
} from '@/modules/pace/components/file-viewer/file-viewer.constants';
import type {
  HtmlViewMode,
  MarkdownViewMode,
  SpreadsheetViewMode,
} from '@/modules/pace/components/file-viewer/file-viewer.types';
import FilePathBreadcrumb from '@/modules/pace/components/file-viewer/FilePathBreadcrumb';
import FileViewerHeaderMenu, { ViewModeMenuSection } from '@/modules/pace/components/file-viewer/FileViewerHeaderMenu';
import RenameFileDialog from '@/modules/pace/components/file-viewer/RenameFileDialog';
import DeleteConfirmationDialog from '@/modules/pace/components/files/DeleteConfirmationDialog';
import { getFileExtension } from '@/modules/pace/components/files/file-tree.utils';
import { setNewChatDraft } from '@/modules/pace/hooks/useChatDraftInput';
import { useFileViewerHeaderActions } from '@/modules/pace/hooks/useFileViewerHeaderActions';
import { useFileViewerHeaderRename } from '@/modules/pace/hooks/useFileViewerHeaderRename';
import { FILES_LISTING_CONVERSATION_ID } from '@/modules/pace/pace.constants';
import { usePaceConversationContext, usePaceLayoutContext } from '@/modules/pace/pace.context';

interface FileViewerHeaderProps {
  filePath: string;
  fileName: string;
  className?: string;
  isMarkdown?: boolean;
  isHtml?: boolean;
  isTextSpreadsheet?: boolean;
  viewMode?: MarkdownViewMode;
  htmlViewMode?: HtmlViewMode;
  spreadsheetViewMode?: SpreadsheetViewMode;
  onViewModeChange?: (mode: MarkdownViewMode) => void;
  onHtmlViewModeChange?: (mode: HtmlViewMode) => void;
  onSpreadsheetViewModeChange?: (mode: SpreadsheetViewMode) => void;
}

const FileViewerHeader = memo(
  ({
    filePath,
    fileName,
    className = '',
    isMarkdown = false,
    isHtml = false,
    isTextSpreadsheet = false,
    viewMode = 'milkdown',
    htmlViewMode = 'preview',
    spreadsheetViewMode = 'table',
    onViewModeChange,
    onHtmlViewModeChange,
    onSpreadsheetViewModeChange,
  }: FileViewerHeaderProps) => {
    const extension = getFileExtension(fileName);

    const router = useRouter();
    const { wordWrapEnabled, toggleWordWrap, toggleTreeSidebar, isTreeSidebarOpen } = usePaceLayoutContext();
    const { activeConversationId, setPendingFileReferences } = usePaceConversationContext();
    const isOnFilesPage = activeConversationId === FILES_LISTING_CONVERSATION_ID;

    const {
      isRenameDialogOpen,
      isRenameLoading,
      siblingNames,
      openRenameDialog,
      setRenameDialogOpen,
      handleRenameSubmit,
    } = useFileViewerHeaderRename({
      filePath,
      fileName,
    });

    const { handleActionClick, isDeleting, deleteConfirmation } = useFileViewerHeaderActions({
      filePath,
      fileName,
      onRenameRequested: openRenameDialog,
    });

    const handleCopyPath = () => {
      if (!filePath) return;

      navigator.clipboard
        .writeText(filePath)
        .then(() => toast.success('Path copied to clipboard'))
        .catch(() => toast.error('Failed to copy path'));
    };

    const handleChatWithFile = () => {
      if (!filePath || !fileName) return;

      setPendingFileReferences([{ path: filePath, name: fileName }]);
      setNewChatDraft(`Let's discuss ${fileName} `);
      router.push(ROUTES_PATH.CHAT);
    };

    const renderViewModeSection = () => {
      if (isMarkdown && onViewModeChange) {
        return <ViewModeMenuSection value={viewMode} options={MARKDOWN_VIEW_OPTIONS} onChange={onViewModeChange} />;
      }
      if (isHtml && onHtmlViewModeChange) {
        return <ViewModeMenuSection value={htmlViewMode} options={HTML_VIEW_OPTIONS} onChange={onHtmlViewModeChange} />;
      }
      if (isTextSpreadsheet && onSpreadsheetViewModeChange) {
        return (
          <ViewModeMenuSection
            value={spreadsheetViewMode}
            options={SPREADSHEET_VIEW_OPTIONS}
            onChange={onSpreadsheetViewModeChange}
          />
        );
      }

      return null;
    };

    return (
      <>
        {deleteConfirmation.isOpen && (
          <DeleteConfirmationDialog
            open
            onOpenChange={deleteConfirmation.onOpenChange}
            itemName={fileName}
            itemType='file'
            isDeleting={isDeleting}
            onConfirm={deleteConfirmation.onConfirm}
          />
        )}
        <RenameFileDialog
          open={isRenameDialogOpen}
          onOpenChange={setRenameDialogOpen}
          currentFileName={fileName}
          siblingNames={siblingNames}
          isLoading={isRenameLoading}
          onConfirm={handleRenameSubmit}
        />
        <div
          className={cn('border-GRAY_400 bg-BG_WHITE flex items-center justify-between border-b px-4 py-3', className)}
        >
          <div className='flex min-w-0 shrink items-center gap-x-1'>
            <FilePathBreadcrumb
              filePath={filePath}
              fileName={fileName}
              fileIcon={
                <FileIcon extension={extension || 'txt'} className='size-4 rounded-sm' iconClassName='size-3.5' />
              }
            />
            <FileViewerHeaderMenu
              onActionClick={handleActionClick}
              onCopyPath={handleCopyPath}
              wordWrapEnabled={wordWrapEnabled}
              onToggleWordWrap={toggleWordWrap}
              disabled={isDeleting || isRenameLoading}
              viewModeSection={renderViewModeSection()}
            />
          </div>

          <div className='flex shrink-0 items-center gap-x-2'>
            <Button variant='default' size='small' onClick={handleChatWithFile}>
              Chat with file
            </Button>
            {!isOnFilesPage && (
              <Button
                variant='ghost'
                size='icon'
                onClick={toggleTreeSidebar}
                title='Toggle file tree'
                aria-label='Toggle file tree'
                aria-pressed={isTreeSidebarOpen}
                className={cn('h-6 w-6 shrink-0', isTreeSidebarOpen && 'bg-accent text-accent-GRAY_1000')}
              >
                <FolderOpen size={14} className='text-GRAY_700' />
              </Button>
            )}
          </div>
        </div>
      </>
    );
  },
);

FileViewerHeader.displayName = 'FileViewerHeader';

export default FileViewerHeader;
