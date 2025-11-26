import React, { FC, useMemo } from 'react';
import { useGetAudiencesByOrganisationIdQuery, useGetPolicyResultApprovalsQuery } from 'apis/people';
import { useAppSelector } from 'hooks/toolkit';
import InvitationApprovalActions from 'modules/team/components/members/InvitationApprovalActions';
import { RootState } from 'store';
import { Approval, ApprovalStatus, PolicyResultStatus } from '@/types/api/policies.types';
import { getUserDisplayName } from '@/utils/common';

type InvitationApprovalStatusProps = {
  status?: PolicyResultStatus;
  policyResultId?: string;
};

type ApprovalStatusTextProps = {
  message: React.ReactNode;
};

const ApprovalStatusText: FC<ApprovalStatusTextProps> = ({ message }) => {
  return (
    <div className='flex items-center'>
      <span className='f-12-400 text-GRAY_1000'>{message}</span>
    </div>
  );
};

const InvitationApprovalStatus: FC<InvitationApprovalStatusProps> = ({ status, policyResultId }) => {
  const user = useAppSelector((state: RootState) => state?.user?.user ?? null);

  const { data: policyApprovals, isLoading: isLoadingApprovals } = useGetPolicyResultApprovalsQuery(
    { policyResultId: policyResultId || '' },
    { skip: !policyResultId },
  );

  const { data: organizationMembers } = useGetAudiencesByOrganisationIdQuery(
    { organizationId: user?.orgs?.[0]?.organization_id ?? '' },
    { skip: !user?.orgs?.[0]?.organization_id },
  );

  // check if the current user is pending on the policy result
  const isPendingOnCurrentUser = useMemo(() => {
    if (!policyApprovals?.data || !organizationMembers) return false;

    return (
      policyApprovals?.data?.some((approval: Approval) => {
        return approval?.status === ApprovalStatus.PENDING && approval?.approver_id === user?.user_id;
      }) || false
    );
  }, [policyApprovals, organizationMembers, user?.user_id]);

  // convert the pending approvals list to the list of approver emails
  const pendingApprovers = useMemo(() => {
    if (!policyApprovals?.data || !organizationMembers) return [];

    return (
      policyApprovals?.data
        ?.filter((approval: Approval) => approval?.status === ApprovalStatus.PENDING)
        .map((approval: Approval) => {
          const member = organizationMembers.find((member) => member?.user?.user_id === approval?.approver_id);

          return member ? getUserDisplayName(member.user) : 'Unknown';
        }) || []
    );
  }, [policyApprovals, organizationMembers]);

  if (isLoadingApprovals) {
    return <ApprovalStatusText message='' />;
  }

  switch (status) {
    case PolicyResultStatus.PENDING_APPROVAL:
      if (isPendingOnCurrentUser) {
        const approval = policyApprovals?.data?.find(
          (approval) =>
            approval?.status === 'PENDING' && approval?.approver_id && user?.user_id === approval?.approver_id,
        );

        return (
          <div className='flex items-center'>
            <InvitationApprovalActions approvalId={approval?.id || ''} />
          </div>
        );
      }

      if (pendingApprovers.length > 0) {
        return <ApprovalStatusText message={`Sent for approval to ${pendingApprovers.join(', ')}`} />;
      }
      break;

    case PolicyResultStatus.APPROVED:
      return <ApprovalStatusText message='Approved, acceptance pending' />;

    case PolicyResultStatus.REJECTED:
      return <ApprovalStatusText message='Rejected' />;

    default:
      return <ApprovalStatusText message='Invitation sent' />;
  }
};

export default InvitationApprovalStatus;
