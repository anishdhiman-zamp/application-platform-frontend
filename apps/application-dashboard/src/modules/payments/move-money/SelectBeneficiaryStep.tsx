import { FC } from 'react';
import SelectAccountDropdown from 'modules/payments/move-money/components/SelectAccountDropdown';
import SelectBeneDropdown from 'modules/payments/move-money/components/SelectBeneDropdown';
import { accountsList } from 'modules/payments/move-money/move-money.dummy';
import { moveMoneyContextActions, useMoveMoneyContextStore } from 'modules/payments/move-money/moveMoney.context';
import { AccountDetailsType } from 'modules/payments/payments.types';
import { MenuItem, SIZE_TYPES } from 'types/common/components';
import { BUTTON_TYPES } from 'types/components/button.type';
import { snakeCaseToSentenceCase } from 'utils/common';
import { Button } from 'components/common/button/Button';

interface SelectBeneficiaryStepProps {
  handleStepChange: (step: number) => void;
}

const SelectBeneficiaryStep: FC<SelectBeneficiaryStepProps> = ({ handleStepChange }) => {
  const {
    state: { contactDetails, destinationAccountDetails, currentStep },
    dispatch,
  } = useMoveMoneyContextStore();

  const handleBeneficiarySelect = (account: MenuItem) => {
    dispatch({
      type: moveMoneyContextActions.CONTACT_DETAILS,
      payload: {
        contactDetails: account,
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
          <SelectBeneDropdown autoFocus={true} onSelect={handleBeneficiarySelect} shouldReset={false} />
          {contactDetails?.value && (
            <SelectAccountDropdown
              autoFocus
              accountsList={accountsList}
              shouldReset={false}
              accountDetails={destinationAccountDetails}
              onAccountSelect={handleAccountSelect}
              label='Recipient account'
            />
          )}
          {destinationAccountDetails?.account_name && (
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
            disabled
            type={BUTTON_TYPES.SECONDARY}
            size={SIZE_TYPES.MEDIUM}
            id='MOVE_MONEY_SELECT_BENEFICIARY_BACK'
          >
            Back
          </Button>
          <Button
            size={SIZE_TYPES.MEDIUM}
            id='MOVE_MONEY_SELECT_BENEFICIARY_NEXT'
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
