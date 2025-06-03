import { FC, useState } from 'react';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import DropdownToggle from 'modules/payments/move-money/components/DropdownToggle';
import { AccountDetailsType } from 'modules/payments/payments.types';
import { cn } from '@/utils/common';

type RecipientAccountCardProps = {
  account: AccountDetailsType;
};

const RecipientAccountCard: FC<RecipientAccountCardProps> = ({ account }) => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  return (
    <div
      className='border-BORDER_GRAY_400 w-full overflow-hidden rounded-md border'
      onClick={() => setIsDetailsOpen((prev) => !prev)}
    >
      <div className='bg-BACKGROUND_GRAY_2 f-11-400 flex cursor-pointer select-none items-center gap-1.5 px-2 py-2.5'>
        <SvgSpriteLoader id='bank' size={14} />
        <div className='grow'>Account Name {account?.masked_account_number}</div>
        <DropdownToggle isShowMenu={isDetailsOpen} setIsShowMenu={setIsDetailsOpen} />
      </div>

      <div
        className={cn(
          'flex flex-col gap-3.5 overflow-hidden px-2.5 transition-all duration-200',
          isDetailsOpen ? 'max-h-[500px] py-3' : 'max-h-0',
        )}
      >
        {account?.account_details?.map((detail, index) => (
          <div key={index} className='flex items-center gap-4'>
            <div className='f-12-400 text-GRAY_700 w-[150px]'>{detail.label}</div>
            <div className='f-11-400'>{detail.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecipientAccountCard;
