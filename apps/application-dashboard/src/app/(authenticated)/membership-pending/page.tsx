import { Suspense } from 'react';
import OrgMembershipPending from 'modules/login/OrgMembershipPending';
import { HandleInvitations } from '@/modules/invitations';

const MembershipPendingPage = () => {
  return (
    <div className='fixed inset-0 z-[10000] h-screen w-screen bg-white'>
      <HandleInvitations />
      <Suspense>
        <OrgMembershipPending />
      </Suspense>
    </div>
  );
};

export default MembershipPendingPage;
