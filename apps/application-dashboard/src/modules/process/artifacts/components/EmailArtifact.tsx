import { type FC, useState } from 'react';
import { toast } from '@zamp-platform/ui';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import EmailDetailsDropdown from 'modules/process/artifacts/components/EmailDetailsDropdown';
import ArtifactTag from 'modules/process/common/ArtifactTag';
import { ARTIFACT_TYPE } from 'modules/process/process.types';
import { getEmailDate } from 'modules/process/process.utils';
import { useSearchParams } from 'next/navigation';
import { useLazyGetSignedUrlByArtifactIdQuery } from '@/apis/processes';
import { COLORS } from '@/constants/colors';
import type { EmailArtifactsResponseType } from '@/types/api/processApi.types';
import { getFirstLetters } from '@/utils/common';

interface EmailArtifactProps {
  emailArtifact: EmailArtifactsResponseType;
  artifactId: string;
}

const EmailArtifact: FC<EmailArtifactProps> = ({ emailArtifact, artifactId }) => {
  const searchParams = useSearchParams();
  const processId = searchParams?.get('processId') as string;

  const [loading, setLoading] = useState(true);

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

  return (
    <div className='border-GRAY_500 m-5 flex h-[calc(100%-40px)] flex-col items-start justify-start rounded-xl border-[0.5px]'>
      {/* Header */}
      <div className='flex w-full items-start justify-between overflow-x-auto px-4 py-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
        <div className='flex min-w-fit items-start justify-start gap-3'>
          <div className='bg-BLUE_200 flex h-6 w-6 shrink-0 items-center justify-center rounded-full'>
            {/* Avatar */}
            <span className='text-GRAY_1000 f-12-500 whitespace-nowrap capitalize'>
              {getFirstLetters(emailArtifact?.from_name ?? emailArtifact?.from_mail_id?.split('@')[0] ?? 'U', 1)}
            </span>
          </div>
          <div className='flex min-w-fit flex-col items-start justify-between gap-1'>
            <div className='flex items-center justify-start gap-3'>
              {emailArtifact?.from_name && (
                <span className='f-13-600 text-GRAY_1000 whitespace-nowrap'>{emailArtifact?.from_name}</span>
              )}
              {emailArtifact?.from_mail_id && (
                <span className='f-13-400 text-GRAY_900 whitespace-nowrap'>{emailArtifact?.from_mail_id}</span>
              )}
            </div>
            <div className='flex items-center justify-start gap-1'>
              {!!emailArtifact?.to_mail_ids?.length && (
                <p className='f-13-400 text-GRAY_900 whitespace-nowrap'>
                  to {emailArtifact?.to_mail_ids.map((email) => email.split('@')[0]).join(', ')}
                </p>
              )}
              <EmailDetailsDropdown emailArtifact={emailArtifact} />
            </div>
          </div>
        </div>
        {emailArtifact?.date && (
          <div className='ml-4 flex min-w-fit shrink-0 items-end justify-end'>
            <span className='f-13-400 text-GRAY_700'>{getEmailDate(emailArtifact?.date)}</span>
          </div>
        )}
      </div>

      {/* Body */}
      {emailArtifact?.body_html && (
        <div className='relative w-full flex-1 overflow-auto p-4'>
          {loading && (
            <div className='absolute inset-0 z-10 flex items-center justify-center bg-white bg-opacity-80'>
              <span className='f-13-400 text-GRAY_700'>Loading...</span>
            </div>
          )}
          <iframe
            srcDoc={emailArtifact?.body_html}
            title='Email content'
            className='h-full w-full border-none'
            onLoad={() => setLoading(false)}
            loading='eager'
          />
        </div>
      )}

      {emailArtifact?.body_plain_text && (
        <div className='relative w-full flex-1 overflow-auto p-4'>
          <span className='f-13-400 text-GRAY_900'>{emailArtifact?.body_plain_text}</span>
        </div>
      )}

      {/* Attachments bar */}
      <div className='border-GRAY_500 flex w-full items-center justify-start gap-2 overflow-hidden border-t-[0.5px]'>
        <div className='flex shrink-0 items-center justify-start gap-2 py-4 pl-4'>
          <SvgSpriteLoader id='attachment-01' size={16} color={COLORS.GRAY_900} />
          <span className='f-13-400 text-GRAY_900'>{emailArtifact?.attachments?.length ?? 0} Attachments:</span>
        </div>

        {!!emailArtifact?.attachments?.length && (
          <div className='flex w-0 flex-1 items-center justify-start gap-2 overflow-x-auto py-4 pr-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
            {emailArtifact?.attachments.map((attachment) => (
              <ArtifactTag
                key={attachment?.file_id}
                type={ARTIFACT_TYPE.PDF_DATASET}
                displayName={attachment?.file_display_name}
                onClick={() => handleAttachmentDownload(attachment?.file_id)}
                displayClassName='max-w-40'
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailArtifact;
