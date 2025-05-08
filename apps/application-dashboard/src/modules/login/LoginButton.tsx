import { FC, MouseEvent, useEffect, useState } from 'react';
import Image from 'next/image';
import { cn } from 'utils/common';

type LoginButtonPropsType = {
  loading: boolean;
  onClick: (e?: MouseEvent<HTMLButtonElement>) => void;
  providerLogo: string;
};

const LoginButton: FC<LoginButtonPropsType> = ({ loading, onClick, providerLogo }) => {
  const [isOIDCLogoLoaded, setIsOICLogoLoaded] = useState(false);
  const showSigningIn = providerLogo?.length > 0 && isOIDCLogoLoaded;

  useEffect(() => {
    if (providerLogo) {
      const img = new window.Image();

      img.src = providerLogo;
      img.onload = () => {
        setTimeout(() => {
          setIsOICLogoLoaded(true);
        }, 300);
      };
    } else {
      setIsOICLogoLoaded(false);
    }
  }, [providerLogo]);

  return (
    <button
      id='google-login'
      type='submit'
      className={cn(
        'relative bg-BG_GRAY_3 h-12 w-full mt-4 rounded-md',
        loading ? '!cursor-not-allowed' : '!cursor-pointer',
      )}
      onClick={onClick}
    >
      <div
        className={cn(
          'relative z-10 color-transition before:transform before:translate-x-0 before:bg-BG_GRAY_3 after:transform after:-translate-x-1/2 h-full w-full overflow-hidden rounded-md before:absolute before:top-0 before:h-full before:w-full before:transition-transform before:duration-[3000ms] before:ease-in-out before:rounded-[6px] after:absolute after:top-0 after:h-full after:w-full after:transition-transform after:duration-[3000ms] after:ease-in-out after:rounded-[6px] after:bg-BG_GRAY_4',
          { active: loading },
        )}
      >
        <div className='absolute top-[12px] right-40 text-white z-40'>
          {showSigningIn ? (
            <div className='flex gap-1.5 items-center justify-center text-white f-14-500 animate-opacity'>
              <span>Signing in with</span>
              <Image src={providerLogo} alt='provider logo' width={40} height={20} style={{ maxHeight: '20px' }} />
            </div>
          ) : (
            <span className='mr-10'>Login</span>
          )}
        </div>
      </div>
    </button>
  );
};

export default LoginButton;
