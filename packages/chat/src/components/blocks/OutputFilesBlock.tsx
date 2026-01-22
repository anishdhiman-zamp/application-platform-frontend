import { Button } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { FileText, Loader } from 'lucide-react';
import React from 'react';

import { useLazyGetOutputFileDownloadQuery } from '../../api';
import { OutputFilesBlockType } from '../../types/block.types';
import { downloadFile } from '../block.utils';

interface OutputFilesBlockProps {
  payload: OutputFilesBlockType['payload'];
  conversationId?: string;
}

export const OutputFilesBlock: React.FC<OutputFilesBlockProps> = ({ payload, conversationId }) => {
  const [getOutputFileDownload, { isFetching, originalArgs }] = useLazyGetOutputFileDownloadQuery();

  const handleDownloadFile = async (filename: string) => {
    if (!conversationId) return;

    try {
      const res = await getOutputFileDownload({
        conversationId,
        filename,
      }).unwrap();

      if (res?.download_url) {
        await downloadFile(res.download_url, filename);
      }
    } catch (error) {
      console.error('Failed to fetch download URL:', error);
    }
  };

  if (!payload.output_files?.length) {
    return null;
  }

  return (
    <div className='mb-2 flex flex-wrap gap-2 pt-1.5 [&::-webkit-scrollbar]:hidden'>
      {payload.output_files.map((file) => {
        const isDownloading = isFetching && originalArgs?.filename === file?.filename;

        return (
          <div
            key={file?.filename}
            className={cn(
              'rounded-2.5 shadow-table-filter-menu group relative flex w-[148px] items-center gap-2 border border-gray-400 bg-white p-1 pr-3',
              'cursor-pointer',
            )}
            onClick={() => handleDownloadFile(file?.filename)}
          >
            <div className='flex items-center gap-1'>
              <div className='flex h-5 w-6 items-center justify-center rounded-md bg-gray-100 [&_svg]:size-3.5'>
                <FileText />
              </div>
              <span className='f-12-500 max-w-[104px] truncate'>{file?.filename}</span>
            </div>
            {isDownloading && (
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
      })}
    </div>
  );
};
