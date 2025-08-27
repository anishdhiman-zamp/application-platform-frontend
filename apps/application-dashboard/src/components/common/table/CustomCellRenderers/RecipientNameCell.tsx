import { cn } from '@zamp-platform/ui/utils';
import { getFirstLetters } from '@/utils/common';

interface RecipientNameCellProps {
  value: string;
  className?: string;
}

const RecipientNameCell = ({ value, className }: RecipientNameCellProps) => {
  if (!value) return <></>;

  return (
    <div
      className={cn(
        'bg-GRAY_100 inline-flex items-center justify-center gap-1 rounded-full py-1 pr-1.5 pl-1',
        className,
      )}
    >
      <div className='bg-GRAY_1000 f-10-400 flex h-4 w-4 items-center justify-center rounded-full text-white'>
        {getFirstLetters(value, 1)}
      </div>
      {value}
    </div>
  );
};

export default RecipientNameCell;
