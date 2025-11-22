import { Button, toast } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { CircleX, FileText, Loader } from 'lucide-react';
import React from 'react';

import { useLazyGetFileDownloadUrlQuery } from '../../api';
import { UploadedFileType } from '../../types/block.types';
import { downloadFile } from '../block.utils';

interface AttachmentProps {
  attachment: UploadedFileType;
  removeAttachment?: (fileId: string) => void;
  isLoading?: boolean;
}

const getFileIcon = () => {
  return (
    <div className='flex h-5 w-6 items-center justify-center rounded-md bg-gray-100 [&_svg]:size-3.5'>
      <FileText />
    </div>
  );
};

const Attachment: React.FC<AttachmentProps> = ({ attachment, removeAttachment, isLoading }) => {
  const [getFileDownloadUrl, { isFetching: isLoadingFileDownload }] = useLazyGetFileDownloadUrlQuery();

  const handleDownloadFile = async () => {
    if (!attachment.file_id || removeAttachment) return;
    try {
      const res = await getFileDownloadUrl({ file_upload_id: attachment.file_id }).unwrap();
      if (res?.download_url) {
        await downloadFile(res.download_url, attachment.file_name || 'download');
      }
    } catch {
      toast.error('Failed to download file');
    }
  };

  return (
    <div
      key={attachment.file_id || attachment.file_name}
      className={cn(
        'rounded-2.5 shadow-table-filter-menu group relative flex w-[148px] items-center gap-2 border border-gray-400 bg-white p-1 pr-3',
        { 'cursor-pointer': !removeAttachment },
      )}
      onClick={handleDownloadFile}
    >
      <div className='flex items-center gap-1'>
        {getFileIcon()}
        <span className='f-12-500 max-w-[104px] truncate'>{attachment.file_name}</span>
      </div>
      {attachment.file_id && removeAttachment && (
        <Button
          className='absolute size-4 rounded-full bg-white p-[1px] opacity-0 group-hover:opacity-100 [&_svg]:size-3.5'
          variant='ghost'
          size='icon'
          onClick={() => removeAttachment(attachment.file_id)}
          style={{
            top: '-8px',
            right: '-8px',
          }}
        >
          <CircleX className='size-3.5 text-gray-700' />
        </Button>
      )}
      {((isLoading && !attachment.file_id) || isLoadingFileDownload) && (
        <Button
          className='absolute size-4 rounded-full bg-white p-[1px] [&_svg]:size-3.5'
          variant='ghost'
          size='icon'
          style={{
            top: '-8px',
            right: '-8px',
          }}
        >
          <Loader size={14} className='animate-spin text-gray-900' />
        </Button>
      )}
    </div>
  );
};

export default Attachment;
