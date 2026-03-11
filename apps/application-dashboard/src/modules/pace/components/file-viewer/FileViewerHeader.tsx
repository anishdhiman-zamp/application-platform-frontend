'use client';

import { FileIcon, Input, Tabs, TabsList, TabsTrigger } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
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
import FileSaveStatus from '@/modules/pace/components/file-viewer/FileSaveStatus';
import FileViewerHeaderMenu from '@/modules/pace/components/file-viewer/FileViewerHeaderMenu';
import DeleteConfirmationDialog from '@/modules/pace/components/files/DeleteConfirmationDialog';
import { getFileExtension } from '@/modules/pace/components/files/file-tree.utils';
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
          className='flex h-6 w-[26px] shrink-0 items-center justify-center p-1.5'
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

const FileViewerHeader = ({
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
    isRenaming,
    renameValue,
    fileExtension,
    isRenameLoading,
    isDuplicateName,
    startRename,
    setRenameValue,
    handleRenameSubmit,
    handleRenameKeyDown,
    handleRenameInputRef,
  } = useFileViewerHeaderRename({
    filePath,
    fileName,
  });

  const { handleActionClick, isDeleting, deleteConfirmation } = useFileViewerHeaderActions({
    filePath,
    fileName,
  });

  return (
    <>
      <DeleteConfirmationDialog
        open={deleteConfirmation.isOpen}
        onOpenChange={deleteConfirmation.onOpenChange}
        itemName={fileName}
        itemType='file'
        isDeleting={isDeleting}
        onConfirm={deleteConfirmation.onConfirm}
      />
      <div className={cn('border-GRAY_400 flex items-center justify-between border-b bg-white px-4 py-3', className)}>
        <div className='flex items-center gap-2'>
          <FileIcon extension={extension || 'txt'} className='text-GRAY_900 size-6' />
          <div className='flex items-center gap-x-3'>
            {isRenaming ? (
              <div className='flex items-center'>
                <TooltipV2
                  tooltipBody='A file or folder with this name already exists.'
                  side={SIDE_OPTIONS.BOTTOM}
                  open={isDuplicateName}
                  delayDuration={0}
                  tooltipClassName='bg-RED_100 text-RED_700 border-RED_300 border'
                  asChildTrigger
                >
                  <Input
                    ref={handleRenameInputRef}
                    autoFocus
                    value={renameValue}
                    autoComplete='off'
                    onChange={(e) => setRenameValue(e.target.value)}
                    onBlur={handleRenameSubmit}
                    onKeyDown={handleRenameKeyDown}
                    disabled={isRenameLoading}
                    className={cn(
                      'f-14-500 text-GRAY_1000 h-6 w-auto min-w-[100px] px-1 py-1',
                      isDuplicateName && 'border-RED_700! focus:shadow-input-error-outline-shadow',
                    )}
                  />
                </TooltipV2>
                {fileExtension && <span className='f-14-500 text-GRAY_600 shrink-0 select-none'>{fileExtension}</span>}
              </div>
            ) : (
              <span
                className='f-14-500 text-GRAY_1000 hover:bg-GRAY_200 inline-flex cursor-pointer items-center rounded-md px-1.5 py-0.5 transition-colors'
                onClick={startRename}
              >
                {fileName}
              </span>
            )}
          </div>
        </div>

        <div className='flex items-center gap-x-3'>
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
          <FileViewerHeaderMenu onActionClick={handleActionClick} disabled={isDeleting || isRenaming} />
        </div>
      </div>
    </>
  );
};

export default FileViewerHeader;
