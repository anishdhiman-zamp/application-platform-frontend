import { Button } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { CircleX, FileText, LoaderCircle } from 'lucide-react';
import React from 'react';

import { useChatActions } from '../../context/ChatActionsContext';
import { UploadedFileType } from '../../types/block.types';

interface FileReferenceItemProps {
  fileReference: UploadedFileType;
  onRemove?: (fileId: string) => void;
  isLoading?: boolean;
  className?: string;
}

const getFileIcon = () => {
  return (
    <div className='flex h-5 w-6 items-center justify-center rounded-md bg-gray-100 [&_svg]:size-3.5'>
      <FileText />
    </div>
  );
};

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
        'rounded-2.5 shadow-table-filter-menu group relative inline-flex w-fit cursor-pointer items-center gap-2 border border-gray-400 bg-white p-1 pr-3',
        className,
      )}
      onClick={handleClick}
    >
      <div className='flex items-center gap-1'>
        {getFileIcon()}
        <span className='f-12-500 max-w-[104px] truncate'>{fileReference.name}</span>
      </div>
      {fileReference.path && onRemove && (
        <Button
          className='absolute -top-2 -right-2 size-4 rounded-full bg-white p-px opacity-0 group-hover:opacity-100 [&_svg]:size-3.5'
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
          className='absolute -top-2 -right-2 size-4 rounded-full border border-gray-400 bg-white [&_svg]:size-3'
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
