import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { cn, getFirstLetters } from 'utils/common';
import { RecipientDetailsType } from '@/unused/apis/paymentApi.types';
type RecipientCardProps = {
  recipient: RecipientDetailsType;
  handleRecipientSelect: (recipient: RecipientDetailsType) => void;
  className?: string;
};

const RecipientCard = ({
  ref,
  recipient,
  handleRecipientSelect,
  className,
}: RecipientCardProps & {
  ref: (el: HTMLDivElement | null) => void;
}) => {
  return (
    <div
      ref={ref}
      onClick={() => handleRecipientSelect(recipient)}
      className={cn(
        'hover:bg-GRAY_100 group flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-2 transition duration-100',
        className,
      )}
    >
      <div className='bg-BLUE_200 f-8-500 flex h-4 w-4 items-center justify-center rounded-full pl-px'>
        {getFirstLetters(recipient?.name as string, 1).toLocaleUpperCase()}
      </div>
      <div className='f-13-500 grow'>{recipient?.name}</div>
      <SvgSpriteLoader size={14} id='send-03' className='opacity-0 transition duration-100 group-hover:opacity-100' />
    </div>
  );
};

RecipientCard.displayName = 'RecipientCard';

export default RecipientCard;
