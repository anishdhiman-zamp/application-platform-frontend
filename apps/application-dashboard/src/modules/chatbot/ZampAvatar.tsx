import Image from 'next/image';
import { ZAMP_ICON } from '@/constants/icons';

const ZampAvatar = () => {
  return (
    <div className='grid h-6 min-h-6 w-6 min-w-6 place-items-center rounded-full'>
      <Image src={ZAMP_ICON} alt='Zamp Avatar' height={20} width={20} />
    </div>
  );
};

export default ZampAvatar;
