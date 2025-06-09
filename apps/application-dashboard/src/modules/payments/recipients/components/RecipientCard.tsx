import { FC } from 'react';
import { RECIPIENT_CARD_ACTION_ITEMS } from 'modules/payments/payments.constant';
import { MOVE_MONEY_ACTION_TYPE, MOVE_MONEY_TYPE } from 'modules/payments/payments.types';
import { useRouter } from 'next/navigation';
import { SIZE_TYPES } from 'types/common/components';
import { Button } from '@/components/common/button/Button';
import TooltipV2 from '@/components/common/TooltipV2';
import { ROUTES_PATH } from '@/constants/routeConfig';
import { RecipientDetailsType } from '@/types/api/paymentApi.types';
import { BUTTON_TYPES } from '@/types/components/button.type';
import { getFirstLetters } from '@/utils/common';

type RecipientCardProps = {
  recipient: RecipientDetailsType;
  onAddRecipientAccount: (recipientDetails: RecipientDetailsType) => void;
  allowActions?: boolean;
};

const RecipientCard: FC<RecipientCardProps> = ({ recipient, onAddRecipientAccount, allowActions = true }) => {
  const router = useRouter();

  const handleActionClick = (action: MOVE_MONEY_ACTION_TYPE, e?: React.MouseEvent<HTMLButtonElement>) => {
    e?.stopPropagation();

    switch (action) {
      case MOVE_MONEY_ACTION_TYPE.ADD_ACCOUNT:
        onAddRecipientAccount(recipient);
        break;
      case MOVE_MONEY_ACTION_TYPE.FILTER_PAYMENTS:
        //filter payments
        break;
      case MOVE_MONEY_ACTION_TYPE.SEND_MONEY:
        router.push(
          `${ROUTES_PATH.MONEY_TRANSFER}?type=${MOVE_MONEY_TYPE.SINGLE_TRANSFER}&recipientId=${recipient?.id}`,
        );
        break;
    }
  };

  return (
    <div className='hover:bg-GRAY_50 group flex cursor-pointer items-center justify-between rounded-md px-1.5 py-1 hover:z-50'>
      <div className='flex items-center gap-1.5'>
        <div className='bg-BLUE_200 f-12-500 flex h-6 w-6 items-center justify-center rounded-full'>
          {getFirstLetters(recipient?.name, 1)}
        </div>
        <div>
          <div className='f-13-500'>{recipient?.name}</div>
          <div className='f-11-400 text-GRAY_700'>{recipient?.email}</div>
        </div>
      </div>
      <div className='flex items-center gap-2.5'>
        <div className='f-11-400 text-GRAY_700 group-hover:text-GRAY_900'>
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
        {allowActions &&
          RECIPIENT_CARD_ACTION_ITEMS.map((item) => (
            <TooltipV2 key={item?.id} tooltipBody={item?.tooltipBody}>
              <Button
                type={BUTTON_TYPES.SECONDARY}
                id='recipient-card-action'
                size={SIZE_TYPES.XSMALL}
                className='hover:!bg-GRAY_300 border-none bg-transparent!'
                iconProps={item?.icon}
                onClick={(e) => handleActionClick(item?.action, e)}
              />
            </TooltipV2>
          ))}
      </div>
    </div>
  );
};

export default RecipientCard;
