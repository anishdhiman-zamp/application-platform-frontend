import { useState } from 'react';
import { Button } from '@zamp-platform/ui';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { useLazyGetSignedUrlByArtifactIdQuery } from '@/apis/processes';
import { toast } from '@/components/common/toast/Toast';
import { COLORS } from '@/constants/colors';
import { EmailAttachmentType } from '@/types/api/processApi.types';

const Attachments = ({
  attachments,
  processId,
  artifactId,
}: {
  attachments: EmailAttachmentType[];
  processId: string;
  artifactId: string;
}) => {
  const [attachmentsCopy, setAttachmentsCopy] = useState<EmailAttachmentType[]>(attachments);
  const [getSignedUrlByArtifactId] = useLazyGetSignedUrlByArtifactIdQuery();
  const handleAttachmentDownload = (fileId: string) => {
    if (!processId || !fileId) return;

    getSignedUrlByArtifactId({
      processId: processId as string,
      artifactId,
      fileId,
    })
      .unwrap()
      .then((res) => {
        window.open(res?.signed_url as string, '_blank');
      })
      .catch((err) => {
        toast.error(err?.data?.message);
      });
  };

  const handleDeleteAttachment = (fileId: string) => {
    setAttachmentsCopy(attachmentsCopy.filter((attachment) => attachment.file_id !== fileId));
  };

  return (
    <div className='flex flex-col gap-1.5'>
      {attachmentsCopy?.map((attachment, index) => (
        <div
          key={`${attachment.file_id}-${index}`}
          className='flex h-6 w-3/4 max-w-[570px] items-center justify-between rounded bg-gray-100 px-1.5'
        >
          <div className='flex items-center gap-1.5'>
            <SvgSpriteLoader id='file-02' color={COLORS.GRAY_900} size={12} />

            <Button variant='ghost' size='xxsmall' onClick={() => handleAttachmentDownload(attachment.file_id)}>
              {attachment.file_display_name}
            </Button>
          </div>
          <Button
            variant='ghost'
            size='xxsmall'
            className='h-3 w-3 p-0 [&_svg]:size-3'
            onClick={() => handleDeleteAttachment(attachment.file_id)}
          >
            <SvgSpriteLoader id='x-close' color={COLORS.GRAY_900} size={12} />
          </Button>
        </div>
      ))}
      <div className='h-12' /> {/* space for the footer */}
    </div>
  );
};

export default Attachments;
