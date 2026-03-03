import { cn } from '@zamp-platform/ui/utils';
import React, { FC } from 'react';

import AttachmentItem from './AttachmentItem';

interface UploadedFile {
  file_id: string;
  file_name: string;
  file_type?: string;
  file?: File;
}

interface AttachmentsListProps {
  attachments: UploadedFile[];
  removeAttachment?: (fileId: string) => void;
  isLoading?: boolean;
  className?: string;
}

export const AttachmentsList: FC<AttachmentsListProps> = ({ attachments, removeAttachment, isLoading, className }) => {
  return (
    <>
      {attachments.length > 0 && (
        <div className={cn('flex flex-wrap gap-2 pt-1.5', className)}>
          {[...attachments].reverse().map((attachment) => (
            <AttachmentItem
              key={attachment.file_id || attachment.file_name}
              attachment={attachment}
              removeAttachment={removeAttachment}
              isLoading={isLoading}
            />
          ))}
        </div>
      )}
    </>
  );
};
