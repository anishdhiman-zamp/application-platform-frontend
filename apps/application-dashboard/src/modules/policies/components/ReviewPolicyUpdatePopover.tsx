import { type FC, useState } from 'react';
import { Button, Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader } from '@zamp-platform/ui';
import UpdatePolicyCard from 'modules/policies/components/UpdatePolicyCard';
import { useApprovalActionMutation } from '@/apis/people';
import { TEMPLATE_APPROVAL_ACTION_TYPES } from '@/modules/payments/payments.types';
import { AudiencesByResourceResponse } from '@/types/api/collaboration.types';
import type { PolicyDetailsType } from '@/types/api/paymentApi.types';
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
    if (action === TEMPLATE_APPROVAL_ACTION_TYPES.REJECT) {
      setIsRejected(true);
    } else {
      approvePolicy({
        action: action.toString().toUpperCase(),
        approval_ids: [policy.status_details.approval.id],
      });
    }
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
        <DialogBody className='!bg-GRAY_100 grid grid-cols-2 divide-x divide-GRAY_300'>
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
        <DialogFooter className='flex justify-end gap-2'>
          <Button
            size='small'
            variant='secondary'
            onClick={() => handleApproveAction(TEMPLATE_APPROVAL_ACTION_TYPES.REJECT)}
            disabled={isLoading && isRejected}
          >
            Reject
          </Button>
          <Button
            size='small'
            onClick={() => handleApproveAction(TEMPLATE_APPROVAL_ACTION_TYPES.APPROVE)}
            disabled={isLoading && !isRejected}
          >
            Approve
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewPolicyUpdatePopover;
