import { ZAMP_LOGO } from 'constants/icons';
import Image from 'next/image';

const DashboardDowntime = () => {
  return (
    <div className='fixed z-1000 flex h-screen w-screen items-center justify-center bg-white p-6'>
      <Image
        width={115}
        height={28}
        alt={'zamp logo'}
        className='absolute top-8 left-8'
        src={ZAMP_LOGO}
        draggable='false'
        priority
      />
      <div className='flex flex-col items-center text-center'>
        <div className='text-[80px]'>🚧</div>
        <div className='f-18-500 mt-8 max-w-[650px] text-center'>
          Our dashboard is taking a short break. We’ll be back up and running soon.
          <br />
          Thanks for your patience!
        </div>
      </div>
    </div>
  );
};

export default DashboardDowntime;
