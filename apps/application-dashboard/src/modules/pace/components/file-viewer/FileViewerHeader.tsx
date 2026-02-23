'use client';

import { FileIcon } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import FileSaveStatus from '@/modules/pace/components/file-viewer/FileSaveStatus';
import FileViewerHeaderMenu from '@/modules/pace/components/file-viewer/FileViewerHeaderMenu';
import { getFileExtension } from '@/modules/pace/components/files/file-tree.utils';
import { useFileViewerHeaderActions } from '@/modules/pace/hooks/useFileViewerHeaderActions';

interface FileViewerHeaderProps {
  filePath: string;
  fileName: string;
  isSaving: boolean;
  lastSavedAt: number | null;
  className?: string;
}

const FileViewerHeader = ({ filePath, fileName, isSaving, lastSavedAt, className = '' }: FileViewerHeaderProps) => {
  const extension = getFileExtension(fileName);

  const { handleActionClick, isDeleting } = useFileViewerHeaderActions({
    filePath,
    fileName,
  });

  return (
    <div className={cn('border-GRAY_400 flex items-center justify-between border-b bg-white px-4 py-3', className)}>
      <div className='flex items-center gap-3'>
        <FileIcon extension={extension || 'txt'} size='sm' />

        <div className='flex items-center gap-x-3'>
          <span className='f-14-500 text-GRAY_1000'>{fileName}</span>

          <FileSaveStatus isSaving={isSaving} lastSavedAt={lastSavedAt} />
        </div>
      </div>

      <FileViewerHeaderMenu onActionClick={handleActionClick} disabled={isDeleting} />
    </div>
  );
};

export default FileViewerHeader;
