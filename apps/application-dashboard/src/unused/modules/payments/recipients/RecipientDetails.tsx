import { FC } from 'react';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { useRouter } from 'next/navigation';
import { SIZE_TYPES } from 'types/common/components';
import { defaultFnType } from 'types/commonTypes';
import { BUTTON_TYPES, ICON_POSITION_TYPES } from 'types/components/button.type';
import TooltipV2 from '@/components/common/TooltipV2';
import CommonWrapper from '@/components/commonWrapper';
import { ROUTES_PATH } from '@/constants/routeConfig';
import { RecipientDetailsType } from '@/unused/apis/paymentApi.types';
import { MOVE_MONEY_TYPE } from '@/unused/modules/payments/payments.types';
import RecipientAccountCard from '@/unused/modules/payments/recipients/components/RecipientAccountCard';
import { getFirstLetters } from '@/utils/common';
import { Button } from 'components/common/button/Button';
type RecipientDetailsProps = {
  onBack: defaultFnType;
  recipientDetails: RecipientDetailsType;
  onAddRecipientAccount: defaultFnType;
  allowActions?: boolean;
};

const RecipientDetails: FC<RecipientDetailsProps> = ({
  onBack,
  recipientDetails,
  onAddRecipientAccount,
  allowActions = true,
}) => {
  const router = useRouter();

  const handleSendMoney = () => {
    router.push(
      `${ROUTES_PATH.MONEY_TRANSFER}?type=${MOVE_MONEY_TYPE.SINGLE_TRANSFER}&recipientId=${recipientDetails?.id}`,
    );
  };

  return (
    <div className='flex flex-col gap-8 py-6.5 pr-2 pl-4.5'>
      <div className='flex items-center gap-3'>
        <SvgSpriteLoader id='arrow-narrow-left' size={14} onClick={onBack} />
        <div className='flex grow items-center gap-2.5'>
          <div className='bg-BLUE_200 f-12-500 flex h-6 w-6 items-center justify-center rounded-full'>
            {getFirstLetters(recipientDetails?.name, 1)}
          </div>
          <div className='f-16-600'>{recipientDetails?.name}</div>
        </div>
        <TooltipV2 tooltipBody='Filter payment'>
          <Button
            type={BUTTON_TYPES.SECONDARY}
            id='recipient-card-action'
            size={SIZE_TYPES.XSMALL}
            className='hidden'
            iconProps={{ id: 'filter-lines', size: 14 }}
            onClick={handleSendMoney}
          />
        </TooltipV2>
        {allowActions && (
          <Button
            id='send-money'
            onClick={handleSendMoney}
            className='px-3!'
            iconProps={{
              id: 'send-03',
              size: 14,
            }}
            iconPosition={ICON_POSITION_TYPES.LEFT}
            size={SIZE_TYPES.XSMALL}
          >
            Send money
          </Button>
        )}
      </div>
      <CommonWrapper>
        <div className=''>
          <div className='f-13-500 mb-2.5'>Recipient details</div>
          <div className='flex flex-col gap-2.5'>
            {recipientDetails?.recipient_details?.map((recipientDetails, index) => (
              <div key={index} className='flex items-center gap-4'>
                <div className='f-12-400 text-GRAY_700 w-[150px]'>{recipientDetails.label}</div>
                <div className='f-11-400'>{recipientDetails?.value}</div>
              </div>
            ))}
          </div>
          <div className='mt-8 flex flex-col gap-3'>
            <div className='f-13-500 flex items-center justify-between'>
              Accounts ({recipientDetails?.accounts?.length})
              {allowActions && (
                <Button
                  id='add-account'
                  size={SIZE_TYPES.XSMALL}
                  type={BUTTON_TYPES.SECONDARY}
                  iconPosition={ICON_POSITION_TYPES.LEFT}
                  iconProps={{
                    id: 'plus',
                    size: 14,
                  }}
                  // this onClick is intentional to not pass any arguments to the function
                  onClick={() => onAddRecipientAccount()}
                >
                  Add
                </Button>
              )}
            </div>
            {recipientDetails?.accounts?.map((account, index) => (
              <RecipientAccountCard key={index} account={account} />
            ))}
          </div>
        </div>
      </CommonWrapper>
    </div>
  );
};

export default RecipientDetails;
