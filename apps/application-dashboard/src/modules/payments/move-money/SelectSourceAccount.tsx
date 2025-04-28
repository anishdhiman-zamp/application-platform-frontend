import { FC, useEffect, useMemo } from 'react';
import SelectAccountDropdown from 'modules/payments/move-money/components/SelectAccountDropdown';
import { moveMoneyContextActions, useMoveMoneyContextStore } from 'modules/payments/move-money/moveMoney.context';
import { AccountDetailsType, MOVE_MONEY_TYPE, TEMPLATE_STATUS_TYPES } from 'modules/payments/payments.types';
import { useGetSourceAccountsQuery, useGetTemplateListQuery } from '@/apis/payments';
import { Button } from '@/components/common/button/Button';
import { TemplateDetailsType } from '@/types/api/paymentApi.types';
import { SIZE_TYPES } from '@/types/common/components';
import { BUTTON_TYPES } from '@/types/components/button.type';
type SelectSourceAccountProps = {
  handleStepChange: (step: number) => void;
  transferType: MOVE_MONEY_TYPE;
  recipientId?: string;
  templateId?: string;
};

const SelectSourceAccount: FC<SelectSourceAccountProps> = ({
  handleStepChange,
  transferType,
  recipientId,
  templateId,
}) => {
  const {
    dispatch,
    state: { sourceAccountDetails, currentStep, reset },
  } = useMoveMoneyContextStore();

  const { data: sourceAccounts, isLoading } = useGetSourceAccountsQuery({ recipient_id: recipientId });
  const { data: templateList } = useGetTemplateListQuery(undefined, { refetchOnMountOrArgChange: false });

  const filteredTemplateList = useMemo(
    () =>
      templateList?.templates?.filter(
        (template) => template?.type === transferType && template?.status === TEMPLATE_STATUS_TYPES.ACTIVE,
      ),
    [templateList, transferType],
  );

  const handleSourceAccountSelect = (account: AccountDetailsType) => {
    dispatch({
      type: moveMoneyContextActions.SOURCE_ACCOUNT_DETAILS,
      payload: {
        sourceAccountDetails: account,
      },
    });
  };

  const handleTemplateSelect = (template: TemplateDetailsType) => {
    dispatch({
      type: moveMoneyContextActions.TEMPLATE_DETAILS,
      payload: {
        templateDetails: template,
      },
    });
  };

  useEffect(() => {
    if (templateId) {
      const template = filteredTemplateList?.find((template) => template?.id === templateId);

      if (template) handleTemplateSelect(template);
    }
  }, [templateId]);

  return (
    <div className='h-screen overflow-y-scroll pt-20'>
      <div className='max-w-75 m-auto'>
        <div className='f-22-550 mb-5'>Where are you paying from?</div>
        <div className='flex flex-col gap-5'>
          <SelectAccountDropdown
            autoFocus
            accountsList={sourceAccounts?.accounts ?? []}
            templateList={filteredTemplateList ?? []}
            shouldReset={reset}
            accountDetails={sourceAccountDetails}
            onAccountSelect={handleSourceAccountSelect}
            onTemplateSelect={handleTemplateSelect}
            isLoading={isLoading}
            showTemplate
          />
        </div>
        <div className='flex gap-3 mt-10'>
          <Button
            disabled
            type={BUTTON_TYPES.SECONDARY}
            size={SIZE_TYPES.MEDIUM}
            id='MOVE_MONEY_SELECT_SOURCE_ACCOUNT_BACK'
          >
            Back
          </Button>
          <Button
            size={SIZE_TYPES.MEDIUM}
            id='MOVE_MONEY_SELECT_SOURCE_ACCOUNT_NEXT'
            onClick={() => handleStepChange(currentStep + 1)}
            disabled={!sourceAccountDetails}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SelectSourceAccount;
