import { captureException } from '@sentry/browser';
import {
  Button,
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogHeaderTitle,
} from '@zamp-platform/ui';
import { defaultFnType } from 'types/commonTypes';
import { useDeleteRuleMutation } from '@/apis/dataset';
import { TOAST_MESSAGES } from '@/components/common/toast/toast.constants';
import { DatasetUpdateResponseType } from '@/types/api/dataset.types';
import { toast } from 'components/common/toast/Toast';

type RuleDeleteProps = {
  isOpen: boolean;
  onClose: defaultFnType;
  ruleId: string;
  onSuccess: (data: DatasetUpdateResponseType) => void;
};

const RuleDelete = ({ isOpen, onClose, ruleId, onSuccess }: RuleDeleteProps) => {
  const [deleteRule, { isLoading }] = useDeleteRuleMutation();

  const handleApplyChanges = () => {
    deleteRule({ ruleId })
      .unwrap()
      .then(onSuccess)
      .catch((error) => {
        captureException(error);
        toast.error(TOAST_MESSAGES.ERROR_RULE_DELETION);
      })
      .finally(onClose);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent size='small' showCloseButton className='w-[344px]'>
        <DialogHeader>
          <DialogHeaderTitle>Delete Rule ?</DialogHeaderTitle>
        </DialogHeader>
        <DialogBody className='f-13-400 text-GRAY_900 px-5 py-6'>
          Are you sure you want to delete this rule ? This action cannot be undone.
        </DialogBody>
        <DialogFooter className='flex justify-end gap-2'>
          <DialogClose asChild>
            <Button variant='secondary' size='medium' id='rule-delete-cancel'>
              Discard
            </Button>
          </DialogClose>
          <Button
            variant='destructive'
            size='medium'
            id='rule-delete-confirm'
            onClick={handleApplyChanges}
            isLoading={isLoading}
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RuleDelete;
