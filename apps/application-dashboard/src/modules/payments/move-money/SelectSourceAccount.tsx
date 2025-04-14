import { FC } from 'react';
import SelectAccountDropdown from 'modules/payments/move-money/components/SelectAccountDropdown';
import { accountsList } from 'modules/payments/move-money/move-money.dummy';
import { moveMoneyContextActions, useMoveMoneyContextStore } from 'modules/payments/move-money/moveMoney.context';
import { AccountDetailsType } from 'modules/payments/payments.types';
import { Button } from '@/components/common/button/Button';
import { SIZE_TYPES } from '@/types/common/components';
import { BUTTON_TYPES } from '@/types/components/button.type';

type SelectSourceAccountProps = {
  handleStepChange: (step: number) => void;
};

const SelectSourceAccount: FC<SelectSourceAccountProps> = ({ handleStepChange }) => {
  const {
    dispatch,
    state: { sourceAccountDetails, currentStep, templateDetails },
  } = useMoveMoneyContextStore();

  const handleSourceAccountSelect = (account: AccountDetailsType) => {
    dispatch({
      type: moveMoneyContextActions.SOURCE_ACCOUNT_DETAILS,
      payload: {
        sourceAccountDetails: account,
      },
    });
  };

  return (
    <div className='h-screen overflow-y-scroll pt-34'>
      <div className='max-w-75 m-auto'>
        <div className='f-22-550 mb-5'>Where are you paying from?</div>
        <div className='flex flex-col gap-5'>
          <SelectAccountDropdown
            autoFocus
            accountsList={accountsList}
            shouldReset={false}
            accountDetails={sourceAccountDetails}
            onAccountSelect={handleSourceAccountSelect}
            label='Send from'
            disabled={!!templateDetails}
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
