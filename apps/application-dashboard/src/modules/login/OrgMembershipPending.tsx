'use client';

import { useSelector } from 'react-redux';
import { useGetOrganizationMembershipRequestsAllQuery } from 'apis/people';
import { ZAMP_BLACK_ICON } from 'constants/icons';
import { useLogout } from 'hooks/useLogout';
import Image from 'next/image';
import { RootState } from 'store';
import { MembershipRequested } from 'components/MembershipRequested';

const OrgMembershipPending = ({ email }: { email?: string }) => {
  const reduxEmail = useSelector((state: RootState) => state?.user?.user)?.user_email;
  const userEmail = reduxEmail || email;
  const { logout } = useLogout();
  const { data: membershipRequests, isLoading: isLoadingMembershipRequests } =
    useGetOrganizationMembershipRequestsAllQuery();

  const logoutButton = {
    text: 'Logout',
    onClick: logout,
  };

  if (isLoadingMembershipRequests) {
    return (
      <div className='flex h-screen w-screen flex-col items-center justify-center bg-white'>
        <Image
          width={60}
          height={60}
          alt='zamp logo'
          className='w-8 cursor-pointer align-middle'
          src={ZAMP_BLACK_ICON}
          priority={true}
        />
      </div>
    );
  }

  if (membershipRequests && membershipRequests?.length > 0) {
    return (
      <MembershipRequested
        text='Your account is pending approval'
        body={[
          'We have notified the organization admin. You will receive an email when your membership request is approved.',
        ]}
        userEmail={userEmail || ''}
        actionItems={[logoutButton]}
      />
    );
  }

  return (
    <MembershipRequested
      text='Thank you for taking an interest in Zamp!'
      body={[
        "We're crafting AI employees that actually fit into how your team works. They learn, adapt, and take ownership of the work you'd rather not do yourself.",
        "To make sure each onboarding feels considered rather than rushed, we're letting people in gradually. We'll reach out as soon as we're ready.",
      ]}
      userEmail={userEmail || ''}
      actionItems={[logoutButton]}
    />
  );
};

export default OrgMembershipPending;
