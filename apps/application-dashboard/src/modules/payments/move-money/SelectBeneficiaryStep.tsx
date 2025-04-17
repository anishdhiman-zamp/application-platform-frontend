import { FC } from 'react';
import SelectAccountDropdown from 'modules/payments/move-money/components/SelectAccountDropdown';
import SelectBeneDropdown from 'modules/payments/move-money/components/SelectBeneDropdown';
import { moveMoneyContextActions, useMoveMoneyContextStore } from 'modules/payments/move-money/moveMoney.context';
import { AccountDetailsType } from 'modules/payments/payments.types';
import { SIZE_TYPES } from 'types/common/components';
import { BUTTON_TYPES } from 'types/components/button.type';
import { snakeCaseToSentenceCase } from 'utils/common';
import { useGetRecipientBySourceAccountQuery } from '@/apis/payments';
import { RecipientDetailsType, TemplateDetailsType } from '@/types/api/paymentApi.types';
import { Button } from 'components/common/button/Button';

interface SelectBeneficiaryStepProps {
  handleStepChange: (step: number) => void;
  defaultTemplate?: TemplateDetailsType;
}

const SelectBeneficiaryStep: FC<SelectBeneficiaryStepProps> = ({ handleStepChange, defaultTemplate }) => {
  const {
    state: { sourceAccountDetails, currentStep, templateDetails, recipientDetails, destinationAccountDetails },
    dispatch,
  } = useMoveMoneyContextStore();

  const { data: recipientBySourceAccount, isLoading: isRecipientBySourceAccountLoading } =
    useGetRecipientBySourceAccountQuery(
      {
        source_account_id: sourceAccountDetails?.id ?? '',
      },
      {
        refetchOnMountOrArgChange: false,
        skip: !sourceAccountDetails?.id,
      },
    );

  const handleBeneficiarySelect = (beneficiary: RecipientDetailsType) => {
    dispatch({
      type: moveMoneyContextActions.RECIPIENT_DETAILS,
      payload: {
        recipientDetails: beneficiary,
      },
    });
  };

  const handleAccountSelect = (account: AccountDetailsType) => {
    dispatch({
      type: moveMoneyContextActions.DESTINATION_ACCOUNT_DETAILS,
      payload: {
        destinationAccountDetails: account,
      },
    });
  };

  return (
    <div className='h-screen overflow-y-scroll pt-34'>
      <div className='max-w-75 m-auto'>
        <div className='f-22-550 mb-5'>Who are you paying?</div>
        <div className='flex flex-col gap-5'>
          <SelectBeneDropdown
            autoFocus={currentStep === 1}
            onSelect={handleBeneficiarySelect}
            shouldReset={false}
            isLoading={isRecipientBySourceAccountLoading}
            templateDetails={defaultTemplate}
            recipientList={recipientBySourceAccount?.recipients ?? []}
          />
          {!templateDetails && recipientDetails && (
            <SelectAccountDropdown
              autoFocus
              accountsList={recipientDetails?.accounts}
              shouldReset={false}
              accountDetails={destinationAccountDetails}
              onAccountSelect={handleAccountSelect}
              label='Recipient account'
            />
          )}
          {!templateDetails && destinationAccountDetails?.account_name && (
            <div className='flex flex-col gap-4'>
              {Object.keys(destinationAccountDetails).map((key, index) => (
                <div key={index} className='grid grid-cols-2'>
                  <div className='f-12-400 text-GRAY_700'>{snakeCaseToSentenceCase(key)}</div>
                  <div className='f-12-450 whitespace-no-wrap'>
                    {snakeCaseToSentenceCase(String(destinationAccountDetails[key as keyof AccountDetailsType] || ''))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className='flex gap-3 mt-10'>
          <Button
            onClick={() => handleStepChange(currentStep - 1)}
            type={BUTTON_TYPES.SECONDARY}
            size={SIZE_TYPES.MEDIUM}
            id='MOVE_MONEY_SELECT_BENEFICIARY_BACK'
          >
            Back
          </Button>
          <Button
            size={SIZE_TYPES.MEDIUM}
            id='MOVE_MONEY_SELECT_BENEFICIARY_NEXT'
            disabled={!destinationAccountDetails?.id}
            onClick={() => handleStepChange(currentStep + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SelectBeneficiaryStep;
