import { FC, useMemo, useState } from 'react';
import { ListCard } from '@zamp-platform/ui';
import { format } from 'date-fns';
import ReviewPolicyUpdatePopover from 'modules/policies/components/ReviewPolicyUpdatePopover';
import PolicyActionsDropdown from 'modules/policies/listing/PolicyActionsDropdown';
import PolicyAttributeTags from 'modules/policies/listing/PolicyAttributeTags';
import { DATE_FORMATS } from '@/constants/date.constants';
import PolicyApproveCard from '@/modules/dualAdmin/components.tsx/PolicyApproveCard';
import { AudiencesByResourceResponse } from '@/types/api/collaboration.types';
import { PolicyDetailsType, PolicyMutateActionType } from '@/types/api/paymentApi.types';
import { PolicyResultStatus } from '@/types/api/policies.types';
import { stopPropagationAction } from '@/utils/common';

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

  const teamMember = useMemo(() => {
    const memberId = isUpdatedPolicy ? policy?.status_details?.policy_result_created_by : policy.created_by;
    const member = audienceMembersData?.find((member) => member.user?.user_id === memberId);

    return member?.user?.name?.length ? member?.user?.name : (member?.user?.email?.split('@')[0] ?? '');
  }, [audienceMembersData, policy, isUpdatedPolicy]);

  const getStatus = (isPendingApproval: boolean) => {
    if (isPendingApproval) {
      return (
        <div className='flex items-center gap-2' onClick={stopPropagationAction}>
          <span className='w-1 h-1 bg-ORANGE_800 rounded-full' />
          <PolicyApproveCard
            approvalId={policy?.status_details?.approval?.id}
            canApprove={policy?.status_details?.can_approve}
          />
        </div>
      );
    }

    if (policy?.status_details?.status === PolicyResultStatus.APPROVED)
      return (
        <div className='flex items-center gap-2 f-11-450 text-GREEN_800'>
          <span className='w-1 h-1 bg-GREEN_800 rounded-full' />
          Active
        </div>
      );
  };

  return (
    <>
      <ListCard
        header={
          <div className='flex items-center gap-2'>
            <span className='f-11-400 text-gray-700 whitespace-nowrap'>
              {isUpdatedPolicy ? 'Edited on' : 'Created on'}{' '}
              {format(new Date(isUpdatedPolicy ? policy?.updated_at : policy.created_at), DATE_FORMATS.ddMMMyyyy)}
              {isUpdatedPolicy && ` by ${teamMember}`}
            </span>
            {isShowReviewAction && (
              <div
                className='f-11-450 border-b border-BG_GRAY_2 hover:border-primary select-none'
                onClick={handleReviewPolicy}
              >
                Review
              </div>
            )}
            {getStatus(policy?.status_details?.status === PolicyResultStatus.PENDING_APPROVAL)}
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
