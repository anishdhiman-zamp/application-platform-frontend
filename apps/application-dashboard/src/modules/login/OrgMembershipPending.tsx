'use client';

import { useSelector } from 'react-redux';
import { useGetOrganizationMembershipRequestsAllQuery } from 'apis/people';
import { useLogout } from 'hooks/useLogout';
import { RootState } from 'store';
import { MembershipRequested } from 'components/MembershipRequested';

const OrgMembershipPending = ({ email }: { email: string }) => {
  const userEmail = useSelector((state: RootState) => state?.user?.user)?.user_email || email;
  const { logout, isLoggingOut } = useLogout();
  const { data: membershipRequests } = useGetOrganizationMembershipRequestsAllQuery();

  const logoutButton = {
    text: 'Logout',
    onClick: logout,
    loading: isLoggingOut,
  };

  const hasMembershipRequests = membershipRequests && membershipRequests.length > 0;

  return (
    <MembershipRequested
      text={hasMembershipRequests ? 'Your account is pending approval' : 'Thank you for your interest in Zamp'}
      subText={
        hasMembershipRequests
          ? 'We have notified the organization admin. You will receive an email when your membership request is approved.'
          : 'We have received your signup request and our team will review it shortly.'
      }
      userEmail={userEmail || ''}
      actionItems={[logoutButton]}
    />
  );
};

export default OrgMembershipPending;
