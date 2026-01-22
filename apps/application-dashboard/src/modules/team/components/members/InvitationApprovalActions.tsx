import React, { FC } from 'react';
import { Button } from '@zamp-platform/ui';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { useApprovePolicyMutation, useRejectPolicyMutation } from 'apis/people';
import { TOAST_MESSAGES } from '@/components/common/toast/toast.constants';
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
        variant='outline'
        size='xsmall'
        onClick={handleApprove}
        disabled={buttonDisabled}
        leadingIcon={<SvgSpriteLoader id='check' width={16} height={16} />}
        isLoading={isApprovePolicyLoading}
        testId='approve-button'
      >
        Approve
      </Button>
      <Button
        variant='outline'
        size='xsmall'
        onClick={handleReject}
        disabled={buttonDisabled}
        leadingIcon={<SvgSpriteLoader id='x-close' width={16} height={16} />}
        isLoading={isRejectPolicyLoading}
        testId='reject-button'
      >
        Reject
      </Button>
    </div>
  );
};

export default InvitationApprovalActions;
