import { ChangeEvent, FC, useEffect, useMemo, useRef, useState } from 'react';
import SelectAccountDropdown from 'modules/payments/move-money/components/SelectAccountDropdown';
import { moveMoneyContextActions, useMoveMoneyContextStore } from 'modules/payments/move-money/moveMoney.context';
import { PAYMENT_PROCESSING_MODES } from 'modules/payments/payments.constant';
import { AccountDetailsType } from 'modules/payments/payments.types';
import { type MenuItem, SIZE_TYPES } from 'types/common/components';
import { defaultFn } from 'types/commonTypes';
import { BUTTON_TYPES } from 'types/components/button.type';
import { getCommaSeparatedNumberForInput } from 'utils/common';
import { COMMA_SEPARATED_NUMBER_REGEX } from 'utils/regex';
import { useGetDestinationAccountsQuery } from '@/apis/payments';
import { Button } from 'components/common/button/Button';
import { Dropdown } from 'components/common/dropdown';
import Input from 'components/common/input';

interface AmountDetailsStepProps {
  isSelfTransfer: boolean;
  handleStepChange: (step: number) => void;
}

const AmountDetailsStep: FC<AmountDetailsStepProps> = ({ isSelfTransfer, handleStepChange }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const {
    dispatch,
    state: { amountDetails, currentStep, destinationAccountDetails, sourceAccountDetails, templateDetails, reset },
  } = useMoveMoneyContextStore();
  const isActiveStep = useMemo(
    () => (isSelfTransfer ? currentStep === 1 : currentStep === 2),
    [currentStep, isSelfTransfer],
  );
  const [amount, setAmount] = useState(amountDetails?.amount);
  const [paymentProcessingMode, setPaymentProcessingMode] = useState<MenuItem>();

  const { data: destinationAccounts, isLoading } = useGetDestinationAccountsQuery(
    {
      source_account_id: sourceAccountDetails?.id ?? '',
    },
    { skip: !sourceAccountDetails?.id || !isSelfTransfer },
  );

  const handleDestinationAccountSelect = (account: AccountDetailsType) => {
    dispatch({
      type: moveMoneyContextActions.DESTINATION_ACCOUNT_DETAILS,
      payload: {
        destinationAccountDetails: account,
      },
    });
  };

  const handleAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (parseFloat(e?.target?.value.replaceAll(',', '')) < 0 || !e?.target?.value.match(COMMA_SEPARATED_NUMBER_REGEX))
      return;
    setAmount(e?.target?.value.replaceAll(',', '') || '');
  };

  const onNextClick = () => {
    if (amount) {
      dispatch({
        type: moveMoneyContextActions.AMOUNT_DETAILS,
        payload: {
          amountDetails: {
            amount,
            processingMode: paymentProcessingMode,
            currency: { label: sourceAccountDetails?.currency_code, value: sourceAccountDetails?.currency_code },
          },
        },
      });

      handleStepChange(currentStep + 1);
    }
  };

  useEffect(() => {
    if (inputRef.current && isActiveStep && !isSelfTransfer)
      inputRef.current?.focus({
        preventScroll: true,
      });
  }, [isActiveStep]);

  useEffect(() => {
    if (reset) {
      setAmount('');
    }
  }, [reset]);

  useEffect(() => {
    if (destinationAccountDetails?.currency_code) {
      setPaymentProcessingMode(
        PAYMENT_PROCESSING_MODES[
          destinationAccountDetails?.currency_code?.toUpperCase() as keyof typeof PAYMENT_PROCESSING_MODES
        ]?.[0],
      );
    }
  }, [destinationAccountDetails?.currency_code]);

  return (
    <div className='h-screen pt-20 w-75 m-auto'>
      <div className='flex flex-col gap-5'>
        <div className='f-22-550'>{isSelfTransfer ? 'Transfer details' : 'How much are you sending?'}</div>
        {isSelfTransfer && (
          <SelectAccountDropdown
            autoFocus={isActiveStep}
            accountsList={destinationAccounts?.accounts ?? []}
            isLoading={isLoading}
            disabled={!!templateDetails}
            shouldReset={false}
            accountDetails={destinationAccountDetails}
            onAccountSelect={handleDestinationAccountSelect}
            label='Transfer to'
          />
        )}
        <div className='flex gap-3 items-baseline'>
          <Input
            autoFocus={!isSelfTransfer}
            tabIndex={isActiveStep ? 0 : -1}
            id='search'
            inputRef={inputRef}
            size={SIZE_TYPES.MEDIUM}
            value={getCommaSeparatedNumberForInput(amount ?? '')}
            onChange={handleAmountChange}
            className='f-13-450 grow'
            placeholder='Amount'
            inputFontClassName='!px-3 placeholder:text-base bg-white placeholder:!text-GRAY_500 placeholder:text-[13px] w-full'
            inputWrapperClassName='w-full '
          />
          <div className='border border-GRAY_400 rounded-md f-13-450 p-3 flex items-center justify-center'>
            {sourceAccountDetails?.currency_code}
          </div>
        </div>
        <div className='w-full'>
          <div className='f-12-500 text-GRAY_900 mb-2'>Payment processing mode</div>
          {paymentProcessingMode && (
            <Dropdown
              options={
                PAYMENT_PROCESSING_MODES[
                  sourceAccountDetails?.currency_code?.toUpperCase() as keyof typeof PAYMENT_PROCESSING_MODES
                ]
              }
              id='payment-processing-mode-dropdown'
              eventCallback={defaultFn}
              onChange={setPaymentProcessingMode}
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
          )}
        </div>
      </div>
      <div className='flex gap-3 mt-10'>
        <Button
          type={BUTTON_TYPES.SECONDARY}
          size={SIZE_TYPES.MEDIUM}
          id='MOVE_MONEY_AMOUNT_DETAILS_BACK'
          onClick={() => handleStepChange(currentStep - 1)}
        >
          Back
        </Button>
        <Button
          size={SIZE_TYPES.MEDIUM}
          id='MOVE_MONEY_AMOUNT_DETAILS_NEXT'
          onClick={onNextClick}
          disabled={!amount || (isSelfTransfer && !destinationAccountDetails)}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default AmountDetailsStep;
