import React, { FC, useMemo, useState } from 'react';
import RecipientCard from 'modules/payments/recipients/components/RecipientCard';
import RecipientCardSkeleton from 'modules/payments/recipients/components/RecipientCardSkeleton';
import { SIZE_TYPES } from 'types/common/components';
import { defaultFnType } from 'types/commonTypes';
import { BUTTON_TYPES, ICON_POSITION_TYPES } from 'types/components/button.type';
import { useGetRecipientListQuery } from '@/apis/payments';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import { RecipientDetailsType } from '@/types/api/paymentApi.types';
import { Button } from 'components/common/button/Button';
import Input from 'components/common/input';

type RecipientsListProps = {
  onRecipientDetails: (recipientDetails: RecipientDetailsType) => void;
  onAddRecipient: defaultFnType;
  onAddRecipientAccount: (recipientDetails: RecipientDetailsType) => void;
  allowActions?: boolean;
};

const RecipientsList: FC<RecipientsListProps> = ({
  onRecipientDetails,
  onAddRecipient,
  onAddRecipientAccount,
  allowActions = true,
}) => {
  const [search, setSearch] = useState('');

  const {
    data: recipientList,
    isLoading,
    isError,
  } = useGetRecipientListQuery(undefined, {
    refetchOnMountOrArgChange: false,
  });

  const filteredRecipientList = useMemo(
    () =>
      recipientList?.filter(
        (recipient) =>
          recipient?.name?.toLowerCase().includes(search.toLowerCase()) ||
          recipient?.email?.toLowerCase().includes(search.toLowerCase()) ||
          recipient?.accounts?.some((account) =>
            account?.masked_account_number?.toLowerCase().includes(search.toLowerCase()),
          ),
      ),
    [recipientList, search],
  );

  return (
    <div className='pl-4.5 py-6 pr-2'>
      <div className='mb-4.5 flex w-full items-center justify-between'>
        <div className='f-16-600 px-1.5'>Recipients</div>
        {allowActions && (
          <Button
            size={SIZE_TYPES.SMALL}
            type={BUTTON_TYPES.SECONDARY}
            iconPosition={ICON_POSITION_TYPES.LEFT}
            id='add-recipient'
            onClick={onAddRecipient}
            iconProps={{
              id: 'plus',
              size: 14,
            }}
          >
            Add
          </Button>
        )}
      </div>
      <Input
        autoFocus
        type='text'
        placeholder='Search by name, account name, or last 4 digits of account number'
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className='mb-3.5 px-1.5'
        inputClassName='border-none! px-0! focus:outline-hidden placeholder:text-xs py-0! h-6! placeholder:!text-GRAY_500'
        focusClassNames=''
      />
      <CommonWrapper
        isLoading={isLoading}
        isError={isError}
        isNoData={filteredRecipientList?.length === 0}
        noDataBanner={<div className='tw-text-GRAY_900 f-12-500 px-2.5 py-2'>No recipients found</div>}
        skeletonType={SkeletonTypes.CUSTOM}
        loader={<RecipientCardSkeleton />}
      >
        <div className='flex flex-col gap-2'>
          {filteredRecipientList?.map((recipient) => (
            <div
              key={recipient.id}
              onClick={() => onRecipientDetails(recipient)}
              className='hover:z-1000 cursor-pointer'
            >
              <RecipientCard
                recipient={recipient}
                allowActions={allowActions}
                onAddRecipientAccount={onAddRecipientAccount}
              />
            </div>
          ))}
        </div>
      </CommonWrapper>
    </div>
  );
};

export default RecipientsList;
