import React, { FC, useState } from 'react';
import RecipientCard from 'modules/payments/recipients/components/RecipientCard';
import { SIZE_TYPES } from 'types/common/components';
import { defaultFnType } from 'types/commonTypes';
import { BUTTON_TYPES, ICON_POSITION_TYPES } from 'types/components/button.type';
import { useGetRecipientListQuery } from '@/apis/payments';
import CommonWrapper from '@/components/commonWrapper';
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

  return (
    <div className='py-6 px-4.5'>
      <div className='w-full flex items-center justify-between'>
        <div className='f-16-600 mb-4'>Recipients</div>
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
        placeholder='Search...'
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className='mb-4'
        inputClassName='!border-none !px-0 focus:outline-none'
        focusClassNames=''
      />
      <CommonWrapper
        isLoading={isLoading}
        isError={isError}
        noDataBanner={<div className='tw-text-GRAY_900 f-12-500 px-2.5 py-2'>No recipients found</div>}
      >
        <div className='flex flex-col gap-2'>
          {recipientList?.map((recipient) => (
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
