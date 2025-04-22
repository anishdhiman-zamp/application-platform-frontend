import { FC, useState } from 'react';
import DropdownToggle from 'modules/payments/move-money/components/DropdownToggle';
import { AccountDetailsType } from 'modules/payments/payments.types';
import SvgSpriteLoader from 'components/SvgSpriteLoader';

type RecipientAccountCardProps = {
  account: AccountDetailsType;
};

const RecipientAccountCard: FC<RecipientAccountCardProps> = ({ account }) => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  return (
    <div
      className='w-full rounded-md border border-BORDER_GRAY_400 overflow-hidden'
      onClick={() => setIsDetailsOpen((prev) => !prev)}
    >
      <div className='px-2 py-2.5 flex items-center gap-1.5 bg-BACKGROUND_GRAY_2 f-11-400 cursor-pointer select-none'>
        <SvgSpriteLoader id='bank' size={14} />
        <div className='grow'>Account Name {account?.masked_account_number}</div>
        <DropdownToggle isShowMenu={isDetailsOpen} setIsShowMenu={setIsDetailsOpen} />
      </div>
      {isDetailsOpen && (
        <div className='px-2.5 py-3 flex flex-col gap-3.5'>
          {account?.account_details?.map((detail, index) => (
            <div key={index} className='flex items-center gap-4'>
              <div className='f-12-400 text-GRAY_700 w-[150px]'>{detail.label}</div>
              <div className='f-11-400'>{detail.value}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecipientAccountCard;
