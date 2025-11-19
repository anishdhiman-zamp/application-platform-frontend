import { ZAMP_LOGO_LOADER_SVG } from '@/constants/icons';

export default function Loading() {
  return (
    <div className='flex h-full items-center justify-center'>
      <div className='z-50 flex h-[calc(100vh-200px)] w-full items-center justify-center bg-white'>
        <img
          src={ZAMP_LOGO_LOADER_SVG}
          alt='zamp logo loader'
          width={140}
          height={140}
          className='h-[140px] w-[140px]'
        />
      </div>
    </div>
  );
}
