import type { FC } from 'react';
import { useApprovePolicyMutation, useRejectPolicyMutation } from '@/apis/people';
import { Button } from '@/components/common/button/Button';
import { toast } from '@/components/common/toast/Toast';
import { TOAST_MESSAGES } from '@/components/common/toast/toast.constants';
import { SIZE_TYPES } from '@/types/common/components';
import { BUTTON_TYPES } from '@/types/components/button.type';

type ApproveActionCardProps = {
  approvalId: string;
};

const ApproveActionCard: FC<ApproveActionCardProps> = ({ approvalId }) => {
  const [approvePolicy, { isLoading: isApprovePolicyLoading }] = useApprovePolicyMutation();
  const [rejectPolicy, { isLoading: isRejectPolicyLoading }] = useRejectPolicyMutation();

  const handleApprove = () => {
    approvePolicy({ ids: [approvalId] })
      .unwrap()
      .then(() => {
        toast.success(TOAST_MESSAGES.SUCCESS_APPROVED);
      })
      .catch((error: any) => {
        toast.error(`${TOAST_MESSAGES.ERROR_APPROVED}: ${error?.data?.error}`);
      });
  };

  const handleReject = () => {
    rejectPolicy({ ids: [approvalId] })
      .unwrap()
      .then(() => {
        toast.success(TOAST_MESSAGES.SUCCESS_REJECTED);
      })
      .catch((error: any) => {
        toast.error(`${TOAST_MESSAGES.ERROR_REJECTED}: ${error?.data?.error}`);
      });
  };

  return (
    <div className='border-GRAY_400 flex items-center gap-3 border-b px-4.5 py-4'>
      <div className='f-12-500 text-ORANGE_800 flex-1'>Your approval is pending for this payment</div>
      <Button
        id='reject-payment'
        type={BUTTON_TYPES.SECONDARY}
        size={SIZE_TYPES.SMALL}
        onClick={handleReject}
        isLoading={isRejectPolicyLoading}
        className='f-12-500 text-RED_700 border-RED_700 hover:!text-RED_700 min-w-16'
      >
        Reject
      </Button>
      <Button
        id='approve-payment'
        onClick={handleApprove}
        size={SIZE_TYPES.SMALL}
        isLoading={isApprovePolicyLoading}
        className='f-12-500 min-w-[72px]'
      >
        Approve
      </Button>
    </div>
  );
};

export default ApproveActionCard;
