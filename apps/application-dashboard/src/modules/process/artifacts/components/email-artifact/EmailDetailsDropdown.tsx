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
        <div className='hover:bg-GRAY_50 flex cursor-pointer items-center justify-center rounded border-none px-1 py-1'>
          <SvgSpriteLoader id='chevron-down' size={14} color={COLORS.GRAY_700} />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent sideOffset={4} align='end' className='z-1001 w-[600px] px-3 py-2'>
        <div className='flex flex-col gap-y-1 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
          {emailArtifact?.from_mail_id && (
            <div className='flex min-w-fit items-center gap-2'>
              <p className='f-13-500 text-GRAY_600 w-[60px] flex-shrink-0'>from:</p>
              <div className='min-w-0 flex-1'>
                <p className='f-13-400 text-GRAY_1000 whitespace-nowrap'>
                  {emailArtifact?.from_name && <span className='f-13-600'>{emailArtifact.from_name}</span>}
                  <span className='f-13-500 text-GRAY_900'>{` <${emailArtifact.from_mail_id}>`}</span>
                </p>
              </div>
            </div>
          )}
          {emailArtifact?.to_mail_ids?.length > 0 && (
            <div className='flex min-w-fit items-center gap-2'>
              <p className='f-13-500 text-GRAY_600 w-[60px] flex-shrink-0'>to:</p>
              <span className='f-13-400 text-GRAY_1000 min-w-0 flex-1 whitespace-nowrap'>
                {emailArtifact.to_mail_ids?.join(', ')}
              </span>
            </div>
          )}
          {emailArtifact?.date && (
            <div className='flex min-w-fit items-center gap-2'>
              <p className='f-13-500 text-GRAY_600 w-[60px] flex-shrink-0'>date:</p>
              <span className='f-13-400 text-GRAY_1000 min-w-0 flex-1 whitespace-nowrap'>
                {getEmailDate(emailArtifact.date)}
              </span>
            </div>
          )}
          {emailArtifact?.heading && (
            <div className='flex min-w-fit items-center gap-2'>
              <p className='f-13-500 text-GRAY_600 w-[60px] flex-shrink-0'>subject:</p>
              <span className='f-13-400 text-GRAY_1000 min-w-0 flex-1 whitespace-nowrap'>{emailArtifact.heading}</span>
            </div>
          )}
          {emailArtifact?.bcc_mail_ids?.length > 0 && (
            <div className='flex min-w-fit items-center gap-2'>
              <p className='f-13-500 text-GRAY_600 w-[60px] flex-shrink-0'>bcc:</p>
              <span className='f-13-400 text-GRAY_1000 min-w-0 flex-1 whitespace-nowrap'>
                {emailArtifact.bcc_mail_ids?.join(', ')}
              </span>
            </div>
          )}
          {emailArtifact?.cc_mail_ids?.length > 0 && (
            <div className='flex min-w-fit items-center gap-2'>
              <p className='f-13-500 text-GRAY_600 w-[60px] flex-shrink-0'>cc:</p>
              <span className='f-13-400 text-GRAY_1000 min-w-0 flex-1 whitespace-nowrap'>
                {emailArtifact.cc_mail_ids?.join(', ')}
              </span>
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default EmailDetailsDropdown;
