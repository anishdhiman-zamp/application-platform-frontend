import { FC } from 'react';
import { Button, Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader } from '@zamp-platform/ui';
import PolicyCard from 'modules/policies/listing/PolicyCard';
import { useDeletePolicyMutation } from '@/apis/payments';
import { toast } from '@/components/common/toast/Toast';
import { TOAST_MESSAGES } from '@/components/common/toast/toast.constants';
import { AudiencesByResourceResponse } from '@/types/api/collaboration.types';
import { PolicyDetailsType } from '@/types/api/paymentApi.types';
import { defaultFnType } from '@/types/commonTypes';
type PolicyDeleteConfirmPopupProps = {
  isOpen: boolean;
  onClose: defaultFnType;
  policy: PolicyDetailsType;
  audienceMembersData?: AudiencesByResourceResponse[];
};

const PolicyDeleteConfirmPopup: FC<PolicyDeleteConfirmPopupProps> = ({
  isOpen,
  onClose,
  policy,
  audienceMembersData,
}) => {
  const [deletePolicy, { isLoading }] = useDeletePolicyMutation();

  const handleDeletePolicy = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    deletePolicy(policy.id)
      .unwrap()
      .then(() => {
        toast.success(TOAST_MESSAGES.SUCCESS_POLICY_DELETED);
      })
      .catch(() => {
        toast.error(TOAST_MESSAGES.ERROR_DELETING_POLICY);
      })
      .finally(onClose);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        showCloseButton
        size='small'
        onCloseAutoFocus={(e) => {
          e.preventDefault();
          e.preventDefault();
        }}
      >
        <DialogHeader className='f-16-600'>Are you sure you want to delete this policy?</DialogHeader>
        <DialogBody className='p-6 flex justify-center'>
          <PolicyCard policy={policy} audienceMembersData={audienceMembersData ?? []} />
        </DialogBody>
        <DialogFooter className='flex justify-end gap-2'>
          <Button
            size='small'
            variant='secondary'
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
          >
            No
          </Button>
          <Button size='small' onClick={handleDeletePolicy} isLoading={isLoading} variant='destructive'>
            Yes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PolicyDeleteConfirmPopup;
