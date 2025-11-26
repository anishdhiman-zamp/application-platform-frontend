import { type FC, useState } from 'react';
import { Button, Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader } from '@zamp-platform/ui';
import { useApprovalActionMutation } from '@/apis/people';
import { toast } from '@/components/common/toast/Toast';
import { AudiencesByResourceResponse } from '@/types/api/collaboration.types';
import type { PolicyDetailsType } from '@/unused/apis/paymentApi.types';
import { TEMPLATE_APPROVAL_ACTION_TYPES } from '@/unused/modules/payments/payments.types';
import UpdatePolicyCard from '@/unused/modules/policies/components/UpdatePolicyCard';
import { APPROVAL_FAILED_TOAST, APPROVAL_POLICY_TOAST } from '@/unused/modules/policies/constants';

type ReviewPolicyUpdatePopoverProps = {
  isOpen: boolean;
  onClose: () => void;
  policy: PolicyDetailsType;
  audienceMembersData?: Array<AudiencesByResourceResponse & { team_name: string; team_color: string }>;
};

const ReviewPolicyUpdatePopover: FC<ReviewPolicyUpdatePopoverProps> = ({
  audienceMembersData,
  isOpen,
  onClose,
  policy,
}) => {
  const [isRejected, setIsRejected] = useState(false);

  const [approvePolicy, { isLoading }] = useApprovalActionMutation();

  const handleApproveAction = (action: TEMPLATE_APPROVAL_ACTION_TYPES) => {
    if (action === TEMPLATE_APPROVAL_ACTION_TYPES.REJECT) setIsRejected(true);

    approvePolicy({
      action: action.toString().toUpperCase(),
      approval_ids: [policy.status_details.approval.id],
    })
      .unwrap()
      .then(() => {
        toast.success(APPROVAL_POLICY_TOAST);
      })
      .catch(() => {
        toast.error(APPROVAL_FAILED_TOAST);
      })
      .finally(() => {
        onClose();
      });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        showCloseButton
        className='w-[1000px]'
        size='small'
        onCloseAutoFocus={(e) => {
          e.preventDefault();
        }}
      >
        <DialogHeader className='f-14-550'>{policy?.name}</DialogHeader>
        <DialogBody className='!bg-GRAY_100 divide-GRAY_300 grid grid-cols-2 divide-x'>
          <UpdatePolicyCard
            label='Current'
            policyConfig={policy?.policy_configurations}
            audienceMembersData={audienceMembersData}
          />
          <UpdatePolicyCard
            label='Updated'
            policyConfig={
              policy?.status_details?.resource_action_metadata?.data.resource_action_data?.policy_configurations
            }
            audienceMembersData={audienceMembersData}
          />
        </DialogBody>
        {policy?.status_details?.can_approve ? (
          <DialogFooter className='flex justify-end gap-2'>
            <Button
              size='small'
              variant='secondary'
              className='min-w-16'
              onClick={() => handleApproveAction(TEMPLATE_APPROVAL_ACTION_TYPES.REJECT)}
              isLoading={isLoading && isRejected}
            >
              Reject
            </Button>
            <Button
              size='small'
              className='min-w-16'
              onClick={() => handleApproveAction(TEMPLATE_APPROVAL_ACTION_TYPES.APPROVE)}
              isLoading={isLoading && !isRejected}
            >
              Approve
            </Button>
          </DialogFooter>
        ) : (
          <DialogFooter className='flex justify-end gap-2'>
            <Button size='small' className='min-w-16' onClick={onClose}>
              Close
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ReviewPolicyUpdatePopover;
