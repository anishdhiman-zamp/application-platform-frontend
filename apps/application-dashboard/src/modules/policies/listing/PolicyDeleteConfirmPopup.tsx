import { FC } from 'react';
import { Button, Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader } from '@zamp-platform/ui';
import { useDeletePolicyMutation } from '@/apis/payments';
import { toast } from '@/components/common/toast/Toast';
import { TOAST_MESSAGES } from '@/components/common/toast/toast.constants';
import { PolicyDetailsType } from '@/types/api/paymentApi.types';
import { defaultFnType } from '@/types/commonTypes';

type PolicyDeleteConfirmPopupProps = {
  isOpen: boolean;
  onClose: defaultFnType;
  policy: PolicyDetailsType;
};

const PolicyDeleteConfirmPopup: FC<PolicyDeleteConfirmPopupProps> = ({ isOpen, onClose, policy }) => {
  const [deletePolicy, { isLoading }] = useDeletePolicyMutation();

  const handleDeletePolicy = () => {
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
      <DialogContent showCloseButton size='small'>
        <DialogHeader className='f-16-600'>Delete Policy</DialogHeader>
        <DialogBody className='p-6 flex justify-center'>
          <div className='f-14-400'>
            <p className='mb-2'>
              Are you sure you want to delete <span className='f-14-600'>{policy.name}</span>?
            </p>
            <p>This action cannot be undone.</p>
          </div>
        </DialogBody>
        <DialogFooter className='flex justify-end gap-2'>
          <Button size='small' variant='secondary' onClick={() => onClose()}>
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
