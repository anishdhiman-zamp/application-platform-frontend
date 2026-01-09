import { Button } from '@zamp-platform/ui';
import { ZAMP_ICON } from 'constants/icons';
import Image from 'next/image';
import { defaultFnType } from 'types/commonTypes';

type MembershipRequestedProps = {
  text: string;
  subText: string;
  userEmail?: string;
  actionItems: {
    text: string;
    onClick: defaultFnType;
  }[];
};

export const MembershipRequested = (props: MembershipRequestedProps) => {
  const { text, subText, userEmail, actionItems } = props;

  return (
    <div className='mx-auto flex h-screen w-screen max-w-[600px] flex-col items-center justify-center bg-white text-center'>
      <div>
        <Image
          width={60}
          height={60}
          alt='zamp logo'
          className='w-8 cursor-pointer align-middle'
          src={ZAMP_ICON}
          priority={true}
        />
      </div>
      <div className='flex flex-col items-center justify-center'>
        <span className='f-16-600 mt-4'>{text}</span>
        <span className='f-13-400 text-GRAY_600 mt-6'>{subText}</span>
        {userEmail && (
          <>
            <span className='f-13-400 text-GRAY_600 mt-6'>You are logged in as</span>
            <span className='f-13-600 text-GRAY_950 mt-1'>{userEmail}</span>
          </>
        )}
      </div>
      <div className='mt-6 flex gap-2.5'>
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
  );
};
