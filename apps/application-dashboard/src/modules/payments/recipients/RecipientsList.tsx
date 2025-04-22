import React, { FC, useMemo, useState } from 'react';
import RecipientCard from 'modules/payments/recipients/components/RecipientCard';
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
};

const RecipientsList: FC<RecipientsListProps> = ({ onRecipientDetails, onAddRecipient }) => {
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
    <div className='py-6 pl-4.5 pr-2'>
      <div className='w-full flex items-center justify-between mb-4.5'>
        <div className='f-16-600'>Recipients</div>
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
      </div>
      <Input
        type='text'
        placeholder='Search by name, account name, or last 4 digits of account number'
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className='mb-4'
        inputClassName='!border-none !px-0 focus:outline-none placeholder:text-xs'
        focusClassNames=''
      />
      <CommonWrapper
        isLoading={isLoading}
        isError={isError}
        noDataBanner={<div className='tw-text-GRAY_900 f-12-500 px-2.5 py-2'>No recipients found</div>}
        skeletonType={SkeletonTypes.CUSTOM}
        loader={
          <div className='flex flex-col gap-2'>
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className='w-full h-9 bg-GRAY_200 rounded-md animate-pulse' />
            ))}
          </div>
        }
      >
        <div className='flex flex-col gap-2'>
          {filteredRecipientList?.map((recipient) => (
            <div
              key={recipient.id}
              onClick={() => onRecipientDetails(recipient)}
              className='hover:z-1000 cursor-pointer'
            >
              <RecipientCard recipient={recipient} />
            </div>
          ))}
        </div>
      </CommonWrapper>
    </div>
  );
};

export default RecipientsList;
