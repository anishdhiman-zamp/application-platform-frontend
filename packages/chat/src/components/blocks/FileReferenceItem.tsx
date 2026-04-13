import { Button, FileIcon } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { CircleX, LoaderCircle } from 'lucide-react';
import React from 'react';

import { useChatActions } from '../../context/ChatActionsContext';
import { UploadedFileType } from '../../types/block.types';

interface FileReferenceItemProps {
  fileReference: UploadedFileType;
  onRemove?: (fileId: string) => void;
  isLoading?: boolean;
  className?: string;
}

/** @deprecated Use `FilePreviewCard` instead, which shows file content previews. */
const FileReferenceItem: React.FC<FileReferenceItemProps> = ({ fileReference, onRemove, isLoading, className }) => {
  const { onFileOpen } = useChatActions();

  const handleClick = () => {
    if (!fileReference.path) return;

    if (onFileOpen) {
      const normalizedPath = fileReference.path.startsWith('/home/') ? fileReference.path.slice(6) : fileReference.path;
      onFileOpen(normalizedPath, fileReference.name);
    }
  };

  return (
    <span
      key={fileReference.path || fileReference.name}
      className={cn(
        'rounded-2.5 shadow-table-filter-menu group border-border bg-BG_WHITE relative inline-flex w-fit cursor-pointer items-center gap-2 border p-1 pr-3',
        className,
      )}
      onClick={handleClick}
    >
      <div className='flex items-center gap-1'>
        <FileIcon extension={fileReference.name || 'txt'} className='size-5 rounded-md' iconClassName='size-4' />
        <span className='f-12-500 max-w-[104px] truncate'>{fileReference.name}</span>
      </div>
      {fileReference.path && onRemove && (
        <Button
          className='bg-BG_WHITE absolute -top-2 -right-2 size-4 rounded-full p-px opacity-0 group-hover:opacity-100 [&_svg]:size-3.5'
          variant='ghost'
          size='icon'
          onClick={(e) => {
            e.stopPropagation();
            onRemove(fileReference.path);
          }}
        >
          <CircleX className='size-3.5 text-gray-700' />
        </Button>
      )}
      {isLoading && !fileReference.path && (
        <Button
          className='border-border bg-BG_WHITE absolute -top-2 -right-2 size-4 rounded-full border [&_svg]:size-3'
          variant='ghost'
          size='icon'
        >
          <LoaderCircle size={12} className='animate-spin text-blue-700' />
        </Button>
      )}
    </span>
  );
};

export default FileReferenceItem;
