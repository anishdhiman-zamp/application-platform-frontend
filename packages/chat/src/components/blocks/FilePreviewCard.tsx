'use client';

import '../code-highlight.css';

import { Button, FileIcon } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { CircleX, LoaderCircle } from 'lucide-react';

import { useChatActions } from '../../context/ChatActionsContext';
import { useFilePreview } from '../../hooks/useFilePreview';
import { UploadedFileType } from '../../types/block.types';
import PreviewContent from './PreviewContent';

interface FilePreviewCardProps {
  fileReference: UploadedFileType;
  onRemove?: (fileId: string) => void;
  isLoading?: boolean;
  className?: string;
}

const FilePreviewCard = ({ fileReference, onRemove, isLoading, className }: FilePreviewCardProps) => {
  const { onFileOpen } = useChatActions();
  const { category, previewUrl, codeNodes, isLoading: isPreviewLoading } = useFilePreview(fileReference);

  const handleClick = () => {
    if (!fileReference.path) return;

    if (onFileOpen) {
      // Server returns absolute paths prefixed with /home/; the file tree expects paths without it
      const normalizedPath = fileReference.path.startsWith('/home/') ? fileReference.path.slice(6) : fileReference.path;
      onFileOpen(normalizedPath, fileReference.name);
    }
  };

  return (
    <div
      className={cn(
        'shadow-table-filter-menu border-border bg-BG_WHITE group relative w-30 cursor-pointer rounded-[10px] border',
        isLoading && !fileReference.path && 'pointer-events-none opacity-60',
        className,
      )}
      role='button'
      tabIndex={0}
      onClick={handleClick}
    >
      {/* Preview area */}
      <div className='relative h-20 w-full overflow-hidden rounded-t-[8px]'>
        <PreviewContent
          category={category}
          previewUrl={previewUrl}
          codeNodes={codeNodes}
          isLoading={isPreviewLoading}
          fileName={fileReference.name}
        />
      </div>

      {/* File name bar */}
      <div className='border-border flex items-center gap-1.5 border-t px-2 py-1.5'>
        <FileIcon extension={fileReference.name || 'txt'} className='size-4 shrink-0 rounded' iconClassName='size-3' />
        <span className='f-12-500 text-GRAY_1000 min-w-0 truncate'>{fileReference.name}</span>
      </div>

      {/* Remove button */}
      {fileReference.path && onRemove && (
        <Button
          className='absolute -top-2 -right-2 size-4 rounded-full p-px opacity-0 group-hover:opacity-100 hover:bg-transparent [&_svg]:size-3.5'
          variant='ghost'
          size='icon'
          onClick={(e) => {
            e.stopPropagation();
            onRemove(fileReference.path);
          }}
        >
          <CircleX className='text-GRAY_500 size-3.5' />
        </Button>
      )}

      {/* Upload loading indicator */}
      {isLoading && !fileReference.path && (
        <Button
          className='border-border bg-BG_WHITE absolute -top-2 -right-2 size-4 rounded-full border [&_svg]:size-3'
          variant='ghost'
          size='icon'
        >
          <LoaderCircle size={12} className='animate-spin text-blue-700' />
        </Button>
      )}
    </div>
  );
};

FilePreviewCard.displayName = 'FilePreviewCard';

export default FilePreviewCard;
