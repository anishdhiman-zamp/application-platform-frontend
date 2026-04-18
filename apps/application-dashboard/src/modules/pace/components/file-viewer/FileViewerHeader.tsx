'use client';

import { memo } from 'react';
import { Button, FileIcon, Tabs, TabsList, TabsTrigger } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { Download } from 'lucide-react';
import TooltipV2 from '@/components/common/TooltipV2';
import {
  HTML_VIEW_OPTIONS,
  MARKDOWN_VIEW_OPTIONS,
  SPREADSHEET_VIEW_OPTIONS,
} from '@/modules/pace/components/file-viewer/file-viewer.constants';
import type {
  HtmlViewMode,
  MarkdownViewMode,
  SpreadsheetViewMode,
  ViewModeToggleProps,
} from '@/modules/pace/components/file-viewer/file-viewer.types';
import FilePathBreadcrumb from '@/modules/pace/components/file-viewer/FilePathBreadcrumb';
import FileSaveStatus from '@/modules/pace/components/file-viewer/FileSaveStatus';
import FileViewerHeaderMenu from '@/modules/pace/components/file-viewer/FileViewerHeaderMenu';
import RenameFileDialog from '@/modules/pace/components/file-viewer/RenameFileDialog';
import DeleteConfirmationDialog from '@/modules/pace/components/files/DeleteConfirmationDialog';
import { getFileExtension } from '@/modules/pace/components/files/file-tree.utils';
import { FILE_VIEWER_HEADER_ACTION_IDS } from '@/modules/pace/components/files/files.constants';
import { useFileViewerHeaderActions } from '@/modules/pace/hooks/useFileViewerHeaderActions';
import { useFileViewerHeaderRename } from '@/modules/pace/hooks/useFileViewerHeaderRename';
import { SIDE_OPTIONS } from '@/types/commonTypes';

const ViewModeToggle = <T extends string>({ value, options, onChange }: ViewModeToggleProps<T>) => (
  <Tabs value={value} onValueChange={(v) => onChange(v as T)}>
    <TabsList className='gap-x-1'>
      {options.map((option) => (
        <TabsTrigger
          key={option.value}
          value={option.value}
          className='flex h-6 w-[26px] shrink-0 items-center justify-center border border-transparent p-1.5'
        >
          {option.icon}
        </TabsTrigger>
      ))}
    </TabsList>
  </Tabs>
);

interface FileViewerHeaderProps {
  filePath: string;
  fileName: string;
  isSaving: boolean;
  lastSavedAt: number | null;
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
    isSaving,
    lastSavedAt,
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
          <div className='flex min-w-0 items-center'>
            <FilePathBreadcrumb
              filePath={filePath}
              fileName={fileName}
              fileIcon={
                <FileIcon extension={extension || 'txt'} className='size-4 rounded-sm' iconClassName='size-3.5' />
              }
            />
          </div>

          <div className='flex items-center gap-x-2'>
            <FileSaveStatus isSaving={isSaving} lastSavedAt={lastSavedAt} />
            {isMarkdown && onViewModeChange && (
              <ViewModeToggle value={viewMode} options={MARKDOWN_VIEW_OPTIONS} onChange={onViewModeChange} />
            )}
            {isHtml && onHtmlViewModeChange && (
              <ViewModeToggle value={htmlViewMode} options={HTML_VIEW_OPTIONS} onChange={onHtmlViewModeChange} />
            )}
            {isTextSpreadsheet && onSpreadsheetViewModeChange && (
              <ViewModeToggle
                value={spreadsheetViewMode}
                options={SPREADSHEET_VIEW_OPTIONS}
                onChange={onSpreadsheetViewModeChange}
              />
            )}
            <TooltipV2 tooltipBody='Download' side={SIDE_OPTIONS.BOTTOM} delayDuration={300} asChildTrigger>
              <Button
                variant='ghost'
                size='icon'
                onClick={() => handleActionClick(FILE_VIEWER_HEADER_ACTION_IDS.DOWNLOAD)}
                disabled={isDeleting}
                className='h-6 w-6 shrink-0'
              >
                <Download size={14} className='text-GRAY_700' />
              </Button>
            </TooltipV2>
            <FileViewerHeaderMenu onActionClick={handleActionClick} disabled={isDeleting || isRenameLoading} />
          </div>
        </div>
      </>
    );
  },
);

FileViewerHeader.displayName = 'FileViewerHeader';

export default FileViewerHeader;
