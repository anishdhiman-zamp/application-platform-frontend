import { ChangeEvent, FC, useEffect, useMemo, useRef, useState } from 'react';
import SelectAccountDropdown from 'modules/payments/move-money/components/SelectAccountDropdown';
import { accountsList, PAYMENT_PROCESSING_MODES } from 'modules/payments/move-money/move-money.dummy';
import { moveMoneyContextActions, useMoveMoneyContextStore } from 'modules/payments/move-money/moveMoney.context';
import { AccountDetailsType, TemplateDetailsType } from 'modules/payments/payments.types';
import { SIZE_TYPES } from 'types/common/components';
import { defaultFn } from 'types/commonTypes';
import { BUTTON_TYPES } from 'types/components/button.type';
import { getCommaSeparatedNumberForInput } from 'utils/common';
import { COMMA_SEPARATED_NUMBER_REGEX } from 'utils/regex';
import { Button } from 'components/common/button/Button';
import { Dropdown } from 'components/common/dropdown';
import Input from 'components/common/input';

interface AmountDetailsStepProps {
  isSelfTransfer: boolean;
  handleStepChange: (step: number) => void;
  templateDetails?: TemplateDetailsType;
}

const AmountDetailsStep: FC<AmountDetailsStepProps> = ({
  isSelfTransfer,
  handleStepChange,
  templateDetails: defaultTemplate,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const {
    dispatch,
    state: { amountDetails, currentStep, destinationAccountDetails, templateDetails },
  } = useMoveMoneyContextStore();
  const isActiveStep = useMemo(() => currentStep === 1, [currentStep]);
  const [amount, setAmount] = useState(amountDetails?.amount);
  const [paymentProcessingMode, setPaymentProcessingMode] = useState(PAYMENT_PROCESSING_MODES[0]);
  const [accountDetails, setAccountDetails] = useState<AccountDetailsType | undefined>(
    amountDetails?.sourceAccountDetails,
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

  const handleAccountSelect = (account: AccountDetailsType) => setAccountDetails(account);

  const onNextClick = () => {
    if (amount && accountDetails) {
      dispatch({
        type: moveMoneyContextActions.AMOUNT_DETAILS,
        payload: {
          amountDetails: {
            amount,
            sourceAccountDetails: accountDetails,
            processingMode: paymentProcessingMode,
            currency: { label: 'USD', value: 'USD' },
          },
        },
      });

      handleStepChange(currentStep + 1);
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
        <div className='f-22-550'>{isSelfTransfer ? 'Transfer details' : 'How much are you sending?'}</div>
        {isSelfTransfer && (
          <SelectAccountDropdown
            autoFocus
            accountsList={accountsList}
            shouldReset={false}
            accountDetails={destinationAccountDetails}
            onAccountSelect={handleDestinationAccountSelect}
            label='Recipient account'
          />
        )}
        <div className='flex gap-3 items-baseline'>
          <Input
            autoFocus={!isSelfTransfer}
            tabIndex={isActiveStep ? 0 : -1}
            id='search'
            inputRef={inputRef}
            size={SIZE_TYPES.MEDIUM}
            value={getCommaSeparatedNumberForInput(amount)}
            onChange={handleAmountChange}
            className='f-16-300 grow'
            placeholder='Amount'
            inputFontClassName='!px-3 placeholder:text-base bg-white placeholder:!text-GRAY_500 placeholder:text-[13px] w-full'
            inputWrapperClassName='w-full '
          />
          <div className='border border-GRAY_400 rounded-md f-13-450 p-3 flex items-center justify-center'>USD</div>
        </div>
        <SelectAccountDropdown
          accountsList={accountsList}
          shouldReset={false}
          accountDetails={defaultTemplate?.details[0]?.source_account ?? accountDetails}
          onAccountSelect={handleAccountSelect}
          label='Send from'
          disabled={!!templateDetails}
        />
        {defaultTemplate && (
          <SelectAccountDropdown
            hasSubtitle
            accountsList={accountsList}
            shouldReset={false}
            accountDetails={defaultTemplate?.details[0]?.beneficiary_account}
            onAccountSelect={handleAccountSelect}
            label='Recipient'
            disabled={!!templateDetails}
          />
        )}

        <div className='w-full'>
          <div className='f-12-500 text-GRAY_900 mb-2'>Payment processing mode</div>
          <Dropdown
            options={PAYMENT_PROCESSING_MODES}
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
        </div>
      </div>
      <div className='flex gap-3 mt-10'>
        <Button
          type={BUTTON_TYPES.SECONDARY}
          size={SIZE_TYPES.MEDIUM}
          id='MOVE_MONEY_AMOUNT_DETAILS_BACK'
          onClick={() => handleStepChange(currentStep - 1)}
          disabled={isSelfTransfer}
        >
          Back
        </Button>
        <Button
          size={SIZE_TYPES.MEDIUM}
          id='MOVE_MONEY_AMOUNT_DETAILS_NEXT'
          onClick={onNextClick}
          disabled={!amount || !accountDetails}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default AmountDetailsStep;
