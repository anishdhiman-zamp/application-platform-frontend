import { FC, useState } from 'react';
import { toast } from 'react-toastify';
import SelectBeneDropdown from 'modules//payments/move-money/components/SelectBeneDropdown';
import SelectAccountDropdown from 'modules/payments/move-money/components/SelectAccountDropdown';
import { defaultAccountData } from 'modules/payments/payments.constant';
import { AccountDetailsType, MOVE_MONEY_TYPE } from 'modules/payments/payments.types';
import { TITLE_MAP } from 'modules/payments/templates/templates.constant';
import {
  useCreateTemplateMutation,
  useGetSourceAccountsQuery,
  useLazyGetDestinationAccountsQuery,
  useLazyGetRecipientBySourceAccountQuery,
} from '@/apis/payments';
import Input from '@/components/common/input';
import Dialogue from '@/components/common/popup/Dialogue';
import SvgSpriteLoader from '@/components/SvgSpriteLoader';
import { COLORS } from '@/constants/colors';
import { RecipientDetailsType } from '@/types/api/paymentApi.types';
import { SIZE_TYPES } from '@/types/common/components';
import { defaultFnType } from '@/types/commonTypes';

type CreateTemplatePopoverProps = {
  isOpen: boolean;
  onClose: defaultFnType;
  paymentType: MOVE_MONEY_TYPE;
};

const CreateTemplatePopover: FC<CreateTemplatePopoverProps> = ({ isOpen, onClose, paymentType }) => {
  const isSingleTransfer = paymentType === MOVE_MONEY_TYPE.SINGLE_TRANSFER;
  const [destinationAccountDetails, setDestinationAccountDetails] = useState<AccountDetailsType | undefined>();
  const [sourceAccountDetails, setSourceAccountDetails] = useState<AccountDetailsType | undefined>();
  const [recipientDetails, setRecipientDetails] = useState<RecipientDetailsType | undefined>();
  const [templateName, setTemplateName] = useState<string>('');
  const [destinationAccountList, setDestinationAccountList] = useState<AccountDetailsType[]>([]);

  const [createTemplate, { isLoading: isCreateTemplateLoading }] = useCreateTemplateMutation();
  const { data: sourceAccounts, isLoading } = useGetSourceAccountsQuery({}, { refetchOnMountOrArgChange: false });
  const [
    getRecipientBySourceAccount,
    { data: recipientBySourceAccount, isLoading: isRecipientBySourceAccountLoading },
  ] = useLazyGetRecipientBySourceAccountQuery();
  const [getDestinationAccounts, { isLoading: isDestinationAccountsLoading }] = useLazyGetDestinationAccountsQuery();

  const handleSubmit = () => {
    createTemplate({
      template_name: templateName,
      details: [
        {
          order: '1',
          source_account_id: sourceAccountDetails?.id ?? '',
          destination_account_id: destinationAccountDetails?.id ?? '',
        },
      ],
      description: 'NA',
      type: paymentType,
    })
      .unwrap()
      .then(() => {
        toast.success('Template created successfully');
        onClose();
      })
      .catch(() => {
        toast.error('Failed to create template');
      });
  };

  const handleSourceAccountSelect = (account: AccountDetailsType) => {
    setSourceAccountDetails(account);
    setDestinationAccountDetails(defaultAccountData);
    setDestinationAccountList([]);
    setRecipientDetails(undefined);
    if (!isSingleTransfer && account.id) {
      getDestinationAccounts({ source_account_id: account.id ?? '' })
        .unwrap()
        .then((res) => {
          setDestinationAccountList(res.accounts);
        });
    } else if (isSingleTransfer && account.id) {
      getRecipientBySourceAccount({ source_account_id: account.id ?? '' });
    }
  };

  const handleRecipientSelect = (recipient: RecipientDetailsType) => {
    setRecipientDetails(recipient);
    setDestinationAccountDetails(undefined);
    if (recipient?.accounts?.length) {
      setDestinationAccountList(recipient?.accounts ?? []);
    }
  };

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
        parentWrapperClassName='z-[1002]'
        onCancel={onClose}
        onSubmit={handleSubmit}
        closeOnClickOutside={false}
        isNextButtonLoading={isCreateTemplateLoading}
        isNextButtonDisabled={!destinationAccountDetails || !sourceAccountDetails || !templateName}
        nextButtonClassName='!min-w-[62px]'
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
          <SelectAccountDropdown
            accountsList={sourceAccounts?.accounts ?? []}
            shouldReset={false}
            accountDetails={sourceAccountDetails}
            onAccountSelect={handleSourceAccountSelect}
            label='Source account'
            isLoading={isLoading}
          />
          {sourceAccountDetails && isSingleTransfer && (
            <SelectBeneDropdown
              onSelect={handleRecipientSelect}
              defaultSelectedRecipient={recipientDetails}
              shouldReset={false}
              label='Recipient'
              showTemplate={false}
              recipientList={recipientBySourceAccount?.recipients ?? []}
              isLoading={isRecipientBySourceAccountLoading}
            />
          )}
          {((isSingleTransfer && recipientDetails) || !isSingleTransfer) && sourceAccountDetails && (
            <SelectAccountDropdown
              accountsList={destinationAccountList}
              shouldReset={false}
              accountDetails={destinationAccountDetails}
              onAccountSelect={(account: AccountDetailsType) => setDestinationAccountDetails(account)}
              label={isSingleTransfer ? 'Recipient account' : 'Destination account'}
              isLoading={isDestinationAccountsLoading || isRecipientBySourceAccountLoading}
            />
          )}
        </div>
      </Dialogue>
    </div>
  );
};

export default CreateTemplatePopover;
