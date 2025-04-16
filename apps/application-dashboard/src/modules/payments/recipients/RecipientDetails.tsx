import { FC } from 'react';
import RecipientAccountCard from 'modules/payments/recipients/components/RecipientAccountCard';
import { SIZE_TYPES } from 'types/common/components';
import { defaultFnType } from 'types/commonTypes';
import { BUTTON_TYPES, ICON_POSITION_TYPES } from 'types/components/button.type';
import CommonWrapper from '@/components/commonWrapper';
import { RecipientDetailsType } from '@/types/api/paymentApi.types';
import { getFirstLetters } from '@/utils/common';
import { Button } from 'components/common/button/Button';
import SvgSpriteLoader from 'components/SvgSpriteLoader';
type RecipientDetailsProps = {
  onBack: defaultFnType;
  recipientDetails: RecipientDetailsType;
};

const RecipientDetails: FC<RecipientDetailsProps> = ({ onBack, recipientDetails }) => {
  return (
    <div className='px-4.5 py-6.5 flex flex-col gap-8 overflow-y-scroll'>
      <div className='flex items-center gap-3 '>
        <SvgSpriteLoader id='arrow-narrow-left' size={14} onClick={onBack} />
        <div className='flex items-center gap-2.5'>
          <div className='w-6 h-6 flex items-center justify-center rounded-full bg-BLUE_200 f-12-500'>
            {getFirstLetters(recipientDetails?.name, 1)}
          </div>
          <div>
            <div className='f-16-600'>{recipientDetails?.name}</div>
            <div className='f-11-400 text-GRAY_700'>{recipientDetails?.email}</div>
          </div>
        </div>
      </div>
      <CommonWrapper>
        <div className='flex flex-col gap-2.5'>
          {recipientDetails?.recipient_details.map((recipientDetails, index) => (
            <div key={index} className='flex items-center gap-4'>
              <div className='f-12-400 text-GRAY_700 w-[150px]'>{recipientDetails.label}</div>
              <div className='f-11-400'>{recipientDetails.value}</div>
            </div>
          ))}
        </div>
        <div className='flex flex-col gap-3'>
          <div className=' flex justify-between items-center f-13-500'>
            Accounts
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
          {recipientDetails?.accounts?.map((account, index) => <RecipientAccountCard key={index} account={account} />)}
        </div>
      </CommonWrapper>
    </div>
  );
};

export default RecipientDetails;
