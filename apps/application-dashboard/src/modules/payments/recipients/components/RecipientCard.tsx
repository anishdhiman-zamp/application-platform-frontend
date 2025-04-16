import { FC } from 'react';
import { RECIPIENT_CARD_ACTION_ITEMS } from 'modules/payments/payments.constant';
import { SIZE_TYPES } from 'types/common/components';
import { Button } from '@/components/common/button/Button';
import TooltipV2 from '@/components/common/TooltipV2';
import { RecipientDetailsType } from '@/types/api/paymentApi.types';
import { BUTTON_TYPES } from '@/types/components/button.type';
import { getFirstLetters } from '@/utils/common';

type RecipientCardProps = {
  recipient: RecipientDetailsType;
};

const RecipientCard: FC<RecipientCardProps> = ({ recipient }) => {
  return (
    <div className='flex items-center justify-between px-1.5 py-1 hover:bg-GRAY_50 cursor-pointer rounded-md hover:z-50'>
      <div className='flex items-center gap-1.5'>
        <div className='w-6 h-6 flex items-center justify-center rounded-full bg-BLUE_200 f-12-500'>
          {getFirstLetters(recipient.recipient.name, 1)}
        </div>
        <div>
          <div className='f-12-500'>{recipient.recipient.name}</div>
          <div className='f-11-400 text-GRAY_700'>{recipient.recipient.email}</div>
        </div>
      </div>
      <div className='flex items-center gap-2.5'>
        <div className='f-11-400'>
          <TooltipV2
            tooltipBody={
              <div>
                {recipient?.accounts?.map((account) => (
                  <div key={account?.masked_account_number}>
                    <p>{account?.masked_account_number}</p>
                  </div>
                ))}
              </div>
            }
          >
            <p>{recipient?.accounts?.length} Accounts</p>
          </TooltipV2>
        </div>
        {RECIPIENT_CARD_ACTION_ITEMS.map((item) => (
          <TooltipV2 key={item?.id} tooltipBody={item?.tooltipBody}>
            <Button
              type={BUTTON_TYPES.SECONDARY}
              id='recipient-card-action'
              size={SIZE_TYPES.XSMALL}
              className='border-none'
              iconProps={item?.icon}
            />
          </TooltipV2>
        ))}
      </div>
    </div>
  );
};

export default RecipientCard;
