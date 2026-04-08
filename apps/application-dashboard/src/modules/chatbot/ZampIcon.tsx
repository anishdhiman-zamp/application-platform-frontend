import Image from 'next/image';
import { ZAMP_BLACK_ICON, ZAMP_WHITE_ICON } from '@/constants/icons';

const ZampIcon = () => {
  return (
    <div className='grid h-6 min-h-6 w-6 min-w-6 place-items-center'>
      <Image src={ZAMP_BLACK_ICON} alt='Zamp Icon' height={20} width={20} className='block dark:hidden' />
      <Image src={ZAMP_WHITE_ICON} alt='Zamp Icon' height={20} width={20} className='hidden dark:block' />
    </div>
  );
};

export default ZampIcon;
