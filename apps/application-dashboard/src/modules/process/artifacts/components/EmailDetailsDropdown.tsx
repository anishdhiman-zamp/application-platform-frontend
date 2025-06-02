import { type FC } from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@zamp-platform/ui';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { COLORS } from '@/constants/colors';
import { getEmailDate } from '@/modules/process/process.utils';
import type { EmailArtifactsResponseType } from '@/types/api/processApi.types';

interface EmailDetailsDropdownProps {
  emailArtifact: EmailArtifactsResponseType;
}

const EmailDetailsDropdown: FC<EmailDetailsDropdownProps> = ({ emailArtifact }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className='rounded flex items-center justify-center px-1 py-1 border-none cursor-pointer hover:bg-GRAY_50'>
          <SvgSpriteLoader id='chevron-down' size={14} color={COLORS.GRAY_700} />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        sideOffset={2}
        align='start'
        className='z-1001 min-w-[400px] py-2 px-3 flex flex-col gap-y-1'
      >
        {emailArtifact?.from_mail_id && (
          <div className='flex items-start gap-2'>
            <p className='f-13-500 text-GRAY_600 w-[60px]'>from:</p>
            <p className='f-13-400 text-GRAY_1000'>
              {emailArtifact?.from_name && <span className='f-13-600'>{emailArtifact?.from_name}</span>}
              <span className='f-13-500 text-GRAY_900'>{` <${emailArtifact?.from_mail_id}>`}</span>
            </p>
          </div>
        )}
        {emailArtifact?.to_mail_ids?.length > 0 && (
          <div className='flex items-start gap-2'>
            <p className='f-13-500 text-GRAY_600 w-[60px]'>to:</p>
            <div className='flex flex-wrap gap-1'>
              {emailArtifact?.to_mail_ids?.map((email) => (
                <span key={email} className='f-13-400 text-GRAY_1000'>
                  {email}
                </span>
              ))}
            </div>
          </div>
        )}
        {emailArtifact?.date && (
          <div className='flex items-start gap-2'>
            <p className='f-13-500 text-GRAY_600 w-[60px]'>date:</p>
            <p className='f-13-400 text-GRAY_1000'>{getEmailDate(emailArtifact?.date)}</p>
          </div>
        )}
        {emailArtifact?.heading && (
          <div className='flex items-start gap-2'>
            <p className='f-13-500 text-GRAY_600 w-[60px]'>subject:</p>
            <p className='f-13-400 text-GRAY_1000'>{emailArtifact?.heading}</p>
          </div>
        )}
        {emailArtifact?.bcc_mail_ids?.length > 0 && (
          <div className='flex items-start gap-2'>
            <p className='f-13-500 text-GRAY_600 w-[60px]'>bcc:</p>
            <div className='flex flex-wrap gap-1'>
              {emailArtifact?.bcc_mail_ids?.map((email) => (
                <span key={email} className='f-13-400 text-GRAY_1000'>
                  {email}
                </span>
              ))}
            </div>
          </div>
        )}
        {emailArtifact?.cc_mail_ids?.length > 0 && (
          <div className='flex items-start gap-2'>
            <p className='f-13-500 text-GRAY_600 w-[60px]'>cc:</p>
            <div className='flex flex-wrap gap-1'>
              {emailArtifact?.cc_mail_ids?.map((email) => (
                <span key={email} className='f-13-400 text-GRAY_1000'>
                  {email}
                </span>
              ))}
            </div>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default EmailDetailsDropdown;
