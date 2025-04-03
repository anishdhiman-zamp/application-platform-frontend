import { useEffect, useMemo, useRef, useState } from 'react';
import SelectAccountDropdown from 'modules/payments/move-money/components/SelectAccountDropdown';
import {
  accountsListWithBalance,
  currencyList,
  PAYMENT_PROCESSING_MODES,
} from 'modules/payments/move-money/move-money.dummy';
import { moveMoneyContextActions, useMoveMoneyContextStore } from 'modules/payments/move-money/moveMoney.context';
import { AccountDetailsType } from 'modules/payments/payments.types';
import { SIZE_TYPES } from 'types/common/components';
import { defaultFn } from 'types/commonTypes';
import { BUTTON_TYPES } from 'types/components/button.type';
import { getCommaSeparatedNumberForInput } from 'utils/common';
import { COMMA_SEPARATED_NUMBER_REGEX } from 'utils/regex';
import { Button } from 'components/common/button/Button';
import { Dropdown } from 'components/common/dropdown';
import Input from 'components/common/input';

const AmountDetailsStep = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const {
    dispatch,
    state: { amountDetails, currentStep },
  } = useMoveMoneyContextStore();
  const isActiveStep = useMemo(() => currentStep === 1, [currentStep]);
  const [amount, setAmount] = useState(amountDetails?.amount);
  const [currency, setCurrency] = useState(currencyList[0]);
  const [paymentProcessingMode, setPaymentProcessingMode] = useState(PAYMENT_PROCESSING_MODES[0]);
  const [accountDetails, setAccountDetails] = useState<AccountDetailsType>(amountDetails?.sourceAccountDetails);

  const handleStepChange = (step: number) => {
    dispatch({
      type: moveMoneyContextActions.CURRENT_STEP,
      payload: {
        currentStep: step,
      },
    });
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (parseFloat(e?.target?.value.replaceAll(',', '')) < 0 || !e?.target?.value.match(COMMA_SEPARATED_NUMBER_REGEX))
      return;
    setAmount(e?.target?.value.replaceAll(',', '') || '');
  };

  const handleAccountSelect = (account: AccountDetailsType) => setAccountDetails(account);

  const handleNextClick = () => {
    if (amount && accountDetails) {
      dispatch({
        type: moveMoneyContextActions.AMOUNT_DETAILS,
        payload: {
          amountDetails: {
            amount,
            currency,
            sourceAccountDetails: accountDetails,
            processingMode: paymentProcessingMode,
          },
        },
      });

      handleStepChange(2);
    }
  };

  useEffect(() => {
    if (inputRef.current && isActiveStep)
      inputRef.current.focus({
        preventScroll: true,
      });
  }, [isActiveStep]);

  return (
    <div className='h-screen pt-34 w-75 m-auto'>
      <div className='flex flex-col gap-5'>
        <div className='f-22-550'>How much are you paying?</div>
        <div className='flex gap-3 items-baseline'>
          <Input
            tabIndex={isActiveStep ? 0 : -1}
            id='search'
            inputRef={inputRef}
            size={SIZE_TYPES.MEDIUM}
            value={getCommaSeparatedNumberForInput(amount)}
            onChange={handleAmountChange}
            className='f-16-300 grow'
            placeholder='Amount'
            inputWrapperClassName='w-full '
          />
          <div>
            <Dropdown
              options={currencyList}
              id='currency-dropdown'
              eventCallback={defaultFn}
              onChange={(selectedOption) => {
                setCurrency(selectedOption);
              }}
              value={currency}
              defaultValue={currency}
              placeholder='Currency'
              isSearchable={false}
              customClassNames={{
                placeholder: 'f-13-450',
              }}
              customDropdownIndicatorSize={14}
            />
          </div>
        </div>
        <SelectAccountDropdown
          accountsList={accountsListWithBalance}
          shouldReset={false}
          autoFocus={true}
          hasSubtitle={true}
          accountDetails={accountDetails}
          onAccountSelect={handleAccountSelect}
          label='Send from'
        />
        <div className='w-full'>
          <div className='f-12-500 text-GRAY_900 mb-2'>Payment processing mode</div>
          <Dropdown
            options={PAYMENT_PROCESSING_MODES}
            id={`payment-processing-mode-dropdown`}
            eventCallback={defaultFn}
            onChange={(selectedOption) => {
              setPaymentProcessingMode(selectedOption);
            }}
            value={paymentProcessingMode}
            defaultValue={paymentProcessingMode}
            placeholder='Payment processing mode'
            isSearchable={false}
            customClassNames={{
              placeholder: 'f-13-450 !w-75',
            }}
            menuOptionClasses={{
              contentWrapper: 'w-[260px]',
            }}
            customDropdownIndicatorSize={14}
          />
        </div>
      </div>
      <div className='flex gap-3 mt-10'>
        <Button
          type={BUTTON_TYPES.SECONDARY}
          size={SIZE_TYPES.MEDIUM}
          id='SELF_TRANSFER_AMOUNT_DETAILS_BACK'
          onClick={() => handleStepChange(0)}
        >
          Back
        </Button>
        <Button
          size={SIZE_TYPES.MEDIUM}
          id='SELF_TRANSFER_AMOUNT_DETAILS_NEXT'
          onClick={handleNextClick}
          disabled={!amount || !accountDetails}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default AmountDetailsStep;
