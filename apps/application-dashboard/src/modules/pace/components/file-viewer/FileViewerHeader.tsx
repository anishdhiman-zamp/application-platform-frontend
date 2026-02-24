'use client';

import { FileIcon, Input, Tabs, TabsList, TabsTrigger } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { Eye, Pencil } from 'lucide-react';
import FileSaveStatus from '@/modules/pace/components/file-viewer/FileSaveStatus';
import FileViewerHeaderMenu from '@/modules/pace/components/file-viewer/FileViewerHeaderMenu';
import { getFileExtension } from '@/modules/pace/components/files/file-tree.utils';
import { useFileViewerHeaderActions } from '@/modules/pace/hooks/useFileViewerHeaderActions';
import { useFileViewerHeaderRename } from '@/modules/pace/hooks/useFileViewerHeaderRename';

export type MarkdownViewMode = 'edit' | 'preview';

interface FileViewerHeaderProps {
  filePath: string;
  fileName: string;
  isSaving: boolean;
  lastSavedAt: number | null;
  className?: string;
  isMarkdown?: boolean;
  viewMode?: MarkdownViewMode;
  onViewModeChange?: (mode: MarkdownViewMode) => void;
}

const FileViewerHeader = ({
  filePath,
  fileName,
  isSaving,
  lastSavedAt,
  className = '',
  isMarkdown = false,
  viewMode = 'edit',
  onViewModeChange,
}: FileViewerHeaderProps) => {
  const extension = getFileExtension(fileName);

  const {
    isRenaming,
    renameValue,
    fileExtension,
    isRenameLoading,
    startRename,
    setRenameValue,
    handleRenameSubmit,
    handleRenameKeyDown,
    handleRenameInputRef,
  } = useFileViewerHeaderRename({
    filePath,
    fileName,
  });

  const { handleActionClick, isDeleting } = useFileViewerHeaderActions({
    filePath,
    fileName,
  });

  return (
    <div className={cn('border-GRAY_400 flex items-center justify-between border-b bg-white px-4 py-3', className)}>
      <div className='flex items-center gap-3'>
        <FileIcon extension={extension || 'txt'} size='sm' />

        <div className='flex items-center gap-x-3'>
          {isRenaming ? (
            <div className='flex items-center'>
              <Input
                ref={handleRenameInputRef}
                autoFocus
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onKeyDown={handleRenameKeyDown}
                onBlur={handleRenameSubmit}
                disabled={isRenameLoading}
                className='f-14-500 text-GRAY_1000 h-6 w-auto min-w-[100px] px-1 py-1'
                autoComplete='off'
              />
              {fileExtension && <span className='f-14-500 text-GRAY_600 shrink-0 select-none'>{fileExtension}</span>}
            </div>
          ) : (
            <span className='f-14-500 text-GRAY_1000 cursor-pointer' onDoubleClick={startRename}>
              {fileName}
            </span>
          )}
        </div>
      </div>

      <div className='flex items-center gap-x-3'>
        <FileSaveStatus isSaving={isSaving} lastSavedAt={lastSavedAt} />
        {isMarkdown && (
          <Tabs value={viewMode} onValueChange={(value) => onViewModeChange?.(value as MarkdownViewMode)}>
            <TabsList className='gap-x-1'>
              <TabsTrigger value='edit' className='flex h-6 w-[26px] shrink-0 items-center justify-center p-1.5'>
                <Pencil size={14} />
              </TabsTrigger>
              <TabsTrigger value='preview' className='flex h-6 w-[26px] shrink-0 items-center justify-center p-1.5'>
                <Eye size={14} />
              </TabsTrigger>
            </TabsList>
          </Tabs>
        )}
        <FileViewerHeaderMenu onActionClick={handleActionClick} disabled={isDeleting || isRenaming} />
      </div>
    </div>
  );
};

export default FileViewerHeader;
