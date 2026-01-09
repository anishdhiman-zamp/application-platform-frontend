import React from 'react';
import { Button } from '@zamp-platform/ui';

const ChooseRoleMembers = () => {
  return (
    <div className='relative flex w-fit flex-col'>
      <Button variant='outline' testId='send-user-invite-btn' size='small' className='!bg-GRAY_100'>
        Share
      </Button>
      <div className='relative z-1000'>
        <div className='absolute right-0 bottom-0 flex h-40 w-[20rem] bg-red-400'>this is the dropdown</div>
      </div>
    </div>
  );
};

export default ChooseRoleMembers;
