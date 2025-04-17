import { FC } from 'react';
import { MOVE_MONEY_TYPE } from 'modules/payments/payments.types';
import RecipientAccountCard from 'modules/payments/recipients/components/RecipientAccountCard';
import { useRouter } from 'next/router';
import { SIZE_TYPES } from 'types/common/components';
import { defaultFnType } from 'types/commonTypes';
import { BUTTON_TYPES, ICON_POSITION_TYPES } from 'types/components/button.type';
import CommonWrapper from '@/components/commonWrapper';
import { ROUTES_PATH } from '@/constants/routeConfig';
import { RecipientDetailsType } from '@/types/api/paymentApi.types';
import { getFirstLetters } from '@/utils/common';
import { Button } from 'components/common/button/Button';
import SvgSpriteLoader from 'components/SvgSpriteLoader';
type RecipientDetailsProps = {
  onBack: defaultFnType;
  recipientDetails: RecipientDetailsType;
};

const RecipientDetails: FC<RecipientDetailsProps> = ({ onBack, recipientDetails }) => {
  const router = useRouter();

  const handleSendMoney = () => {
    router.push({
      pathname: ROUTES_PATH.MONEY_TRANSFER,
      query: {
        type: MOVE_MONEY_TYPE.SINGLE_TRANSFER,
        recipientId: recipientDetails?.id,
      },
    });
  };

  return (
    <div className='px-4.5 py-6.5 flex flex-col gap-8 overflow-y-scroll'>
      <div className='flex items-center gap-3 '>
        <SvgSpriteLoader id='arrow-narrow-left' size={14} onClick={onBack} />
        <div className='flex items-center gap-2.5 grow'>
          <div className='w-6 h-6 flex items-center justify-center rounded-full bg-BLUE_200 f-12-500'>
            {getFirstLetters(recipientDetails?.name, 1)}
          </div>
          <div className='f-16-600'>{recipientDetails?.name}</div>
        </div>
        <Button
          id='send-money'
          onClick={handleSendMoney}
          className='!px-3'
          iconProps={{
            id: 'send-03',
            size: 14,
          }}
          iconPosition={ICON_POSITION_TYPES.LEFT}
          size={SIZE_TYPES.XSMALL}
        >
          Send money
        </Button>
      </div>
      <CommonWrapper>
        <div className=''>
          <div className='f-13-500 mb-2.5'>Recipient details</div>
          <div className='flex flex-col gap-2.5'>
            {recipientDetails?.recipient_details.map((recipientDetails, index) => (
              <div key={index} className='flex items-center gap-4'>
                <div className='f-12-400 text-GRAY_700 w-[150px]'>{recipientDetails?.label}</div>
                <div className='f-11-400'>{recipientDetails?.value}</div>
              </div>
            ))}
          </div>
          <div className='flex flex-col gap-3 mt-8'>
            <div className=' flex justify-between items-center f-13-500'>
              Accounts ({recipientDetails?.accounts?.length})
              <Button
                id='add-account'
                size={SIZE_TYPES.XSMALL}
                type={BUTTON_TYPES.SECONDARY}
                iconPosition={ICON_POSITION_TYPES.LEFT}
                iconProps={{
                  id: 'plus',
                  size: 14,
                }}
              >
                Add
              </Button>
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
