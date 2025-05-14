import Image from 'next/image';
import { ADAM_ICON } from '@/constants/icons';

const SenderInfo = () => {
  return (
    // <div className='flex items-center justify-start gap-x-1.5 mt-3'>
    //   <div className='size-4 rounded-[4px] bg-BLUE_200 flex justify-center items-center'>
    //     <span className='f-10-450'>A</span>
    //   </div>
    //   <span className='f-13-450 text-GRAY_900'>Aditya Jain</span>
    // </div>
    <div className='flex items-center justify-start gap-x-1.5 mt-3'>
      <div className='size-4 rounded-[4px] bg-VIOLET_100 flex justify-center items-center'>
        <Image src={ADAM_ICON} alt='adam' width={10} height={10} priority />
      </div>
      <span className='f-13-450 text-GRAY_900'>Adam</span>
    </div>
  );
};

export default SenderInfo;
