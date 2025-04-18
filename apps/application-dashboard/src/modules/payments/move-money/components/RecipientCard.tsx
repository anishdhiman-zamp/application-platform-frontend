import { FC } from 'react';
import { getFirstLetters } from 'utils/common';
import { RecipientDetailsType } from '@/types/api/paymentApi.types';
import SvgSpriteLoader from 'components/SvgSpriteLoader';
type RecipientCardProps = {
  recipient: RecipientDetailsType;
  handleRecipientSelect: (recipient: RecipientDetailsType) => void;
};

const RecipientCard: FC<RecipientCardProps> = ({ recipient, handleRecipientSelect }) => {
  return (
    <div
      onClick={() => handleRecipientSelect(recipient)}
      className='cursor-pointer rounded-lg gap-1.5 flex items-center px-2.5 py-2 group hover:bg-GRAY_100 transition duration-100'
    >
      <div className='w-4 h-4 bg-BLUE_200 flex justify-center items-center pl-px f-8-500 rounded-full'>
        {getFirstLetters(recipient?.name as string, 1).toLocaleUpperCase()}
      </div>
      <div className='f-12-500 grow'>{recipient?.name}</div>
      <SvgSpriteLoader size={14} id='send-03' className='opacity-0 group-hover:opacity-100 transition duration-100' />
    </div>
  );
};

export default RecipientCard;
