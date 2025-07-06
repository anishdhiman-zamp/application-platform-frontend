import { type FC, useState } from 'react';
import { toast } from '@zamp-platform/ui';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import EmailDetailsDropdown from 'modules/process/artifacts/components/email-artifact/EmailDetailsDropdown';
import ArtifactTag from 'modules/process/common/ArtifactTag';
import { ARTIFACT_TYPE } from 'modules/process/process.types';
import { getEmailDate } from 'modules/process/process.utils';
import { useParams } from 'next/navigation';
import { useLazyGetSignedUrlByArtifactIdQuery } from '@/apis/processes';
import { COLORS } from '@/constants/colors';
import type { EmailArtifactsResponseType } from '@/types/api/processApi.types';
import { formatPlural, getFirstLetters } from '@/utils/common';

interface EmailArtifactProps {
  emailArtifact: EmailArtifactsResponseType;
  artifactId: string;
}

const EmailArtifact: FC<EmailArtifactProps> = ({ emailArtifact, artifactId }) => {
  const params = useParams();
  const processId = params?.processId as string;

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

  const handleIframeLoad = (e: React.SyntheticEvent<HTMLIFrameElement>) => {
    setLoading(false);
    const iframe = e.currentTarget;
    const doc = iframe.contentDocument;

    if (!doc) return;

    const style = doc.createElement('style');

    style.innerHTML = `
    body {
      font-family: 'Inter', sans-serif !important;
      font-size: 14px;
      color: #333;
    }
    * {
      font-family: inherit !important;
    }
  `;
    doc.head.appendChild(style);
  };

  return (
    <div className='bg-BG_GRAY_2 h-full w-full p-5'>
      <div className='border-GRAY_500 flex h-full flex-col items-start justify-start rounded-xl border-[0.5px] bg-white'>
        {/* Header */}
        <div className='flex w-full items-start justify-between px-4 py-3'>
          <div className='flex w-0 flex-1 items-start justify-start gap-3'>
            <div className='bg-BLUE_200 flex h-6 w-6 shrink-0 items-center justify-center rounded-full'>
              {/* Avatar */}
              <span className='text-GRAY_1000 f-12-500 capitalize'>
                {getFirstLetters(emailArtifact?.from_name ?? emailArtifact?.from_mail_id?.split('@')[0] ?? 'U', 1)}
              </span>
            </div>
            <div className='flex w-0 min-w-0 flex-1 flex-col items-start justify-between gap-1'>
              <div className='flex w-full min-w-0 items-center justify-start gap-3'>
                {emailArtifact?.from_name && (
                  <span title={emailArtifact?.from_name} className='f-13-600 text-GRAY_1000 min-w-0 truncate'>
                    {emailArtifact?.from_name}
                  </span>
                )}
                {emailArtifact?.from_mail_id && (
                  <span title={emailArtifact?.from_mail_id} className='f-13-400 text-GRAY_900 min-w-0 truncate'>
                    {emailArtifact?.from_mail_id}
                  </span>
                )}
              </div>
              <div className='flex w-full min-w-0 items-center justify-start gap-1'>
                {!!emailArtifact?.to_mail_ids?.length && (
                  <p className='f-13-400 text-GRAY_900 min-w-0 truncate'>
                    to {emailArtifact?.to_mail_ids.map((email) => email.split('@')[0]).join(', ')}
                  </p>
                )}
                <EmailDetailsDropdown emailArtifact={emailArtifact} />
              </div>
            </div>
          </div>
          {emailArtifact?.date && (
            <div className='ml-4 flex min-w-max shrink-0 items-end justify-end'>
              <span className='f-13-400 text-GRAY_700'>{getEmailDate(emailArtifact?.date)}</span>
            </div>
          )}
        </div>

        {/* Body */}
        {emailArtifact?.body_html ? (
          <div className='relative w-full flex-1 overflow-hidden p-4'>
            {loading && (
              <div className='bg-opacity-80 absolute inset-0 z-10 flex items-center justify-center bg-white'>
                <span className='f-13-400 text-GRAY_700'>Loading...</span>
              </div>
            )}
            <iframe
              srcDoc={emailArtifact?.body_html}
              title='Email content'
              className='h-full w-full overflow-auto border-none'
              onLoad={handleIframeLoad}
              loading='eager'
            />
          </div>
        ) : emailArtifact?.body_plain_text ? (
          <div className='relative w-full flex-1 overflow-auto p-4'>
            <span className='f-13-400 text-GRAY_900'>{emailArtifact?.body_plain_text}</span>
          </div>
        ) : null}

        {/* Attachments bar */}
        {!!emailArtifact?.attachments?.length && (
          <div className='border-GRAY_500 flex w-full items-center justify-start gap-2 overflow-hidden border-t-[0.5px]'>
            <div className='flex shrink-0 items-center justify-start gap-2 py-4 pl-4'>
              <SvgSpriteLoader id='attachment-01' size={16} color={COLORS.GRAY_900} />
              <span className='f-13-400 text-GRAY_900'>
                {formatPlural(emailArtifact?.attachments?.length ?? 0, 'Attachment')}
              </span>
            </div>

            <div className='flex w-0 flex-1 items-center justify-start gap-2 overflow-x-auto py-4 pr-2 [&::-webkit-scrollbar]:hidden'>
              {emailArtifact?.attachments.map((attachment) => (
                <ArtifactTag
                  key={attachment?.file_id}
                  artifactType={ARTIFACT_TYPE.PDF_DATASET}
                  displayName={attachment?.file_display_name}
                  onClick={() => handleAttachmentDownload(attachment?.file_id)}
                  displayClassName='max-w-40'
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailArtifact;
