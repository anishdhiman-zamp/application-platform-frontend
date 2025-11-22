import React from 'react';

import { AttachmentsBlockType, AttachmentsList, useGetFilesByIdsQuery } from '../../..';

interface AttachmentsBlockProps {
  payload: AttachmentsBlockType['payload'];
}

export const AttachmentsBlock: React.FC<AttachmentsBlockProps> = ({ payload }) => {
  const { data } = useGetFilesByIdsQuery(
    {
      ids: payload.attachments.map((attachment) => attachment.file_id),
    },
    {
      skip: payload.attachments.every((attachment) => !!attachment.file_name),
    },
  );

  return (
    <AttachmentsList
      attachments={
        data?.file_uploads?.map((file) => ({
          file_id: file.file_upload_id,
          file_name: file.name,
          file_type: file.file_type,
        })) ??
        payload.attachments.map((attachment) => ({
          file_id: attachment.file_id,
          file_name: attachment.file_name || '',
        })) ??
        []
      }
    />
  );
};
