import { FC } from 'react';
import { getFirstLetters } from '@/utils/common';

type RecipientNameCellProps = {
  value: string;
  className?: string;
};

const RecipientNameCell: FC<RecipientNameCellProps> = ({ value }) => {
  if (!value) return <></>;

  return (
    <div className='bg-GRAY_100 rounded-full pl-1 pr-1.5 py-1  items-center justify-center gap-1 inline-flex'>
      <div className='flex items-center justify-center w-4 h-4 rounded-full bg-GRAY_1000 f-10-400 text-white '>
        {getFirstLetters(value, 1)}
      </div>
      {value}
    </div>
  );
};

export default RecipientNameCell;
