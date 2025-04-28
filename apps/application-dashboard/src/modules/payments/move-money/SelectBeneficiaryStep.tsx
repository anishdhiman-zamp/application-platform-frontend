import { FC, useMemo } from 'react';
import SelectAccountDropdown from 'modules/payments/move-money/components/SelectAccountDropdown';
import SelectBeneDropdown from 'modules/payments/move-money/components/SelectBeneDropdown';
import { moveMoneyContextActions, useMoveMoneyContextStore } from 'modules/payments/move-money/moveMoney.context';
import { AccountDetailsType } from 'modules/payments/payments.types';
import { SIZE_TYPES } from 'types/common/components';
import { BUTTON_TYPES } from 'types/components/button.type';
import { useGetRecipientBySourceAccountQuery } from '@/apis/payments';
import { RecipientDetailsType } from '@/types/api/paymentApi.types';
import { Button } from 'components/common/button/Button';

interface SelectBeneficiaryStepProps {
  handleStepChange: (step: number) => void;
  recipientId?: string;
}

const SelectBeneficiaryStep: FC<SelectBeneficiaryStepProps> = ({ handleStepChange, recipientId }) => {
  const {
    state: { sourceAccountDetails, currentStep, templateDetails, recipientDetails, destinationAccountDetails, reset },
    dispatch,
  } = useMoveMoneyContextStore();

  const { data: recipientBySourceAccount, isLoading: isRecipientBySourceAccountLoading } =
    useGetRecipientBySourceAccountQuery(
      {
        source_account_id: sourceAccountDetails?.id ?? '',
      },
      {
        skip: !sourceAccountDetails?.id,
      },
    );

  const handleBeneficiarySelect = (beneficiary: RecipientDetailsType) => {
    if (!templateDetails)
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

  const selectedBeneficiary = useMemo(() => {
    if (recipientId) {
      return recipientBySourceAccount?.recipients?.find((recipient) => recipient?.id === recipientId);
    }

    return null;
  }, [recipientId, recipientBySourceAccount]);

  return (
    <div className='h-screen overflow-y-scroll pt-20'>
      <div className='max-w-75 m-auto'>
        <div className='f-22-550 mb-5'>Who are you paying?</div>
        <div className='flex flex-col gap-5'>
          <SelectBeneDropdown
            autoFocus={currentStep === 1 || !!recipientId}
            disabled={!!recipientId || !!templateDetails}
            defaultSelectedRecipient={selectedBeneficiary ?? recipientDetails}
            onSelect={handleBeneficiarySelect}
            shouldReset={reset}
            isLoading={isRecipientBySourceAccountLoading}
            templateDetails={templateDetails}
            recipientList={recipientBySourceAccount?.recipients ?? []}
          />
          {recipientDetails && (
            <SelectAccountDropdown
              autoFocus
              accountsList={recipientDetails?.accounts ?? []}
              shouldReset={reset}
              accountDetails={destinationAccountDetails}
              onAccountSelect={handleAccountSelect}
              label='Recipient account'
              disabled={!!templateDetails}
            />
          )}
          {destinationAccountDetails?.account_name && (
            <div className='flex flex-col gap-4'>
              <div className='grid grid-cols-2'>
                <div className='f-12-400 text-GRAY_700'>Bank name</div>
                <div className='f-12-450 whitespace-no-wrap'>{destinationAccountDetails?.bank_name}</div>
              </div>
              <div className='grid grid-cols-2'>
                <div className='f-12-400 text-GRAY_700'>Account number</div>
                <div className='f-12-450 whitespace-no-wrap'>{destinationAccountDetails?.account_number}</div>
              </div>
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
