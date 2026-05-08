'use client';

import { type MouseEvent } from 'react';
import { FileIcon } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { X } from 'lucide-react';
import { getFileExtension } from '@/modules/pace/components/files/file-tree.utils';
import { defaultFnType } from '@/types/commonTypes';

interface FilePillProps {
  filePath: string;
  fileName: string;
  onOpen: defaultFnType;
  onDetach: defaultFnType;
  className?: string;
}

const FilePill = ({ filePath, fileName, onOpen, onDetach, className }: FilePillProps) => {
  const extension = getFileExtension(fileName);

  const handleDetach = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onDetach();
  };

  return (
    <div
      role='button'
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onOpen();
        }
      }}
      title={filePath}
      className={cn(
        'border-GRAY_400 bg-BG_WHITE hover:bg-GRAY_200 flex w-fit max-w-[240px] cursor-pointer items-center gap-1.5 rounded-3xl border py-1.5 pr-1.5 pl-2 transition-colors',
        className,
      )}
    >
      <FileIcon extension={extension || 'txt'} className='size-3.5 shrink-0 rounded-sm' iconClassName='size-3' />
      <span className='f-13-450 text-GRAY_1000 min-w-0 truncate'>{fileName}</span>
      <button
        type='button'
        aria-label='Remove file from chat'
        onClick={handleDetach}
        className='text-GRAY_700 hover:bg-GRAY_300 hover:text-GRAY_1000 flex size-4 shrink-0 items-center justify-center rounded-full transition-colors'
      >
        <X size={11} />
      </button>
    </div>
  );
};

export default FilePill;
