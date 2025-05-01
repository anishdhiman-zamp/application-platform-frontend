import React, { FC } from 'react';
import { useApprovePolicyMutation, useRejectPolicyMutation } from 'apis/people';
import { SIZE_TYPES } from 'types/common/components';
import { BUTTON_TYPES, ICON_POSITION_TYPES } from 'types/components/button.type';
import { TOAST_MESSAGES } from '@/components/common/toast/toast.constants';
import { Button } from 'components/common/button/Button';
import { toast } from 'components/common/toast/Toast';

type InvitationApprovalActionsProps = {
  approvalId: string;
};

const InvitationApprovalActions: FC<InvitationApprovalActionsProps> = ({ approvalId }) => {
  const [approvePolicy, { isLoading: isApprovePolicyLoading }] = useApprovePolicyMutation();
  const [rejectPolicy, { isLoading: isRejectPolicyLoading }] = useRejectPolicyMutation();

  const handleApprove = async () => {
    try {
      await approvePolicy({ ids: [approvalId] }).unwrap();
      toast.success(TOAST_MESSAGES.SUCCESS_APPROVED);
    } catch (error: any) {
      toast.error(`${TOAST_MESSAGES.ERROR_APPROVED}: ${error?.data?.error}`);
    }
  };

  const handleReject = async () => {
    try {
      await rejectPolicy({ ids: [approvalId] }).unwrap();
      toast.success(TOAST_MESSAGES.SUCCESS_REJECTED);
    } catch (error: any) {
      toast.error(`${TOAST_MESSAGES.ERROR_REJECTED}: ${error?.data?.error}`);
    }
  };

  const buttonDisabled = isApprovePolicyLoading || isRejectPolicyLoading;

  return (
    <div className='flex space-x-2'>
      <Button
        type={BUTTON_TYPES.SECONDARY}
        size={SIZE_TYPES.XSMALL}
        onClick={handleApprove}
        disabled={buttonDisabled}
        iconProps={{
          size: 16,
          id: 'check',
        }}
        iconPosition={ICON_POSITION_TYPES.LEFT}
        isLoading={isApprovePolicyLoading}
        id='approve-button'
      >
        Approve
      </Button>
      <Button
        type={BUTTON_TYPES.SECONDARY}
        size={SIZE_TYPES.XSMALL}
        onClick={handleReject}
        disabled={buttonDisabled}
        iconProps={{
          size: 16,
          id: 'x-close',
        }}
        iconPosition={ICON_POSITION_TYPES.LEFT}
        isLoading={isRejectPolicyLoading}
        id='reject-button'
      >
        Reject
      </Button>
    </div>
  );
};

export default InvitationApprovalActions;
