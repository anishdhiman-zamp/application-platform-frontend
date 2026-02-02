import { cn } from '@zamp-platform/ui/utils';
import { FC } from 'react';

import { UploadedFileType } from '../../types/block.types';
import Attachment from './Attachment';

interface AttachmentsListProps {
  attachments: UploadedFileType[];
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
            <Attachment
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
