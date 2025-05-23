import { type FC, useMemo } from 'react';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import DOMPurify from 'dompurify';
import ArtifactTag from 'modules/process/common/ArtifactTag';
import { ARTIFACT_TYPE } from 'modules/process/process.types';
import { COLORS } from '@/constants/colors';
import { MOCK_EMAIL_ARTIFACT } from '@/modules/process/mock.data';
import type { EmailArtifactsResponseType } from '@/types/api/processApi.types';

interface EmailArtifactProps {
  emailArtifact: EmailArtifactsResponseType;
}

const EmailArtifact: FC<EmailArtifactProps> = ({ emailArtifact }) => {
  // TODO: Remove this once we have the actual email artifact
  console.log(emailArtifact);
  const html = MOCK_EMAIL_ARTIFACT;

  // TODO: Remove this once we have the actual email artifact
  const sanitizedHtml = useMemo(() => {
    return DOMPurify.sanitize(html);
  }, [html]);

  return (
    <div className='flex flex-col justify-start items-start h-[calc(100%-40px)] m-5 rounded-xl border-[0.5px] border-GRAY_500'>
      {/* Header */}
      <div className='flex justify-between items-start w-full py-3 px-4 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]'>
        <div className='flex justify-start items-center min-w-fit gap-3'>
          <div className='flex justify-center items-center w-6 h-6 rounded-full bg-BLUE_200 shrink-0'>
            <span className='text-GRAY_1000 f-12-500 whitespace-nowrap'>A</span>
          </div>
          <div className='flex flex-col justify-between items-start gap-1 min-w-fit'>
            <div className='flex justify-start items-center gap-3'>
              <span className='f-13-600 text-GRAY_1000 whitespace-nowrap'>Aashita Goel</span>
              <span className='f-13-400 text-GRAY_900 whitespace-nowrap'>aashita.goel@gmail.com</span>
            </div>
            <div className='flex justify-start items-center gap-1'>
              <p className='f-13-400 text-GRAY_900 whitespace-nowrap'>to engineering</p>
              <SvgSpriteLoader id='chevron-down' size={14} color={COLORS.GRAY_700} />
            </div>
          </div>
        </div>
        <div className='flex justify-end items-end min-w-fit ml-4 shrink-0'>
          <span className='f-13-400 text-GRAY_700'>Feb 4, 2025</span>
        </div>
      </div>

      {/* Body */}
      <div className='p-4 overflow-auto flex-1 w-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]'>
        <div className='text-GRAY_900 f-13-400' dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
      </div>

      {/* Attachments bar */}
      <div className='flex justify-start items-center gap-2 w-full overflow-hidden border-t-[0.5px] border-GRAY_500'>
        <div className='flex justify-start items-center gap-2 py-4 pl-4 shrink-0'>
          <SvgSpriteLoader id='attachment-01' size={16} color={COLORS.GRAY_900} />
          <span className='f-13-400 text-GRAY_900'>6 Attachments:</span>
        </div>

        <div className='w-0 overflow-x-auto flex flex-1 justify-start items-center gap-2 py-4 pr-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]'>
          <ArtifactTag type={ARTIFACT_TYPE.PDF_DATASET} displayName='PDF Dataset' onClick={() => {}} />
          <ArtifactTag type={ARTIFACT_TYPE.PDF_DATASET} displayName='PDF Dataset' onClick={() => {}} />
          <ArtifactTag type={ARTIFACT_TYPE.PDF_DATASET} displayName='PDF Dataset' onClick={() => {}} />
          <ArtifactTag type={ARTIFACT_TYPE.PDF_DATASET} displayName='PDF Dataset' onClick={() => {}} />
          <ArtifactTag type={ARTIFACT_TYPE.PDF_DATASET} displayName='PDF Dataset' onClick={() => {}} />
          <ArtifactTag type={ARTIFACT_TYPE.PDF_DATASET} displayName='PDF Dataset' onClick={() => {}} />
          <ArtifactTag type={ARTIFACT_TYPE.PDF_DATASET} displayName='PDF Dataset' onClick={() => {}} />
          <ArtifactTag type={ARTIFACT_TYPE.PDF_DATASET} displayName='PDF Dataset' onClick={() => {}} />
          <ArtifactTag type={ARTIFACT_TYPE.PDF_DATASET} displayName='PDF Dataset' onClick={() => {}} />
          <ArtifactTag type={ARTIFACT_TYPE.PDF_DATASET} displayName='PDF Dataset' onClick={() => {}} />
          <ArtifactTag type={ARTIFACT_TYPE.PDF_DATASET} displayName='PDF Dataset' onClick={() => {}} />
        </div>
      </div>
    </div>
  );
};

export default EmailArtifact;
