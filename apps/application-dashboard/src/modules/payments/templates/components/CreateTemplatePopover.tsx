import { FC, useState } from 'react';
import SelectBeneDropdown from 'modules//payments/move-money/components/SelectBeneDropdown';
import SelectAccountDropdown from 'modules/payments/move-money/components/SelectAccountDropdown';
import { accountsList } from 'modules/payments/move-money/move-money.dummy';
import { defaultAccountData } from 'modules/payments/payments.constant';
import { AccountDetailsType, MOVE_MONEY_TYPE } from 'modules/payments/payments.types';
import { TITLE_MAP } from 'modules/payments/templates/templates.constant';
import Input from '@/components/common/input';
import Dialogue from '@/components/common/popup/Dialogue';
import SvgSpriteLoader from '@/components/SvgSpriteLoader';
import { COLORS } from '@/constants/colors';
import { MenuItem, SIZE_TYPES } from '@/types/common/components';
import { defaultFnType } from '@/types/commonTypes';

type CreateTemplatePopoverProps = {
  isOpen: boolean;
  onClose: defaultFnType;
  paymentType: MOVE_MONEY_TYPE;
};

const CreateTemplatePopover: FC<CreateTemplatePopoverProps> = ({ isOpen, onClose, paymentType }) => {
  const [destinationAccountDetails, setDestinationAccountDetails] = useState<AccountDetailsType>(defaultAccountData);
  const [sourceAccountDetails, setSourceAccountDetails] = useState<AccountDetailsType>(defaultAccountData);
  const [recipientDetails, setRecipientDetails] = useState<MenuItem>();
  const [templateName, setTemplateName] = useState<string>('');

  const handleSubmit = () => {
    console.log(destinationAccountDetails, sourceAccountDetails, recipientDetails);
  };

  const isSingleTransfer = paymentType === MOVE_MONEY_TYPE.SINGLE_TRANSFER;

  return (
    <div>
      <Dialogue
        isOpen={isOpen}
        onClose={onClose}
        title={TITLE_MAP[paymentType as keyof typeof TITLE_MAP] ?? ''}
        titleClassName='f-16-600 text-GRAY_950'
        nextButtonTitle='Create'
        backButtonTitle='Discard'
        childrenClassName='mt-12'
        wrapperClassName='w-[1000px]'
        onCancel={onClose}
        onSubmit={handleSubmit}
        closeOnClickOutside={false}
      >
        <div className='flex flex-col gap-5 w-[300px] mx-auto min-h-[600px]'>
          <div className='flex items-end gap-2'>
            <Input
              id='ADD_ACCOUNT_SEARCH_BANK'
              size={SIZE_TYPES.LARGE}
              autoFocus
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              focusClassNames=''
              placeholder='New Template'
              inputWrapperClassName='border-b border-dashed border-GRAY_1000'
              inputFontClassName='f-22-550 !px-0 !pb-0 font-medium'
            />
            <SvgSpriteLoader id='edit-03' className='pl-10' size={14} color={COLORS.GRAY_900} />
          </div>
          {isSingleTransfer && (
            <SelectBeneDropdown
              onSelect={(recipient: MenuItem) => setRecipientDetails(recipient)}
              shouldReset={false}
              label='Recipient'
              showTemplate={false}
            />
          )}
          <SelectAccountDropdown
            accountsList={accountsList}
            shouldReset={false}
            accountDetails={destinationAccountDetails}
            onAccountSelect={(account: AccountDetailsType) => setDestinationAccountDetails(account)}
            label={isSingleTransfer ? 'Recipient account' : 'Destination account'}
          />
          <SelectAccountDropdown
            accountsList={accountsList}
            shouldReset={false}
            accountDetails={sourceAccountDetails}
            onAccountSelect={(account: AccountDetailsType) => setSourceAccountDetails(account)}
            label='Source account'
          />
        </div>
      </Dialogue>
    </div>
  );
};

export default CreateTemplatePopover;
