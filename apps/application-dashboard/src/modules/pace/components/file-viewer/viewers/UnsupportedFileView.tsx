'use client';

import { FileIcon } from '@zamp-platform/ui';
import { getFileExtension } from '@/modules/pace/components/files/file-tree.utils';

interface UnsupportedFileViewProps {
  fileName: string;
  downloadUrl?: string;
  className?: string;
}

const UnsupportedFileView = ({ fileName, className = '' }: UnsupportedFileViewProps) => {
  const extension = getFileExtension(fileName);

  return (
    <div className={`flex h-full w-full flex-col items-center justify-center gap-1 p-8 ${className}`}>
      <div className='flex h-32 w-32 items-center justify-center rounded-2xl'>
        <FileIcon extension={extension || 'file'} className='size-26 rounded-lg' iconClassName='size-25' />
      </div>

      <div className='text-center'>
        <h3 className='f-16-500 text-GRAY_1000'>{fileName}</h3>
      </div>

      <div className='text-center'>
        <p className='f-14-400 text-GRAY_900 mb-4'>Preview is not available for this file type.</p>
      </div>
    </div>
  );
};

export default UnsupportedFileView;
