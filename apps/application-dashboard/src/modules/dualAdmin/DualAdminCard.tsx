import type { FC } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Switch } from '@zamp-platform/ui';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import ApprovalsDropdown from 'modules/dualAdmin/components.tsx/ApprovalsDropdown';
import PolicyApproveCard from 'modules/dualAdmin/components.tsx/PolicyApproveCard';
import type { RequestApprovalPolicyConfig } from 'modules/dualAdmin/components.tsx/RequestApprovalDialogue';
import { POLICY_STATUS_LABEL } from 'modules/payments/payments.constant';
import { formatAudienceMembers } from 'modules/policies/create/constants';
import { LOGICAL_OPERATOR_CONDITIONS } from 'modules/widgets/displayConfig/displayConfig.types';
import TooltipV2 from '@/components/common/TooltipV2';
import { useAppSelector } from '@/hooks/toolkit';
import useAudienceMembers from '@/hooks/useAudienceMembers';
import { type ApproverListOption, PolicyAttributeAction, PolicyQuorum } from '@/modules/policies/types';
import { type GetDualAdminPolicyResponse, PolicyResultStatus, ResourceType } from '@/types/api/policies.types';
import { SIDE_OPTIONS } from '@/types/commonTypes';

type DualAdminCardProps = {
  item: GetDualAdminPolicyResponse;
  setRequestApprovalPolicyConfig: (policyConfig: RequestApprovalPolicyConfig) => void;
};

const DualAdminCard: FC<DualAdminCardProps> = ({ item, setRequestApprovalPolicyConfig }) => {
  const [selectedApprovers, setSelectedApprovers] = useState<ApproverListOption[]>([]);
  const [approversList, setApproversList] = useState<ApproverListOption[]>([]);

  const { user } = useAppSelector((state) => state.user);

  const { data: audiences, loading } = useAudienceMembers({
    resourceType: ResourceType.ORGANIZATION,
    resourceId: user?.orgs[0]?.organization_id ?? '',
  });

  const handleRequestApproval = () => {
    const approvalSteps = [
      {
        logical_operator: LOGICAL_OPERATOR_CONDITIONS.OR,
        conditions: [
          {
            mode: PolicyQuorum.ONE,
            approver_details: selectedApprovers.map((approver) => approver.value),
          },
        ],
      },
    ];

    setRequestApprovalPolicyConfig({
      data: {
        approvalSteps,
        policyName: item?.name,
        action: [{ label: '', value: PolicyAttributeAction.REQUIRE_APPROVAL.toString() }],
      },
      action_type: item.action_type,
      resource_id: item.resource_id,
      resource_type: item.resource_type,
    });
  };

  const getPolicyStatus = useMemo(() => {
    if (item?.policy?.status_details?.status === PolicyResultStatus.APPROVED) {
      return POLICY_STATUS_LABEL.ACTIVE;
    }

    if (item?.policy?.status_details?.status === PolicyResultStatus.PENDING_APPROVAL) {
      const member = audiences?.find(
        (audience) => audience.resource_audience_id === item?.policy?.status_details?.policy_result_created_by,
      );

      return `${member?.user?.name || member?.user?.email?.split('@')[0]} requested to enable/disable this policy`;
    }

    return POLICY_STATUS_LABEL.INACTIVE;
  }, [item?.policy?.status_details?.status]);

  useEffect(() => {
    if (!loading && audiences) {
      const options = formatAudienceMembers(audiences);

      setApproversList(options);
    }
    if (item?.policy?.status_details?.status) {
      const approval = item.policy.policy_configurations.approval_flow?.steps[0].conditions[0].approver_details;

      const defaultAudience = audiences?.filter((audience) =>
        approval?.find((approver) => approver.id === audience?.resource_audience_id),
      );

      const options = formatAudienceMembers(defaultAudience);

      setSelectedApprovers(options);
    }
  }, [item, audiences]);

  return (
    <tr className='border-b border-GRAY_100'>
      <td className='px-2 py-3'>
        <div className='flex items-center gap-2'>
          <div className='p-2 bg-GRAY_100 rounded-md text-GRAY_1000'>
            <SvgSpriteLoader id={'users-02'} size={14} />
          </div>
          <div>
            <div className='f-12-450 text-GRAY_1000 mb-0.5'>{item?.name}</div>
            <div className='f-11-450 text-GRAY_700'>{item?.description}</div>
          </div>
        </div>
      </td>
      <td className='px-2 py-2.5 '>
        <div className='min-w-24'>
          <ApprovalsDropdown
            selectedApprovers={selectedApprovers}
            onChange={setSelectedApprovers}
            approversList={approversList}
          />
        </div>
      </td>
      <td className='px-2 py-2.5'>
        <div className='flex items-center justify-end'>
          <TooltipV2
            tooltipClassName='max-w-[128px] text-[10px] font-[450]'
            side={SIDE_OPTIONS.LEFT}
            tooltipBody={!selectedApprovers.length ? 'Select approvers to enable this policy' : ''}
          >
            <Switch
              checked={item?.policy?.status_details?.status === PolicyResultStatus.APPROVED}
              onClick={handleRequestApproval}
              disabled={
                !selectedApprovers.length ||
                item?.policy?.status_details?.status === PolicyResultStatus.PENDING_APPROVAL
              }
            />
          </TooltipV2>
        </div>
      </td>
      <td className='px-2 py-2.5'>
        <div className='f-12-450 text-GRAY_600'>{getPolicyStatus}</div>
      </td>
      <td className='px-2 py-2.5 text-end'>
        <div className='min-w-24'>
          {item?.policy && item?.policy?.status_details?.status !== PolicyResultStatus.APPROVED && (
            <PolicyApproveCard approvalId='' canApprove={item?.policy?.status_details?.can_approve} />
          )}
        </div>
      </td>
    </tr>
  );
};

export default DualAdminCard;
