import { FC, useMemo, useState } from 'react';
import { ListCard } from '@zamp-platform/ui';
import { DATE_FORMATS } from '@zamp-platform/utils';
import { format } from 'date-fns';
import ReviewPolicyUpdatePopover from 'modules/policies/components/ReviewPolicyUpdatePopover';
import PolicyActionsDropdown from 'modules/policies/listing/PolicyActionsDropdown';
import PolicyAttributeTags from 'modules/policies/listing/PolicyAttributeTags';
import TooltipV2 from '@/components/common/TooltipV2';
import PolicyApproveCard from '@/modules/dualAdmin/components.tsx/PolicyApproveCard';
import { AudiencesByResourceResponse } from '@/types/api/collaboration.types';
import { PolicyDetailsType, PolicyMutateActionType } from '@/types/api/paymentApi.types';
import { PolicyResultStatus } from '@/types/api/policies.types';
import { cn, stopPropagationAction } from '@/utils/common';

type PolicyCardProps = {
  policy: PolicyDetailsType;
  audienceMembersData?: Array<AudiencesByResourceResponse & { team_name: string; team_color: string }>;
};

const PolicyCard: FC<PolicyCardProps> = ({ policy, audienceMembersData }) => {
  const [isShowReview, setIsShowReview] = useState(false);

  const handleReviewPolicy = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsShowReview(true);
  };

  const isUpdatedPolicy =
    policy?.status_details?.resource_action_metadata?.mutate_action === PolicyMutateActionType.UPDATE;
  const isShowReviewAction = isUpdatedPolicy && policy?.status_details?.status === PolicyResultStatus.PENDING_APPROVAL;
  const isPolicyPendingApproval = policy?.status_details?.status === PolicyResultStatus.PENDING_APPROVAL;

  const teamMember = useMemo(() => {
    const memberId = isUpdatedPolicy ? policy?.status_details?.policy_result_created_by : policy.created_by;
    const member = audienceMembersData?.find((member) => member.user?.user_id === memberId);

    return member?.user?.name?.length ? member?.user?.name : (member?.user?.email?.split('@')[0] ?? '');
  }, [audienceMembersData, policy, isUpdatedPolicy]);

  const cardTitle = useMemo(() => {
    return `${isUpdatedPolicy ? 'Edited on' : 'Created on'} ${format(new Date(isUpdatedPolicy ? policy?.updated_at : policy.created_at), DATE_FORMATS.ddMMMyyyy)}  by ${teamMember}`;
  }, [isUpdatedPolicy, policy, teamMember]);

  const getStatus = (isPendingApproval: boolean) => {
    if (isPendingApproval) {
      return (
        <div className='flex items-center gap-2' onClick={stopPropagationAction}>
          <span className='bg-ORANGE_800 h-1 w-1 rounded-full' />
          <PolicyApproveCard
            approvalId={policy?.status_details?.approval?.id}
            canApprove={policy?.status_details?.can_approve}
          />
        </div>
      );
    }

    if (policy?.status_details?.status === PolicyResultStatus.APPROVED)
      return (
        <div className='f-11-450 text-GREEN_800 flex items-center gap-2'>
          <span className='bg-GREEN_800 h-1 w-1 rounded-full' />
          Active
        </div>
      );
  };

  return (
    <>
      <ListCard
        header={
          <div className='flex w-full items-center gap-2'>
            <TooltipV2 tooltipBody={isPolicyPendingApproval ? cardTitle : ''}>
              <div
                className={cn('f-11-400 whitespace-nowrap text-gray-700', {
                  'max-w-[170px] overflow-hidden text-ellipsis': isPolicyPendingApproval,
                })}
              >
                {cardTitle}
              </div>
            </TooltipV2>
            {isShowReviewAction && (
              <div
                className='f-11-450 border-BG_GRAY_2 hover:border-primary border-b select-none'
                onClick={handleReviewPolicy}
              >
                Review
              </div>
            )}
            {getStatus(isPolicyPendingApproval)}
          </div>
        }
        rightComponent={<PolicyActionsDropdown policy={policy} />}
      >
        <div className='space-y-2'>
          <h2 className='f-13-550'>{policy.name}</h2>
          <PolicyAttributeTags
            creatorLength={policy.policy_configurations.creator?.length}
            conditions={policy.policy_configurations.conditions?.conditions}
            action={policy.policy_configurations.action}
          />
        </div>
        {isShowReviewAction && (
          <div onClick={stopPropagationAction}>
            <ReviewPolicyUpdatePopover
              audienceMembersData={audienceMembersData}
              policy={policy}
              isOpen={isShowReview}
              onClose={() => setIsShowReview(false)}
            />
          </div>
        )}
      </ListCard>
    </>
  );
};

export default PolicyCard;
