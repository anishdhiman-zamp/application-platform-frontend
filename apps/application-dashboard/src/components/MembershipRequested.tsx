import { Button } from '@zamp-platform/ui';
import { WAITLIST_PAGE_EMPTY_STATE, ZAMP_BLACK_ICON } from 'constants/icons';
import Image from 'next/image';
import { defaultFnType } from 'types/commonTypes';
import ImageKitImage from '@/components/ImageKitImage';

interface MembershipRequestedProps {
  text: string;
  body: string[];
  userEmail?: string;
  actionItems: {
    text: string;
    onClick: defaultFnType;
  }[];
}

export const MembershipRequested = ({ text, body, userEmail, actionItems }: MembershipRequestedProps) => (
  <div className='flex h-screen w-screen justify-center overflow-y-auto bg-white'>
    <div className='flex w-full max-w-[760px] flex-col px-10 py-16'>
      <Image
        width={32}
        height={32}
        alt='zamp logo'
        className='w-8 align-middle'
        src={ZAMP_BLACK_ICON}
        priority={true}
      />

      <h1 className='f-22-600 text-GRAY_1000 mt-10'>{text}</h1>

      <div className='bg-GRAY_200 mt-10 flex h-[180px] w-full items-center justify-center overflow-hidden rounded-md'>
        <ImageKitImage
          src={WAITLIST_PAGE_EMPTY_STATE}
          alt=''
          width={680}
          height={180}
          className='h-full w-full object-contain object-center'
        />
      </div>

      <div className='mt-10 flex flex-col gap-6'>
        {body.map((paragraph) => (
          <p key={paragraph} className='f-13-400 text-GRAY_900 leading-5'>
            {paragraph}
          </p>
        ))}
      </div>

      {userEmail && (
        <div className='mt-12 flex flex-col items-center'>
          <span className='f-13-400 text-GRAY_600'>You are logged in as</span>
          <span className='f-13-600 text-GRAY_950 mt-1'>{userEmail}</span>
        </div>
      )}

      <div className='mt-6 flex justify-center gap-2.5'>
        {actionItems.map((actionItem) => (
          <Button
            key={actionItem.text}
            variant='outline'
            testId='send-user-invite-btn'
            size='small'
            onClick={actionItem.onClick}
          >
            {actionItem.text}
          </Button>
        ))}
      </div>
    </div>
  </div>
);
