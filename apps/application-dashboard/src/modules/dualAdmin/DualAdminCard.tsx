import type { FC } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Switch } from '@zamp-platform/ui';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import ApprovalsDropdown from 'modules/dualAdmin/components.tsx/ApprovalsDropdown';
import PolicyApproveCard from 'modules/dualAdmin/components.tsx/PolicyApproveCard';
import type { RequestApprovalPolicyConfig } from 'modules/dualAdmin/components.tsx/RequestApprovalDialogue';
import type { AudienceMembersDataType } from 'modules/dualAdmin/DualAdminHome';
import { POLICY_STATUS_LABEL } from 'modules/payments/payments.constant';
import { LOGICAL_OPERATOR_CONDITIONS } from 'modules/widgets/displayConfig/displayConfig.types';
import TooltipV2 from '@/components/common/TooltipV2';
import { PolicyAttributeAction, PolicyQuorum } from '@/modules/policies/types';
import { PolicyMutateActionType } from '@/types/api/paymentApi.types';
import { type GetDualAdminPolicyResponse, PolicyResultStatus } from '@/types/api/policies.types';
import { SIDE_OPTIONS } from '@/types/commonTypes';

type DualAdminCardProps = {
  item: GetDualAdminPolicyResponse;
  setRequestApprovalPolicyConfig: (policyConfig: RequestApprovalPolicyConfig) => void;
  approversList: AudienceMembersDataType[];
};

const DualAdminCard: FC<DualAdminCardProps> = ({ item, setRequestApprovalPolicyConfig, approversList }) => {
  const [selectedApprovers, setSelectedApprovers] = useState<AudienceMembersDataType[]>([]);

  const handleRequestApproval = () => {
    const approvalSteps = [
      {
        logical_operator: LOGICAL_OPERATOR_CONDITIONS.OR,
        conditions: [
          {
            mode: PolicyQuorum.ONE,
            approver_details: selectedApprovers?.map((approver) => ({
              id: approver?.resource_audience_id,
              type: approver?.resource_audience_type,
              email: approver?.user?.email ?? '',
              name: approver?.user?.name ?? '',
              role: approver?.user?.role ?? '',
            })),
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
      status: item?.policy?.status_details?.status,
      action_type: item?.action_type,
      resource_id: item?.resource_id,
      resource_type: item?.resource_type,
      policy_id: item.policy?.id,
    });
  };

  const { isToggleOn, isUpdateUserAllowed, isToggleDisabled } = useMemo(() => {
    const isToggleOn =
      item?.policy?.status_details?.status === PolicyResultStatus.APPROVED ||
      (item?.policy?.status_details?.status === PolicyResultStatus.PENDING_APPROVAL &&
        item?.policy?.status_details?.resource_action_metadata?.mutate_action === PolicyMutateActionType.DELETE);

    const isToggleDisabled =
      !selectedApprovers?.length || item?.policy?.status_details?.status === PolicyResultStatus.PENDING_APPROVAL;

    const isUpdateUserAllowed =
      item?.policy?.status_details?.status === PolicyResultStatus.APPROVED ||
      item?.policy?.status_details?.status === PolicyResultStatus.PENDING_APPROVAL;

    return { isToggleOn, isUpdateUserAllowed, isToggleDisabled };
  }, [item, selectedApprovers]);

  const getPolicyStatus = useMemo(() => {
    if (item?.policy?.status_details?.status === PolicyResultStatus.APPROVED) {
      return POLICY_STATUS_LABEL.ACTIVE;
    }

    if (item?.policy?.status_details?.status === PolicyResultStatus.PENDING_APPROVAL) {
      const member = approversList?.find(
        (audience) => audience?.resource_audience_id === item?.policy?.status_details?.policy_result_created_by,
      );

      return `${member?.user?.name || member?.user?.email?.split('@')[0]} requested to ${
        item?.policy?.status_details?.resource_action_metadata?.mutate_action === PolicyMutateActionType.DELETE
          ? 'disable'
          : 'enable'
      } this policy`;
    }

    return POLICY_STATUS_LABEL.INACTIVE;
  }, [item?.policy?.status_details?.status, approversList]);

  useEffect(() => {
    if (approversList?.length && item?.policy?.status_details?.status) {
      const approval = item?.policy?.policy_configurations?.approval_flow?.steps?.[0].conditions?.[0]?.approver_details;

      const defaultAudience = approversList?.filter((audience: AudienceMembersDataType) =>
        approval?.find((approver) => approver?.id === audience?.resource_audience_id),
      );

      setSelectedApprovers(defaultAudience);
    }
  }, [approversList, item]);

  return (
    <tr className='border-b border-GRAY_100'>
      <td className='px-2 py-3'>
        <div className='flex items-center gap-2'>
          <div className='p-2 bg-GRAY_100 rounded-md text-GRAY_1000'>
            <SvgSpriteLoader id={item?.icon_id} size={14} />
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
            disabled={isUpdateUserAllowed}
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
            <Switch checked={isToggleOn} onClick={handleRequestApproval} disabled={isToggleDisabled} />
          </TooltipV2>
        </div>
      </td>
      <td className='px-2 py-2.5'>
        <div className='f-12-450 text-GRAY_600'>{getPolicyStatus}</div>
      </td>
      <td className='px-2 py-2.5 text-end'>
        <div className='min-w-24'>
          {item?.policy && item?.policy?.status_details?.status !== PolicyResultStatus.APPROVED && (
            <PolicyApproveCard
              approvalId={item?.policy?.status_details?.approval?.id}
              canApprove={item?.policy?.status_details?.can_approve}
            />
          )}
        </div>
      </td>
    </tr>
  );
};

export default DualAdminCard;
