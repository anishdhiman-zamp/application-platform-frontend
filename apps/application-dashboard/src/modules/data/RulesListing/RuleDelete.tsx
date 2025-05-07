import { captureException } from '@sentry/browser';
import { SIZE_TYPES } from 'types/common/components';
import { defaultFnType } from 'types/commonTypes';
import { BUTTON_TYPES } from 'types/components/button.type';
import { useDeleteRuleMutation } from '@/apis/dataset';
import { TOAST_MESSAGES } from '@/components/common/toast/toast.constants';
import { DatasetUpdateResponseType } from '@/types/api/dataset.types';
import { Button } from 'components/common/button/Button';
import Popup from 'components/common/popup/Popup';
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
    <Popup
      isOpen={isOpen}
      onClose={onClose}
      title='Delete Rule ?'
      iconId='x-close'
      className='w-[344px] border-2 border-GRAY_400 rounded-3.5 bg-white !p-0 shadow-menuList'
      titleClassName='f-16-600 text-GRAY_950'
      showIcon
      closeOnClickOutside={false}
    >
      <div className='f-13-400 text-GRAY_900 px-5 py-6'>
        Are you sure you want to delete this rule ? This action cannot be undone.
      </div>
      <div className='flex justify-end gap-2 px-5 py-4 border-t border-GRAY_400'>
        <Button type={BUTTON_TYPES.SECONDARY} size={SIZE_TYPES.MEDIUM} id='rule-delete-cancel' onClick={onClose}>
          Discard
        </Button>
        <Button
          type={BUTTON_TYPES.PRIMARY}
          size={SIZE_TYPES.MEDIUM}
          id='rule-delete-confirm'
          onClick={handleApplyChanges}
          isLoading={isLoading}
        >
          Confirm
        </Button>
      </div>
    </Popup>
  );
};

export default RuleDelete;
