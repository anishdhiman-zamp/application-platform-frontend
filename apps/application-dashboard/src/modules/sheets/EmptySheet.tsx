import { Button } from '@zamp-platform/ui';
import Image from 'next/image';
import { SHEET_EMPTY_STATE } from '@/constants/icons';
import { defaultFnType } from '@/types/commonTypes';

interface EmptySheetProps {
  onAddWidget: defaultFnType;
}

const EmptySheet = ({ onAddWidget }: EmptySheetProps) => {
  return (
    <div className='flex h-[calc(100vh-120px)] flex-col items-center justify-center'>
      <Image src={SHEET_EMPTY_STATE} alt='Empty sheet' width={264} height={266} />
      <Button size='large' variant='secondary' onClick={onAddWidget}>
        Add a widget
      </Button>
    </div>
  );
};

export default EmptySheet;
