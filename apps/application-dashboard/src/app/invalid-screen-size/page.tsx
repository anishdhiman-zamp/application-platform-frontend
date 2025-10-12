import Image from 'next/image';
import { SCREEN_SUPPORT, ZAMP_LOGO } from '@/constants/icons';

export default function InvalidScreenSize() {
  return (
    <div className='fixed z-[10000] flex h-screen w-screen items-center justify-center bg-white p-6'>
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
        <Image width={260} height={112} alt='small screen banner' src={SCREEN_SUPPORT} draggable='false' priority />
        <div className='text-GRAY_600 mt-8'>We are live on desktop only. See you there!</div>
      </div>
    </div>
  );
}
