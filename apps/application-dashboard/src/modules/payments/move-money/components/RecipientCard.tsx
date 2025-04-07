import { FC } from 'react';
import { MenuItem } from 'types/common/components';
import { getFirstLetters } from 'utils/common';
import SvgSpriteLoader from 'components/SvgSpriteLoader';

type RecipientCardProps = {
  recipient: MenuItem;
  handleRecipientSelect: (recipient: MenuItem) => void;
};

const RecipientCard: FC<RecipientCardProps> = ({ recipient, handleRecipientSelect }) => {
  return (
    <div
      onClick={() => handleRecipientSelect(recipient)}
      className='cursor-pointer rounded-lg gap-1.5 flex items-center px-2.5 py-2 group hover:bg-GRAY_100 transition duration-100'
    >
      <div className='w-4 h-4 bg-BLUE_200 flex justify-center items-center pl-px f-8-500 rounded-full'>
        {getFirstLetters(recipient?.value as string).toLocaleUpperCase()}
      </div>
      <div className='f-12-500 grow'>{recipient?.label}</div>
      <SvgSpriteLoader size={14} id='send-03' className='opacity-0 group-hover:opacity-100 transition duration-100' />
    </div>
  );
};

export default RecipientCard;
