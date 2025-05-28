import { useState } from 'react';
import { Button } from '@zamp-platform/ui';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import MembersName from 'modules/team/components/members/MembersName';
import { PRIVILEGES_LIST, USER_APPROVAL_ACTION_TYPES } from 'modules/team/people.constants';
import { GetTeamPendingApprovalsResponse } from 'types/api/people.types';
import { useApprovalActionMutation } from '@/apis/people';
import { toast } from '@/components/common/toast/Toast';
import { TEMPLATE_APPROVAL_ACTION_TYPES } from '@/modules/payments/payments.types';
import { APPROVAL_FAILED_TOAST, APPROVAL_POLICY_TOAST } from '@/modules/policies/constants';

type TeamMemberApprovalCardProps = {
  name: string;
  email: string;
  role: string;
  details: GetTeamPendingApprovalsResponse;
  teamDetails: { name: string; color: string };
  organization: string;
  search: string;
};

const TeamMemberApprovalCard = ({
  name,
  email,
  role,
  details,
  teamDetails,
  organization,
  search,
}: TeamMemberApprovalCardProps) => {
  const [isRejected, setIsRejected] = useState(false);
  const [approvePolicy, { isLoading }] = useApprovalActionMutation();

  const handleApproveAction = (action: TEMPLATE_APPROVAL_ACTION_TYPES, approvalId: string) => {
    if (isLoading) return;

    approvePolicy({
      action: action.toString().toUpperCase(),
      approval_ids: [approvalId],
    })
      .unwrap()
      .then((res) => {
        toast.success(res?.message ?? APPROVAL_POLICY_TOAST);
      })
      .catch(() => {
        toast.error(APPROVAL_FAILED_TOAST);
      });
  };

  const handleAction = (action: TEMPLATE_APPROVAL_ACTION_TYPES) => {
    if (action === TEMPLATE_APPROVAL_ACTION_TYPES.REJECT) setIsRejected(true);
    handleApproveAction(action, details?.approval_id);
  };

  const getChangeType = () => {
    switch (details?.action) {
      case USER_APPROVAL_ACTION_TYPES.CREATE_USER_INVITATION: {
        const currentROle = PRIVILEGES_LIST.find((item) => item.value === details.privilege);

        return `Invited as ${currentROle?.label}`;
      }
      case USER_APPROVAL_ACTION_TYPES.REMOVE_USER_FROM_TEAM:
        return (
          <div className='flex items-center gap-1.5 whitespace-nowrap'>
            Removed from
            <div className='px-1.5 py-1 rounded' style={{ backgroundColor: teamDetails.color }}>
              {teamDetails.name}
            </div>
          </div>
        );
      case USER_APPROVAL_ACTION_TYPES.ADD_USER_TO_TEAM: {
        return (
          <div className='flex items-center gap-1.5 whitespace-nowrap'>
            Added to
            <div className='px-1.5 py-1 rounded' style={{ backgroundColor: teamDetails.color }}>
              {teamDetails.name}
            </div>
          </div>
        );
      }
      case USER_APPROVAL_ACTION_TYPES.UPDATE_USER_ACCESS: {
        const currentROle = PRIVILEGES_LIST.find((item) => item.value === role);
        const UpdatedRole = PRIVILEGES_LIST.find((item) => item.value === details.privilege);

        return (
          <div className='flex items-center gap-1.5'>
            {currentROle?.label}
            <SvgSpriteLoader id='arrow-right' size={14} />
            {UpdatedRole?.label}
          </div>
        );
      }
      case USER_APPROVAL_ACTION_TYPES.REMOVE_USER_ACCESS: {
        return `Remove from ${organization}`;
      }

      default:
        return '';
    }
  };

  if (
    search &&
    !email.toLowerCase().includes(search.toLowerCase()) &&
    !name.toLowerCase().includes(search.toLowerCase())
  )
    return null;

  return (
    <div className='grid grid-cols-4 gap-4 f-12-450 border-b border-'>
      <div className='flex items-center'>
        <MembersName value={name} />
      </div>
      <div className='flex items-center'>{email}</div>
      <div className='flex items-center'>{getChangeType()}</div>
      <div className='flex items-center gap-3 px-2 py-2'>
        {details?.can_approve ? (
          <>
            <Button
              variant='outline'
              size='xsmall'
              onClick={() => handleAction(TEMPLATE_APPROVAL_ACTION_TYPES.APPROVE)}
              className='gap-1 min-w-[88px]'
              isLoading={isLoading && !isRejected}
            >
              <SvgSpriteLoader id='check' size={14} />
              Approve
            </Button>
            <Button
              variant='outline'
              size='xsmall'
              onClick={() => handleAction(TEMPLATE_APPROVAL_ACTION_TYPES.REJECT)}
              className='gap-1 min-w-[88px]'
              isLoading={isLoading && isRejected}
            >
              <SvgSpriteLoader id='x-close' size={14} />
              Reject
            </Button>
          </>
        ) : (
          <div className='f-11-450 text-ORANGE_800 whitespace-nowrap'>Pending approval</div>
        )}
      </div>
    </div>
  );
};

export default TeamMemberApprovalCard;
