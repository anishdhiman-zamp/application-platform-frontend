import { FileIcon, Skeleton } from '@zamp-platform/ui';
import { Play } from 'lucide-react';
import React from 'react';

import { FILE_PREVIEW_CATEGORY, type FilePreviewCategory } from '../../utils/filePreviewCategory';

interface PreviewContentProps {
  category: FilePreviewCategory;
  previewUrl: string | null;
  codeNodes: React.ReactNode | null;
  isLoading: boolean;
  fileName: string;
}

const PreviewContent = ({ category, previewUrl, codeNodes, isLoading, fileName }: PreviewContentProps) => {
  if (isLoading) {
    return <Skeleton className='size-full rounded-none' />;
  }

  if (category === FILE_PREVIEW_CATEGORY.IMAGE && previewUrl) {
    return <img src={previewUrl} alt={fileName} className='size-full object-cover' draggable={false} />;
  }

  if (category === FILE_PREVIEW_CATEGORY.VIDEO && previewUrl) {
    return (
      <div className='relative size-full'>
        <img src={previewUrl} alt={fileName} className='size-full object-cover' draggable={false} />
        <div className='absolute inset-0 flex items-center justify-center'>
          <div className='bg-GRAY_1000/50 flex size-6 items-center justify-center rounded-full'>
            <Play className='fill-BG_WHITE text-BG_WHITE size-3' />
          </div>
        </div>
      </div>
    );
  }

  if (category === FILE_PREVIEW_CATEGORY.PDF && previewUrl) {
    return <img src={previewUrl} alt={fileName} className='size-full object-cover object-top' draggable={false} />;
  }

  if (category === FILE_PREVIEW_CATEGORY.CODE && codeNodes) {
    return (
      <div className='relative size-full'>
        <pre className='hljs size-full overflow-hidden p-2 font-mono text-[10px] leading-[1.4]'>
          <code>{codeNodes}</code>
        </pre>
      </div>
    );
  }

  return (
    <div className='bg-GRAY_50 flex size-full items-center justify-center'>
      <FileIcon extension={fileName || 'txt'} className='size-10 rounded-lg' iconClassName='size-6' />
    </div>
  );
};

PreviewContent.displayName = 'PreviewContent';

export default PreviewContent;
