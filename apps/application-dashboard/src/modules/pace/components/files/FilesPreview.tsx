import { FileIcon } from '@zamp-platform/ui';
import Image from 'next/image';
import { FILE_TYPE, type FilesPreviewProps } from '@/modules/pace/components/files/file-tree.types';
import {
  formatDate,
  formatFileSize,
  getFileExtension,
  getFileTypeLabel,
} from '@/modules/pace/components/files/file-tree.utils';

const FilesPreview = ({ selectedFile }: FilesPreviewProps) => {
  if (!selectedFile || selectedFile.type === FILE_TYPE.DIRECTORY) {
    return (
      <div className='w-3/5 overflow-y-auto p-3'>
        <div className='flex h-full flex-col items-center justify-start gap-y-8 p-3'>
          <div className='border-GRAY_400 rounded-xl border border-dashed p-1.5'>
            <div className='aspect-5/4 w-full overflow-hidden rounded-lg'>
              <Image
                src='/images/files/file-empty-state.png'
                alt='File Empty State'
                className='size-full object-cover'
                width={400}
                height={320}
                unoptimized
                priority
              />
            </div>
          </div>
          <p className='f-14-500 text-GRAY_700'>Your preview will appear here. Until then, breathe.</p>
        </div>
      </div>
    );
  }

  const extension = getFileExtension(selectedFile.name);
  const fileTypeLabel = getFileTypeLabel(selectedFile.name);
  const fileSize = formatFileSize(selectedFile.size);

  return (
    <div className='flex w-3/5 flex-col gap-y-6 overflow-y-auto p-3'>
      <div className='border-GRAY_400 bg-BG_GRAY_2 flex h-1/2 items-center justify-center rounded-[10px] border p-3'>
        <FileIcon extension={extension || 'txt'} className='text-GRAY_900 size-[100px]' />
      </div>
      <div className='flex flex-col gap-y-5 px-8'>
        <div className='flex flex-col gap-1'>
          <h2 className='f-16-500 text-GRAY_1000'>{selectedFile.name}</h2>
          <p className='f-13-450 text-GRAY_700'>
            {fileTypeLabel} - {fileSize}
          </p>
        </div>
        <div className='flex flex-col gap-4'>
          <div className='flex items-center justify-between'>
            <span className='f-13-450 text-GRAY_700'>Last modified on</span>
            <span className='f-13-450 text-GRAY_1000'>{formatDate(selectedFile.mtime_ms)}</span>
          </div>
          <div className='border-GRAY_400 border-t border-dashed' />
          <div className='flex items-center justify-between'>
            <span className='f-13-450 text-GRAY_700'>Owner</span>
            <span className='f-13-450 text-GRAY_1000'>{selectedFile.owner}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilesPreview;
