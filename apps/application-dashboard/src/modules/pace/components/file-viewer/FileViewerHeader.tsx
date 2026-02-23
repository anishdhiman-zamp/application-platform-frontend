'use client';

import { FileIcon } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { RefreshCw } from 'lucide-react';
import { getFileExtension } from '@/modules/pace/components/files/file-tree.utils';

interface FileViewerHeaderProps {
  fileName: string;
  isSaving: boolean;
  className?: string;
}

const FileViewerHeader = ({ fileName, isSaving, className = '' }: FileViewerHeaderProps) => {
  const extension = getFileExtension(fileName);

  return (
    <div className={cn('border-GRAY_400 flex items-center justify-between border-b bg-white px-4 py-3', className)}>
      <div className='flex items-center gap-3'>
        <FileIcon extension={extension || 'txt'} size='sm' />

        <div className='flex flex-col'>
          <div className='flex items-center gap-x-2'>
            <span className='f-14-500 text-GRAY_1000'>{fileName}</span>
            {isSaving && <RefreshCw size={12} className='text-GRAY_600 animate-spin' />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileViewerHeader;
