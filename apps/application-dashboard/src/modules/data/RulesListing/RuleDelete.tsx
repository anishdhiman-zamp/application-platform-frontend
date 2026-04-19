import { captureException } from '@sentry/browser';
import { ConfirmationDialog } from '@zamp-platform/ui';
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
    <ConfirmationDialog
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      title='Delete Rule?'
      description='Are you sure you want to delete this rule? This action cannot be undone.'
      confirmLabel='Confirm'
      cancelLabel='Discard'
      onConfirm={handleApplyChanges}
      isLoading={isLoading}
    />
  );
};

export default RuleDelete;
