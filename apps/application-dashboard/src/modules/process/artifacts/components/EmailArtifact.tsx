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
  const processId = searchParams?.get('processId');
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
    <div className='flex flex-col justify-start items-start h-[calc(100%-40px)] m-5 rounded-xl border-[0.5px] border-GRAY_500'>
      {/* Header */}
      <div className='flex justify-between items-start w-full py-3 px-4 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]'>
        <div className='flex justify-start items-start min-w-fit gap-3'>
          <div className='flex justify-center items-center w-6 h-6 rounded-full bg-BLUE_200 shrink-0'>
            {/* Avatar */}
            <span className='text-GRAY_1000 f-12-500 whitespace-nowrap capitalize'>
              {getFirstLetters(emailArtifact?.from_name ?? emailArtifact?.from_mail_id?.split('@')[0] ?? 'U', 1)}
            </span>
          </div>
          <div className='flex flex-col justify-between items-start gap-1 min-w-fit'>
            <div className='flex justify-start items-center gap-3'>
              {emailArtifact?.from_name && (
                <span className='f-13-600 text-GRAY_1000 whitespace-nowrap'>{emailArtifact?.from_name}</span>
              )}
              {emailArtifact?.from_mail_id && (
                <span className='f-13-400 text-GRAY_900 whitespace-nowrap'>{emailArtifact?.from_mail_id}</span>
              )}
            </div>
            <div className='flex justify-start items-center gap-1'>
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
          <div className='flex justify-end items-end min-w-fit ml-4 shrink-0'>
            <span className='f-13-400 text-GRAY_700'>{getEmailDate(emailArtifact?.date)}</span>
          </div>
        )}
      </div>

      {/* Body */}
      {emailArtifact?.body_html && (
        <div className='p-4 overflow-auto flex-1 w-full relative'>
          {loading && (
            <div className='absolute inset-0 flex justify-center items-center bg-white bg-opacity-80 z-10'>
              <span className='f-13-400 text-GRAY_700'>Loading...</span>
            </div>
          )}
          <iframe
            srcDoc={emailArtifact?.body_html}
            title='Email content'
            className='w-full h-full border-none'
            onLoad={() => setLoading(false)}
            loading='eager'
          />
        </div>
      )}

      {emailArtifact?.body_plain_text && (
        <div className='p-4 overflow-auto flex-1 w-full relative'>
          <span className='f-13-400 text-GRAY_900'>{emailArtifact?.body_plain_text}</span>
        </div>
      )}

      {/* Attachments bar */}
      <div className='flex justify-start items-center gap-2 w-full overflow-hidden border-t-[0.5px] border-GRAY_500'>
        <div className='flex justify-start items-center gap-2 py-4 pl-4 shrink-0'>
          <SvgSpriteLoader id='attachment-01' size={16} color={COLORS.GRAY_900} />
          <span className='f-13-400 text-GRAY_900'>{emailArtifact?.attachments?.length ?? 0} Attachments:</span>
        </div>

        {!!emailArtifact?.attachments?.length && (
          <div className='w-0 overflow-x-auto flex flex-1 justify-start items-center gap-2 py-4 pr-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]'>
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
