import React, { FC } from 'react';

import { UploadedFileType } from '../../types/block.types';
import Attachment from './Attachment';

interface AttachmentsListProps {
  attachments: UploadedFileType[];
  removeAttachment?: (fileId: string) => void;
  isLoading?: boolean;
}

export const AttachmentsList: FC<AttachmentsListProps> = ({ attachments, removeAttachment, isLoading }) => {
  return (
    <>
      {attachments.length > 0 && (
        <div className='mb-2 flex flex-wrap gap-2 pt-1.5 [&::-webkit-scrollbar]:hidden'>
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
