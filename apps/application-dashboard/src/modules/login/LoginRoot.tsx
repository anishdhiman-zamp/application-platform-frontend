import { ZAMP_FULL_LOGO, ZAMP_LOGIN_BG } from 'constants/icons';
import { LoginForm } from 'modules/login/LoginForm';
import Image from 'next/image';

export const LoginRoot = () => {
  return (
    <div className='bg-BG_GRAY_5 relative flex h-screen w-screen items-center justify-center'>
      <video autoPlay muted loop className='absolute z-0 h-full w-full object-cover'>
        <source src={ZAMP_LOGIN_BG} type='video/mp4' />
        <span className='f-14-400 text-GRAY_1000'>Your browser does not support the video tag.</span>
      </video>
      <div className='rounded-4.5 shadow-table-filter-menu border-GRAY_100 z-50 w-[580px] border bg-white px-16 py-[82px]'>
        <Image src={ZAMP_FULL_LOGO} priority alt='ZAMP' width={98} height={24} />
        <LoginForm />
      </div>
    </div>
  );
};
