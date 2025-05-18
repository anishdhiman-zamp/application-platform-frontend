import { type FC, useMemo, useState } from 'react';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { Loader2 } from 'lucide-react';
import { useApprovalActionMutation } from '@/apis/people';
import AudienceMember from '@/components/audience-member';
import { toast } from '@/components/common/toast/Toast';
import { TEMPLATE_APPROVAL_ACTION_TYPES } from '@/modules/payments/payments.types';
import { APPROVAL_FAILED_TOAST, APPROVAL_POLICY_TOAST } from '@/modules/policies/constants';
import { RESOURCE_ACTION_TYPE } from '@/modules/policies/types';
import { PRIVILEGES_LIST } from '@/modules/team/people.constants';
import { AudiencesByResourceResponse } from '@/types/api/collaboration.types';
import type { GetTeamPendingApprovalsResponse, GetTeamsByOrganizationIdResponseType } from '@/types/api/people.types';
import { getUserNameFromAudience, snakeCaseToSentenceCase } from '@/utils/common';

type ShareResourceApprovalCardProps = {
  allTeams: GetTeamsByOrganizationIdResponseType[];
  allAudience: AudiencesByResourceResponse[];
  audience: GetTeamPendingApprovalsResponse;
  audiencesData: AudiencesByResourceResponse[];
};

const ShareResourceApprovalCard: FC<ShareResourceApprovalCardProps> = ({
  allTeams,
  allAudience,
  audience,
  audiencesData,
}) => {
  const [isRejected, setIsRejected] = useState(false);
  const [approvePolicy, { isLoading }] = useApprovalActionMutation();

  const { name, email, privilege } = useMemo(() => {
    const privilege = audiencesData?.find((item) => item?.resource_audience_id === audience?.audience_id)?.privilege;
    const user = allAudience?.find((member) => member?.resource_audience_id === audience?.audience_id);

    return {
      name: getUserNameFromAudience(user),
      email: user?.user?.email || '',
      privilege: privilege || '',
    };
  }, [allAudience, audience]);

  const { name: teamName, color: teamColor } = useMemo(() => {
    const team = allTeams?.find((team) => team?.team_id === audience?.audience_id);

    return { name: team?.name || '', color: team?.metadata?.color_hex_code || '' };
  }, [allTeams, audience]);

  const handleApproveAction = (action: TEMPLATE_APPROVAL_ACTION_TYPES, approvalId: string) => {
    if (isLoading) return;

    approvePolicy({
      action: action.toString().toUpperCase(),
      approval_ids: [approvalId],
    })
      .unwrap()
      .then(() => {
        toast.success(APPROVAL_POLICY_TOAST);
      })
      .catch(() => {
        toast.error(APPROVAL_FAILED_TOAST);
      });
  };

  const handleAction = (action: TEMPLATE_APPROVAL_ACTION_TYPES) => {
    if (action === TEMPLATE_APPROVAL_ACTION_TYPES.REJECT) setIsRejected(true);
    handleApproveAction(action, audience?.approval_id);
  };

  const getPreviousPrivilege = (privilege: string) => {
    return PRIVILEGES_LIST.find((item) => item.value === privilege)?.label || snakeCaseToSentenceCase(privilege);
  };

  const action = useMemo(() => {
    switch (audience?.resource_action) {
      case RESOURCE_ACTION_TYPE.DELETE_RESOURCE_AUDIENCE_POLICY: {
        return <div className='flex items-center gap-1.5'>Revoked access</div>;
      }
      case RESOURCE_ACTION_TYPE.ADD_RESOURCE_AUDIENCE_POLICY: {
        return <div className='flex items-center gap-1.5'>Invited as {audience?.privilege}</div>;
      }
      case RESOURCE_ACTION_TYPE.UPDATE_RESOURCE_AUDIENCE_POLICY:
      case RESOURCE_ACTION_TYPE.MUTATE_USER: {
        return (
          <div className='flex items-center gap-1.5'>
            {getPreviousPrivilege(privilege || '')}
            <SvgSpriteLoader id='arrow-right' size={14} />
            {getPreviousPrivilege(audience?.privilege || '')}
          </div>
        );
      }
      default:
        return '';
    }
  }, [audience?.resource_action]);

  return (
    <div className='p-2 flex items-center'>
      <div className='min-w-[150px]'>
        <AudienceMember
          resourceType={audience?.audience_type}
          user={{
            name,
            email,
          }}
          currentUserHasAdminAccess={false}
          teamInfo={{
            name: teamName,
            color: teamColor,
          }}
          resourceAudienceType={audience?.audience_type}
          showAvatar={true}
          tagClassName='border-none'
        />
      </div>
      <div className='f-12-450 flex-1'>{action}</div>
      <div className='text-ORANGE_800'>
        {audience?.can_approve ? (
          <div className='flex items-center gap-4 px-1'>
            {isLoading && !isRejected ? (
              <Loader2 className='animate-spin max-w-[14px] max-h-[14px]' />
            ) : (
              <SvgSpriteLoader
                id='check'
                onClick={() => handleAction(TEMPLATE_APPROVAL_ACTION_TYPES.APPROVE)}
                size={14}
              />
            )}
            {isLoading && isRejected ? (
              <Loader2 className='animate-spin max-w-[14px] max-h-[14px]' />
            ) : (
              <SvgSpriteLoader
                id='x-close'
                onClick={() => handleAction(TEMPLATE_APPROVAL_ACTION_TYPES.REJECT)}
                size={14}
              />
            )}
          </div>
        ) : (
          <SvgSpriteLoader id='clock' size={14} />
        )}
      </div>
    </div>
  );
};

export default ShareResourceApprovalCard;
